export type OfferType = 'PERCENTAGE' | 'FLAT_AMOUNT';

export interface Offer {
  id: number;
  name: string;
  code?: string | null;
  type: OfferType;
  value: number;
  minOrderValue: number;
  startDate?: string | null;
  endDate?: string | null;
  applicableProducts?: number[] | null;
  applicableCategories?: number[] | null;
  conditions?: any | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferPayload {
  name: string;
  code?: string | null;
  type: OfferType;
  value: number;
  minOrderValue?: number;
  startDate?: string | null;
  endDate?: string | null;
  applicableProducts?: number[] | null;
  applicableCategories?: number[] | null;
  conditions?: any | null;
  isActive?: boolean;
}

export interface ValidateOfferResult {
  discountTotal: number;
  offer: Offer;
}
