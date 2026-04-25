import { create } from 'zustand';
import type { IContactStore } from '@/core/ports/contact-store.port';
import type { IContactPort } from '@/core/ports/contact.port';
import type { DiscoverContactsRequest } from '@/core/types/contact.types';
import { normalizeError } from '@/core/utils/normalize-error';

export function createContactStore(contactPort: IContactPort) {
  return create<IContactStore>((set) => ({
    contacts: [],
    isLoading: false,
    isDiscovering: false,
    error: null,

    loadAll: async () => {
      set({ isLoading: true, error: null });
      try {
        const contacts = await contactPort.getContacts();
        set({ contacts, isLoading: false });
      } catch (err) {
        set({ isLoading: false, error: normalizeError(err) });
      }
    },

    loadBySelection: async (selectionId) => {
      set({ isLoading: true, error: null, contacts: [] });
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
        set((state) => {
          const existingIds = new Set(state.contacts.map((c) => c.id));
          const newContacts = contacts.filter((c) => !existingIds.has(c.id));
          return {
            contacts: [...state.contacts, ...newContacts],
            isDiscovering: false,
          };
        });
      } catch (err) {
        set({ isDiscovering: false, error: normalizeError(err) });
      }
    },

    reset: () => set({ contacts: [], isLoading: false, isDiscovering: false, error: null }),
    clearError: () => set({ error: null }),
  }));
}
