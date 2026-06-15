import { fetchClient } from '@/lib/api-client';
import { Offer, CreateOfferPayload, ValidateOfferResult } from '../types/offer';

export const OfferService = {
  getOffers: async (params?: { status?: 'ACTIVE' | 'INACTIVE'; search?: string }): Promise<Offer[]> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);
    
    return fetchClient(`/offers?${searchParams.toString()}`);
  },

  getOfferById: async (id: number): Promise<Offer> => {
    return fetchClient(`/offers/${id}`);
  },

  createOffer: async (data: CreateOfferPayload): Promise<Offer> => {
    return fetchClient('/offers', {
      method: 'POST',
      data,
    });
  },

  updateOffer: async (id: number, data: Partial<CreateOfferPayload>): Promise<Offer> => {
    return fetchClient(`/offers/${id}`, {
      method: 'PUT',
      data,
    });
  },

  deleteOffer: async (id: number): Promise<void> => {
    return fetchClient(`/offers/${id}`, {
      method: 'DELETE',
    });
  },

  validateOffer: async (offerId: number, cartTotal: number, items?: any[]): Promise<ValidateOfferResult> => {
    return fetchClient('/offers/validate', {
      method: 'POST',
      data: { offerId, cartTotal, items },
    });
  },
};
