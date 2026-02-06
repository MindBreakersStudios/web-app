import { memo } from 'react';
import { Loader2, LogOut } from 'lucide-react';
import { useKickAuth } from '../hooks/useKickAuth';

interface KickLoginButtonProps {
  /** Texto del botón cuando no está conectado */
  loginText?: string;
  /** Texto del botón cuando está conectado */
  logoutText?: string;
  /** Variante del botón */
  variant?: 'primary' | 'secondary' | 'minimal';
  /** Tamaño del botón */
  size?: 'sm' | 'md' | 'lg';
  /** Mostrar avatar cuando está conectado */
  showAvatar?: boolean;
  /** Callback después de login exitoso */
  onLoginSuccess?: () => void;
}

/**
 * KickLoginButton - Botón para conectar/desconectar cuenta de Kick
 */
export const KickLoginButton = memo(function KickLoginButton({
  loginText = 'Conectar con Kick',
  logoutText = 'Desconectar',
  variant = 'primary',
  size = 'md',
  showAvatar = true,
  onLoginSuccess,
}: KickLoginButtonProps) {
  const { isConnected, user, login, logout, isLoading, error } = useKickAuth();

  const handleLogin = async () => {
    // Guardar URL actual para redirigir después del login
    sessionStorage.setItem('kick_oauth_return_url', window.location.pathname);
    await login();
  };

  const handleLogout = () => {
    logout();
  };

  // Variant styles
  const variantClasses = {
    primary: 'bg-lime-400 text-black hover:bg-lime-500',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600',
    minimal: 'bg-transparent text-lime-400 hover:bg-lime-400/10 border border-lime-400/30',
  };

  // Size styles
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  if (isConnected && user) {
    return (
      <div className="flex items-center gap-3">
        {/* User info */}
        {showAvatar && (
          <div className="flex items-center gap-2">
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={user.username}
                className="w-8 h-8 rounded-full border-2 border-lime-400"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-lime-400/20 border-2 border-lime-400 flex items-center justify-center">
                <span className="text-lime-400 font-bold text-sm">
                  {user.username[0].toUpperCase()}
                </span>
              </div>
            )}
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-white">{user.username}</p>
              <p className="text-xs text-gray-400">Kick conectado</p>
            </div>
          </div>
        )}

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className={`
            flex items-center gap-2 rounded-lg font-medium transition-colors
            ${sizeClasses[size]}
            ${variantClasses.secondary}
          `}
          title="Desconectar cuenta de Kick"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">{logoutText}</span>
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleLogin}
        disabled={isLoading}
        className={`
          flex items-center gap-2 rounded-lg font-medium transition-colors
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        title="Conectar tu cuenta de Kick para chatear"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Conectando...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
            <span>{loginText}</span>
          </>
        )}
      </button>

      {/* Error message */}
      {error && (
        <p className="text-red-400 text-xs mt-2">
          {error}
        </p>
      )}
    </div>
  );
});
