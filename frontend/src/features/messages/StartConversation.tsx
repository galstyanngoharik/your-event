
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useCreateConversationMutation } from './messagesApi';

interface Props {
  providerId: number;
}

export default function StartConversationButton({
  providerId,
}: Props) {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const [createConversation, { isLoading }] =
    useCreateConversationMutation();

  const handleClick = async () => {
    setError('');
    try {
      const conversation = await createConversation({
        providerId,
      }).unwrap();

      navigate(`/organizer/messages?chat=${conversation.id}`);
    } catch {
      setError('Could not start the conversation. Please try again.');
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="flex items-center gap-2 rounded-xl bg-[#351018] px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        <MessageCircle size={18} />
        {isLoading ? 'Opening chat...' : 'Start conversation'}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
