import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthContext } from '../../context/AuthContext';
import { parseError, parseFieldErrors } from '../../utils/errorParser.util';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { ROUTES } from '../../constants/routes.constants';
import styles from './AuthPages.module.css';

const schema = yup.object({
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const LoginPage = () => {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    mode: 'onBlur',
  });

  const onSubmit = async (data) => {
    try {
      await login(data);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      const fieldErrors = parseFieldErrors(err);
      if (Object.keys(fieldErrors).length > 0) {
        Object.entries(fieldErrors).forEach(([field, msg]) => setError(field, { message: msg }));
      } else {
        const msg = parseError(err);
        if (msg.toLowerCase().includes('password') || msg.toLowerCase().includes('credential')) {
          setError('password', { message: msg });
        } else {
          setError('email', { message: msg });
        }
      }
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
    window.location.href = `${apiBase}/auth/google`;
  };

  return (
    <div className="auth-layout">
      {/* Left panel */}
      <div className="auth-left">
        <div className={styles.brandPanel}>
          <div className={styles.brandLogo}>✈</div>
          <h1 className={styles.brandTitle}>Traveloop</h1>
          <p className={styles.brandTagline}>Your personalized travel planning companion</p>
          <div className={styles.features}>
            {['Plan multi-city itineraries', 'Track budgets & expenses', 'Share trips with friends', 'Real-time collaboration'].map((f) => (
              <div key={f} className={styles.feature}>
                <span className={styles.featureCheck}>✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
          <div className={styles.decorCircle1} />
          <div className={styles.decorCircle2} />
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className={styles.formPanel}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Welcome back</h2>
            <p className={styles.formSubtitle}>Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              required
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              error={errors.password?.message}
              required
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>}
              {...register('password')}
            />

            <div className={styles.rememberRow}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" className={styles.checkbox} {...register('rememberMe')} />
                Remember me
              </label>
              <Link to={ROUTES.FORGOT_PASSWORD} className={styles.forgotLink}>
                Forgot password?
              </Link>
            </div>

            <Button type="submit" fullWidth loading={isSubmitting} size="lg">
              Sign in
            </Button>

            <div className={styles.divider}>
              <span>or continue with</span>
            </div>

            <button type="button" className={styles.googleBtn} onClick={handleGoogleLogin}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
          </form>

          <p className={styles.switchLink}>
            Don't have an account?{' '}
            <Link to={ROUTES.REGISTER}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
