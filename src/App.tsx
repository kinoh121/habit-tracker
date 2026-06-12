import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HabitProvider } from './contexts/HabitContext';
import LoginPage from './views/LoginPage';
import MainView from './views/MainView';

function AppInner() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%',
        color: 'var(--text-muted)',
      }}>
        読み込み中...
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <HabitProvider>
      <MainView />
    </HabitProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
