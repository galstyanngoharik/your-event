interface Props {
  instagram: string;
  phoneNumber: string;
  setInstagram: (value: string) => void;
  setPhoneNumber: (value: string) => void;
}

export default function ProviderContactFields({ instagram, phoneNumber, setInstagram, setPhoneNumber }: Props) {
  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#351018]">
          Instagram
        </label>
        <input
          type="url"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          maxLength={255}
          placeholder="https://www.instagram.com/username/ or @username"
          className="w-full rounded-xl border border-[#351018]/15 px-4 py-3 outline-none focus:ring-2 focus:ring-[#D9A3AA]"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[#351018]">
          Phone Number
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          maxLength={32}
          placeholder="+000000000"
          className="w-full rounded-xl border border-[#351018]/15 px-4 py-3 outline-none focus:ring-2 focus:ring-[#D9A3AA]"
        />
      </div>
    </>
  );
}
