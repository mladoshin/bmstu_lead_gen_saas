import { ExportMapper } from './export.mapper';
import { CompanyEntity } from '../../companies/repositories/company.repository';
import { ContactEntity } from '../../contacts/repositories/contact.repository';

describe('ExportMapper', () => {
  let mapper: ExportMapper;

  beforeEach(() => {
    mapper = new ExportMapper();
  });

  const company: CompanyEntity = {
    id: 'comp-1',
    selectionId: 'sel-1',
    userId: 'user-1',
    name: 'Acme Corp',
    industry: 'IT',
    city: 'Moscow',
    website: 'https://acme.com',
    domain: 'acme.com',
    phone: '+7999',
    emailGeneral: 'info@acme.com',
    country: 'Russia',
    address: '123 Main St',
    source: 'google_maps',
    createdAt: new Date(),
  };

  const contact: ContactEntity = {
    id: 'contact-1',
    companyId: 'comp-1',
    userId: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
    position: 'CEO',
    seniority: 'C-level',
    email: 'john@acme.com',
    phone: '+7999',
    linkedin: 'https://linkedin.com/in/johndoe',
    telegram: '@johndoe',
    confidenceScore: 0.95,
    source: 'openai_web_search',
    createdAt: new Date(),
  };

  describe('companyToRow', () => {
    it('should map all fields', () => {
      const row = mapper.companyToRow(company);

      expect(row).toEqual({
        id: 'comp-1',
        name: 'Acme Corp',
        industry: 'IT',
        city: 'Moscow',
        website: 'https://acme.com',
        domain: 'acme.com',
        phone: '+7999',
        email_general: 'info@acme.com',
        country: 'Russia',
        address: '123 Main St',
        source: 'google_maps',
      });
    });
  });

  describe('contactToRow', () => {
    it('should map all fields', () => {
      const row = mapper.contactToRow(contact);

      expect(row).toEqual({
        id: 'contact-1',
        first_name: 'John',
        last_name: 'Doe',
        position: 'CEO',
        seniority: 'C-level',
        email: 'john@acme.com',
        phone: '+7999',
        linkedin: 'https://linkedin.com/in/johndoe',
        telegram: '@johndoe',
        confidence_score: 0.95,
        source: 'openai_web_search',
      });
    });
  });

  describe('toCsv', () => {
    it('should generate header + data', () => {
      const rows = [{ a: 'val1', b: 'val2' }];
      const csv = mapper.toCsv(rows, ['a', 'b']);

      expect(csv).toBe('a,b\n"val1","val2"');
    });

    it('should escape quotes', () => {
      const rows = [{ a: 'He said "hello"' }];
      const csv = mapper.toCsv(rows, ['a']);

      expect(csv).toBe('a\n"He said ""hello"""');
    });

    it('should handle null/undefined as empty strings', () => {
      const rows = [{ a: null, b: undefined }];
      const csv = mapper.toCsv(rows as any, ['a', 'b']);

      expect(csv).toBe('a,b\n"",""');
    });

    it('should return only header for empty array', () => {
      const csv = mapper.toCsv([], ['a', 'b', 'c']);

      expect(csv).toBe('a,b,c');
    });
  });
});
