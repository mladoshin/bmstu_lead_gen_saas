import type { Contact } from '../entities/contact';
import type { DiscoverContactsRequest } from '../types/contact.types';

export interface IContactPort {
  getContacts(selectionId?: string): Promise<Contact[]>;
  discoverContacts(data: DiscoverContactsRequest): Promise<Contact[]>;
}
