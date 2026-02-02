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

---

## Troubleshooting Común

Esta sección cubre problemas frecuentes que pueden surgir durante la configuración y uso de Supabase.

### Variables de Entorno

#### Las variables no se cargan
```
Error: VITE_SUPABASE_URL is undefined
```
**Solución:**
1. Verifica que el archivo se llame `.env.local` (no `.env`)
2. Las variables deben tener prefijo `VITE_` para ser accesibles en el frontend
3. Reinicia el servidor de desarrollo (`npm run dev`)
4. Verifica que no haya espacios alrededor del `=`:
   ```bash
   # Correcto
   VITE_SUPABASE_URL=https://xxx.supabase.co

   # Incorrecto
   VITE_SUPABASE_URL = https://xxx.supabase.co
   ```

#### El archivo .env.local no existe
- Copia el archivo de ejemplo: `cp .env.example .env.local`
- Nunca subas `.env.local` a git (ya está en `.gitignore`)

### Problemas de Conexión

#### Error "Failed to fetch" o timeout
**Causas comunes:**
1. Proyecto de Supabase pausado (inactividad en tier gratuito)
   - Solución: Ve al dashboard de Supabase y reactiva el proyecto
2. URL incorrecta
   - Verifica que no tenga espacios o caracteres extra
3. Firewall o VPN bloqueando conexión
   - Prueba deshabilitando VPN temporalmente

#### Error "Invalid API key"
- Asegúrate de usar la **anon public key**, no la service_role key
- La key correcta comienza con `eyJhbG...`
- Encuéntrala en: Settings > API > Project API keys > anon public

### Problemas de Autenticación

#### Discord OAuth no redirige correctamente
1. En Supabase Dashboard > Authentication > URL Configuration:
   - Site URL: `http://localhost:5173`
   - Redirect URLs: agregar `http://localhost:5173/auth/callback`
2. En Discord Developer Portal:
   - Verifica que el Redirect URI coincida exactamente
   - Formato: `https://[tu-proyecto].supabase.co/auth/v1/callback`

#### Steam login no funciona
Steam usa OpenID, no OAuth estándar. Requiere configuración adicional:
1. Ve a Authentication > Providers > OpenID Connect
2. Configura con la URL de Steam OpenID
3. Revisa la documentación de Steam Web API

#### "Email link is invalid or has expired"
- Los links de confirmación expiran en 24 horas
- Verifica que el usuario no haya solicitado múltiples links
- Revisa carpeta de spam

### Problemas de Base de Datos

#### Error "relation does not exist"
La tabla no existe. Solución:
1. Ve a SQL Editor en Supabase
2. Ejecuta las migraciones en orden:
   ```
   supabase/migrations/001_initial_schema.sql
   ```

#### Error de Row Level Security (RLS)
```
new row violates row-level security policy
```
**Causas:**
1. El usuario no tiene permisos para la operación
2. Las políticas RLS están mal configuradas
3. El usuario no está autenticado

**Solución:**
- Para desarrollo, puedes deshabilitar RLS temporalmente (no en producción)
- Revisa las políticas en: Table Editor > [tabla] > Policies

#### Datos no aparecen aunque existen
Probablemente es un problema de RLS:
1. Verifica que haya políticas de SELECT para la tabla
2. Prueba la query directamente en SQL Editor (ignora RLS)
3. Asegúrate de que el usuario cumpla las condiciones de la política

### Problemas con Migraciones

#### Error de sintaxis SQL
- Supabase usa PostgreSQL, no MySQL
- Diferencias comunes:
  - Usar `TEXT` en lugar de `VARCHAR` sin límite
  - `SERIAL` o `BIGSERIAL` para auto-increment
  - `TIMESTAMPTZ` para timestamps con timezone

#### La migración se ejecutó pero las tablas no aparecen
1. Refresca la página del dashboard
2. Verifica que estés viendo el schema correcto (usualmente `public`)
3. Revisa si hubo errores en la ejecución (Results tab en SQL Editor)

### Problemas de Performance

#### Queries lentas
1. Verifica que tengas índices en columnas usadas en WHERE/JOIN
2. Usa el Query Performance en Supabase Dashboard
3. Limita los resultados con `.limit()` cuando sea posible

#### Límite de conexiones alcanzado
El tier gratuito tiene límite de conexiones simultáneas:
- Cierra conexiones que no uses
- Usa connection pooling si es posible
- Considera upgrade a tier Pro para producción

### Desarrollo Local con Supabase CLI (Opcional)

Si prefieres correr Supabase localmente:

```bash
# Instalar CLI
npm install -g supabase

# Iniciar servicios locales
supabase start

# Ver credenciales locales
supabase status
```

Las URLs locales serán diferentes:
```bash
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=[key-local]
```

## Links Útiles

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
