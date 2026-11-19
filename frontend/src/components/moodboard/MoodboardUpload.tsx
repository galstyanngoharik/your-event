import { useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { useUploadMoodboardImageMutation } from '../../features/events/moodboardApi';

const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
interface PendingImage { file: File; previewUrl: string }

export default function MoodboardUpload({ eventId, setError, setNotice }: {
  eventId: number; setError: (message: string) => void; setNotice: (message: string) => void;
}) {
  const [uploadImage, { isLoading: isUploading }] = useUploadMoodboardImageMutation();
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [uploadCaption, setUploadCaption] = useState('');
  const pendingUrls = useRef(new Set<string>());
  useEffect(() => {
    const urls = pendingUrls.current;
    return () => { urls.forEach((url) => URL.revokeObjectURL(url)); };
  }, []);
  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    setError('');
    const validFiles = files.filter((file) => imageTypes.includes(file.type) && file.size <= 5 * 1024 * 1024);
    if (validFiles.length !== files.length) {
      setError('Choose JPG, PNG or WEBP images smaller than 5 MB.');
    }
    const staged = validFiles.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      pendingUrls.current.add(previewUrl);
      return { file, previewUrl };
    });
    setPendingImages((current) => [...current, ...staged]);
  };

  const removePending = (pending: PendingImage) => {
    URL.revokeObjectURL(pending.previewUrl);
    pendingUrls.current.delete(pending.previewUrl);
    setPendingImages((current) => current.filter((image) => image !== pending));
  };

  const postImages = async () => {
    if (!pendingImages.length || isUploading) return;
    setError('');
    setNotice('Uploading inspiration...');
    const uploaded: PendingImage[] = [];
    for (const pending of pendingImages) {
      const formData = new FormData();
      formData.append('image', pending.file);
      if (uploadCaption.trim()) formData.append('caption', uploadCaption.trim());
      try {
        await uploadImage({ eventId, formData }).unwrap();
        uploaded.push(pending);
      } catch {
        uploaded.forEach((image) => {
          URL.revokeObjectURL(image.previewUrl);
          pendingUrls.current.delete(image.previewUrl);
        });
        setPendingImages((current) => current.filter((image) => !uploaded.includes(image)));
        setNotice('');
        setError(`Could not upload ${pending.file.name}. Remaining images stay in the preview.`);
        return;
      }
    }
    uploaded.forEach((image) => {
      URL.revokeObjectURL(image.previewUrl);
      pendingUrls.current.delete(image.previewUrl);
    });
    setPendingImages((current) => current.filter((image) => !uploaded.includes(image)));
    setUploadCaption('');
    setNotice(`${uploaded.length} image${uploaded.length === 1 ? '' : 's'} added to the moodboard.`);
  };

  return (
    <section className="space-y-4 rounded-2xl border border-[#D9A3AA]/40 bg-white p-5">
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#351018] px-5 py-3 text-sm text-white">
        <ImagePlus size={18} /> Add Photos
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={isUploading} onChange={handleFiles} className="sr-only" />
      </label>
      {pendingImages.length > 0 && (
        <section data-export-ignore className="space-y-3 rounded-2xl border border-[#D9A3AA]/40 bg-white p-5">
          <h2 className="font-semibold text-[#351018]">Preview before adding</h2>
          <label className="block max-w-xl space-y-2 text-sm font-medium text-[#351018]">
            Optional caption for these images
            <input value={uploadCaption} onChange={(event) => setUploadCaption(event.target.value)} maxLength={250} className="w-full rounded-xl border border-[#351018]/15 px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-[#D9A3AA]" />
          </label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {pendingImages.map((pending) => (
              <div key={pending.previewUrl} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#F2D9DC]/40">
                <img src={pending.previewUrl} alt={pending.file.name} className="h-full w-full object-cover" />
                <button type="button" onClick={() => removePending(pending)} aria-label={`Remove ${pending.file.name}`} className="absolute right-2 top-2 rounded-full bg-white/90 p-2 text-[#351018] shadow"><X size={15} /></button>
              </div>
            ))}
          </div>
          <button type="button" onClick={postImages} disabled={isUploading} className="rounded-xl bg-[#351018] px-5 py-3 text-sm font-medium text-white disabled:opacity-50">{isUploading ? 'Adding...' : 'Add to Moodboard'}</button>
        </section>
      )}
    </section>
  );
}
