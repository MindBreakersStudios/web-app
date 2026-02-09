import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { saveKickUser } from '../../hooks/useKickAuth';

/**
 * KickCallback - Página que maneja el callback de OAuth de Kick
 * Ruta: /auth/kick/callback?code=xxx&state=yyy
 */
export function KickCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 1. Obtener code y state de URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code || !state) {
          throw new Error('Parámetros de callback inválidos');
        }

        // 2. Verificar state contra sessionStorage
        const storedState = sessionStorage.getItem('kick_oauth_state');
        const codeVerifier = sessionStorage.getItem('kick_oauth_code_verifier');

        if (!storedState || !codeVerifier) {
          throw new Error('Estado de OAuth no encontrado. Por favor intenta nuevamente.');
        }

        if (state !== storedState) {
          throw new Error('Estado de OAuth no coincide. Posible ataque CSRF.');
        }

        // 3. Llamar a Edge Function para completar OAuth
        const response = await fetch(
          'https://flwgrttppsnsfmigblvz.supabase.co/functions/v1/kick-callback',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code,
              code_verifier: codeVerifier,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success || !data.user) {
          throw new Error(data.error || 'Error al completar autenticación');
        }

        // Validar que los datos del usuario existen
        if (!data.user.id || !data.user.username) {
          throw new Error('Datos de usuario incompletos');
        }

        // 4. Guardar usuario en localStorage
        saveKickUser({
          id: String(data.user.id),
          username: String(data.user.username),
          profile_picture: data.user.profile_picture ? String(data.user.profile_picture) : null,
        });

        // 5. Limpiar sessionStorage
        sessionStorage.removeItem('kick_oauth_state');
        sessionStorage.removeItem('kick_oauth_code_verifier');

        // 6. Éxito
        setStatus('success');

        // 7. Redirigir después de 2 segundos
        setTimeout(() => {
          const returnUrl = sessionStorage.getItem('kick_oauth_return_url') || '/watchparty';
          sessionStorage.removeItem('kick_oauth_return_url');
          navigate(returnUrl, { replace: true });
        }, 2000);
      } catch (err) {
        console.error('[KickCallback] Error:', err);
        setErrorMessage(err instanceof Error ? err.message : 'Error desconocido');
        setStatus('error');

        // Redirigir a /watch después de 5 segundos en caso de error
        setTimeout(() => {
          navigate('/watchparty', { replace: true });
        }, 5000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <>
      <Helmet>
        <title>Conectando con Kick - MindBreakers</title>
      </Helmet>

      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
          {/* Loading state */}
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-lime-400 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">
                Conectando con Kick...
              </h2>
              <p className="text-gray-400 text-sm">
                Estamos completando tu autenticación. Por favor espera.
              </p>
            </>
          )}

          {/* Success state */}
          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">
                ¡Conectado exitosamente!
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                Tu cuenta de Kick ha sido conectada correctamente.
              </p>
              <p className="text-gray-500 text-xs">
                Redirigiendo...
              </p>
            </>
          )}

          {/* Error state */}
          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">
                Error de autenticación
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                {errorMessage}
              </p>
              <p className="text-gray-500 text-xs">
                Redirigiendo en 5 segundos...
              </p>
              <button
                onClick={() => navigate('/watchparty', { replace: true })}
                className="mt-4 px-4 py-2 bg-lime-400 text-black rounded-lg font-medium hover:bg-lime-500 transition-colors"
              >
                Volver al WatchParty
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default KickCallback;
