import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Train, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/Supabase/supabase';
import { toast } from 'sonner';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Welcome back!');
        navigate('/community');
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { username },
        },
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Check your email to verify your account!');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center border-2 border-foreground neo-shadow mb-4">
            <Train className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">Railway Our Way</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isLogin ? 'Welcome back, commuter!' : 'Join the commuter community'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border-2 border-foreground neo-shadow p-6 space-y-4">
          <h2 className="text-xl font-extrabold text-card-foreground text-center">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>

          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-card-foreground/50" />
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={!isLogin}
                className="pl-11 h-12 bg-secondary/50 border-2 border-foreground/30 text-card-foreground placeholder:text-card-foreground/40 rounded-xl font-medium focus:border-primary"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-card-foreground/50" />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-11 h-12 bg-secondary/50 border-2 border-foreground/30 text-card-foreground placeholder:text-card-foreground/40 rounded-xl font-medium focus:border-primary"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-card-foreground/50" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-11 pr-11 h-12 bg-secondary/50 border-2 border-foreground/30 text-card-foreground placeholder:text-card-foreground/40 rounded-xl font-medium focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-card-foreground/50 hover:text-card-foreground"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg border-2 border-foreground rounded-xl neo-shadow-sm transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </form>

        {/* Toggle */}
        <p className="text-center mt-6 text-foreground/70 text-sm">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-bold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
