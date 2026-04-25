import { LocalTokenStorage } from '@/api/storage/local-token-storage';
import { createAxiosInstance } from '@/api/http/axios-instance';
import { AuthService } from '@/api/services/auth.service';
import { SearchService } from '@/api/services/search.service';
import { SelectionService } from '@/api/services/selection.service';
import { CompanyService } from '@/api/services/company.service';
import { ContactService } from '@/api/services/contact.service';
import { createAuthStore } from './auth.store';
import { createSelectionStore } from './selection.store';
import { createCompanyStore } from './company.store';
import { createContactStore } from './contact.store';

const tokenStorage = new LocalTokenStorage();
const axiosInstance = createAxiosInstance(tokenStorage);
const authService = new AuthService(axiosInstance);
const searchService = new SearchService(axiosInstance);
const selectionService = new SelectionService(axiosInstance);
const companyService = new CompanyService(axiosInstance);
const contactService = new ContactService(axiosInstance);

export const useAuthStore = createAuthStore(authService, tokenStorage);
export const useSelectionStore = createSelectionStore(searchService, selectionService);
export const useCompanyStore = createCompanyStore(companyService);
export const useContactStore = createContactStore(contactService);
