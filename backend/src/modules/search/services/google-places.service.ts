import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface GooglePlaceResult {
  name: string;
  website?: string;
  phone?: string;
  address?: string;
  city: string;
}

export interface IGooglePlacesService {
  searchPlaces(industry: string, city: string): Promise<GooglePlaceResult[]>;
}

export const GOOGLE_PLACES_SERVICE_TOKEN = 'IGooglePlacesService';

@Injectable()
export class GooglePlacesService implements IGooglePlacesService {
  private readonly logger = new Logger(GooglePlacesService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async searchPlaces(industry: string, city: string): Promise<GooglePlaceResult[]> {
    const apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      this.logger.warn('GOOGLE_MAPS_API_KEY is not set, skipping search');
      return [];
    }

    const textQuery = `${industry} ${city}`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://places.googleapis.com/v1/places:searchText',
          { textQuery, maxResultCount: 20 },
          {
            headers: {
              'X-Goog-Api-Key': apiKey,
              'X-Goog-FieldMask': [
                'places.displayName',
                'places.websiteUri',
                'places.nationalPhoneNumber',
                'places.formattedAddress',
              ].join(','),
            },
          },
        ),
      );

      if (!response.data || !Array.isArray(response.data.places)) {
        this.logger.warn(
          `Unexpected Google Places response shape for "${textQuery}": ${JSON.stringify(response.data)}`,
        );
        return [];
      }

      return response.data.places.map((p: any) => ({
        name: p.displayName?.text ?? '',
        website: p.websiteUri,
        phone: p.nationalPhoneNumber,
        address: p.formattedAddress,
        city,
      }));
    } catch (err) {
      const axiosErr = err as import('axios').AxiosError;
      if (axiosErr.response?.status === 401 || axiosErr.response?.status === 403) {
        this.logger.error(
          `Google Places authentication error (${axiosErr.response.status}) for "${textQuery}" — check GOOGLE_MAPS_API_KEY`,
        );
      } else {
        this.logger.warn(
          `Google Places transient error for "${textQuery}": ${(err as Error).message}`,
        );
      }
      return [];
    }
  }
}
