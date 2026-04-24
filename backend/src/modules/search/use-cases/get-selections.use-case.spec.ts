import { GetSelectionsUseCase } from './get-selections.use-case';
import { ISelectionReader, SelectionEntity } from '../repositories/selection.repository';

const makeSelectionReader = (): jest.Mocked<ISelectionReader> => ({
  findById: jest.fn(),
  findByUserId: jest.fn(),
});

const makeSelection = (overrides: Partial<SelectionEntity> = {}): SelectionEntity => ({
  id: 'sel-1',
  userId: 'user-1',
  name: 'IT — Moscow',
  industry: 'IT',
  cities: ['Moscow'],
  companyLimit: 10,
  targetRoles: ['CEO'],
  status: 'completed',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  ...overrides,
});

describe('GetSelectionsUseCase', () => {
  let useCase: GetSelectionsUseCase;
  let selectionReader: jest.Mocked<ISelectionReader>;

  beforeEach(() => {
    selectionReader = makeSelectionReader();
    useCase = new GetSelectionsUseCase(selectionReader);
  });

  it('returns array of selections for the given userId', async () => {
    const userId = 'user-1';
    const selections: SelectionEntity[] = [
      makeSelection({ id: 'sel-1' }),
      makeSelection({ id: 'sel-2', name: 'Finance — SPb' }),
    ];

    selectionReader.findByUserId.mockResolvedValue(selections);

    const result = await useCase.execute(userId);

    expect(selectionReader.findByUserId).toHaveBeenCalledWith(userId);
    expect(result).toEqual(selections);
    expect(result).toHaveLength(2);
  });

  it('returns empty array when user has no selections', async () => {
    const userId = 'user-empty';

    selectionReader.findByUserId.mockResolvedValue([]);

    const result = await useCase.execute(userId);

    expect(selectionReader.findByUserId).toHaveBeenCalledWith(userId);
    expect(result).toEqual([]);
  });
});
