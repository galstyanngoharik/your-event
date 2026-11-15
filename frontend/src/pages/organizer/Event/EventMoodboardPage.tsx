import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowUp, Download, ImagePlus, Trash2, X } from 'lucide-react';
import { toPng } from 'html-to-image';
import { useGetEventByIdQuery } from '../../../features/events/eventsApi';
import {
  useDeleteMoodboardItemMutation,
  useGetMoodboardQuery,
  useReorderMoodboardMutation,
  useSaveMoodboardColorsMutation,
  useUpdateMoodboardCaptionMutation,
  useUploadMoodboardImageMutation,
} from '../../../features/events/moodboardApi';
import type { MoodboardItem } from '../../../features/events/moodboardApi';
import { serviceImage } from '../../../features/services/servicesApi';

const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const validHex = /^#[0-9A-Fa-f]{6}$/;

interface PendingImage {
  file: File;
  previewUrl: string;
}

export default function EventMoodboardPage() {
  const { eventId: eventIdParam } = useParams();
  const eventId = Number(eventIdParam);
  const isValidEventId = Number.isInteger(eventId) && eventId > 0;
  const { data: event, isLoading: isLoadingEvent, isError: eventError } = useGetEventByIdQuery(eventId, { skip: !isValidEventId });
  const { data: moodboard, isLoading, isError, refetch } = useGetMoodboardQuery(eventId, { skip: !isValidEventId });
  const [uploadImage, { isLoading: isUploading }] = useUploadMoodboardImageMutation();
  const [updateCaption, { isLoading: isUpdatingCaption }] = useUpdateMoodboardCaptionMutation();
  const [deleteItem, { isLoading: isDeleting }] = useDeleteMoodboardItemMutation();
  const [reorderItems, { isLoading: isReordering }] = useReorderMoodboardMutation();
  const [saveColors, { isLoading: isSavingColors }] = useSaveMoodboardColorsMutation();
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const pendingUrls = useRef(new Set<string>());
  const exportRef = useRef<HTMLDivElement>(null);
  const draggedItemId = useRef<number | null>(null);
  const [captionDrafts, setCaptionDrafts] = useState<Record<number, string>>({});
  const [uploadCaption, setUploadCaption] = useState('');
  const [colors, setColors] = useState<string[]>([]);
  const [paletteLoadedForEvent, setPaletteLoadedForEvent] = useState(0);
  const [hexDraft, setHexDraft] = useState('#D9A3AA');
  const [selectedImage, setSelectedImage] = useState<MoodboardItem | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (moodboard && paletteLoadedForEvent !== eventId) {
      setColors(moodboard.colors);
      setPaletteLoadedForEvent(eventId);
    }
  }, [eventId, moodboard, paletteLoadedForEvent]);

  useEffect(() => () => {
    pendingUrls.current.forEach((url) => URL.revokeObjectURL(url));
    pendingUrls.current.clear();
  }, []);

  useEffect(() => {
    if (!selectedImage) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [selectedImage]);

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

  const moveItem = async (itemIndex: number, targetIndex: number) => {
    const ordered = [...(moodboard?.items || [])].sort((a, b) => a.position - b.position);
    if (targetIndex < 0 || targetIndex >= ordered.length || targetIndex === itemIndex) return;
    const [item] = ordered.splice(itemIndex, 1);
    ordered.splice(targetIndex, 0, item);
    try {
      await reorderItems({ eventId, itemIds: ordered.map((entry) => entry.id) }).unwrap();
      setError('');
    } catch {
      setError('Could not save the image order.');
    }
  };

  const handleDrop = async (targetId: number) => {
    const sourceId = draggedItemId.current;
    draggedItemId.current = null;
    if (!sourceId || sourceId === targetId) return;
    const ordered = [...(moodboard?.items || [])].sort((a, b) => a.position - b.position);
    const sourceIndex = ordered.findIndex((item) => item.id === sourceId);
    const targetIndex = ordered.findIndex((item) => item.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;
    await moveItem(sourceIndex, targetIndex);
  };

  const saveCaption = async (item: MoodboardItem) => {
    try {
      await updateCaption({ eventId, itemId: item.id, caption: (captionDrafts[item.id] ?? item.caption ?? '').trim() || null }).unwrap();
      setNotice('Caption saved.');
      setError('');
    } catch {
      setError('Could not save the caption.');
    }
  };

  const removeItem = async (item: MoodboardItem) => {
    if (!window.confirm('Delete this inspiration image?')) return;
    try {
      await deleteItem({ eventId, itemId: item.id }).unwrap();
      setError('');
    } catch {
      setError('Could not delete the image.');
    }
  };

  const addColor = () => {
    if (!validHex.test(hexDraft)) {
      setError('Enter a valid HEX color, for example #D9A3AA.');
      return;
    }
    if (colors.some((color) => color.toLowerCase() === hexDraft.toLowerCase())) return;
    setColors((current) => [...current, hexDraft.toUpperCase()]);
    setError('');
  };

  const handleSaveColors = async () => {
    try {
      await saveColors({ eventId, colors }).unwrap();
      setNotice('Event colors saved.');
      setError('');
    } catch {
      setError('Could not save the color palette.');
    }
  };

  const saveBoardAsImage = async () => {
    const board = exportRef.current;
    if (!board || isExporting) return;
    setError('');
    setNotice('Preparing your moodboard image...');
    setIsExporting(true);
    try {
      await document.fonts.ready;
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      const dataUrl = await toPng(board, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#FFF8F1',
        filter: (node: HTMLElement) => !(node instanceof Element && node.hasAttribute('data-export-ignore')),
      });
      const anchor = document.createElement('a');
      const eventSlug = (event?.title || 'event')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 48) || `event-${eventId}`;
      anchor.download = `yourevent-moodboard-${eventSlug}-event-${eventId}.png`;
      anchor.href = dataUrl;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setNotice('Moodboard image downloaded.');
    } catch (exportError) {
      console.error('Moodboard export failed:', exportError);
      setNotice('');
      setError('Could not export the full moodboard. Check that all images have loaded, then try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isValidEventId) return <p className="text-sm text-red-600">Invalid event.</p>;
  if (isLoadingEvent) return <p className="text-sm text-[#351018]/60">Loading event...</p>;
  if (eventError || !event) return <p className="text-sm text-red-600">Event not found.</p>;

  const orderedItems = [...(moodboard?.items || [])].sort((a, b) => a.position - b.position);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link data-export-ignore to={`/organizer/events/${eventId}`} className="inline-flex items-center gap-2 text-sm text-[#351018]/70 hover:text-[#351018]">
        <ArrowLeft size={17} /> Back to {event.title}
      </Link>
      <div ref={exportRef} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#351018]">Event Moodboard</h1>
          <p className="mt-1 text-sm text-[#351018]/60">Collect inspiration and bring your event vision to life.</p>
        </div>
        <div data-export-ignore className="flex flex-wrap gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#351018] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#D9A3AA] hover:text-[#351018]">
            <ImagePlus size={18} /> Add Photos
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFiles} className="sr-only" />
          </label>
          <button type="button" onClick={saveBoardAsImage} disabled={isExporting || isLoading || (orderedItems.length === 0 && colors.length === 0)} className="inline-flex items-center gap-2 rounded-xl border border-[#351018]/20 bg-white px-5 py-3 text-sm font-medium text-[#351018] transition hover:bg-[#F2D9DC]/50 disabled:cursor-not-allowed disabled:opacity-50">
            <Download size={18} /> {isExporting ? 'Saving Image...' : 'Save as Image'}
          </button>
        </div>
      </div>

      <section className="space-y-4 rounded-2xl border border-[#D9A3AA]/40 bg-white p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold text-[#351018]">Your Event Colors</h2>
          <p className="mt-1 text-sm text-[#351018]/60">Build a palette for your event inspiration.</p>
        </div>
        <div data-export-ignore className="flex flex-wrap items-end gap-3">
          <label className="space-y-2 text-sm font-medium text-[#351018]">
            Choose a color
            <input type="color" value={validHex.test(hexDraft) ? hexDraft : '#D9A3AA'} onChange={(event) => setHexDraft(event.target.value.toUpperCase())} className="block h-11 w-16 cursor-pointer rounded-lg border border-[#351018]/15 bg-white p-1" />
          </label>
          <label className="space-y-2 text-sm font-medium text-[#351018]">
            HEX value
            <input value={hexDraft} onChange={(event) => setHexDraft(event.target.value)} maxLength={7} className="block w-32 rounded-xl border border-[#351018]/15 px-3 py-2.5 font-mono text-sm uppercase outline-none focus:ring-2 focus:ring-[#D9A3AA]" />
          </label>
          <button type="button" onClick={addColor} className="rounded-xl border border-[#351018]/20 px-4 py-2.5 text-sm font-medium text-[#351018] hover:bg-[#F2D9DC]/50">Add Color</button>
          <button type="button" onClick={handleSaveColors} disabled={isSavingColors} className="rounded-xl bg-[#351018] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">{isSavingColors ? 'Saving...' : 'Save Palette'}</button>
        </div>
        <div className="flex flex-wrap gap-3">
          {colors.map((color, index) => (
            <div key={`${color}-${index}`} className="flex items-center gap-2 rounded-full border border-[#351018]/10 bg-[#FFF8F1] py-1 pl-1 pr-3">
              {isExporting ? (
                <img alt={color} src={`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><circle cx="32" cy="32" r="30" fill="${color}"/></svg>`)}`} className="h-8 w-8 rounded-full border border-[#351018]/10" />
              ) : (
                <input aria-label={color} type="color" value={color} disabled className="h-8 w-8 cursor-default rounded-full border border-[#351018]/10 p-0 disabled:opacity-100" />
              )}
              <span className="font-mono text-xs text-[#351018]">{color}</span>
              <button data-export-ignore type="button" onClick={() => setColors((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove ${color}`} className="ml-1 text-sm text-[#351018]/60 hover:text-red-600">×</button>
            </div>
          ))}
          {colors.length === 0 && <p className="text-sm text-[#351018]/50">No colors selected yet.</p>}
        </div>
      </section>

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


      <section className="space-y-4 rounded-2xl border border-[#D9A3AA]/40 bg-white p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold text-[#351018]">Inspiration Gallery</h2>
          <p className="mt-1 text-sm text-[#351018]/60">Drag photos to rearrange them, or use the move controls.</p>
        </div>
        {isLoading ? (
          <p className="text-sm text-[#351018]/60">Loading inspiration...</p>
        ) : isError ? (
          <p className="text-sm text-red-600">Could not load the moodboard. <button onClick={() => refetch()} className="underline">Try again</button></p>
        ) : orderedItems.length === 0 ? (
          <div className="rounded-xl bg-[#FFF8F1] px-5 py-12 text-center text-sm text-[#351018]/60">No inspiration images yet. Add your first photo to this event's moodboard.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {orderedItems.map((item, index) => (
              <article key={item.id} draggable onDragStart={() => { draggedItemId.current = item.id; }} onDragOver={(event) => event.preventDefault()} onDrop={() => handleDrop(item.id)} className="group overflow-hidden rounded-2xl border border-[#D9A3AA]/40 bg-white transition-shadow hover:shadow-md">
                <button type="button" onClick={() => setSelectedImage(item)} aria-label={`Preview ${item.caption || 'inspiration image'}`} className="block aspect-[4/3] w-full overflow-hidden bg-[#F2D9DC]/30">
                  <img src={serviceImage(item.imageUrl) || ''} alt={item.caption || 'Event inspiration'} className={`h-full w-full transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none ${isExporting ? 'object-contain' : 'object-cover'}`} />
                </button>
                <div className="space-y-3 p-4">
                  {isExporting ? (
                    (captionDrafts[item.id] ?? item.caption) && <p className="min-h-10 whitespace-pre-wrap break-words text-sm text-[#351018]">{captionDrafts[item.id] ?? item.caption}</p>
                  ) : (
                    <label data-export-ignore className="block space-y-1 text-xs font-medium text-[#351018]">
                      Caption
                      <input value={captionDrafts[item.id] ?? item.caption ?? ''} onChange={(event) => setCaptionDrafts((drafts) => ({ ...drafts, [item.id]: event.target.value }))} maxLength={250} className="w-full rounded-lg border border-[#351018]/15 px-3 py-2 text-sm font-normal outline-none focus:ring-2 focus:ring-[#D9A3AA]" />
                    </label>
                  )}
                  <div data-export-ignore className="flex items-center justify-between gap-2">
                    <button type="button" onClick={() => saveCaption(item)} disabled={isUpdatingCaption} className="rounded-lg border border-[#351018]/15 px-3 py-2 text-xs text-[#351018] disabled:opacity-50">Save Caption</button>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => moveItem(index, index - 1)} disabled={index === 0 || isReordering} aria-label="Move image up" className="rounded-lg border border-[#351018]/15 p-2 text-[#351018] disabled:opacity-30"><ArrowUp size={15} /></button>
                      <button type="button" onClick={() => moveItem(index, index + 1)} disabled={index === orderedItems.length - 1 || isReordering} aria-label="Move image down" className="rounded-lg border border-[#351018]/15 p-2 text-[#351018] disabled:opacity-30"><ArrowDown size={15} /></button>
                      <button type="button" onClick={() => removeItem(item)} disabled={isDeleting} aria-label="Delete inspiration image" className="rounded-lg border border-[#351018]/15 p-2 text-[#351018] hover:bg-[#F2D9DC]/50 disabled:opacity-50"><Trash2 size={15} /></button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      </div>
      {notice && <p data-export-ignore role="status" className="text-sm text-[#351018]">{notice}</p>}
      {error && <p data-export-ignore role="alert" className="rounded-xl border border-red-200 bg-white p-3 text-sm text-red-600">{error}</p>}

      {selectedImage && (
        <div data-export-ignore role="dialog" aria-modal="true" aria-label={selectedImage.caption || 'Moodboard image preview'} onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedImage(null); }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 sm:p-8">
          <button type="button" onClick={() => setSelectedImage(null)} aria-label="Close image preview" className="absolute right-4 top-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"><X size={24} /></button>
          <div className="flex max-h-full max-w-full flex-col items-center gap-3">
            <img src={serviceImage(selectedImage.imageUrl) || ''} alt={selectedImage.caption || 'Event inspiration'} className="max-h-[85vh] max-w-[92vw] object-contain" />
            {selectedImage.caption && <p className="text-sm text-white">{selectedImage.caption}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
