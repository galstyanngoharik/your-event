import { useState } from 'react';
import { Plus, Trash2, Users } from 'lucide-react';
import {
  useGetGuestsQuery,
  useCreateGuestMutation,
  useDeleteGuestMutation,
} from '../guestsApi';
interface Props {
  eventId: number;
}

export default function GuestsTab({ eventId }: Props) {
  const [name, setName] = useState('');
  const {
  data: guests = [],
  isLoading,
  isError,
} = useGetGuestsQuery(eventId);

const [createGuest] = useCreateGuestMutation();
const [deleteGuest] = useDeleteGuestMutation();

  const handleAdd = async () => {
    if (!name.trim()) return;

  try {
    await createGuest({
      eventId,
      name: name.trim(),
    }).unwrap();

    setName('');
  } catch (err) {
    console.log(err);
  }
  };

  const handleDelete = async (guestId: number) => {
    try {
    await deleteGuest({
      eventId,
      guestId,
    }).unwrap();
  } catch (err) {
    console.log(err);
  }
  };

  return (
    <div className="space-y-6">
      <div>
        {isLoading && (
        <p className="text-sm text-[#351018]/60">
            Loading guests...
        </p>
        )}

        {isError && (
        <p className="text-sm text-red-600">
            Failed to load guests.
        </p>
        )}
        <h2 className="text-xl font-semibold text-[#351018]">
          Guest List
        </h2>
        <p className="mt-1 text-sm text-[#351018]/60">
          Manage your invitations and guest responses.
        </p>
      </div>

      <div className="flex gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Guest name"
          className="flex-1 rounded-xl border border-[#351018]/15 px-4 py-3 text-sm outline-none"
        />

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-xl bg-[#351018] px-5 py-3 text-sm text-white"
        >
          <Plus size={18} />
          Add Guest
        </button>
      </div>

      <div className="rounded-xl border border-[#351018]/10">
        {guests.length === 0 ? (
          <div className="py-12 text-center">
            <Users
              size={36}
              className="mx-auto mb-3 text-[#351018]/30"
            />
            <p className="text-sm text-[#351018]/50">
              No guests added yet.
            </p>
          </div>
        ) : (
          guests.map((guest) => (
            <div
              key={guest.id}
              className="flex items-center justify-between border-b border-[#351018]/10 p-4 last:border-0"
            >
              <span className="text-sm font-medium text-[#351018]">
                {guest.name}
              </span>

              <div className="flex items-center gap-4">
                <span className="rounded-full bg-[#351018]/5 px-3 py-1 text-xs capitalize text-[#351018]">
                  {guest.status}
                </span>

                <button
                  onClick={() => handleDelete(guest.id)}
                  aria-label="Delete guest"
                >
                  <Trash2 size={18} className="text-[#351018]/50" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}