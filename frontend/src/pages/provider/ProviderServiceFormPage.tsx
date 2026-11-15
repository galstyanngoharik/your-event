import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ImagePlus, Save, Trash2 } from 'lucide-react';
import {
  useCreateServiceMutation,
  useGetMyServicesQuery,
  useUpdateServiceMutation,
  useUploadServiceImageMutation,
  serviceImage,
} from '../../features/services/servicesApi';

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

export default function ProviderServiceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const serviceId = id ? Number(id) : null;
  const editing = serviceId !== null;
  const {
    data: services = [],
    isLoading: isLoadingServices,
    isError: servicesError,
    refetch,
  } = useGetMyServicesQuery();
  const service = editing ? services.find((item) => item.id === serviceId) : undefined;
  const [createService, { isLoading: isCreating }] = useCreateServiceMutation();
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadServiceImageMutation();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [price, setPrice] = useState('');
  const [active, setActive] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!service) return;
    setTitle(service.title);
    setCategory(service.category);
    setDescription(service.description || '');
    setCity(service.city);
    setPrice(String(service.price));
    setActive(service.active);
    setImages(service.images || []);
  }, [service]);

  const handleImages = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;

    if (images.length + files.length > 12) {
      setError('You can add up to 12 images.');
      return;
    }

    setError('');
    setNotice('');
    const uploaded: string[] = [];

    for (const file of files) {
      if (!allowedTypes.includes(file.type) || file.size > 5 * 1024 * 1024) {
        setError('Choose JPG, PNG or WEBP images smaller than 5 MB.');
        return;
      }

      const formData = new FormData();
      formData.append('image', file);
      try {
        const result = await uploadImage(formData).unwrap();
        uploaded.push(result.url);
      } catch {
        setError('Failed to upload an image. Please try again.');
        return;
      }
    }

    setImages((current) => [...current, ...uploaded]);
    setNotice(`${uploaded.length} image${uploaded.length === 1 ? '' : 's'} uploaded.`);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');

    const amount = Number(price);
    if (!title.trim() || !category.trim() || !city.trim()) {
      setError('Title, category and city are required.');
      return;
    }
    if (!Number.isFinite(amount) || amount < 0) {
      setError('Enter a valid non-negative price.');
      return;
    }

    const data = {
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      city: city.trim(),
      price: amount,
      images,
      active,
    };

    try {
      if (editing && serviceId) {
        await updateService({ id: serviceId, data }).unwrap();
      } else {
        await createService(data).unwrap();
      }
      navigate('/provider/services');
    } catch {
      setError(`Failed to ${editing ? 'update' : 'create'} service. Please try again.`);
    }
  };

  if (editing && (isLoadingServices || (!service && !servicesError))) {
    return <p className="text-sm text-[#351018]/60">Loading service...</p>;
  }

  if (editing && (!service || servicesError)) {
    return (
      <div className="rounded-2xl bg-white p-6 text-sm text-red-600">
        {servicesError ? 'Failed to load your services.' : 'Service not found in your account.'}
        {servicesError && <button onClick={() => refetch()} className="ml-2 underline">Try again</button>}
      </div>
    );
  }

  const isSaving = isCreating || isUpdating;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/provider/services" className="inline-flex items-center gap-2 text-sm text-[#351018]">
        <ArrowLeft size={17} /> Back to My Services
      </Link>
      <div>
        <h1 className="text-2xl font-semibold text-[#351018]">
          {editing ? 'Edit Service' : 'Add New Service'}
        </h1>
        <p className="mt-1 text-sm text-[#351018]/60">
          Update the details organizers see in the services catalog.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-[#D9A3AA]/40 bg-white p-5 sm:p-7">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-[#351018]">
            Service title
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} required className="w-full rounded-xl border border-[#351018]/15 px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-[#D9A3AA]" />
          </label>
          <label className="space-y-2 text-sm font-medium text-[#351018]">
            Category
            <input value={category} onChange={(e) => setCategory(e.target.value)} maxLength={80} required className="w-full rounded-xl border border-[#351018]/15 px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-[#D9A3AA]" />
          </label>
          <label className="space-y-2 text-sm font-medium text-[#351018]">
            City
            <input value={city} onChange={(e) => setCity(e.target.value)} maxLength={100} required className="w-full rounded-xl border border-[#351018]/15 px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-[#D9A3AA]" />
          </label>
          <label className="space-y-2 text-sm font-medium text-[#351018]">
            Price (AMD)
            <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full rounded-xl border border-[#351018]/15 px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-[#D9A3AA]" />
          </label>
        </div>

        <label className="block space-y-2 text-sm font-medium text-[#351018]">
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={5000} rows={5} className="w-full resize-y rounded-xl border border-[#351018]/15 px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-[#D9A3AA]" />
        </label>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-[#351018]">Service images</p>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#351018]/15 px-3 py-2 text-sm text-[#351018] transition hover:bg-[#F2D9DC]/50">
              <ImagePlus size={16} /> {isUploading ? 'Uploading...' : 'Add images'}
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImages} disabled={isUploading || images.length >= 12} className="sr-only" />
            </label>
          </div>
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {images.map((image, index) => (
                <div key={`${image}-${index}`} className="relative">
                  <img src={serviceImage(image) || ''} alt={`Service image ${index + 1}`} className="h-28 w-full rounded-lg object-cover" />
                  <button type="button" onClick={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label="Remove image" className="absolute right-2 top-2 rounded-full bg-white p-2 text-[#351018] shadow">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-[#351018]/50">JPG, PNG or WEBP, up to 5 MB each. Maximum 12 images.</p>
        </div>

        <label className="flex items-center gap-3 text-sm text-[#351018]">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 accent-[#351018]" />
          Service is active and visible in the catalog
        </label>

        {notice && <p className="text-sm text-[#351018]">{notice}</p>}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end border-t border-[#D9A3AA]/30 pt-5">
          <button type="submit" disabled={isSaving || isUploading} className="inline-flex items-center gap-2 rounded-xl bg-[#351018] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#D9A3AA] hover:text-[#351018] disabled:opacity-50">
            <Save size={17} /> {isSaving ? 'Saving...' : editing ? 'Save Changes' : 'Create Service'}
          </button>
        </div>
      </form>
    </div>
  );
}