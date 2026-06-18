import { fetchClient, buildQueryString } from '../lib/api-client';
import { ApiLocation, CreateLocationDto, UpdateLocationDto } from '../types/location';

interface LocationListResponse {
  success: boolean;
  data: {
    data: ApiLocation[];
    total: number;
    page: number;
    limit: number;
  };
}

interface LocationResponse {
  success: boolean;
  data: ApiLocation;
}

export const locationService = {
  getLocations: async (params?: { search?: string; isActive?: boolean; page?: number; limit?: number }) => {
    const query = buildQueryString(params);
    return fetchClient<LocationListResponse>(`/locations${query}`);
  },

  getLocation: async (id: number) => {
    return fetchClient<LocationResponse>(`/locations/${id}`);
  },

  createLocation: async (data: CreateLocationDto) => {
    return fetchClient<LocationResponse>('/locations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateLocation: async (id: number, data: UpdateLocationDto) => {
    return fetchClient<LocationResponse>(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteLocation: async (id: number) => {
    return fetchClient<{ success: boolean; message: string }>(`/locations/${id}`, {
      method: 'DELETE',
    });
  },
};
