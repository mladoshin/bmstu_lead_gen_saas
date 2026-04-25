import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@shared/ui';
import { useContactStore } from '@/store';
import { discoverSchema, type DiscoverFormData } from './validation/discover.schema';

interface DiscoverFormProps {
  selectionId: string;
}

export const DiscoverForm = ({ selectionId }: DiscoverFormProps) => {
  const { discover, isDiscovering, error, clearError } = useContactStore();

  const { control, handleSubmit } = useForm<DiscoverFormData>({
    resolver: zodResolver(discoverSchema),
    defaultValues: { targetRoles: '' },
  });

  const onSubmit = (data: DiscoverFormData) => {
    const targetRoles = data.targetRoles.split(',').map((r) => r.trim()).filter(Boolean);
    discover({ selectionId, targetRoles });
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
        name="targetRoles"
        control={control}
        render={({ field, fieldState }) => (
          <Input
            {...field}
            label="Роли ЛПР"
            placeholder="CEO, CTO, директор"
            hint="Через запятую"
            error={fieldState.error?.message}
            onFocus={clearError}
          />
        )}
      />

      <Button type="submit" loading={isDiscovering}>
        Найти контакты
      </Button>
    </form>
  );
};
