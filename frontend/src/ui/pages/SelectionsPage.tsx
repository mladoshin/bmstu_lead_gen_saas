import { useEffect } from 'react';
import { useSelectionsListStore } from '@/store';
import { SelectionTable } from '@features/selections/SelectionTable';

export const SelectionsPage = () => {
  const { loadSelections, reset } = useSelectionsListStore();

  useEffect(() => {
    loadSelections();
    return () => reset();
  }, [loadSelections, reset]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">История подборок</h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <SelectionTable />
      </div>
    </div>
  );
};
