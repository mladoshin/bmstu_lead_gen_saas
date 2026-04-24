import { GetCompaniesUseCase } from './get-companies.use-case';
import { ICompanyRepository, CompanyEntity } from '../repositories/company.repository';

const makeCompanyRepo = (): jest.Mocked<ICompanyRepository> => ({
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findBySelectionId: jest.fn(),
  findBySelectionIdAndUserId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('GetCompaniesUseCase', () => {
  let useCase: GetCompaniesUseCase;
  let repo: jest.Mocked<ICompanyRepository>;

  const companies: CompanyEntity[] = [
    {
      id: 'comp-1',
      selectionId: 'sel-1',
      userId: 'user-1',
      name: 'Acme Corp',
      industry: 'Tech',
      city: 'Moscow',
      website: null,
      domain: null,
      phone: null,
      emailGeneral: null,
      country: null,
      address: null,
      source: 'manual',
      createdAt: new Date(),
    },
    {
      id: 'comp-2',
      selectionId: 'sel-1',
      userId: 'user-1',
      name: 'Beta Inc',
      industry: 'Finance',
      city: 'SPb',
      website: 'https://beta.io',
      domain: 'beta.io',
      phone: null,
      emailGeneral: null,
      country: 'RU',
      address: null,
      source: 'ai',
      createdAt: new Date(),
    },
  ];

  beforeEach(() => {
    repo = makeCompanyRepo();
    useCase = new GetCompaniesUseCase(repo);
  });

  it('should return array of companies for userId', async () => {
    repo.findByUserId.mockResolvedValue(companies);

    const result = await useCase.execute('user-1');

    expect(repo.findByUserId).toHaveBeenCalledWith('user-1');
    expect(result).toEqual(companies);
    expect(result).toHaveLength(2);
  });

  it('should return empty array when user has no companies', async () => {
    repo.findByUserId.mockResolvedValue([]);

    const result = await useCase.execute('user-no-companies');

    expect(repo.findByUserId).toHaveBeenCalledWith('user-no-companies');
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });
});
