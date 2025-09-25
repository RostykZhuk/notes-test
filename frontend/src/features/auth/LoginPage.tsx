import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { extractErrorMessage } from '../../utils/error';
import { AuthLayout } from './AuthLayout';
import './auth.css';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isInitializing } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await login({ email, password });
      const state = location.state as { from?: { pathname: string } } | undefined;
      const redirectTo = state?.from?.pathname ?? '/';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setError(extractErrorMessage(error, 'Invalid email or password'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="QuickNotes" subtitle="Sign in to continue">
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          <span>Email</span>
          <input
            disabled={isSubmitting || isInitializing}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label>
          <span>Password</span>
          <input
            disabled={isSubmitting || isInitializing}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn--primary" type="submit" disabled={isSubmitting || isInitializing}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className="auth-link">
        Need an account? <Link to="/register">Register</Link>
      </p>
    </AuthLayout>
  );
};
