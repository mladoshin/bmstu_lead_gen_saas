import { create } from 'zustand';
import type { Contact } from '@/core/entities/contact';
import type { IContactPort } from '@/core/ports/contact.port';
import type { DiscoverContactsRequest } from '@/core/types/contact.types';
import { normalizeError } from '@/core/utils/normalize-error';

interface ContactState {
  contacts: Contact[];
  isLoading: boolean;
  isDiscovering: boolean;
  error: string | null;
  loadBySelection: (selectionId: string) => Promise<void>;
  discover: (data: DiscoverContactsRequest) => Promise<void>;
  reset: () => void;
  clearError: () => void;
}

export function createContactStore(contactPort: IContactPort) {
  return create<ContactState>((set) => ({
    contacts: [],
    isLoading: false,
    isDiscovering: false,
    error: null,

    loadBySelection: async (selectionId) => {
      set({ isLoading: true, error: null });
      try {
        const contacts = await contactPort.getContacts(selectionId);
        set({ contacts, isLoading: false });
      } catch (err) {
        set({ isLoading: false, error: normalizeError(err) });
      }
    },

    discover: async (data) => {
      set({ isDiscovering: true, error: null });
      try {
        const contacts = await contactPort.discoverContacts(data);
        set((state) => ({
          contacts: [...state.contacts, ...contacts],
          isDiscovering: false,
        }));
      } catch (err) {
        set({ isDiscovering: false, error: normalizeError(err) });
      }
    },

    reset: () => set({ contacts: [], isLoading: false, isDiscovering: false, error: null }),
    clearError: () => set({ error: null }),
  }));
}
