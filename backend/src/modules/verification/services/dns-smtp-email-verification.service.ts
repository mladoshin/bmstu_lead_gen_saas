import { Injectable, Logger } from '@nestjs/common';
import { promises as dns } from 'dns';
import * as net from 'net';
import { randomUUID } from 'crypto';
import {
  IEmailVerificationService,
  EmailVerificationResult,
} from './email-verification.service';

const SMTP_TIMEOUT = 10_000;

@Injectable()
export class DnsSmtpEmailVerificationService implements IEmailVerificationService {
  private readonly logger = new Logger(DnsSmtpEmailVerificationService.name);

  async verifyEmail(email: string): Promise<EmailVerificationResult> {
    const domain = email.split('@')[1];

    try {
      const mxHost = await this.resolveMx(domain);

      if (!mxHost) {
        return {
          isValid: false,
          mxFound: false,
          smtpCheck: false,
          catchAll: false,
          confidenceScore: 0.0,
        };
      }

      const smtpResult = await this.smtpVerify(mxHost, email, domain);

      let isValid: boolean;
      let confidenceScore: number;

      if (smtpResult.greylisted) {
        isValid = false;
        confidenceScore = 0.3;
      } else if (!smtpResult.smtpCheck) {
        isValid = false;
        confidenceScore = 0.0;
      } else if (smtpResult.catchAll) {
        isValid = true;
        confidenceScore = 0.5;
      } else {
        isValid = true;
        confidenceScore = 0.95;
      }

      return {
        isValid,
        mxFound: true,
        smtpCheck: smtpResult.smtpCheck,
        catchAll: smtpResult.catchAll,
        confidenceScore,
      };
    } catch (err) {
      this.logger.error(
        `Unexpected error verifying "${email}": ${(err as Error).message}`,
      );
      return {
        isValid: false,
        mxFound: false,
        smtpCheck: false,
        catchAll: false,
        confidenceScore: 0.0,
      };
    }
  }

  private async resolveMx(domain: string): Promise<string | null> {
    try {
      const records = await dns.resolveMx(domain);
      if (!records || records.length === 0) {
        return null;
      }
      records.sort((a, b) => a.priority - b.priority);
      return records[0].exchange;
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === 'ENOTFOUND' || code === 'ENODATA') {
        return null;
      }
      throw err;
    }
  }

  private async smtpVerify(
    mxHost: string,
    email: string,
    domain: string,
  ): Promise<{ smtpCheck: boolean; catchAll: boolean; greylisted: boolean }> {
    let socket: net.Socket | null = null;

    try {
      socket = await this.createConnection(mxHost, 25);

      const greeting = await this.readResponse(socket);
      const greetingCode = this.parseResponseCode(greeting);
      if (greetingCode !== 220) {
        return { smtpCheck: false, catchAll: false, greylisted: false };
      }

      const ehloResponse = await this.sendCommand(socket, 'EHLO verify.local\r\n');
      const ehloCode = this.parseResponseCode(ehloResponse);
      if (ehloCode !== 250) {
        return { smtpCheck: false, catchAll: false, greylisted: false };
      }

      const mailFromResponse = await this.sendCommand(socket, 'MAIL FROM:<>\r\n');
      const mailFromCode = this.parseResponseCode(mailFromResponse);
      if (mailFromCode !== 250) {
        return { smtpCheck: false, catchAll: false, greylisted: false };
      }

      const rcptResponse = await this.sendCommand(
        socket,
        `RCPT TO:<${email}>\r\n`,
      );
      const rcptCode = this.parseResponseCode(rcptResponse);

      if (rcptCode >= 400 && rcptCode < 500) {
        return { smtpCheck: false, catchAll: false, greylisted: true };
      }

      if (rcptCode !== 250) {
        return { smtpCheck: false, catchAll: false, greylisted: false };
      }

      // Catch-all detection
      const catchAll = await this.detectCatchAll(socket, domain);

      return { smtpCheck: true, catchAll, greylisted: false };
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      const isNetworkError =
        code === 'ECONNREFUSED' ||
        code === 'ETIMEDOUT' ||
        code === 'ECONNRESET' ||
        (err as Error).message === 'Connection timeout' ||
        (err as Error).message === 'Socket timeout';

      if (isNetworkError) {
        this.logger.warn(
          `SMTP connection failed to ${mxHost}: ${code ?? (err as Error).message}`,
        );
        return { smtpCheck: false, catchAll: false, greylisted: true };
      }

      this.logger.error(
        `Unexpected SMTP error for ${mxHost}: ${(err as Error).message}`,
      );
      return { smtpCheck: false, catchAll: false, greylisted: false };
    } finally {
      if (socket) {
        try {
          socket.write('QUIT\r\n');
        } catch {
          // ignore write errors on closing
        }
        socket.destroy();
      }
    }
  }

  private async detectCatchAll(
    socket: net.Socket,
    domain: string,
  ): Promise<boolean> {
    try {
      const rsetResponse = await this.sendCommand(socket, 'RSET\r\n');
      if (this.parseResponseCode(rsetResponse) !== 250) {
        return false;
      }

      const mailFromResponse = await this.sendCommand(socket, 'MAIL FROM:<>\r\n');
      if (this.parseResponseCode(mailFromResponse) !== 250) {
        return false;
      }

      const fakeEmail = `${randomUUID()}@${domain}`;
      const rcptResponse = await this.sendCommand(
        socket,
        `RCPT TO:<${fakeEmail}>\r\n`,
      );
      const rcptCode = this.parseResponseCode(rcptResponse);

      return rcptCode === 250;
    } catch {
      return false;
    }
  }

  private createConnection(host: string, port: number): Promise<net.Socket> {
    return new Promise((resolve, reject) => {
      const socket = net.createConnection({ host, port, timeout: SMTP_TIMEOUT });

      socket.setTimeout(SMTP_TIMEOUT);

      socket.once('connect', () => resolve(socket));
      socket.once('error', (err) => reject(err));
      socket.once('timeout', () => {
        socket.destroy();
        reject(new Error('Connection timeout'));
      });
    });
  }

  private readResponse(socket: net.Socket): Promise<string> {
    return new Promise((resolve, reject) => {
      let data = '';

      const onData = (chunk: Buffer) => {
        data += chunk.toString();
        // Multi-line: wait until we get a line matching `code SP text` (no dash)
        const lines = data.split('\r\n');
        for (const line of lines) {
          if (line.length >= 3 && /^\d{3} /.test(line)) {
            cleanup();
            resolve(data);
            return;
          }
        }
      };

      const onError = (err: Error) => {
        cleanup();
        reject(err);
      };

      const onTimeout = () => {
        cleanup();
        socket.destroy();
        reject(new Error('Socket timeout'));
      };

      const onClose = () => {
        cleanup();
        reject(new Error('Socket closed'));
      };

      const cleanup = () => {
        socket.removeListener('data', onData);
        socket.removeListener('error', onError);
        socket.removeListener('timeout', onTimeout);
        socket.removeListener('close', onClose);
      };

      socket.on('data', onData);
      socket.once('error', onError);
      socket.once('timeout', onTimeout);
      socket.once('close', onClose);
    });
  }

  private sendCommand(socket: net.Socket, command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      socket.write(command, (err) => {
        if (err) {
          reject(err);
          return;
        }
        this.readResponse(socket).then(resolve, reject);
      });
    });
  }

  private parseResponseCode(response: string): number {
    const match = response.match(/^(\d{3})/);
    return match ? parseInt(match[1], 10) : 0;
  }
}
