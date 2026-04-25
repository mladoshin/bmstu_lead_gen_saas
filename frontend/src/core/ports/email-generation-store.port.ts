export interface IEmailGenerationStore {
  isGenerating: boolean;
  generateResult: { processed: number; updated: number } | null;
  error: string | null;
  generateEmails: (selectionId: string) => Promise<void>;
  reset: () => void;
  clearError: () => void;
}
