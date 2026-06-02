import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import Button from '../components/common/Button.jsx';
import campusBg from '../assets/dormitory.jpg';
import wordmark from '../assets/dartmouth-wordmark.png';

// Split auth screen — media + brand on the left, sign in / sign up on the right.
export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [showPw, setShowPw] = useState(false);
  const isLogin = mode === 'login';

  const submit = (e) => {
    e.preventDefault();
    toast(isLogin ? 'Welcome back to DartClubs' : 'Account created — welcome to DartClubs');
    navigate('/events');
  };

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
                  <input type="text" placeholder="Alex Thompson" autoComplete="name" required />
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
                  onClick={() => toast('Password reset coming soon', { variant: 'info' })}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" className="btn-block auth__submit">
              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight size={16} />
            </Button>
          </form>

          <div className="auth__divider">
            <span>or</span>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={() => toast('Dartmouth NetID SSO coming soon', { variant: 'info' })}
          >
            Continue with Dartmouth NetID
          </button>

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
