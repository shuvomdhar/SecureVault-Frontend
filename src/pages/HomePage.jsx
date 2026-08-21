import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  FolderPlus,
  Lock,
  EyeOff,
  Copy,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { PasswordGenerator } from '../components/PasswordGenerator';

export const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-16 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative text-center space-y-6 pt-6 pb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-300 text-xs font-bold tracking-wide uppercase shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          Next-Gen Password & Secret Manager
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
          Manage Your Secret Data With{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500">
            Uncompromising Security
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Store multi-account credentials, usernames, and passwords effortlessly. Organize secrets into customized folders or store them directly. Protect sensitive fields with dynamic AES column encryption.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to={user ? '/personal-info' : '/auth'}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
          >
            <span>{user ? 'Open Secrets Vault' : 'Get Started Now'}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/about"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
          >
            Explore Security Docs
          </Link>
        </div>
      </section>

      {/* Embedded Password Generator Tool */}
      <section className="max-w-3xl mx-auto">
        <PasswordGenerator />
      </section>

      {/* Platform Features Grid */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Designed For Modern Workflows
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Everything you need to safeguard logins across multiple accounts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel glass-panel-hover rounded-3xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <FolderPlus className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Custom Folders & Root Vault</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Create dedicated folders like "Instagram" or "Banking" for your multi-account profiles, or store secrets directly in the root vault without creating folders.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover rounded-3xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Dynamic Secured Columns</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Define custom columns for your data (e.g. username, password, pin). Check "Is Secured?" to automatically encrypt column entries with AES-256 in the database.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover rounded-3xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">OTP & Google Authentication</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sign up/Login via Email & Password or Google OAuth. Every login step is protected by mandatory 6-digit email OTP verification.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Showcase Banner */}
      <section className="glass-panel rounded-3xl p-8 sm:p-12 relative overflow-hidden bg-gradient-to-br from-purple-900/20 via-indigo-900/10 to-slate-900/40 border border-purple-500/20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider">
              Zero Knowledge Philosophy
            </span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
              One-Click Masking & Copy Support for Columns & Entries
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Every secured field is hidden behind a visual <code className="text-purple-400">••••••••</code> mask with a toggle eye button. Click to reveal when needed, or copy column names and secret values straight to your clipboard with immediate toast feedback.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white/40 dark:bg-slate-800/40 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                <EyeOff className="w-4 h-4 text-purple-500" /> Mask / Reveal Toggle
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white/40 dark:bg-slate-800/40 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                <Copy className="w-4 h-4 text-purple-500" /> Single-Click Copy
              </div>
            </div>
          </div>

          {/* Interactive Preview Mockup Card */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-purple-400 ml-2">Folder: Instagram</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                2 Accounts
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700 space-y-2">
                <div className="text-xs font-semibold text-slate-300">Instagram Account @brand_primary</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">username:</span>
                    <span className="font-mono text-purple-300">brand_official</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">password:</span>
                    <span className="font-mono text-rose-400">••••••••••</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
