import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes.constants';
import toast from 'react-hot-toast';

const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuthContext();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const error = searchParams.get('error');

        if (error) {
          toast.error('Google authentication failed. Please try again.');
          navigate(ROUTES.LOGIN, { replace: true });
          return;
        }

        if (!accessToken || !refreshToken) {
          toast.error('Invalid authentication response. Please try again.');
          navigate(ROUTES.LOGIN, { replace: true });
          return;
        }

        // Store tokens and update auth context
        const { setAccessToken } = await import('../../api/axios.instance');
        setAccessToken(accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        toast.success('Welcome back!');
        navigate(ROUTES.DASHBOARD, { replace: true });
      } catch (err) {
        console.error('OAuth callback error:', err);
        toast.error('Authentication failed. Please try again.');
        navigate(ROUTES.LOGIN, { replace: true });
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, login]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '18px',
      color: '#666',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto',
          }} />
        </div>
        <p>Completing authentication...</p>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OAuthCallbackPage;
