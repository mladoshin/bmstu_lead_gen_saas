import { useState } from 'react';
import { SpinnerIcon, Button } from '@shared/ui';
import { useSelectionsListStore, exportService } from '@/store';
import { downloadBlob } from '@/core/utils/download-blob';
import type { SelectionStatus } from '@/core/entities/selection';

const statusConfig: Record<SelectionStatus, { label: string; className: string }> = {
  pending: { label: 'Ожидание', className: 'bg-yellow-100 text-yellow-800' },
  in_progress: { label: 'В процессе', className: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Завершено', className: 'bg-green-100 text-green-800' },
  failed: { label: 'Ошибка', className: 'bg-red-100 text-red-800' },
};

export const SelectionTable = () => {
  const { selections, isLoading, deleteSelection } = useSelectionsListStore();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (
    selectionId: string,
    type: 'companies' | 'contacts',
  ) => {
    const key = `${selectionId}-${type}`;
    setDownloadingId(key);
    try {
      const blob =
        type === 'companies'
          ? await exportService.exportCompaniesCsv(selectionId)
          : await exportService.exportContactsCsv(selectionId);
      downloadBlob(blob, `${type}-${selectionId}.csv`);
    } catch {
      alert('Ошибка при скачивании CSV');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Удалить подборку?')) return;
    await deleteSelection(id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <SpinnerIcon className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (selections.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">Подборки не найдены</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Отрасль</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Города</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {selections.map((sel) => {
            const status = statusConfig[sel.status];
            const isCompleted = sel.status === 'completed';
            return (
              <tr key={sel.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{sel.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{sel.industry}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{sel.cities.join(', ')}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                    {status.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(sel.createdAt).toLocaleDateString('ru-RU')}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-2">
                    <Button
                      className="!py-1 !px-2 text-xs"
                      disabled={!isCompleted || downloadingId === `${sel.id}-companies`}
                      onClick={() => handleDownload(sel.id, 'companies')}
                    >
                      {downloadingId === `${sel.id}-companies` ? '...' : 'Компании CSV'}
                    </Button>
                    <Button
                      className="!py-1 !px-2 text-xs"
                      disabled={!isCompleted || downloadingId === `${sel.id}-contacts`}
                      onClick={() => handleDownload(sel.id, 'contacts')}
                    >
                      {downloadingId === `${sel.id}-contacts` ? '...' : 'Контакты CSV'}
                    </Button>
                    <Button
                      className="!py-1 !px-2 text-xs bg-red-600 hover:bg-red-700"
                      onClick={() => handleDelete(sel.id)}
                    >
                      Удалить
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
