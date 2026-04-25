import { create } from 'zustand';
import type { IVerificationStore } from '@/core/ports/verification-store.port';
import type { IVerificationPort } from '@/core/ports/verification.port';
import { normalizeError } from '@/core/utils/normalize-error';

export function createVerificationStore(verificationPort: IVerificationPort) {
  return create<IVerificationStore>((set) => ({
    isVerifying: false,
    verifyResult: null,
    error: null,

    bulkVerify: async (selectionId) => {
      set({ isVerifying: true, error: null, verifyResult: null });
      try {
        const result = await verificationPort.bulkVerify({ selectionId });
        set({
          isVerifying: false,
          verifyResult: { processed: result.processed, verified: result.verified },
        });
      } catch (err) {
        set({ isVerifying: false, error: normalizeError(err) });
      }
    },

    reset: () => set({ isVerifying: false, verifyResult: null, error: null }),
    clearError: () => set({ error: null }),
  }));
}
