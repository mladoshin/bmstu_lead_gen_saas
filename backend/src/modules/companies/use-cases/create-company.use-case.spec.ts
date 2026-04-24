import { CreateCompanyUseCase } from './create-company.use-case';
import { ICompanyRepository, CompanyEntity } from '../repositories/company.repository';
import { CreateCompanyDto } from '../dto/create-company.dto';

const makeCompanyRepo = (): jest.Mocked<ICompanyRepository> => ({
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findBySelectionId: jest.fn(),
  findBySelectionIdAndUserId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('CreateCompanyUseCase', () => {
  let useCase: CreateCompanyUseCase;
  let repo: jest.Mocked<ICompanyRepository>;

  beforeEach(() => {
    repo = makeCompanyRepo();
    useCase = new CreateCompanyUseCase(repo);
  });

  it('should delegate create with dto and userId', async () => {
    const dto: CreateCompanyDto = {
      selectionId: 'sel-1',
      name: 'Acme Corp',
      industry: 'Tech',
      city: 'Moscow',
      source: 'manual',
    };
    const userId = 'user-1';

    const created: CompanyEntity = {
      id: 'comp-1',
      selectionId: dto.selectionId,
      userId,
      name: dto.name,
      industry: dto.industry,
      city: dto.city,
      website: null,
      domain: null,
      phone: null,
      emailGeneral: null,
      country: null,
      address: null,
      source: dto.source,
      createdAt: new Date(),
    };

    repo.create.mockResolvedValue(created);

    const result = await useCase.execute(dto, userId);

    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(repo.create).toHaveBeenCalledWith({ ...dto, userId });
    expect(result).toEqual(created);
  });
});
