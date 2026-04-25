import { create } from 'zustand';
import type { IEmailGenerationStore } from '@/core/ports/email-generation-store.port';
import type { IEmailGenerationPort } from '@/core/ports/email-generation.port';
import { normalizeError } from '@/core/utils/normalize-error';

export function createEmailGenerationStore(emailGenPort: IEmailGenerationPort) {
  return create<IEmailGenerationStore>((set) => ({
    isGenerating: false,
    generateResult: null,
    error: null,

    generateEmails: async (selectionId) => {
      set({ isGenerating: true, error: null, generateResult: null });
      try {
        const result = await emailGenPort.generateEmails({ selectionId });
        set({
          isGenerating: false,
          generateResult: { processed: result.processed, updated: result.updated },
        });
      } catch (err) {
        set({ isGenerating: false, error: normalizeError(err) });
      }
    },

    reset: () => set({ isGenerating: false, generateResult: null, error: null }),
    clearError: () => set({ error: null }),
  }));
}
