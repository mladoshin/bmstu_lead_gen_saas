import { useEffect } from 'react';
import { useCompanyStore } from '@/store';
import { CompanyTable } from '@features/search/CompanyTable';

export const CompaniesPage = () => {
  const { loadAll, reset } = useCompanyStore();

  useEffect(() => {
    loadAll();
    return () => reset();
  }, [loadAll, reset]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Все компании</h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <CompanyTable />
      </div>
    </div>
  );
};
