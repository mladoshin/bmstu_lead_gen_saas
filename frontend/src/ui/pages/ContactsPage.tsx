import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContactStore, useEmailGenerationStore, useVerificationStore } from '@/store';
import { DiscoverForm } from '@features/contacts/DiscoverForm';
import { ContactTable } from '@features/contacts/ContactTable';
import { EmailActions } from '@features/email/EmailActions';

export const ContactsPage = () => {
  const { selectionId } = useParams<{ selectionId: string }>();
  const { loadBySelection, reset } = useContactStore();
  const resetEmailGen = useEmailGenerationStore((s) => s.reset);
  const resetVerification = useVerificationStore((s) => s.reset);

  useEffect(() => {
    if (selectionId) {
      loadBySelection(selectionId);
    }
    return () => {
      reset();
      resetEmailGen();
      resetVerification();
    };
  }, [selectionId, loadBySelection, reset, resetEmailGen, resetVerification]);

  if (!selectionId) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/search" className="text-blue-600 hover:underline text-sm">
          &larr; Назад к поиску
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Контакты ЛПР</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <DiscoverForm selectionId={selectionId} />
          <EmailActions
            selectionId={selectionId}
            onComplete={() => loadBySelection(selectionId)}
          />
        </div>
        <div className="lg:col-span-2">
          <ContactTable />
        </div>
      </div>
    </div>
  );
};
