
import { api } from '../../services/api';

export interface Service {
  id: number;
  title: string;
  category: string;
  description: string | null;
  city: string;
  price: string;
  images: string[];
  providerId: number;
  active: boolean;
  provider?: {
    name: string;
    businessName: string | null;
    bio: string | null;
  };
}

export interface ServiceFilters {
  providerId?: number;
  search?: string;
  city?: string;
  category?: string;
  maxPrice?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc';
  offset?: number;
}

const servicesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getServices: builder.query<
      { count: number; rows: Service[] },
      ServiceFilters
    >({
      query: (params) => ({ url: '/services', params }),
      providesTags: ['Services', 'Providers'],
    }),

    getService: builder.query<Service, number>({
      query: (id) => `/services/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Services', id }],
    }),

    getMyServices: builder.query<Service[], void>({
      query: () => '/services/mine',
      providesTags: ['Services'],
    }),

    createService: builder.mutation<Service, ServicePayload>({
      query: (body) => ({
        url: '/services',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Services'],
    }),

    updateService: builder.mutation<Service, { id: number; data: Partial<ServicePayload> }>({
      query: ({ id, data }) => ({
        url: `/services/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Services',
        { type: 'Services', id },
      ],
    }),

    deleteService: builder.mutation<void, number>({
      query: (id) => ({
        url: `/services/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        'Services',
        { type: 'Services', id },
      ],
    }),

    uploadServiceImage: builder.mutation<{ url: string }, FormData>({
      query: (body) => ({
        url: '/uploads',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export interface ServicePayload {
  title: string;
  category: string;
  description?: string;
  city: string;
  price: number;
  images?: string[];
  active?: boolean;
}

export const {
  useGetServicesQuery,
  useGetServiceQuery,
  useGetMyServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useUploadServiceImageMutation,
} = servicesApi;

export const serviceImage = (url?: string) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;

  const base = (
    import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
  ).replace(/\/api\/?$/, '');

  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
};
