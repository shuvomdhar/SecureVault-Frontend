import { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Mail, RefreshCw, X, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/useAuth';

export const OTPModal = () => {
  const {
    otpModalOpen,
    setOtpModalOpen,
    otpEmail,
    otpPurpose,
    simulatedOTP,
    verifyOTP,
    resendOTP,
  } = useAuth();

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!otpModalOpen) return undefined;

    const timerId = setTimeout(() => {
      setDigits(['', '', '', '', '', '']);
      setErrorMsg('');
      setTimer(60);
      inputRefs.current[0]?.focus();
    }, 0);

    return () => clearTimeout(timerId);
  }, [otpModalOpen]);

  useEffect(() => {
    let interval;
    if (otpModalOpen && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpModalOpen, timer]);

  if (!otpModalOpen) return null;

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    setErrorMsg('');

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const pasteArray = pasted.split('');
      setDigits(pasteArray);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length !== 6) {
      setErrorMsg('Please enter a complete 6-digit code');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      await verifyOTP(code);
    } catch (err) {
      setErrorMsg(err.message || 'OTP verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      await resendOTP();
      setTimer(60);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-purple-500/30 text-slate-900 dark:text-white shadow-2xl">
        {/* Close Button */}
        <button
          onClick={() => setOtpModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 shadow-lg shadow-purple-500/10">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Verify Your Account</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xs">
            We sent a 6-digit security OTP code for <strong>{otpPurpose}</strong> to:
          </p>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-purple-600 dark:text-purple-300">
            <Mail className="w-3.5 h-3.5" />
            {otpEmail}
          </div>
        </div>

        {/* Developer Helper OTP Banner */}
        {simulatedOTP && (
          <div className="mb-6 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-500/40 text-purple-700 dark:text-purple-200 text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>Demo OTP:</span>
            </span>
            <span className="font-mono font-bold text-sm tracking-widest text-purple-900 dark:text-white bg-purple-100 dark:bg-purple-900/80 px-2.5 py-1 rounded border border-purple-300 dark:border-purple-400/30">
              {simulatedOTP}
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* OTP Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(element) => {
                  inputRefs.current[idx] = element;
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 rounded-xl font-semibold text-white bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.99] transition shadow-lg shadow-purple-600/25 disabled:opacity-50"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" /> Verifying...
              </span>
            ) : (
              'Verify & Access Vault'
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <span>Didn't receive the code?</span>
          <button
            onClick={handleResend}
            disabled={timer > 0}
            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed flex items-center gap-1 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  );
};
