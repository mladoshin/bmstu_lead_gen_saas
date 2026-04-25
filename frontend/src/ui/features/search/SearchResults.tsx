import { Link } from 'react-router-dom';
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
      {currentSelection.status === 'completed' && (
        <>
          <CompanyTable />
          <Link
            to={`/contacts/${currentSelection.id}`}
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Найти контакты ЛПР
          </Link>
        </>
      )}
      {currentSelection.status === 'failed' && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          Поиск завершился с ошибкой. Попробуйте снова.
        </div>
      )}
    </div>
  );
};
