import { LocalTokenStorage } from '@/api/storage/local-token-storage';
import { createAxiosInstance } from '@/api/http/axios-instance';
import { AuthService } from '@/api/services/auth.service';
import { SearchService } from '@/api/services/search.service';
import { SelectionService } from '@/api/services/selection.service';
import { CompanyService } from '@/api/services/company.service';
import { ContactService } from '@/api/services/contact.service';
import { EmailGenerationService } from '@/api/services/email-generation.service';
import { VerificationService } from '@/api/services/verification.service';
import { ExportService } from '@/api/services/export.service';
import { createAuthStore } from './slices/auth.store';
import { createSelectionStore } from './slices/selection.store';
import { createCompanyStore } from './slices/company.store';
import { createContactStore } from './slices/contact.store';
import { createEmailGenerationStore } from './slices/email-generation.store';
import { createVerificationStore } from './slices/verification.store';
import { createSelectionsListStore } from './slices/selections-list.store';

const tokenStorage = new LocalTokenStorage();
const axiosInstance = createAxiosInstance(tokenStorage);
const authService = new AuthService(axiosInstance);
const searchService = new SearchService(axiosInstance);
const selectionService = new SelectionService(axiosInstance);
const companyService = new CompanyService(axiosInstance);
const contactService = new ContactService(axiosInstance);
const emailGenerationService = new EmailGenerationService(axiosInstance);
const verificationService = new VerificationService(axiosInstance);
const exportService = new ExportService(axiosInstance);

export const useAuthStore = createAuthStore(authService, tokenStorage);
export const useSelectionStore = createSelectionStore(searchService, selectionService);
export const useCompanyStore = createCompanyStore(companyService);
export const useContactStore = createContactStore(contactService);
export const useEmailGenerationStore = createEmailGenerationStore(emailGenerationService);
export const useVerificationStore = createVerificationStore(verificationService);
export const useSelectionsListStore = createSelectionsListStore(selectionService);

export { exportService };
