import type { Contact } from '@/core/entities/contact';

interface VerificationBadgeProps {
  verification: Contact['emailVerification'];
}

export const VerificationBadge = ({ verification }: VerificationBadgeProps) => {
  if (!verification) {
    return <span className="text-gray-400">—</span>;
  }

  const badgeClass = verification.isValid
    ? 'bg-green-100 text-green-800'
    : 'bg-red-100 text-red-800';

  const label = verification.isValid ? 'Валиден' : 'Невалиден';

  return (
    <div className="flex flex-col gap-1">
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badgeClass}`}>
        {label}
      </span>
      <div className="text-xs text-gray-500 space-x-2">
        {verification.smtpCheck != null && (
          <span>SMTP: {verification.smtpCheck ? 'OK' : 'Fail'}</span>
        )}
        {verification.catchAll != null && (
          <span>Catch-all: {verification.catchAll ? 'Да' : 'Нет'}</span>
        )}
      </div>
    </div>
  );
};
