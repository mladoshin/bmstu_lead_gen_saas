import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { GetSelectionUseCase } from './get-selection.use-case';
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

describe('GetSelectionUseCase', () => {
  let useCase: GetSelectionUseCase;
  let selectionReader: jest.Mocked<ISelectionReader>;

  beforeEach(() => {
    selectionReader = makeSelectionReader();
    useCase = new GetSelectionUseCase(selectionReader);
  });

  it('returns selection when userId matches', async () => {
    const selection = makeSelection();

    selectionReader.findById.mockResolvedValue(selection);

    const result = await useCase.execute('sel-1', 'user-1');

    expect(selectionReader.findById).toHaveBeenCalledWith('sel-1');
    expect(result).toEqual(selection);
  });

  it('throws NotFoundException when selection is not found', async () => {
    selectionReader.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent', 'user-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws ForbiddenException when userId does not match', async () => {
    const selection = makeSelection({ userId: 'user-1' });

    selectionReader.findById.mockResolvedValue(selection);

    await expect(useCase.execute('sel-1', 'other-user')).rejects.toThrow(
      ForbiddenException,
    );
  });
});
