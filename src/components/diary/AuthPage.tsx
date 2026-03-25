import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const AuthPage = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      toast('Fill in all fields');
      return;
    }

    setLoading(true);

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        toast('Sign up failed', { description: error.message });
      } else {
        toast('Account created', { description: 'You are now signed in.' });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast('Sign in failed', { description: error.message });
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl text-foreground mb-2">Quiet Lines</h1>
          <p className="text-muted-foreground text-sm">
            {mode === 'signin' ? 'Welcome back.' : 'Begin your archive.'}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground block mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="you@example.com"
              className="w-full bg-card border border-border rounded-md px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground block mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="••••••••"
              className="w-full bg-card border border-border rounded-md px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground rounded-md py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
          >
            {loading ? '...' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </div>

        {/* Toggle */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-foreground underline underline-offset-2"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};
