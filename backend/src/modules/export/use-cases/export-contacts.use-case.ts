import { Inject, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ISelectionReader, SELECTION_READER_TOKEN } from '../../search/repositories/selection.repository';
import { ISelectionWriter, SELECTION_WRITER_TOKEN } from '../../search/repositories/selection.repository';
import { ICompanyRepository, COMPANY_REPOSITORY_TOKEN } from '../../companies/repositories/company.repository';
import { IContactRepository, CONTACT_REPOSITORY_TOKEN } from '../../contacts/repositories/contact.repository';
import { ExportMapper } from '../mappers/export.mapper';

const HEADERS = ['id', 'first_name', 'last_name', 'position', 'seniority', 'email', 'phone', 'linkedin', 'telegram', 'confidence_score', 'source'];

@Injectable()
export class ExportContactsUseCase {
  constructor(
    @Inject(SELECTION_READER_TOKEN) private readonly selectionReader: ISelectionReader,
    @Inject(SELECTION_WRITER_TOKEN) private readonly selectionWriter: ISelectionWriter,
    @Inject(COMPANY_REPOSITORY_TOKEN) private readonly companyRepo: ICompanyRepository,
    @Inject(CONTACT_REPOSITORY_TOKEN) private readonly contactRepo: IContactRepository,
    private readonly exportMapper: ExportMapper,
  ) {}

  async execute(selectionId: string, userId: string): Promise<string> {
    const selection = await this.selectionReader.findById(selectionId);
    if (!selection) {
      throw new NotFoundException('Selection not found');
    }
    if (selection.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const companies = await this.companyRepo.findBySelectionIdAndUserId(selectionId, userId);
    const companyIds = companies.map((c) => c.id);
    const contacts = await this.contactRepo.findByCompanyIds(companyIds);
    const rows = contacts.map((c) => this.exportMapper.contactToRow(c));
    const csv = this.exportMapper.toCsv(rows, HEADERS);

    await this.selectionWriter.updateStatus(selectionId, 'completed');

    return csv;
  }
}
