# Supabase Setup Guide

Guía para configurar Supabase en tu proyecto de desarrollo local.

## Quick Setup

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Espera ~2 minutos a que se inicialice

### 2. Obtener Credenciales

En tu proyecto de Supabase:

1. Ve a **Settings > API**
2. Copia:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOi...`

### 3. Configurar Variables de Entorno

Crea `.env.local` en la raíz del proyecto:

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### 4. Ejecutar Migraciones

En el **SQL Editor** de Supabase, ejecuta el contenido de:

```
supabase/migrations/001_initial_schema.sql
```

Esto crea todas las tablas necesarias (users, games, servers, subscriptions, etc.)

### 5. Cargar Datos de Prueba (Opcional)

Ejecuta el contenido de:

```
supabase/seed.sql
```

Esto carga datos de ejemplo para desarrollo.

### 6. Configurar Autenticación

En Supabase Dashboard > **Authentication > Settings**:

- **Site URL**: `http://localhost:5173`
- **Redirect URLs**: Agregar `http://localhost:5173/auth/callback`

#### Providers Opcionales

- **Discord**: Configura en Authentication > Providers
- **Steam**: Requiere configuración adicional (OpenID)

## Estructura de la Base de Datos

Ver `supabase/migrations/001_initial_schema.sql` para el schema completo.

Tablas principales:
- `users` - Perfiles de usuario
- `games` - Catálogo de juegos
- `servers` - Servidores de juego
- `subscription_tiers` - Niveles VIP
- `subscriptions` - Suscripciones activas
- `achievements` - Sistema de logros

## Troubleshooting

### Error "Invalid Supabase URL"
- Verifica que `VITE_SUPABASE_URL` tenga formato correcto
- Reinicia el servidor de desarrollo después de cambiar `.env.local`

### Error de CORS
- Verifica la URL del proyecto en Supabase
- Asegúrate de que el Site URL esté configurado correctamente

### Auth no funciona
- Verifica que `VITE_SUPABASE_ANON_KEY` sea correcta
- Revisa que Email provider esté habilitado en Authentication > Providers

## Links Útiles

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
