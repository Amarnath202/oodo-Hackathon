import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import { forgotPasswordApi } from '../../api/auth.api';
import { parseError } from '../../utils/errorParser.util';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { ROUTES } from '../../constants/routes.constants';
import styles from './AuthPages.module.css';
import forgotStyles from './ForgotPasswordPage.module.css';

const schema = yup.object({
  email: yup.string().email('Please enter a valid email').required('Email is required'),
});

const ForgotPasswordPage = () => {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    mode: 'onBlur',
  });

  const onSubmit = async (data) => {
    try {
      await forgotPasswordApi(data);
      setSentEmail(data.email);
      setSent(true);
    } catch (err) {
      setError('email', { message: parseError(err) });
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-left">
        <div className={styles.brandPanel}>
          <div className={styles.brandLogo}>✈</div>
          <h1 className={styles.brandTitle}>Traveloop</h1>
          <p className={styles.brandTagline}>Don't worry — we'll get you back on track in no time.</p>
          <div className={styles.decorCircle1} />
          <div className={styles.decorCircle2} />
        </div>
      </div>
      <div className="auth-right">
        <div className={styles.formPanel}>
          {sent ? (
            <div className={forgotStyles.successState}>
              <div className={forgotStyles.successIcon}>📧</div>
              <h2 className={styles.formTitle}>Check your email</h2>
              <p className={forgotStyles.successText}>
                We sent a password reset link to <strong>{sentEmail}</strong>. Check your inbox and follow the instructions.
              </p>
              <Link to={ROUTES.LOGIN} className={forgotStyles.backLink}>← Back to sign in</Link>
            </div>
          ) : (
            <>
              <div className={styles.formHeader}>
                <h2 className={styles.formTitle}>Forgot password?</h2>
                <p className={styles.formSubtitle}>Enter your email and we'll send you a reset link</p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  required
                  {...register('email')}
                />
                <Button type="submit" fullWidth loading={isSubmitting} size="lg">
                  Send reset link
                </Button>
              </form>
              <p className={styles.switchLink}>
                <Link to={ROUTES.LOGIN}>← Back to sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
