import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { TripProvider } from './context/TripContext';
import AppRouter from './routes/AppRouter';

const App = () => (
  <AuthProvider>
    <SocketProvider>
      <TripProvider>
        <AppRouter />
        <Toaster
          position="bottom-right"
          gutter={8}
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              borderRadius: '10px',
              padding: '12px 16px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            },
            success: {
              duration: 3000,
              iconTheme: { primary: '#10B981', secondary: '#fff' },
              style: { background: '#fff', color: '#0F172A' },
            },
            error: {
              duration: 5000,
              iconTheme: { primary: '#EF4444', secondary: '#fff' },
              style: { background: '#fff', color: '#0F172A' },
            },
          }}
        />
      </TripProvider>
    </SocketProvider>
  </AuthProvider>
);

export default App;
