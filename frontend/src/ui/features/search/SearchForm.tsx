import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@shared/ui';
import { useSelectionStore } from '@/store';
import { searchSchema, type SearchFormData } from './validation/search.schema';

export const SearchForm = () => {
  const { search, isSearching, error, clearError } = useSelectionStore();

  const { control, handleSubmit } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: { industry: '', cities: '', companyLimit: 10 },
  });

  const onSubmit = (data: SearchFormData) => {
    const cities = data.cities.split(',').map((c) => c.trim()).filter(Boolean);
    search({ industry: data.industry, cities, companyLimit: data.companyLimit });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      <Controller
        name="industry"
        control={control}
        render={({ field, fieldState }) => (
          <Input
            {...field}
            label="Отрасль"
            placeholder="Например: IT, строительство, логистика"
            error={fieldState.error?.message}
            onFocus={clearError}
          />
        )}
      />

      <Controller
        name="cities"
        control={control}
        render={({ field, fieldState }) => (
          <Input
            {...field}
            label="Города"
            placeholder="Москва, Санкт-Петербург"
            hint="Через запятую"
            error={fieldState.error?.message}
            onFocus={clearError}
          />
        )}
      />

      <Controller
        name="companyLimit"
        control={control}
        render={({ field, fieldState }) => (
          <Input
            {...field}
            type="number"
            label="Лимит компаний"
            placeholder="10"
            error={fieldState.error?.message}
            onFocus={clearError}
          />
        )}
      />

      <Button type="submit" loading={isSearching}>
        Найти компании
      </Button>
    </form>
  );
};
