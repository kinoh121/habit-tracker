import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { signIn } = useAuth();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: 24,
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Habit Tracker</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>習慣を記録して、継続しよう</p>
      </div>
      <button
        onClick={signIn}
        className="btn btn-primary"
        style={{ gap: 8, fontSize: 15 }}
      >
        Googleでログイン
      </button>
    </div>
  );
}
