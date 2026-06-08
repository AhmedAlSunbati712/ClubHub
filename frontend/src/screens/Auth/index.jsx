import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Users, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button.jsx';
import campusBg from '../../assets/dormitory.jpg';
import wordmark from '../../assets/dartmouth-wordmark.png';
import { ROUTES } from '../../constants/routes.js';
import { useCreateUser } from '../../api/user.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Auth() {
  const navigate = useNavigate();
  const { login, user, isLoading } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const isLogin = mode === 'login';
  const { mutate: createUser, isPending: isPendingCreatingUser } = useCreateUser(() => {
    toast.success('Account created. Sign in to continue.');
    setMode('login');
    setShowPw(false);
    setForm((current) => ({
      ...current,
      password: '',
    }));
  });

  const handleChange = (field) => (e) => {
    setForm((current) => ({
      ...current,
      [field]: e.target.value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      try {
        await login({email: form.email, password: form.password});
        navigate(ROUTES.PROFILE);
    
      } catch (error) {
        console.log(error);
        toast.error("Invalid email or password!")
      }
      return;
    }

    createUser(
      {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      },
      {
        onError: (error) => {
          const message =
            error?.response?.data?.Error ||
            error?.response?.data?.errors?.[0]?.msg ||
            'Failed to create account';
          toast.error(message);
        },
      },
    );
  };

  if (isLoading) {
    return null;
  }

  if (user) {
    return <Navigate to={ROUTES.EVENTS} replace />;
  }

  return (
    <div className="auth">
      <aside className="auth__media" style={{ backgroundImage: `url(${campusBg})` }}>
        <div className="auth__media-brand">
          <span className="navbar__brand-mark">
            <Users size={19} strokeWidth={2.5} />
          </span>
          DartClubs
        </div>
        <div className="auth__media-text">
          <p className="auth__media-sub">
            Discover clubs, RSVP to events, and build your Dartmouth experience.
          </p>
          <div className="auth__media-affil">
            <span className="auth__media-affil-label">An official platform of</span>
            <img className="auth__wordmark" src={wordmark} alt="Dartmouth" />
          </div>
        </div>
      </aside>

      <main className="auth__panel">
        <div className="auth__form-wrap">
          <div className="auth__brand-mobile">
            <span className="navbar__brand-mark">
              <Users size={18} strokeWidth={2.5} />
            </span>
            DartClubs
          </div>

          <div className="auth__switch" role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              role="tab"
              aria-selected={isLogin}
              className={`auth__switch-btn${isLogin ? ' is-active' : ''}`}
              onClick={() => setMode('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isLogin}
              className={`auth__switch-btn${!isLogin ? ' is-active' : ''}`}
              onClick={() => setMode('signup')}
            >
              Sign Up
            </button>
          </div>

          <div className="auth__head">
            <h1 className="auth__title">{isLogin ? 'Welcome back' : 'Create your account'}</h1>
            <p className="auth__subtitle">
              {isLogin
                ? 'Sign in to manage your clubs and events.'
                : 'Join with your Dartmouth email to get started.'}
            </p>
          </div>

          <form className="auth__form" onSubmit={submit}>
            {!isLogin && (
              <label className="field">
                <span className="field__label">Full name</span>
                <span className="field__control">
                  <User className="field__icon" size={17} />
                  <input
                    type="text"
                    placeholder="Alex Thompson"
                    autoComplete="name"
                    value={form.name}
                    onChange={handleChange('name')}
                    required
                  />
                </span>
              </label>
            )}

            <label className="field">
              <span className="field__label">Email</span>
              <span className="field__control">
                <Mail className="field__icon" size={17} />
                <input
                  type="email"
                  placeholder="alex.thompson.26@dartmouth.edu"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  required
                />
              </span>
            </label>

            <label className="field">
              <span className="field__label">Password</span>
              <span className="field__control">
                <Lock className="field__icon" size={17} />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  value={form.password}
                  onChange={handleChange('password')}
                  required
                />
                <button
                  type="button"
                  className="field__toggle"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPw((v) => !v)}
                >
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>

            {isLogin && (
              <div className="auth__row">
                <label className="auth__remember">
                  <input type="checkbox" defaultChecked />
                  Remember me
                </label>
                <button
                  type="button"
                  className="auth__link"
                  onClick={() => toast.info('Password reset coming soon')}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" className="btn-block auth__submit" disabled={!isLogin && isPendingCreatingUser}>
              {isLogin ? 'Sign In' : isPendingCreatingUser ? 'Creating Account...' : 'Create Account'}
              <ArrowRight size={16} />
            </Button>
          </form>

          <p className="auth__foot">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" className="auth__link" onClick={() => setMode(isLogin ? 'signup' : 'login')}>
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
