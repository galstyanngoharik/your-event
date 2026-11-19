import { api } from '../../services/api';

const messageAttachmentsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMessageAttachment: builder.query<string, string>({
      query: (url) => ({
        url,
        responseHandler: async (response) => response.ok
          ? URL.createObjectURL(await response.blob())
          : response.json(),
      }),
      keepUnusedDataFor: 0,
      async onCacheEntryAdded(_url, { cacheDataLoaded, cacheEntryRemoved }) {
        let objectUrl: string | undefined;
        try {
          objectUrl = (await cacheDataLoaded).data;
          await cacheEntryRemoved;
        } catch {
          return;
        } finally {
          if (objectUrl) URL.revokeObjectURL(objectUrl);
        }
      },
    }),
  }),
});

export const { useGetMessageAttachmentQuery } = messageAttachmentsApi;
