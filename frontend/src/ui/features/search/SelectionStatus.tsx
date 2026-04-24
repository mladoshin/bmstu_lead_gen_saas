import { SpinnerIcon } from '@shared/ui';
import { useSelectionStore } from '@/store';

const statusConfig = {
  pending: { label: 'Ожидание', className: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'В процессе', className: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Завершено', className: 'bg-green-100 text-green-700' },
  failed: { label: 'Ошибка', className: 'bg-red-100 text-red-700' },
} as const;

export const SelectionStatusCard = () => {
  const currentSelection = useSelectionStore((s) => s.currentSelection);

  if (!currentSelection) return null;

  const config = statusConfig[currentSelection.status];
  const isActive = currentSelection.status === 'pending' || currentSelection.status === 'in_progress';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
          {isActive && <SpinnerIcon className="w-3 h-3 animate-spin" />}
          {config.label}
        </span>
        <span className="text-sm text-gray-500">{currentSelection.name}</span>
      </div>
      <div className="text-sm text-gray-600 space-y-1">
        <p><span className="font-medium">Отрасль:</span> {currentSelection.industry}</p>
        <p><span className="font-medium">Города:</span> {currentSelection.cities.join(', ')}</p>
        <p><span className="font-medium">Лимит:</span> {currentSelection.companyLimit}</p>
      </div>
    </div>
  );
};
