import { Button } from '@shared/ui';
import { useEmailGenerationStore, useVerificationStore } from '@/store';

interface EmailActionsProps {
  selectionId: string;
  onComplete: () => void;
}

export const EmailActions = ({ selectionId, onComplete }: EmailActionsProps) => {
  const {
    isGenerating,
    generateResult,
    error: genError,
    generateEmails,
    clearError: clearGenError,
  } = useEmailGenerationStore();

  const {
    isVerifying,
    verifyResult,
    error: verifyError,
    bulkVerify,
    clearError: clearVerifyError,
  } = useVerificationStore();

  const handleGenerate = async () => {
    clearGenError();
    await generateEmails(selectionId);
    onComplete();
  };

  const handleVerify = async () => {
    clearVerifyError();
    await bulkVerify(selectionId);
    onComplete();
  };

  return (
    <div className="space-y-4 mt-6 pt-6 border-t border-gray-200">
      {genError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm" role="alert">
          {genError}
        </div>
      )}

      {verifyError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm" role="alert">
          {verifyError}
        </div>
      )}

      <Button onClick={handleGenerate} loading={isGenerating} className="w-full">
        Сгенерировать email
      </Button>

      {generateResult && (
        <p className="text-sm text-gray-600">
          Обработано: {generateResult.processed}, обновлено: {generateResult.updated}
        </p>
      )}

      <Button onClick={handleVerify} loading={isVerifying} className="w-full">
        Верифицировать email
      </Button>

      {verifyResult && (
        <p className="text-sm text-gray-600">
          Обработано: {verifyResult.processed}, верифицировано: {verifyResult.verified}
        </p>
      )}
    </div>
  );
};
