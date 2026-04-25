import { SpinnerIcon } from '@shared/ui';
import { useContactStore } from '@/store';

export const ContactTable = () => {
  const { contacts, isLoading } = useContactStore();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <SpinnerIcon className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">Контакты не найдены</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ФИО</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Должность</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seniority</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">LinkedIn</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confidence</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {contacts.map((contact) => (
            <tr key={contact.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-900">
                {contact.firstName} {contact.lastName}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{contact.position}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{contact.seniority || '—'}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{contact.email || '—'}</td>
              <td className="px-4 py-3 text-sm text-blue-600">
                {contact.linkedin ? (
                  <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    Профиль
                  </a>
                ) : '—'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {contact.confidenceScore != null ? `${contact.confidenceScore}%` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
