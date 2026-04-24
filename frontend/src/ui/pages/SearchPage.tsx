import { SearchForm } from '@features/search/SearchForm';
import { SearchResults } from '@features/search/SearchResults';

export const SearchPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Поиск компаний</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <SearchForm />
        </div>
        <div>
          <SearchResults />
        </div>
      </div>
    </div>
  );
};
