import { api } from '../../services/api';

export type InvitationTheme = 'classic' | 'soft' | 'dark';
export type InvitationTemplate = 'romantic' | 'classic' | 'modern';
export type InvitationBackground = 'cream' | 'blush' | 'white' | 'burgundy';
export type InvitationTextColor = 'burgundy' | 'white' | 'dustyRose';
export type InvitationHeadingStyle = 'serif' | 'sans';

export interface Invitation {
  id: number;
  eventId: number;
  theme: InvitationTheme;
  title: string;
  message: string;
  published: boolean;
  token: string;
  template: InvitationTemplate;
  backgroundColor: InvitationBackground;
  textColor: InvitationTextColor;
  headingStyle: InvitationHeadingStyle;
  backgroundImage: string | null;
}

export interface SaveInvitationPayload {
  eventId: number;
  theme: InvitationTheme;
  title: string;
  message: string;
  published: boolean;
  backgroundImage?: string | null;
  template?: InvitationTemplate;
  backgroundColor?: InvitationBackground;
  textColor?: InvitationTextColor;
  headingStyle?: InvitationHeadingStyle;
}

export interface UploadInvitationImageResponse {
  url: string;
}

export interface PublicInvitation {
    id: number;
    eventId: number;
    title: string;
    message: string;
    theme: InvitationTheme;
    published: boolean;
    token: string;
    backgroundImage: string | null;
    template: InvitationTemplate;
    backgroundColor: InvitationBackground;
    textColor: InvitationTextColor;
    headingStyle: InvitationHeadingStyle;
    Event: {
        title: string;
        date: string;
        city: string;
        address: string;
  };
}

export interface RsvpPayload {
  token: string;
  name: string;
  status: 'going' | 'declined';
}

export interface RsvpResponse {
  guestId: number;
  responseToken: string;
  status: 'going' | 'declined';
}

export const invitationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    uploadInvitationImage: builder.mutation<UploadInvitationImageResponse, FormData>({
      query: (body) => ({
        url: '/uploads',
        method: 'POST',
        body,
      }),
    }),
    saveInvitation: builder.mutation<Invitation, SaveInvitationPayload>({
      query: ({ eventId, ...data }) => ({
        url: `/events/${eventId}/invitation`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Invitations', 'Events'],
    }),

    getPublicInvitation: builder.query<PublicInvitation, string>({
      query: (token) => `/invitations/${token}`,
      providesTags: ['Invitations'],
    }),

    submitRsvp: builder.mutation<RsvpResponse, RsvpPayload>({
      query: ({ token, name, status }) => ({
        url: `/invitations/${token}/rsvp`,
        method: 'POST',
        body: { name, status },
      }),
      invalidatesTags: ['Guests'],
    }),
  }),
});

export const {
  useUploadInvitationImageMutation,
  useSaveInvitationMutation,
  useGetPublicInvitationQuery,
  useSubmitRsvpMutation,
} = invitationsApi;