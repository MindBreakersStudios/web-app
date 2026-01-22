# Contribuir a MindBreakers

¡Hola! Bienvenido/a al repositorio de **MindBreakers**, una comunidad gaming de LATAM desde 2020. Nos alegra que quieras contribuir a nuestro proyecto.

Este documento te guiará paso a paso para que puedas empezar a contribuir, sin importar tu nivel de experiencia. Si tienes dudas, no dudes en preguntar.

---

## Cómo empezar

### 1. Haz un Fork del repositorio

Haz clic en el botón **Fork** en la esquina superior derecha de este repositorio. Esto creará una copia en tu cuenta de GitHub.

### 2. Clona tu fork localmente

```bash
git clone https://github.com/TU-USUARIO/website.git
cd website
```

### 3. Instala las dependencias

```bash
npm install
```

### 4. Configura las variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con las variables necesarias.

> Consulta el archivo [LOCAL_SETUP.md](./LOCAL_SETUP.md) para ver las variables requeridas y cómo obtenerlas.

Ejemplo básico:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

### 5. Corre el proyecto en desarrollo

```bash
npm run dev
```

El proyecto estará disponible en `http://localhost:5173`. ¡Listo para desarrollar!

---

## Flujo de contribución

### 1. Crea una branch desde `main`

Usa nombres descriptivos siguiendo esta convención:

```bash
# Para nuevas funcionalidades
git checkout -b feature/nombre-de-la-feature

# Para corrección de bugs
git checkout -b fix/descripcion-del-bug

# Para documentación
git checkout -b docs/que-documentas
```

**Ejemplos:**
- `feature/dark-mode-toggle`
- `fix/login-button-not-working`
- `docs/add-setup-instructions`

### 2. Haz tus cambios

Desarrolla tu funcionalidad o corrección. Recuerda:

- Mantén los cambios enfocados en una sola cosa
- Prueba que todo funcione antes de hacer commit
- Sigue el estilo de código existente

### 3. Haz commits con Conventional Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/) para mantener un historial claro:

```bash
# Nueva funcionalidad
git commit -m "feat: agregar selector de idioma en el header"

# Corrección de bug
git commit -m "fix: corregir error en validación de formulario"

# Documentación
git commit -m "docs: actualizar guía de instalación"

# Estilos (CSS, formato)
git commit -m "style: mejorar espaciado en tarjetas de servidor"

# Refactorización
git commit -m "refactor: simplificar lógica del componente Hero"
```

### 4. Sube tus cambios y crea un Pull Request

```bash
git push origin feature/tu-branch
```

Luego, ve a GitHub y crea un **Pull Request** hacia la branch `main` del repositorio original.

En tu PR incluye:
- Descripción clara de los cambios
- Screenshots si hay cambios visuales
- Referencia a issues relacionados (si aplica)

### 5. Espera el review

Un mantenedor revisará tu PR. Puede que te pidan cambios o mejoras. No te preocupes, es parte del proceso y estamos aquí para ayudarte.

---

## ¿Qué puedo contribuir?

Este es un repositorio **público** enfocado en el frontend de la comunidad. Aquí hay algunas ideas:

| Tipo | Ejemplos |
|------|----------|
| **Componentes UI** | Botones, cards, modales, formularios |
| **Páginas** | Página de perfil, leaderboards, comunidad |
| **Traducciones (i18n)** | Agregar/mejorar traducciones ES/EN |
| **Mejoras de diseño** | Animaciones, responsive, accesibilidad |
| **Documentación** | Guías, comentarios en código, READMEs |
| **Bug fixes** | Corrección de errores visuales o de lógica UI |
| **Tests** | Tests unitarios para componentes |

---

## ¿Qué NO está en este repositorio?

Este repositorio es **público y open-source**. Por seguridad, algunas cosas se manejan en repositorios privados separados:

| Fuera de alcance | Razón |
|------------------|-------|
| **Panel de administración** | Repositorio privado separado |
| **Integración con servidores de juego** | APIs privadas (RCON, game servers) |
| **Lógica de negocio sensible** | Procesamiento de pagos, moderación |
| **Comandos de servidor** | SCUM, HumanitZ, otros juegos |

Si tienes dudas sobre si algo está en alcance, pregunta antes de empezar a trabajar.

---

## Guías específicas

En la carpeta `skills/` encontrarás guías detalladas para tareas específicas:

| Skill | Descripción |
|-------|-------------|
| [`skills/react-components/`](./skills/react-components/) | Cómo crear componentes React |
| [`skills/routing-pages/`](./skills/routing-pages/) | Cómo agregar nuevas páginas |
| [`skills/tailwind-styling/`](./skills/tailwind-styling/) | Guía de estilos con Tailwind |
| [`skills/i18n/`](./skills/i18n/) | Cómo manejar traducciones |
| [`skills/contributing/`](./skills/contributing/) | Guía detallada de contribución |

Estas guías están diseñadas para ayudar tanto a humanos como a agentes de IA a contribuir de manera consistente.

---

## Código de conducta

Queremos que MindBreakers sea un espacio acogedor para todos. Por favor:

### Sé respetuoso
- Trata a todos con respeto, sin importar su nivel de experiencia
- Las críticas constructivas son bienvenidas, los ataques personales no
- Recuerda que detrás de cada PR hay una persona

### Sé inclusivo
- Usamos lenguaje inclusivo
- Damos la bienvenida a contribuidores de todos los orígenes
- Valoramos diferentes perspectivas y experiencias

### Mantén la buena onda
- Estamos aquí porque nos gustan los videojuegos y la programación
- Celebramos los logros de los demás
- Ayudamos a quienes están aprendiendo
- Nos divertimos mientras construimos algo genial

### No toleramos
- Acoso o discriminación de ningún tipo
- Comentarios ofensivos o despectivos
- Spam o autopromoción excesiva

Si ves comportamiento inapropiado, repórtalo a los mantenedores.

---

## ¿Necesitas ayuda?

- **Discord**: Únete a nuestra comunidad en Discord para preguntas rápidas
- **Issues**: Abre un issue en GitHub si encuentras un bug o tienes una sugerencia
- **Discussions**: Usa GitHub Discussions para preguntas generales

---

¡Gracias por contribuir a MindBreakers! Cada línea de código cuenta.

**Happy coding!** 🎮
