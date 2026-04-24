import { SearchCompaniesUseCase } from './search-companies.use-case';
import { ISelectionWriter, SelectionEntity } from '../repositories/selection.repository';
import { ISearchJobService } from '../services/search-job.service';
import { SearchCompaniesDto } from '../dto/search-companies.dto';

const makeSelectionWriter = (): jest.Mocked<ISelectionWriter> => ({
  create: jest.fn(),
  updateStatus: jest.fn(),
  delete: jest.fn(),
});

const makeSearchJobService = (): jest.Mocked<ISearchJobService> => ({
  enqueue: jest.fn(),
});

const makeSelection = (overrides: Partial<SelectionEntity> = {}): SelectionEntity => ({
  id: 'sel-1',
  userId: 'user-1',
  name: 'IT — Moscow, SPb',
  industry: 'IT',
  cities: ['Moscow', 'SPb'],
  companyLimit: 10,
  targetRoles: ['CEO'],
  status: 'in_progress',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  ...overrides,
});

describe('SearchCompaniesUseCase', () => {
  let useCase: SearchCompaniesUseCase;
  let selectionWriter: jest.Mocked<ISelectionWriter>;
  let searchJobService: jest.Mocked<ISearchJobService>;

  beforeEach(() => {
    selectionWriter = makeSelectionWriter();
    searchJobService = makeSearchJobService();
    useCase = new SearchCompaniesUseCase(selectionWriter, searchJobService);
  });

  it('creates selection with name="industry — city1, city2" and status in_progress', async () => {
    const dto: SearchCompaniesDto = {
      industry: 'IT',
      cities: ['Moscow', 'SPb'],
      companyLimit: 10,
      targetRoles: ['CEO'],
    };
    const userId = 'user-1';
    const expected = makeSelection();

    selectionWriter.create.mockResolvedValue(expected);

    const result = await useCase.execute(dto, userId);

    expect(selectionWriter.create).toHaveBeenCalledWith({
      userId,
      name: 'IT — Moscow, SPb',
      industry: 'IT',
      cities: ['Moscow', 'SPb'],
      companyLimit: 10,
      targetRoles: ['CEO'],
      status: 'in_progress',
    });
    expect(result).toEqual(expected);
  });

  it('calls searchJobService.enqueue with created selection and dto', async () => {
    const dto: SearchCompaniesDto = {
      industry: 'Finance',
      cities: ['Kazan'],
      companyLimit: 5,
      targetRoles: ['CTO'],
    };
    const userId = 'user-2';
    const created = makeSelection({ id: 'sel-2', userId, name: 'Finance — Kazan' });

    selectionWriter.create.mockResolvedValue(created);

    await useCase.execute(dto, userId);

    expect(searchJobService.enqueue).toHaveBeenCalledWith(created, dto);
  });

  it('uses empty array for targetRoles when undefined', async () => {
    const dto: SearchCompaniesDto = {
      industry: 'Retail',
      cities: ['Novosibirsk'],
      companyLimit: 3,
    } as SearchCompaniesDto;
    const userId = 'user-3';
    const created = makeSelection({ id: 'sel-3', userId });

    selectionWriter.create.mockResolvedValue(created);

    await useCase.execute(dto, userId);

    expect(selectionWriter.create).toHaveBeenCalledWith(
      expect.objectContaining({ targetRoles: [] }),
    );
  });
});
