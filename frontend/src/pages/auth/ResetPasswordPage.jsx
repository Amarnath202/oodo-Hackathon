import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { resetPasswordApi } from '../../api/auth.api';
import { parseError } from '../../utils/errorParser.util';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { ROUTES } from '../../constants/routes.constants';
import styles from './AuthPages.module.css';

const schema = yup.object({
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords do not match').required('Required'),
});

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    mode: 'onBlur',
  });

  if (!token) {
    return (
      <div className="auth-layout">
        <div className="auth-right" style={{ width: '100%', justifyContent: 'center' }}>
          <div className={styles.formPanel}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>⚠️</div>
              <h2 className={styles.formTitle}>Invalid link</h2>
              <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
                This reset link is invalid or has expired.
              </p>
              <Link to={ROUTES.FORGOT_PASSWORD} style={{ display: 'block', marginTop: 'var(--space-6)', color: 'var(--color-primary)' }}>
                Request a new link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = async (data) => {
    try {
      await resetPasswordApi({ token, password: data.password });
      toast.success('Password reset! Please log in with your new password.');
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (err) {
      const msg = parseError(err);
      if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
        setError('password', { message: 'Reset link is invalid or expired. Please request a new one.' });
      } else {
        setError('password', { message: msg });
      }
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-left">
        <div className={styles.brandPanel}>
          <div className={styles.brandLogo}>✈</div>
          <h1 className={styles.brandTitle}>Traveloop</h1>
          <p className={styles.brandTagline}>Set a new password and get back to planning.</p>
          <div className={styles.decorCircle1} />
          <div className={styles.decorCircle2} />
        </div>
      </div>
      <div className="auth-right">
        <div className={styles.formPanel}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Set new password</h2>
            <p className={styles.formSubtitle}>Choose a strong password for your account</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
            <Input
              label="New password"
              type="password"
              placeholder="Enter new password"
              error={errors.password?.message}
              required
              {...register('password')}
            />
            <Input
              label="Confirm password"
              type="password"
              placeholder="Re-enter new password"
              error={errors.confirmPassword?.message}
              required
              {...register('confirmPassword')}
            />
            <Button type="submit" fullWidth loading={isSubmitting} size="lg">
              Reset password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
