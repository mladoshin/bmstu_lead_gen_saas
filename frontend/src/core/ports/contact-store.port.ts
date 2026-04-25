import type { Contact } from '@/core/entities/contact';
import type { DiscoverContactsRequest } from '@/core/types/contact.types';

export interface IContactStore {
  contacts: Contact[];
  isLoading: boolean;
  isDiscovering: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
  loadBySelection: (selectionId: string) => Promise<void>;
  discover: (data: DiscoverContactsRequest) => Promise<void>;
  reset: () => void;
  clearError: () => void;
}
