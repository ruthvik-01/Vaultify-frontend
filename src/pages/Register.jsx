import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, BookOpen, GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFiles } from '../context/FileContext';

export default function Register() {
  const { login } = useFiles();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [university, setUniversity] = useState('State Institute of Technology');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Mock login using demo credentials for immediate sandbox access
      login('demo@studentvault.com', 'password123');
      alert('Mock account registered successfully! Entering your StudentVault.');
      navigate('/dashboard');
    }, 800);
  };

  return (
    <div>
      <div className="mb-6 text-left">
        <h3 className="font-serif text-2xl font-bold text-brand-charcoal">Create student vault</h3>
        <p className="text-xs text-gray-500 mt-1">Get 10 GB of free encrypted storage for your career assets</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block mb-1">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-brand-cream border border-brand-sand rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-olive focus:border-brand-olive text-brand-charcoal"
              placeholder="Vraj Raju"
            />
          </div>
        </div>

        {/* Student ID & University */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block mb-1">
              Student ID
            </label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-brand-cream border border-brand-sand rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-olive focus:border-brand-olive text-brand-charcoal"
                placeholder="SV-8890"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block mb-1">
              University
            </label>
            <select
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="w-full px-3 py-2.5 bg-brand-cream border border-brand-sand rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-olive focus:border-brand-olive text-brand-charcoal"
            >
              <option value="State Institute of Technology">State Tech</option>
              <option value="National University of Science">National Sci</option>
              <option value="City Academic College">City College</option>
            </select>
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block mb-1">
            Institutional Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-brand-cream border border-brand-sand rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-olive focus:border-brand-olive text-brand-charcoal"
              placeholder="student@university.edu"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block mb-1">
            Choose Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-brand-cream border border-brand-sand rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-olive focus:border-brand-olive text-brand-charcoal"
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Accept Terms */}
        <div className="flex items-start">
          <input
            id="terms"
            type="checkbox"
            required
            className="w-4 h-4 rounded text-brand-olive focus:ring-brand-olive border-brand-sand bg-brand-cream mt-0.5"
          />
          <label htmlFor="terms" className="ml-2 text-[11px] text-gray-500 leading-normal cursor-pointer">
            I certify that I am currently enrolled in an accredited institution and agree to the Terms of Service.
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
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Redirect Footer */}
      <div className="mt-8 pt-4 border-t border-brand-sand text-center text-xs text-gray-500">
        <span>Already have an account? </span>
        <Link to="/login" className="text-brand-olive font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
