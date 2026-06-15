import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFiles } from '../context/FileContext';

export default function Login() {
  const { login } = useFiles();
  const [email, setEmail] = useState('demo@studentvault.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Simulating API validation delay
    setTimeout(() => {
      setLoading(false);
      const success = login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid credentials. Use demo@studentvault.com and password123.');
      }
    }, 800);
  };

  return (
    <div>
      {/* Title */}
      <div className="mb-6 text-left">
        <h3 className="font-serif text-2xl font-bold text-brand-charcoal">Welcome back</h3>
        <p className="text-xs text-gray-500 mt-1">Please sign in to access your student locker files</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium text-left">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block mb-1">
            Student Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-brand-cream border border-brand-sand rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-olive focus:border-brand-olive text-brand-charcoal"
              placeholder="you@university.edu"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-[10px] text-brand-olive hover:underline font-semibold"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-brand-cream border border-brand-sand rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-olive focus:border-brand-olive text-brand-charcoal"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-charcoal focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember me toggle */}
        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            defaultChecked
            className="w-4 h-4 rounded text-brand-olive focus:ring-brand-olive border-brand-sand bg-brand-cream"
          />
          <label htmlFor="remember-me" className="ml-2 text-xs text-gray-500 font-medium cursor-pointerSelectable">
            Keep me signed in on this computer
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-olive hover:bg-brand-olive-dark text-white font-semibold py-2.5 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 rounded-full border border-white border-t-transparent animate-spin" />
          ) : (
            <>
              <span>Sign In to StudentVault</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Mock login notice */}
      <div className="mt-5 p-3 bg-brand-cream border border-brand-sand/60 rounded-xl text-[10px] text-gray-500 flex items-start space-x-2">
        <ShieldCheck className="w-4 h-4 text-brand-olive shrink-0 mt-0.5" />
        <span>
          <strong>Developer Demo:</strong> Credentials are pre-filled. Select Sign In to enter without authentication.
        </span>
      </div>

      {/* Redirect Footer */}
      <div className="mt-8 pt-4 border-t border-brand-sand text-center text-xs text-gray-500">
        <span>Don't have a vault locker yet? </span>
        <Link to="/register" className="text-brand-olive font-semibold hover:underline">
          Create Account
        </Link>
      </div>
    </div>
  );
}
