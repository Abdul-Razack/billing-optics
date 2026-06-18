export interface ApiLocation {
  id: number;
  name: string;
  code: string;
  address?: string | null;
  contactNumber?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLocationDto {
  name: string;
  code: string;
  address?: string;
  contactNumber?: string;
  isActive?: boolean;
}

export type UpdateLocationDto = Partial<CreateLocationDto>;
