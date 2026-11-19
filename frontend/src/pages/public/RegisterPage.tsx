import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

import { useRegisterMutation } from '../../features/auth/authApi';
import type { Role } from '../../types/auth';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [register, { isLoading }] = useRegisterMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('organizer');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register({ name, email, password, role }).unwrap();
      navigate('/login');
    } catch {
      setError('Registration failed. Please check your details.');
    }
  };

  return (
    <main className="ye-ui ye-auth flex min-h-screen items-center justify-center bg-[#FFF8F1] px-6 py-12">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-10 flex items-center justify-center gap-2 text-3xl font-bold text-[#351018]"
        >
          <Heart size={28} fill="none" aria-hidden="true" className="shrink-0 text-[#351018]" />
          YourEvent.
        </Link>

        <h1 className="text-center text-3xl font-semibold text-[#351018]">
          Create Account
        </h1>

        <p className="mt-3 text-center text-sm text-[#351018]/60">
          Join us and make every event unforgettable.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {(['organizer', 'provider'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setRole(item)}
                className={`rounded-xl border px-4 py-4 text-sm font-medium capitalize transition ${
                  role === item
                    ? 'border-[#351018] bg-[#351018] text-white'
                    : 'border-[#351018]/20 text-[#351018] hover:border-[#351018]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            className="w-full rounded-xl border border-[#351018]/20 px-4 py-3 outline-none focus:border-[#351018]"
          />

          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="w-full rounded-xl border border-[#351018]/20 px-4 py-3 outline-none focus:border-[#351018]"
          />

          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-[#351018]/20 px-4 py-3 outline-none focus:border-[#351018]"
          />

          <input
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            className="w-full rounded-xl border border-[#351018]/20 px-4 py-3 outline-none focus:border-[#351018]"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-[#351018] py-3.5 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[#351018]/70">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#351018]">
            Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}