import { useSelectionStore } from '@/store';
import { useSelectionPolling } from './hooks/useSelectionPolling';
import { SelectionStatusCard } from './SelectionStatus';
import { CompanyTable } from './CompanyTable';

export const SearchResults = () => {
  const currentSelection = useSelectionStore((s) => s.currentSelection);

  useSelectionPolling(
    currentSelection?.id ?? null,
    currentSelection?.status ?? null,
  );

  if (!currentSelection) return null;

  return (
    <div className="space-y-4">
      <SelectionStatusCard />
      {currentSelection.status === 'completed' && <CompanyTable />}
      {currentSelection.status === 'failed' && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          Поиск завершился с ошибкой. Попробуйте снова.
        </div>
      )}
    </div>
  );
};
