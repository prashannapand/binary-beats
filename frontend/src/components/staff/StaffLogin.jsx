import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { useToast } from '../ui/Toast';

export function StaffLogin() {
  const { login } = useAuth();
  const { error } = useToast();
  const [username, setUsername] = useState('demo_staff');
  const [password, setPassword] = useState('demo1234');
  const [working, setWorking] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setWorking(true);
    setFormError('');

    try {
      await login(username, password);
    } catch (e) {
      setFormError(e.message);
      error(e.message);
    } finally {
      setWorking(false);
    }
  };

  return (
    <Card variant="dark" padding="xl" className="border-staff-800">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="text-center mb-4">
          <svg className="w-12 h-12 mx-auto mb-3 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h1 className="font-display text-2xl font-semibold text-white">Seamless Staff</h1>
          <p className="text-staff-400 mt-1">Restaurant Operations Dashboard</p>
        </div>

        {formError && (
          <div className="bg-error-500/20 border border-error-500/30 text-error-300 rounded-lg p-3 text-sm animate-fade-in">
            {formError}
          </div>
        )}

        <Input
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          disabled={working}
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          disabled={working}
        />

        <Button
          variant="primary"
          fullWidth
          size="lg"
          type="submit"
          disabled={working}
          loading={working}
        >
          {working ? 'Signing in…' : 'Sign In'}
        </Button>

        <p className="text-center text-xs text-staff-500">
          Demo: <code className="font-mono text-staff-400">demo_staff / demo1234</code>
        </p>
      </form>
    </Card>
  );
}