import type { AxiosInstance } from 'axios';
import type { IContactPort } from '@/core/ports/contact.port';
import type { Contact } from '@/core/entities/contact';
import type { DiscoverContactsRequest } from '@/core/types/contact.types';

export class ContactService implements IContactPort {
  constructor(private readonly http: AxiosInstance) {}

  async getContacts(selectionId?: string): Promise<Contact[]> {
    const params = selectionId ? { selectionId } : undefined;
    const response = await this.http.get<Contact[]>('/contacts', { params });
    return response.data;
  }

  async discoverContacts(data: DiscoverContactsRequest): Promise<Contact[]> {
    const response = await this.http.post<Contact[]>('/contacts/discover', data);
    return response.data;
  }
}
