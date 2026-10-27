import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Library,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Server,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  Zap,
  Info
} from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, demoLogin, isAuthenticated, user } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const defaultTarget = user?.role === 'STUDENT' ? '/student/dashboard' : '/dashboard';
      const target = location.state?.from?.pathname || defaultTarget;
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user?.role, navigate, location]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Check Spring Boot API connectivity
  useEffect(() => {
    let isMounted = true;
    async function checkApi() {
      try {
        const res = await fetch('/api/members?page=0&size=1', {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });
        if (isMounted) {
          // Even if 401/403, the server is responding!
          setBackendStatus(res.status < 500 ? 'online' : 'offline');
        }
      } catch (err) {
        if (isMounted) {
          setBackendStatus('offline');
        }
      }
    }
    checkApi();
    return () => {
      isMounted = false;
    };
  }, []);

  // Detect Caps Lock state
  const handleKeyDown = (e) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState('CapsLock'));
    }
  };

  // Submit credentials to POST /api/members/login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your institutional email address.');
      return;
    }
    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    setLoading(true);

    try {
      const response = await login({ email: trimmedEmail, password });
      setLoginSuccess(true);
      setTimeout(() => {
        const userRole = response?.role || 'ADMIN';
        const defaultDest = userRole === 'STUDENT' ? '/student/dashboard' : '/dashboard';
        const destination = location.state?.from?.pathname || defaultDest;
        navigate(destination, { replace: true });
      }, 700);
    } catch (err) {
      console.error('[LoginPage] Authentication failed:', err);
      let message = err.message || 'Invalid email or password';
      if (err.message && err.message.includes('Failed to fetch')) {
        message = 'Could not reach backend service at http://localhost:8080. Please ensure Spring Boot is running.';
      } else if (err.data?.message) {
        message = err.data.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for testing & development
  const handleQuickFill = (role) => {
    setError(null);
    if (role === 'admin') {
      setEmail('admin@library.com');
      setPassword('Admin@1234');
    } else if (role === 'student') {
      setEmail('student@library.com');
      setPassword('Student@1234');
    }
  };

  // One-click demo login for previewing when backend is offline
  const handleInstantDemo = (role) => {
    demoLogin(role);
    setLoginSuccess(true);
    setTimeout(() => {
      const destination = role === 'STUDENT' ? '/student/dashboard' : '/dashboard';
      navigate(destination, { replace: true });
    }, 600);
  };

  return (
    <div className="login-root-container">
      {/* Dynamic Ambient Glow Backdrops */}
      <div className="login-glow-orb login-glow-orb-1" />
      <div className="login-glow-orb login-glow-orb-2" />
      <div className="login-glow-orb login-glow-orb-3" />
      <div className="login-grid-overlay" />

      <div className="login-content-wrapper">
        {/* Left Showcase Column (Desktop / Tablet) */}
        <div className="login-brand-panel">
          {/* Brand Logo & Title */}
          <div className="login-brand-header">
            <div className="login-logo-badge">
              <Library size={28} />
            </div>
            <div>
              <div className="login-brand-title">
                Libri<span className="brand-accent">Core</span>
              </div>
              <div className="login-brand-edition">Enterprise Library System v2.4</div>
            </div>
          </div>

          {/* Hero Pitch */}
          <div className="login-hero-pitch">
            <div className="login-system-pill">
              <Sparkles size={14} className="pill-sparkle" />
              <span>Next-Gen Academic & Public Library Engine</span>
            </div>
            <h1 className="login-hero-headline">
              Intelligent Circulation, Inventory & Patron Management.
            </h1>
            <p className="login-hero-desc">
              Centralized access for academic librarians and patrons. Seamlessly integrated with
              high-throughput Spring Boot REST microservices and JWT enterprise security.
            </p>
          </div>

          {/* Feature Highlight Cards */}
          <div className="login-feature-cards">
            <div className="login-feature-item">
              <div className="feature-icon-box cyan">
                <BookOpen size={18} />
              </div>
              <div>
                <div className="feature-item-title">Real-time Catalog & Stock</div>
                <div className="feature-item-desc">
                  Live ISBN tracking, circulation limits, and dynamic availability computation.
                </div>
              </div>
            </div>

            <div className="login-feature-item">
              <div className="feature-icon-box indigo">
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="feature-item-title">Role-Based Security & Permissions</div>
                <div className="feature-item-desc">
                  Strict JWT authorization guards catalog creation, loans, and member records.
                </div>
              </div>
            </div>

            <div className="login-feature-item">
              <div className="feature-icon-box emerald">
                <Zap size={18} />
              </div>
              <div>
                <div className="feature-item-title">Sub-Millisecond Checkout & Receipts</div>
                <div className="feature-item-desc">
                  Rapid book issuance with printable loan dockets and fine calculation.
                </div>
              </div>
            </div>
          </div>

          {/* Backend Connection Status Footer */}
          <div className="login-backend-status-card">
            <div className="backend-status-left">
              <div className="backend-icon-wrap">
                <Server size={18} />
              </div>
              <div>
                <div className="backend-label">Spring Boot API Gateway</div>
                <div className="backend-url font-mono">http://localhost:8080/api/members/login</div>
              </div>
            </div>

            <div className={`status-pill ${backendStatus}`}>
              <span className="status-ping" />
              <span>{backendStatus === 'online' ? 'Connected' : backendStatus === 'offline' ? 'Offline' : 'Testing...'}</span>
            </div>
          </div>
        </div>

        {/* Right Authentication Form Column */}
        <div className="login-form-panel">
          <div className="login-card-container">
            {/* Top Card Header */}
            <div className="login-card-header">
              <div className="login-card-badge">
                <ShieldCheck size={13} />
                <span>REST API Authentication</span>
              </div>
              <h2 className="login-card-title">Welcome Back</h2>
              <p className="login-card-subtitle">
                Enter your institutional credentials to authenticate with the backend
              </p>
            </div>

            {/* Alert / Error Banner */}
            {error && (
              <div className="login-alert-banner">
                <AlertCircle size={18} className="alert-icon" />
                <div className="alert-content">
                  <div className="alert-title">Authentication Failed</div>
                  <div className="alert-msg">{error}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="alert-close"
                  aria-label="Dismiss alert"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Caps Lock Warning Banner */}
            {capsLockActive && (
              <div className="login-caps-warning">
                <AlertCircle size={14} />
                <span>Caps Lock is ON</span>
              </div>
            )}

            {/* Main Login Form */}
            <form onSubmit={handleSubmit} className="login-form" noValidate>
              {/* Email Input Field */}
              <div className="form-group">
                <label htmlFor="login-email" className="form-label">
                  Institutional Email
                </label>
                <div className="input-with-icon">
                  <Mail size={18} className="field-icon" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. librarian@campus.edu"
                    className="input-field-custom"
                    required
                    autoComplete="email"
                    disabled={loading || loginSuccess}
                  />
                  {email && (
                    <button
                      type="button"
                      onClick={() => setEmail('')}
                      className="field-action-btn"
                      title="Clear email"
                      tabIndex={-1}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Password Input Field */}
              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="login-password" className="form-label">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="forgot-link"
                    tabIndex={-1}
                  >
                    Need Help?
                  </button>
                </div>
                <div className="input-with-icon">
                  <Lock size={18} className="field-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter account password"
                    className="input-field-custom"
                    required
                    autoComplete="current-password"
                    disabled={loading || loginSuccess}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="field-action-btn"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Options Row: Remember Me */}
              <div className="login-options-row">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  <span className="checkbox-custom" />
                  <span className="checkbox-label">Keep me logged in on this terminal</span>
                </label>
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={loading || loginSuccess}
                className={`login-submit-btn ${loginSuccess ? 'btn-success-state' : ''}`}
                id="login-submit-button"
              >
                {loginSuccess ? (
                  <>
                    <CheckCircle2 size={18} className="success-icon animate-bounce" />
                    <span>Login Verified! Redirecting...</span>
                  </>
                ) : loading ? (
                  <>
                    <span className="submit-spinner" />
                    <span>Verifying with Spring Boot...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight size={18} className="submit-arrow" />
                  </>
                )}
              </button>
            </form>

            {/* Security Compliance Note */}
            <div className="login-footer-security">
              <ShieldCheck size={14} className="security-icon" />
              <span>TLS / AES-256 Encrypted • Spring Boot & JWT Protected Session</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password / Help Modal */}
      {showForgotModal && (
        <div className="modal-backdrop-wrap">
          <div className="forgot-modal glass-card">
            <div className="modal-header-section">
              <div className="modal-title-wrap">
                <HelpCircle size={20} className="modal-title-icon" />
                <h3 className="modal-title">Institutional Account Access</h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="btn-ghost modal-close-btn"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body-section" style={{ padding: '20px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '14px' }}>
                Because LibriCore connects with institutional databases and university SIS records,
                passwords are managed through your administrator.
              </p>
              <div
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Default Administrator Credentials:
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  If you are the developer running Spring Boot locally, ensure your database has an active member with role <code>ADMIN</code> or test using the pre-fill demo buttons.
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleQuickFill('admin');
                  setShowForgotModal(false);
                }}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Auto-fill Admin Credentials
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page-Specific Styles */}
      <style>{`
        .login-root-container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--bg-app);
          position: relative;
          overflow: hidden;
          padding: 24px 16px;
          font-family: inherit;
        }

        /* Ambient Glow Effects */
        .login-glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          z-index: 1;
        }

        .login-glow-orb-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(99, 102, 241, 0) 70%);
          top: -100px;
          left: -100px;
        }

        .login-glow-orb-2 {
          width: 480px;
          height: 480px;
          background: radial-gradient(circle, rgba(6, 182, 212, 0.14) 0%, rgba(6, 182, 212, 0) 70%);
          bottom: -120px;
          right: -100px;
        }

        .login-glow-orb-3 {
          width: 380px;
          height: 380px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0) 70%);
          top: 45%;
          left: 48%;
          transform: translate(-50%, -50%);
        }

        .login-grid-overlay {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
          z-index: 1;
        }

        /* Main Container */
        .login-content-wrapper {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1140px;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 40px;
          align-items: center;
        }

        /* Left Brand Showcase */
        .login-brand-panel {
          display: flex;
          flex-direction: column;
          gap: 28px;
          padding: 20px;
        }

        .login-brand-header {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .login-logo-badge {
          width: 54px;
          height: 54px;
          border-radius: var(--radius-lg);
          background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: 0 0 24px rgba(99, 102, 241, 0.5);
          flex-shrink: 0;
        }

        .login-brand-title {
          font-size: 1.75rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #ffffff;
          line-height: 1.1;
        }

        .brand-accent {
          color: #818cf8;
          background: linear-gradient(135deg, #818cf8 0%, #38bdf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .login-brand-edition {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-top: 4px;
        }

        .login-hero-pitch {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .login-system-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: var(--radius-full);
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.25);
          color: #a5b4fc;
          font-size: 0.8rem;
          font-weight: 600;
          width: fit-content;
        }

        .pill-sparkle {
          color: #818cf8;
        }

        .login-hero-headline {
          font-size: 2.1rem;
          font-weight: 800;
          line-height: 1.25;
          color: #ffffff;
          letter-spacing: -0.02em;
        }

        .login-hero-desc {
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        /* Feature Cards */
        .login-feature-cards {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .login-feature-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 14px 16px;
          background: rgba(19, 29, 49, 0.45);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          backdrop-filter: blur(8px);
          transition: transform var(--transition-fast), border-color var(--transition-fast);
        }

        .login-feature-item:hover {
          transform: translateX(4px);
          border-color: var(--border-medium);
          background: rgba(19, 29, 49, 0.7);
        }

        .feature-icon-box {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .feature-icon-box.cyan {
          background: rgba(6, 182, 212, 0.15);
          color: var(--accent-cyan);
        }

        .feature-icon-box.indigo {
          background: rgba(99, 102, 241, 0.15);
          color: var(--primary);
        }

        .feature-icon-box.emerald {
          background: rgba(16, 185, 129, 0.15);
          color: var(--success);
        }

        .feature-item-title {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .feature-item-desc {
          font-size: 0.78rem;
          color: var(--text-muted);
          line-height: 1.45;
        }

        /* Backend Status Card */
        .login-backend-status-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          gap: 12px;
        }

        .backend-status-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .backend-icon-wrap {
          color: var(--text-secondary);
        }

        .backend-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .backend-url {
          font-size: 0.68rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .status-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          font-size: 0.72rem;
          font-weight: 600;
          flex-shrink: 0;
        }

        .status-pill.online {
          background: rgba(16, 185, 129, 0.14);
          color: var(--success);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .status-pill.online .status-ping {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--success);
          box-shadow: 0 0 8px var(--success);
        }

        .status-pill.offline {
          background: rgba(239, 68, 68, 0.14);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .status-pill.offline .status-ping {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--danger);
        }

        .status-pill.checking {
          background: rgba(245, 158, 11, 0.14);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .status-pill.checking .status-ping {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--warning);
        }

        /* Right Form Panel */
        .login-form-panel {
          width: 100%;
        }

        .login-card-container {
          background: rgba(19, 29, 49, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-xl);
          padding: 36px 32px;
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.6), 0 0 25px rgba(99, 102, 241, 0.08);
          position: relative;
        }

        .login-card-header {
          margin-bottom: 20px;
        }

        .login-card-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.25);
          color: #818cf8;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .login-card-title {
          font-size: 1.65rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
        }

        .login-card-subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        /* Quick Fill Section */
        .demo-fill-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: rgba(15, 23, 42, 0.6);
          border: 1px dashed rgba(255, 255, 255, 0.12);
          border-radius: var(--radius-md);
          margin-bottom: 20px;
          gap: 8px;
          flex-wrap: wrap;
        }

        .demo-fill-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .demo-fill-buttons {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .demo-chip {
          padding: 3px 9px;
          font-size: 0.72rem;
          font-weight: 600;
          border-radius: var(--radius-full);
          background: rgba(99, 102, 241, 0.15);
          color: #c7d2fe;
          border: 1px solid rgba(99, 102, 241, 0.3);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .demo-chip:hover {
          background: var(--primary);
          color: #ffffff;
          transform: translateY(-1px);
        }

        .demo-chip-clear {
          padding: 3px 8px;
          font-size: 0.72rem;
          font-weight: 600;
          border-radius: var(--radius-full);
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-muted);
          border: 1px solid var(--border-subtle);
          cursor: pointer;
        }

        .demo-chip-clear:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.12);
        }

        /* Alert Banner */
        .login-alert-banner {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 14px;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          color: #fca5a5;
          margin-bottom: 20px;
          animation: modalSlideUp 0.25s ease-out;
        }

        .alert-icon {
          color: var(--danger);
          flex-shrink: 0;
          margin-top: 1px;
        }

        .alert-content {
          flex: 1;
          min-width: 0;
        }

        .alert-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: #fecaca;
        }

        .alert-msg {
          font-size: 0.75rem;
          color: #fca5a5;
          margin-top: 2px;
          line-height: 1.4;
        }

        .alert-close {
          color: #fca5a5;
          padding: 2px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          opacity: 0.8;
          transition: opacity var(--transition-fast);
        }

        .alert-close:hover {
          opacity: 1;
        }

        /* Caps Lock Warning */
        .login-caps-warning {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: var(--radius-sm);
          color: #fcd34d;
          font-size: 0.75rem;
          font-weight: 600;
          margin-bottom: 14px;
        }

        /* Form Controls */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .form-label {
          font-size: 0.825rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .forgot-link {
          font-size: 0.75rem;
          color: #818cf8;
          font-weight: 600;
          cursor: pointer;
          transition: color var(--transition-fast);
        }

        .forgot-link:hover {
          color: #a5b4fc;
          text-decoration: underline;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-icon {
          position: absolute;
          left: 14px;
          color: var(--text-muted);
          pointer-events: none;
          transition: color var(--transition-fast);
        }

        .input-field-custom {
          width: 100%;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 12px 42px 12px 44px;
          color: var(--text-primary);
          font-size: 0.9rem;
          transition: all var(--transition-fast);
        }

        .input-field-custom:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-glow);
          background: var(--bg-surface-hover);
        }

        .input-with-icon:focus-within .field-icon {
          color: var(--primary);
        }

        .field-action-btn {
          position: absolute;
          right: 12px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: color var(--transition-fast);
        }

        .field-action-btn:hover {
          color: var(--text-primary);
        }

        /* Checkbox Row */
        .login-options-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .checkbox-container {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
        }

        .checkbox-container input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }

        .checkbox-custom {
          width: 16px;
          height: 16px;
          border: 1px solid var(--border-medium);
          border-radius: 4px;
          background: var(--bg-surface-elevated);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }

        .checkbox-container input:checked ~ .checkbox-custom {
          background: var(--primary);
          border-color: var(--primary);
        }

        .checkbox-container input:checked ~ .checkbox-custom::after {
          content: '';
          display: block;
          width: 4px;
          height: 8px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
          margin-bottom: 2px;
        }

        .checkbox-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        /* Primary Submit Button */
        .login-submit-btn {
          width: 100%;
          min-height: 48px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: #ffffff;
          border-radius: var(--radius-md);
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);
          cursor: pointer;
          transition: all var(--transition-fast);
          margin-top: 4px;
        }

        .login-submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
          box-shadow: 0 6px 22px rgba(99, 102, 241, 0.45);
          transform: translateY(-1px);
        }

        .login-submit-btn:disabled {
          opacity: 0.75;
          cursor: not-allowed;
        }

        .login-submit-btn.btn-success-state {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.35) !important;
        }

        .submit-arrow {
          transition: transform var(--transition-fast);
        }

        .login-submit-btn:hover .submit-arrow {
          transform: translateX(4px);
        }

        .submit-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Divider & Preview Mode */
        .login-preview-divider {
          display: flex;
          align-items: center;
          margin: 22px 0 16px;
          color: var(--text-muted);
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .login-preview-divider::before,
        .login-preview-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border-subtle);
        }

        .login-preview-divider span {
          padding: 0 12px;
        }

        .login-preview-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .preview-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px 12px;
          border-radius: var(--radius-md);
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
          border: 1px solid var(--border-subtle);
          background: var(--bg-surface-elevated);
          color: var(--text-secondary);
        }

        .preview-btn:hover {
          background: var(--bg-surface-hover);
          color: var(--text-primary);
          border-color: var(--border-medium);
        }

        .preview-btn.admin-preview:hover {
          border-color: rgba(99, 102, 241, 0.4);
          color: #a5b4fc;
        }

        .preview-btn.student-preview:hover {
          border-color: rgba(6, 182, 212, 0.4);
          color: #38bdf8;
        }

        /* Footer Security Notice */
        .login-footer-security {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 24px;
          color: var(--text-muted);
          font-size: 0.7rem;
          text-align: center;
        }

        .security-icon {
          color: var(--success);
        }

        /* Modal Details */
        .forgot-modal {
          width: 100%;
          max-width: 440px;
          background: var(--bg-surface);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
          animation: modalSlideUp 0.25s ease-out;
        }

        /* Responsive Breakpoints */
        @media (max-width: 960px) {
          .login-content-wrapper {
            grid-template-columns: 1fr;
            max-width: 480px;
            gap: 24px;
          }

          .login-brand-panel {
            display: none;
          }

          .login-card-container {
            padding: 28px 22px;
          }
        }

        @media (max-width: 480px) {
          .login-root-container {
            padding: 16px 12px;
          }

          .login-preview-options {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
