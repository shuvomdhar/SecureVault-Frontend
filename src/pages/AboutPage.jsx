import React from 'react';
import { ShieldCheck, Lock, FolderKey, Database, CheckCircle2, Key, Cpu, HelpCircle } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          Security Architecture & Technical Overview
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          How <span className="text-purple-600 dark:text-purple-400">SecureVault</span> Protects Your Confidential Data
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Built from the ground up for modern multi-account workflows, offering flexible folder organization, dynamic column schemas, field-level encryption, and mandatory OTP dual-factor verification.
        </p>
      </div>

      {/* Security Principles Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Bcrypt Account Password Hashing</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            All user master account passwords are standardly salted and hashed using <strong>bcrypt</strong> before being stored in the database. Raw account passwords are never stored in plaintext under any circumstances.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Dynamic Column Field Encryption</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            When creating custom columns inside your secret items, checking <strong>"Is Secured?"</strong> ensures every entry of that column is encrypted server-side using <strong>AES-256-GCM</strong>.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">6-Digit OTP Email Verification</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Whether signing up or logging in with email & password or Google OAuth, a unique 6-digit OTP is delivered to your email ID. Access to the vault is granted only after valid OTP input.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <FolderKey className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Flexible Folder & Root Storage</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Folder organization is entirely optional. Create folders like <em>"Instagram"</em>, <em>"Work Accounts"</em>, or <em>"Financial Pins"</em>, or keep items directly in your main root secret storage.
          </p>
        </div>
      </div>

      {/* Real-world Use Case Workflow */}
      <div className="glass-panel rounded-3xl p-8 space-y-6 bg-gradient-to-r from-purple-900/10 to-indigo-900/10 border border-purple-500/20">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Key className="w-6 h-6 text-purple-500" />
          Multi-Account Organization Workflow Example
        </h3>

        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <p>
            Suppose you manage multiple Instagram accounts (e.g. personal, business, client brand). Here is how <strong>SecureVault</strong> simplifies your workflow:
          </p>

          <ol className="list-decimal list-inside space-y-2.5 font-medium pl-2">
            <li>Create a folder named <strong className="text-purple-600 dark:text-purple-400">"Instagram"</strong>.</li>
            <li>Inside this folder, add secret items for each account (e.g. "Brand Account", "Personal Account").</li>
            <li>Define custom columns such as <code className="text-purple-400 font-bold">username</code> and <code className="text-purple-400 font-bold">password</code>.</li>
            <li>Check the <strong>"Is Secured?"</strong> box on sensitive columns like <code className="text-purple-400 font-bold">password</code> to encrypt entries in MongoDB.</li>
            <li>In the vault dashboard, secured entries appear masked as <code className="text-purple-400">••••••••</code>. Click the eye button to reveal or click the copy button to copy directly!</li>
          </ol>
        </div>
      </div>

      {/* Technical FAQ */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-purple-500" />
          Frequently Asked Questions
        </h3>

        <div className="space-y-4">
          <div className="glass-panel rounded-2xl p-5 space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-white">Do I have to create folders for all my secrets?</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No! Folder creation is 100% optional. You can save secrets directly into your root vault without creating any folders.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-5 space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-white">How does Google OAuth work with OTP verification?</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              You can log in or sign up using your Google account without typing email/password manually. After Google authentication, an OTP verification code is sent to your email to complete login.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-5 space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-white">Can I copy column names and field values?</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Yes! Each column header and individual entry has a dedicated copy button for instant clipboard access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
