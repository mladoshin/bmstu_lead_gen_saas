export interface Company {
  id: string;
  selectionId: string;
  userId: string;
  name: string;
  industry: string;
  city: string;
  website: string | null;
  domain: string | null;
  phone: string | null;
  emailGeneral: string | null;
  country: string | null;
  address: string | null;
  source: string;
  createdAt: string;
}
