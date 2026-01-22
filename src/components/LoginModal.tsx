import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../lib/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { signIn, signUp, signInWithDiscord, signInWithSteam } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let result;
      if (isLogin) {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password, { display_name: displayName });
      }

      if (result.error) {
        setError(result.error);
      } else {
        if (isLogin) {
          setSuccess('Successfully logged in!');
          setTimeout(() => {
            onClose();
            resetForm();
          }, 1000);
        } else {
          setSuccess('Account created! Please check your email to verify your account.');
          setIsLogin(true);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError('');
    setSuccess('');
    setLoading(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleDiscordLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await signInWithDiscord();
      if (result.error) {
        setError(result.error);
      }
      // Discord login will redirect, so no need to handle success here
    } catch (err) {
      setError('Discord authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSteamLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await signInWithSteam();
      if (result.error) {
        setError(result.error);
      }
      // Steam login will redirect, so no need to handle success here
    } catch (err) {
      setError('Steam authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md relative">
        <button 
          className="absolute top-4 right-4 text-gray-400 hover:text-white" 
          onClick={handleClose}
          disabled={loading}
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="p-6">
          <div className="text-center mb-6">
            <img src="/Logo-35.png" alt="MindBreakers Logo" className="h-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">
              {isLogin ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="text-gray-400 mt-1">
              {isLogin ? 'Sign in to access your game servers' : 'Join the MindBreakers community'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-900/20 border border-green-700 rounded text-green-400 text-sm">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Display Name
                </label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="Your gaming name"
                  required={!isLogin}
                  disabled={loading}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Email Address
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="name@example.com"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Password
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder={isLogin ? 'Enter your password' : 'Create a strong password'}
                required
                minLength={6}
                disabled={loading}
              />
            </div>
            
            {isLogin && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <input 
                    id="remember-me" 
                    type="checkbox" 
                    className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800" 
                  />
                  <label htmlFor="remember-me" className="ml-2 text-gray-300">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-blue-400 hover:text-blue-300">
                  Forgot password?
                </a>
              </div>
            )}
            
            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-2 rounded-md font-medium transition mt-2"
              disabled={loading}
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button 
                className="ml-1 text-blue-400 hover:text-blue-300" 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setSuccess('');
                }}
                disabled={loading}
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button 
                onClick={handleDiscordLogin}
                className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-indigo-600 hover:bg-indigo-700 text-sm font-medium text-white disabled:opacity-50 transition-colors" 
                disabled={loading}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Discord
              </button>
              <button 
                onClick={handleSteamLogin}
                className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-gray-900 hover:bg-gray-800 text-sm font-medium text-white disabled:opacity-50 transition-colors" 
                disabled={loading}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.5 20.535 6.344 24 11.979 24c6.624 0 11.999-5.375 11.999-12S18.603.001 11.979.001zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.405 1.472 1.009 2.428-.397.955-1.461 1.403-2.417 1.003-.957-.4-1.406-1.472-1.009-2.428.4-.957 1.471-1.406 2.428-1.009z"/>
                </svg>
                Steam
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};