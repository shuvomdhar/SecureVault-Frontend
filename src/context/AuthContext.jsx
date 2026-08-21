import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { auth, googleProvider, signInWithPopup } from '../config/firebase.config';
import { fetchApi } from '../config/api.config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('securevault-token') || '');
  const [loading, setLoading] = useState(true);

  // OTP Modal State
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpPurpose, setOtpPurpose] = useState('Verification');
  const [simulatedOTP, setSimulatedOTP] = useState('');

  // Toast Notification state
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('securevault-token');
    setToken('');
    setUser(null);
    showToast('Logged out of SecureVault successfully.', 'info');
  }, [showToast]);

  // Fetch current user if token exists
  useEffect(() => {
    let isMounted = true;

    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await fetchApi('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!isMounted) return;

        if (data.success) {
          setUser(data.user);
        } else {
          // Token invalid or expired
          logout();
        }
      } catch (err) {
        console.error('Failed to fetch me:', err);
        if (err.message.includes('401') || err.message.includes('Invalid') || err.message.includes('expired')) {
          logout();
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMe();

    return () => {
      isMounted = false;
    };
  }, [logout, token]);

  // Initiate Email/Password Signup
  const signup = async (name, email, password) => {
    try {
      const data = await fetchApi('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!data.success) throw new Error(data.message || 'Registration failed');

      setOtpEmail(data.email);
      setOtpPurpose('Account Signup Verification');
      if (data.otp) setSimulatedOTP(data.otp);
      setOtpModalOpen(true);
      showToast(`Account registration initiated! OTP sent to ${data.email}`, 'info');
      return data;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  // Initiate Email/Password Login
  const login = async (email, password) => {
    try {
      const data = await fetchApi('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!data.success) throw new Error(data.message || 'Login failed');

      setOtpEmail(data.email);
      setOtpPurpose('Login Verification');
      if (data.otp) setSimulatedOTP(data.otp);
      setOtpModalOpen(true);
      showToast(`Login credentials accepted! OTP sent to ${data.email}`, 'info');
      return data;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  // Initiate Firebase Google Auth Signup/Login with Popup
  const loginWithGoogle = async () => {
    try {
      // Step 1: Firebase Google Auth Popup
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;

      const payload = {
        email: googleUser.email,
        name: googleUser.displayName || googleUser.email.split('@')[0],
        googleId: googleUser.uid,
        avatar: googleUser.photoURL || '',
      };

      // Step 2: Send Google user data to backend API to generate OTP
      const data = await fetchApi('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!data.success) throw new Error(data.message || 'Google Auth failed on backend');

      // Step 3: Trigger OTP Modal
      setOtpEmail(data.email);
      setOtpPurpose('Google OAuth Verification');
      if (data.otp) setSimulatedOTP(data.otp);
      setOtpModalOpen(true);
      showToast(`Google authenticated! Verification OTP sent to ${data.email}`, 'info');
      return data;
    } catch (err) {
      let message = err.message;
      if (err.code) {
        switch (err.code) {
          case 'auth/popup-closed-by-user':
            message = 'Google sign-in was cancelled.';
            break;
          case 'auth/popup-blocked':
            message = 'Browser blocked Google popup. Please allow popups and try again.';
            break;
          case 'auth/unauthorized-domain':
            message = "This domain (secure-vault-frontend-rho.vercel.app) isn't authorized in Firebase Auth settings.";
            break;
          default:
            message = `Google Auth Error: ${err.message}`;
        }
      }
      showToast(message, 'error');
      throw new Error(message);
    }
  };

  // Verify OTP Code
  const verifyOTP = async (otpCode) => {
    try {
      const data = await fetchApi('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, otp: otpCode }),
      });

      if (!data.success) throw new Error(data.message || 'OTP verification failed');

      localStorage.setItem('securevault-token', data.token);
      setToken(data.token);
      setUser(data.user);
      setOtpModalOpen(false);
      setSimulatedOTP('');
      showToast(`Welcome back, ${data.user.name}! Authenticated successfully.`, 'success');
      return data;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  // Resend OTP Code
  const resendOTP = async () => {
    try {
      const data = await fetchApi('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail }),
      });

      if (!data.success) throw new Error(data.message || 'Resend OTP failed');

      if (data.otp) setSimulatedOTP(data.otp);
      showToast(`A fresh OTP code has been sent to ${otpEmail}!`, 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signup,
        login,
        loginWithGoogle,
        verifyOTP,
        resendOTP,
        logout,
        otpModalOpen,
        setOtpModalOpen,
        otpEmail,
        otpPurpose,
        simulatedOTP,
        toast,
        showToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
