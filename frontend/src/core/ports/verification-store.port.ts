export interface IVerificationStore {
  isVerifying: boolean;
  verifyResult: { processed: number; verified: number } | null;
  error: string | null;
  bulkVerify: (selectionId: string) => Promise<void>;
  reset: () => void;
  clearError: () => void;
}
