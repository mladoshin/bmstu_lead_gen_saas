import { SpinnerIcon } from '@shared/ui';
import { useCompanyStore } from '@/store';

export const CompanyTable = () => {
  const { companies, isLoading } = useCompanyStore();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <SpinnerIcon className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">Компании не найдены</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Отрасль</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Город</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сайт</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Телефон</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {companies.map((company) => (
            <tr key={company.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-900">{company.name}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{company.industry}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{company.city}</td>
              <td className="px-4 py-3 text-sm text-blue-600">
                {company.website ? (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {company.domain || company.website}
                  </a>
                ) : '—'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{company.phone || '—'}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{company.emailGeneral || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
