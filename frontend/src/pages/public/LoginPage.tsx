import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAppDispatch } from '../../app/hooks';
import { setCredentials } from '../../features/auth/authSlice';
import { useLoginMutation } from '../../features/auth/authApi';

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      const result = await login({ email, password }).unwrap();

      dispatch(setCredentials(result));

      navigate(
        result.user.role === 'organizer' ? '/organizer' : '/provider',
        { replace: true }
      );
    } catch {
      setError('Invalid email or password');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-12 block text-center text-3xl font-bold tracking-tight text-[#351018]"
        >
          YourEvent.
        </Link>

        <h1 className="text-center text-3xl font-semibold text-[#351018]">
          Welcome Back
        </h1>

        <p className="mt-3 text-center text-sm text-[#351018]/60">
          Sign in to continue planning your moments.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#351018]">
              Email
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-xl border border-[#351018]/20 px-4 py-3 text-[#351018] outline-none transition focus:border-[#351018]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#351018]">
              Password
            </label>

            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-[#351018]/20 px-4 py-3 text-[#351018] outline-none transition focus:border-[#351018]"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-[#351018] py-3.5 font-medium text-white transition hover:bg-[#351018]/90 disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[#351018]/70">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-[#351018]">
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}