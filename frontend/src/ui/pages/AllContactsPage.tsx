import { useEffect } from 'react';
import { useContactStore } from '@/store';
import { ContactTable } from '@features/contacts/ContactTable';

export const AllContactsPage = () => {
  const { loadAll, reset } = useContactStore();

  useEffect(() => {
    loadAll();
    return () => reset();
  }, [loadAll, reset]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Все контакты</h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <ContactTable />
      </div>
    </div>
  );
};
