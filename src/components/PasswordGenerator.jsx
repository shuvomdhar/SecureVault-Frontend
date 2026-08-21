import { useState } from 'react';
import { Copy, RefreshCw, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../context/useAuth';

const createPassword = (length, includeUpper, includeLower, includeNumbers, includeSymbols) => {
  let chars = '';
  if (includeLower) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (includeUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (includeNumbers) chars += '0123456789';
  if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (!chars) {
    chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  }

  const cryptoObj = window.crypto || window.msCrypto;
  const values = new Uint32Array(length);
  cryptoObj.getRandomValues(values);

  return Array.from(values, (value) => chars[value % chars.length]).join('');
};

export const PasswordGenerator = () => {
  const { showToast } = useAuth();
  const [password, setPassword] = useState(() => createPassword(16, true, true, true, true));
  const [length, setLength] = useState(16);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [copied, setCopied] = useState(false);

  const generate = (options = {}) => {
    setPassword(
      createPassword(
        options.length ?? length,
        options.includeUpper ?? includeUpper,
        options.includeLower ?? includeLower,
        options.includeNumbers ?? includeNumbers,
        options.includeSymbols ?? includeSymbols
      )
    );
    setCopied(false);
  };

  const handleLengthChange = (nextLength) => {
    setLength(nextLength);
    generate({ length: nextLength });
  };

  const handleOptionChange = (option, value) => {
    const options = { [option]: value };
    if (option === 'includeUpper') setIncludeUpper(value);
    if (option === 'includeLower') setIncludeLower(value);
    if (option === 'includeNumbers') setIncludeNumbers(value);
    if (option === 'includeSymbols') setIncludeSymbols(value);
    generate(options);
  };

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    showToast('Generated password copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // Strength score calculation
  const getStrength = () => {
    if (!password) return { label: 'Weak', color: 'bg-rose-500', percent: 20 };
    let score = 0;
    if (password.length >= 12) score += 25;
    if (password.length >= 16) score += 25;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 20;

    if (score >= 80) return { label: 'Military Grade', color: 'bg-emerald-500', percent: 100 };
    if (score >= 60) return { label: 'Strong', color: 'bg-purple-500', percent: 75 };
    if (score >= 40) return { label: 'Medium', color: 'bg-amber-500', percent: 50 };
    return { label: 'Weak', color: 'bg-rose-500', percent: 25 };
  };

  const strength = getStrength();

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Instant Password Generator</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Create cryptographically secure secrets</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
          AES Ready
        </span>
      </div>

      {/* Generated Password Box */}
      <div className="relative flex items-center justify-between p-4 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
        <span className="font-mono text-base sm:text-lg font-bold text-purple-600 dark:text-purple-300 tracking-wider break-all pr-12">
          {password}
        </span>
        <div className="flex items-center gap-1 absolute right-3">
          <button
            onClick={generate}
            title="Regenerate Password"
            className="p-2 rounded-xl text-slate-500 hover:text-purple-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopy}
            title="Copy Password"
            className="p-2 rounded-xl text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/20 transition flex items-center gap-1 text-xs font-semibold"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Strength Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-medium">
          <span className="text-slate-500 dark:text-slate-400">Password Strength:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">{strength.label}</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full ${strength.color} transition-all duration-300 rounded-full`}
            style={{ width: `${strength.percent}%` }}
          />
        </div>
      </div>

      {/* Controls & Options */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Length: <span className="text-purple-600 font-bold">{length}</span> chars
          </label>
          <input
            type="range"
            min={8}
            max={32}
            value={length}
            onChange={(e) => handleLengthChange(Number(e.target.value))}
            className="w-36 accent-purple-600 cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Uppercase (A-Z)', state: includeUpper, option: 'includeUpper' },
            { label: 'Lowercase (a-z)', state: includeLower, option: 'includeLower' },
            { label: 'Numbers (0-9)', state: includeNumbers, option: 'includeNumbers' },
            { label: 'Symbols (!@#)', state: includeSymbols, option: 'includeSymbols' },
          ].map((item, idx) => (
            <label
              key={idx}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              <input
                type="checkbox"
                checked={item.state}
                onChange={(e) => handleOptionChange(item.option, e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
