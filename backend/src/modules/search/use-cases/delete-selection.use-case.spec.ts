import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { DeleteSelectionUseCase } from './delete-selection.use-case';
import { ISelectionReader, ISelectionWriter, SelectionEntity } from '../repositories/selection.repository';

const makeSelectionReader = (): jest.Mocked<ISelectionReader> => ({
  findById: jest.fn(),
  findByUserId: jest.fn(),
});

const makeSelectionWriter = (): jest.Mocked<ISelectionWriter> => ({
  create: jest.fn(),
  updateStatus: jest.fn(),
  delete: jest.fn(),
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

describe('DeleteSelectionUseCase', () => {
  let useCase: DeleteSelectionUseCase;
  let selectionReader: jest.Mocked<ISelectionReader>;
  let selectionWriter: jest.Mocked<ISelectionWriter>;

  beforeEach(() => {
    selectionReader = makeSelectionReader();
    selectionWriter = makeSelectionWriter();
    useCase = new DeleteSelectionUseCase(selectionReader, selectionWriter);
  });

  it('deletes selection when userId matches', async () => {
    const selection = makeSelection();

    selectionReader.findById.mockResolvedValue(selection);
    selectionWriter.delete.mockResolvedValue(undefined);

    await useCase.execute('sel-1', 'user-1');

    expect(selectionReader.findById).toHaveBeenCalledWith('sel-1');
    expect(selectionWriter.delete).toHaveBeenCalledWith('sel-1');
  });

  it('throws NotFoundException when selection is not found', async () => {
    selectionReader.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent', 'user-1')).rejects.toThrow(
      NotFoundException,
    );
    expect(selectionWriter.delete).not.toHaveBeenCalled();
  });

  it('throws ForbiddenException when userId does not match', async () => {
    const selection = makeSelection({ userId: 'user-1' });

    selectionReader.findById.mockResolvedValue(selection);

    await expect(useCase.execute('sel-1', 'other-user')).rejects.toThrow(
      ForbiddenException,
    );
    expect(selectionWriter.delete).not.toHaveBeenCalled();
  });
});
