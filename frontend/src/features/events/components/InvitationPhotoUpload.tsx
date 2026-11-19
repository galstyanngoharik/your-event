import type { ChangeEvent } from 'react';
import { Upload, X } from 'lucide-react';

export default function InvitationPhotoUpload({ fileName, hasImage, onChange, onRemove }: {
  fileName?: string;
  hasImage: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-base font-semibold text-[#351018]">Optional background photo</p>
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#351018]/15 px-4 py-3 text-sm text-[#351018] hover:bg-[#F2D9DC]/40">
        <Upload size={16} /> {fileName || 'Choose photo'}
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onChange} className="sr-only" />
      </label>
      {hasImage && (
        <button type="button" onClick={onRemove} className="ml-3 inline-flex items-center gap-1 text-sm text-[#351018]/70">
          <X size={15} /> Remove photo
        </button>
      )}
      <p className="text-xs text-[#351018]/50">JPG, PNG or WEBP. Maximum 5 MB.</p>
    </div>
  );
}
