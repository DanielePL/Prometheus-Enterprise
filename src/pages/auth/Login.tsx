import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Loader2, Rocket, User, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

// Team accounts (real Supabase users)
const TEAM_ACCOUNTS: { name: string; email: string; role: string }[] = [
  { name: 'Daniele', email: 'management@prometheus.coach', role: 'Super Admin' },
  { name: 'Karin', email: 'admin@prometheus.coach', role: 'Admin' },
  { name: 'Sjoerd', email: 'campus@prometheus.coach', role: 'Campus' },
  { name: 'Basil', email: 'lab@prometheus.coach', role: 'Lab' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [teamPassword, setTeamPassword] = useState('');
  const [teamError, setTeamError] = useState('');
  const [teamLoading, setTeamLoading] = useState<string | null>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success('Successfully signed in');
      navigate('/dashboard');
    }
  };

  const handleTeamLogin = async (account: typeof TEAM_ACCOUNTS[0]) => {
    if (!teamPassword.trim()) {
      setTeamError('Enter team password');
      return;
    }

    setTeamLoading(account.email);
    setTeamError('');

    const { error } = await signIn(account.email, teamPassword);

    if (error) {
      setTeamError('Invalid password');
      setTeamLoading(null);
    } else {
      toast.success(`Welcome ${account.name}`);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed bg-no-repeat p-4"
      style={{ backgroundImage: "url('/gradient-bg-dark.png')" }}
    >
      <div className="w-full max-w-md space-y-6">
        {/* Team Login */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/90 to-orange-600/90 p-[1px]">
          <div className="rounded-2xl bg-gradient-to-r from-primary/20 to-orange-600/20 backdrop-blur-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Rocket className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Team Login</h2>
                <p className="text-xs text-white/60">Select your account</p>
              </div>
            </div>

            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                type="password"
                value={teamPassword}
                onChange={(e) => { setTeamPassword(e.target.value); setTeamError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && TEAM_ACCOUNTS[0] && handleTeamLogin(TEAM_ACCOUNTS[0])}
                placeholder="Team password"
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40"
                autoFocus
              />
            </div>

            {teamError && (
              <p className="text-sm text-red-300">{teamError}</p>
            )}

            <div className="grid grid-cols-2 gap-2">
              {TEAM_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  onClick={() => handleTeamLogin(account)}
                  disabled={teamLoading !== null}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 transition-all text-left disabled:opacity-50"
                >
                  <div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    {teamLoading === account.email ? (
                      <Loader2 className="h-4 w-4 text-white animate-spin" />
                    ) : (
                      <User className="h-4 w-4 text-white/70" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white truncate">{account.name}</div>
                    <div className="text-[10px] text-white/50 truncate">{account.role}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <img src="/logo-white.png" alt="Prometheus" className="h-10 object-contain" />
          </div>

          <h1 className="text-2xl font-bold text-center mb-2 font-display">
            Welcome back
          </h1>
          <p className="text-muted-foreground text-center mb-6">
            Sign in to your account
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/auth/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-orange-600 hover:opacity-90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link to="/auth/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
