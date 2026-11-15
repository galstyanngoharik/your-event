import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Save, Send, Trash2, X } from 'lucide-react';
import {
  useDeletePortfolioItemMutation,
  useGetProviderPortfolioQuery,
  useUpdatePortfolioItemMutation,
  useUploadPortfolioItemMutation,
} from './providersApi';
import { serviceImage } from '../services/servicesApi';

const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const videoTypes = ['video/mp4', 'video/webm'];

interface Props {
  providerId: number;
}

interface PendingMedia {
  file: File;
  previewUrl: string;
}

export default function PortfolioManager({ providerId }: Props) {
  const { data: items = [], isLoading, isError, refetch } = useGetProviderPortfolioQuery(providerId);
  const [uploadItem, { isLoading: isUploading }] = useUploadPortfolioItemMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdatePortfolioItemMutation();
  const [deleteItem, { isLoading: isDeleting }] = useDeletePortfolioItemMutation();
  const [caption, setCaption] = useState('');
  const [captionDrafts, setCaptionDrafts] = useState<Record<number, string>>({});
  const [pendingMedia, setPendingMedia] = useState<PendingMedia[]>([]);
  const pendingUrls = useRef(new Set<string>());
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => () => {
    pendingUrls.current.forEach((url) => URL.revokeObjectURL(url));
    pendingUrls.current.clear();
  }, []);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    setError('');
    setNotice('');

    for (const file of files) {
      const isImage = imageTypes.includes(file.type);
      const isVideo = videoTypes.includes(file.type);
      const sizeLimit = isImage ? 5 * 1024 * 1024 : 50 * 1024 * 1024;
      if ((!isImage && !isVideo) || file.size > sizeLimit) {
        setError('Use JPG, PNG or WEBP images up to 5 MB, or MP4 and WEBM videos up to 50 MB.');
        return;
      }
    }

    const newMedia = files.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      pendingUrls.current.add(previewUrl);
      return { file, previewUrl };
    });
    setPendingMedia((current) => [...current, ...newMedia]);
    setNotice(`${pendingMedia.length + newMedia.length} item${pendingMedia.length + newMedia.length === 1 ? '' : 's'} ready to post.`);
  };

  const handlePost = async () => {
    if (pendingMedia.length === 0 || isUploading) return;
    setError('');
    setNotice('Posting your work...');
    const posted: PendingMedia[] = [];

    for (const media of pendingMedia) {
      const formData = new FormData();
      formData.append('media', media.file);
      if (caption.trim()) formData.append('caption', caption.trim());
      try {
        await uploadItem(formData).unwrap();
        posted.push(media);
      } catch {
        posted.forEach(({ previewUrl }) => {
          URL.revokeObjectURL(previewUrl);
          pendingUrls.current.delete(previewUrl);
        });
        setPendingMedia((current) => current.filter((mediaItem) => !posted.includes(mediaItem)));
        setError(`Could not post ${media.file.name}. Remaining items are still in your draft.`);
        setNotice('');
        return;
      }
    }

    posted.forEach(({ previewUrl }) => {
      URL.revokeObjectURL(previewUrl);
      pendingUrls.current.delete(previewUrl);
    });
    setPendingMedia((current) => current.filter((media) => !posted.includes(media)));
    setCaption('');
    setNotice(`${posted.length} item${posted.length === 1 ? '' : 's'} posted to My Works.`);
  };

  const handleRemovePending = (media: PendingMedia) => {
    URL.revokeObjectURL(media.previewUrl);
    pendingUrls.current.delete(media.previewUrl);
    setPendingMedia((current) => current.filter((item) => item !== media));
  };

  const handleCaptionSave = async (itemId: number, currentCaption: string | null) => {
    const nextCaption = captionDrafts[itemId] ?? currentCaption ?? '';
    try {
      await updateItem({ id: itemId, data: { caption: nextCaption.trim() || null } }).unwrap();
      setNotice('Caption updated.');
      setError('');
    } catch {
      setError('Failed to update caption.');
    }
  };

  const handleMove = async (index: number, offset: -1 | 1) => {
    const reordered = [...items].sort((a, b) => a.position - b.position);
    const targetIndex = index + offset;
    if (targetIndex < 0 || targetIndex >= reordered.length) return;
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    try {
      await Promise.all(reordered.map((item, position) =>
        updateItem({ id: item.id, data: { position } }).unwrap()
      ));
      setError('');
    } catch {
      setError('Failed to reorder portfolio items.');
    }
  };

  const handleDelete = async (itemId: number) => {
    if (!window.confirm('Delete this portfolio item? This cannot be undone.')) return;
    try {
      await deleteItem(itemId).unwrap();
      setError('');
    } catch {
      setError('Failed to delete portfolio item.');
    }
  };

  return (
    <section id="my-works" className="space-y-5 rounded-2xl border border-[#D9A3AA]/40 bg-white p-6 shadow-sm sm:p-8">
      <div>
        <h2 className="text-lg font-semibold text-[#351018]">My Works</h2>
        <p className="mt-1 text-sm text-[#351018]/60">
          Showcase your best moments and let your work speak for itself.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <label className="space-y-2 text-sm font-medium text-[#351018]">
          Optional caption
          <input
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            maxLength={250}
            placeholder="Add a caption for uploaded work"
            className="w-full rounded-xl border border-[#351018]/15 px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-[#D9A3AA]"
          />
        </label>
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 self-end rounded-xl bg-[#351018] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#D9A3AA] hover:text-[#351018]">
          <ImagePlus size={18} /> {isUploading ? 'Uploading...' : 'Add Photos or Videos'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            multiple
            onChange={handleUpload}
            disabled={isUploading}
            className="sr-only"
          />
        </label>
      </div>
      <p className="text-xs text-[#351018]/50">Photos up to 5 MB; videos up to 50 MB. JPG, PNG, WEBP, MP4 or WEBM.</p>

      {pendingMedia.length > 0 && (
        <div className="space-y-3 rounded-xl border border-[#D9A3AA]/40 bg-[#FFF8F1] p-4">
          <p className="text-sm font-medium text-[#351018]">Ready to post</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {pendingMedia.map((media) => (
              <div key={media.previewUrl} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#F2D9DC]/40">
                {imageTypes.includes(media.file.type) ? (
                  <img src={media.previewUrl} alt={media.file.name} className="h-full w-full object-cover" />
                ) : (
                  <video src={media.previewUrl} controls playsInline className="h-full w-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => handleRemovePending(media)}
                  disabled={isUploading}
                  aria-label={`Remove ${media.file.name} from draft`}
                  className="absolute right-2 top-2 rounded-full bg-white/90 p-2 text-[#351018] shadow disabled:opacity-50"
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-[#351018]/60">Loading your work...</p>
      ) : isError ? (
        <p className="text-sm text-red-600">Could not load portfolio. <button onClick={() => refetch()} className="underline">Try again</button></p>
      ) : items.length === 0 ? (
        <p className="rounded-xl bg-[#FFF8F1] p-5 text-sm text-[#351018]/60">Your portfolio is empty.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...items].sort((a, b) => a.position - b.position).map((item, index, list) => (
            <article key={item.id} className="overflow-hidden rounded-xl border border-[#D9A3AA]/40">
              {item.mediaType === 'image' ? (
                <img src={serviceImage(item.mediaUrl) || ''} alt={item.caption || 'Portfolio work'} className="aspect-[4/3] w-full object-cover" />
              ) : (
                <video src={serviceImage(item.mediaUrl) || ''} controls playsInline preload="metadata" className="aspect-[4/3] w-full object-cover" />
              )}
              <div className="space-y-3 p-3">
                <input
                  value={captionDrafts[item.id] ?? item.caption ?? ''}
                  onChange={(event) => setCaptionDrafts((drafts) => ({ ...drafts, [item.id]: event.target.value }))}
                  maxLength={250}
                  aria-label="Portfolio caption"
                  placeholder="Add a caption"
                  className="w-full rounded-lg border border-[#351018]/15 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#D9A3AA]"
                />
                <div className="flex items-center justify-between gap-2">
                  <button type="button" onClick={() => handleCaptionSave(item.id, item.caption)} disabled={isUpdating} className="inline-flex items-center gap-1 rounded-lg border border-[#351018]/15 px-2 py-2 text-xs text-[#351018] disabled:opacity-50">
                    <Save size={14} /> Save caption
                  </button>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => handleMove(index, -1)} disabled={index === 0 || isUpdating} aria-label="Move up" className="rounded-lg border border-[#351018]/15 p-2 text-[#351018] disabled:opacity-30">
                      <ArrowUp size={15} />
                    </button>
                    <button type="button" onClick={() => handleMove(index, 1)} disabled={index === list.length - 1 || isUpdating} aria-label="Move down" className="rounded-lg border border-[#351018]/15 p-2 text-[#351018] disabled:opacity-30">
                      <ArrowDown size={15} />
                    </button>
                    <button type="button" onClick={() => handleDelete(item.id)} disabled={isDeleting} aria-label="Delete portfolio item" className="rounded-lg border border-[#351018]/15 p-2 text-[#351018] transition hover:bg-[#F2D9DC]/50 disabled:opacity-50">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {notice && <p role="status" className="text-sm text-[#351018]">{notice}</p>}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end border-t border-[#D9A3AA]/30 pt-4">
        <button
          type="button"
          onClick={handlePost}
          disabled={pendingMedia.length === 0 || isUploading}
          className="inline-flex items-center gap-2 rounded-xl bg-[#351018] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#D9A3AA] hover:text-[#351018] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={17} /> {isUploading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </section>
  );
}