
import { api } from '../../services/api';
import type { User } from '../../types/auth';

interface UpdateProfileRequest {
  name: string;
  bio: string | null;
  avatar: string | null;
}

export const profileApi = api.injectEndpoints({
  endpoints: (builder) => ({
    updateProfile: builder.mutation<User, UpdateProfileRequest>({
      query: (body) => ({
        url: '/users/me',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    uploadAvatar: builder.mutation<{ url: string }, FormData>({
      query: (body) => ({
        url: '/uploads',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useUpdateProfileMutation,
  useUploadAvatarMutation,
} = profileApi;
