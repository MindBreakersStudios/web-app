# Configuración del Entorno de Desarrollo Local

Esta guía te llevará paso a paso para configurar tu entorno de desarrollo local para contribuir a MindBreakers.

---

## Requisitos Previos

Antes de empezar, asegúrate de tener instalado:

| Requisito | Versión | Cómo verificar |
|-----------|---------|----------------|
| **Node.js** | 18 o superior | `node --version` |
| **npm** | 9 o superior | `npm --version` |
| **Git** | Cualquier versión reciente | `git --version` |

También necesitarás:

- **Cuenta de GitHub** - Para hacer fork del repositorio
- **Cuenta de Supabase** - Gratis en [supabase.com](https://supabase.com)

### Instalar Node.js

Si no tienes Node.js instalado:

- **Windows/Mac**: Descarga desde [nodejs.org](https://nodejs.org/) (versión LTS)
- **Linux**: Usa tu gestor de paquetes o [nvm](https://github.com/nvm-sh/nvm)

```bash
# Verificar instalación
node --version  # Debería mostrar v18.x.x o superior
npm --version   # Debería mostrar 9.x.x o superior
```

---

## Paso 1: Fork y Clonar el Repositorio

### 1.1 Hacer Fork en GitHub

1. Ve al repositorio original en GitHub
2. Haz clic en el botón **Fork** (esquina superior derecha)
3. Selecciona tu cuenta como destino
4. Espera a que se complete el fork

### 1.2 Clonar tu Fork

```bash
# Reemplaza TU-USUARIO con tu nombre de usuario de GitHub
git clone https://github.com/TU-USUARIO/website.git

# Entrar al directorio
cd website
```

### 1.3 Configurar el Upstream (opcional pero recomendado)

Esto te permite mantener tu fork sincronizado con el repositorio original:

```bash
git remote add upstream https://github.com/MindBreakers/website.git

# Verificar remotes
git remote -v
# Deberías ver:
# origin    https://github.com/TU-USUARIO/website.git (fetch)
# origin    https://github.com/TU-USUARIO/website.git (push)
# upstream  https://github.com/MindBreakers/website.git (fetch)
# upstream  https://github.com/MindBreakers/website.git (push)
```

---

## Paso 2: Instalar Dependencias

Desde la raíz del proyecto, instala las dependencias:

```bash
npm install
```

Esto instalará todas las dependencias necesarias definidas en `package.json`.

> **Nota**: Si prefieres usar pnpm, puedes ejecutar `pnpm install` en su lugar.

---

## Paso 3: Crear Proyecto en Supabase

Cada contributor necesita su propio proyecto de Supabase para desarrollo local. Es gratis y no requiere tarjeta de crédito.

### 3.1 Crear Cuenta

1. Ve a [supabase.com](https://supabase.com)
2. Haz clic en **Start your project**
3. Inicia sesión con GitHub (recomendado) o crea una cuenta con email

### 3.2 Crear Nuevo Proyecto

1. En el dashboard, haz clic en **New Project**
2. Selecciona tu organización (o crea una nueva)
3. Completa los datos:
   - **Name**: `mindbreakers-dev` (o el nombre que prefieras)
   - **Database Password**: Genera una contraseña segura y guárdala
   - **Region**: Selecciona **South America (São Paulo)** si está disponible, o la más cercana a ti
4. Haz clic en **Create new project**
5. Espera 1-2 minutos mientras se inicializa

### 3.3 Obtener Credenciales

Una vez que el proyecto esté listo:

1. Ve a **Settings** (icono de engranaje en la barra lateral)
2. Haz clic en **API** en el menú
3. Encontrarás:
   - **Project URL**: Algo como `https://xxxxx.supabase.co`
   - **anon/public key**: Una cadena larga que empieza con `eyJ...`

> **Importante**: Copia estos valores, los necesitarás en el siguiente paso.

---

## Paso 4: Configurar Variables de Entorno

### 4.1 Crear archivo .env.local

Desde la raíz del proyecto:

```bash
# Copiar el archivo de ejemplo
cp .env.example .env.local
```

O crea el archivo manualmente como `.env.local` en la raíz.

### 4.2 Agregar tus Credenciales

Abre `.env.local` en tu editor y reemplaza los valores:

```env
# Supabase - Tus credenciales del Paso 3
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Modo desarrollo (opcional)
VITE_DEV_MODE=true
```

> **Seguridad**: El archivo `.env.local` está en `.gitignore` y nunca se subirá al repositorio.

---

## Paso 5: Configurar la Base de Datos

### 5.1 Crear Tablas Necesarias

Ve al **SQL Editor** en tu proyecto de Supabase (barra lateral izquierda) y ejecuta el siguiente SQL:

```sql
-- Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  steam_id TEXT,
  discord_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política: usuarios pueden ver todos los perfiles
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Política: usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Política: insertar perfil al registrarse
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### 5.2 Configurar Autenticación (Opcional)

Si quieres probar el login con Discord:

1. Ve a **Authentication** > **Providers** en Supabase
2. Habilita **Discord**
3. Crea una aplicación en [Discord Developer Portal](https://discord.com/developers/applications)
4. Copia el Client ID y Client Secret a Supabase
5. En Discord, configura el Redirect URL: `https://tu-proyecto.supabase.co/auth/v1/callback`

> **Nota**: Para desarrollo local, puedes usar email/password que viene habilitado por defecto.

---

## Paso 6: Cargar Datos de Prueba (Opcional)

Para tener datos de ejemplo, ejecuta este SQL en el editor de Supabase:

```sql
-- Datos de prueba para desarrollo
-- Solo ejecuta esto en tu proyecto de desarrollo, nunca en producción

-- Nota: Los perfiles se crean automáticamente cuando un usuario se registra
-- Este script es solo para referencia de la estructura de datos
```

> **Tip**: La mayoría de los datos se obtienen de la API pública y Supabase en producción. Para desarrollo local, puedes trabajar con datos mínimos.

---

## Paso 7: Iniciar el Servidor de Desarrollo

Desde la raíz del proyecto:

```bash
npm run dev
```

Deberías ver algo como:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

---

## Problemas Comunes

### Error: "Invalid Supabase URL"

**Síntoma**: Error al cargar la página o en la consola del navegador.

**Solución**:
1. Verifica que `VITE_SUPABASE_URL` tenga el formato correcto: `https://xxxxx.supabase.co`
2. Asegúrate de no tener espacios extras en el archivo `.env.local`
3. Reinicia el servidor de desarrollo después de cambiar variables de entorno

### Error de CORS

**Síntoma**: Errores de "Access-Control-Allow-Origin" en la consola.

**Solución**:
1. Verifica que la URL de Supabase sea correcta
2. En Supabase, ve a **Settings** > **API** y verifica que no haya restricciones de dominio

### La autenticación no funciona

**Síntoma**: No puedes iniciar sesión o registrarte.

**Solución**:
1. Verifica que `VITE_SUPABASE_ANON_KEY` sea correcta
2. En Supabase, ve a **Authentication** > **Providers** y verifica que Email esté habilitado
3. Revisa la consola del navegador para más detalles del error

### El puerto 5173 ya está en uso

**Síntoma**: Error "Port 5173 is already in use".

**Solución**:
```bash
# Opción 1: Usar otro puerto
npm run dev -- --port 3000

# Opción 2: Encontrar y matar el proceso (Windows)
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Opción 2: Encontrar y matar el proceso (Mac/Linux)
lsof -i :5173
kill -9 <PID>
```

### Los cambios no se reflejan

**Síntoma**: Haces cambios pero no ves actualizaciones en el navegador.

**Solución**:
1. Verifica que el servidor de desarrollo esté corriendo
2. Limpia la caché del navegador (Ctrl+Shift+R o Cmd+Shift+R)
3. Reinicia el servidor de desarrollo

---

## Comandos Útiles

```bash
# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Preview de la build de producción
npm run preview

# Verificar tipos de TypeScript
npm run type-check

# Ejecutar linter
npm run lint
```

---

## Siguiente Paso

¡Felicidades! Ya tienes tu entorno de desarrollo configurado.

Ahora puedes:
- Leer [CONTRIBUTING.md](./CONTRIBUTING.md) para aprender el flujo de contribución
- Explorar la carpeta `skills/` para guías específicas
- Crear tu primera contribución

¿Encontraste algún problema con esta guía? Abre un issue para ayudarnos a mejorarla.

---

**Happy coding!** 🎮
