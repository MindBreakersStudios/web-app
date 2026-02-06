# MindBreakers MultiViewer

Sistema de visualización múltiple de streams de Kick.com para la plataforma MindBreakers.

## 🎯 Características

- **Grilla responsive**: Layouts configurables de 1x1 hasta 4x4
- **Hasta 12 streams simultáneos**: Mira múltiples streamers a la vez
- **Chat integrado**: Visualiza el chat de un stream a la vez
- **URLs compartibles**: Comparte tu configuración con amigos
- **Persistencia local**: Guarda tu configuración en localStorage
- **Preparado para API**: Arquitectura lista para integrar streamers activos del servidor

## 📦 Estructura de archivos

```
multiviewer/
├── components/
│   ├── MultiViewer.tsx    # Componente principal
│   ├── KickPlayer.tsx     # Player individual de Kick
│   └── KickChat.tsx       # Chat embebido
├── hooks/
│   └── useMultiViewer.ts  # Hook de estado
├── pages/
│   └── WatchPage.tsx      # Página dedicada /watch
├── types/
│   └── multiviewer.ts     # TypeScript definitions
├── locales/
│   ├── multiviewer-es.json
│   ├── multiviewer-en.json
│   └── multiviewer-pt-br.json
└── index.ts               # Exports
```

## 🚀 Instalación

### 1. Copiar archivos al proyecto

Copia la carpeta `multiviewer/` a `src/components/`:

```bash
cp -r multiviewer/ src/components/multiviewer/
```

### 2. Agregar ruta en App.tsx

```tsx
import { WatchPage } from './components/multiviewer/pages/WatchPage';

// En las rutas:
<Route path="/watch" element={<WatchPage />} />
```

### 3. Agregar traducciones a los locales

Agrega el contenido de los archivos en `locales/` a tus archivos de traducción existentes:

```json
// src/locales/es.json
{
  // ... otras traducciones ...
  "multiviewer": { ... }
}
```

### 4. Agregar link en el Header (opcional)

```tsx
<Link to="/watch" className="...">
  <Radio className="w-4 h-4" />
  MultiViewer
</Link>
```

## 📖 Uso

### Básico

```tsx
import { MultiViewer } from './components/multiviewer';

function MyPage() {
  return (
    <MultiViewer 
      initialStreamers={['xqc', 'shroud']}
      maxHeight="80vh"
    />
  );
}
```

### Con streamers del servidor (futura API)

```tsx
import { MultiViewer, ActiveGameStreamer } from './components/multiviewer';

function GamePage() {
  const [serverStreamers, setServerStreamers] = useState<ActiveGameStreamer[]>([]);

  // Fetch de la API futura
  useEffect(() => {
    fetch('/api/active-streamers?game=humanitz')
      .then(res => res.json())
      .then(data => setServerStreamers(data.streamers));
  }, []);

  return (
    <MultiViewer 
      activeServerStreamers={serverStreamers}
      game="humanitz"
      showServerStreamers={true}
    />
  );
}
```

### URL Parameters

La página `/watch` acepta los siguientes query params:

| Param | Descripción | Ejemplo |
|-------|-------------|---------|
| `streamers` | Lista de usernames separados por coma | `?streamers=xqc,shroud,adin` |
| `layout` | Número de columnas (1-4) | `?layout=2` |
| `chat` | Username del chat activo | `?chat=xqc` |

**Ejemplo completo:**
```
/watch?streamers=xqc,shroud,adin&layout=3&chat=xqc
```

## 🔌 Integración futura con API de steamIds

El sistema está preparado para recibir streamers activos desde los logs del servidor:

### Estructura esperada de la API

```typescript
// GET /api/active-streamers?game=humanitz
interface ActiveStreamersAPIResponse {
  success: boolean;
  data: {
    game: 'humanitz' | 'scum';
    streamers: ActiveGameStreamer[];
    lastUpdated: string;
  };
}

interface ActiveGameStreamer {
  username: string;        // Username de Kick
  steamId: string;         // SteamID del jugador
  displayName?: string;    // Nombre para mostrar
  inGameName?: string;     // Nombre en el juego
  game: 'humanitz' | 'scum';
  isOnlineInGame: boolean;
  lastSeenInGame: number;  // Timestamp
}
```

### Flujo de datos propuesto

1. **Backend** lee logs del servidor del juego
2. **Backend** detecta conexión de jugador por steamId
3. **Backend** busca en DB si ese steamId tiene cuenta de Kick vinculada
4. **Backend** expone endpoint `/api/active-streamers`
5. **Frontend** consume la API y muestra los streamers activos

### Tabla de vinculación propuesta (Supabase)

```sql
CREATE TABLE streamer_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  steam_id VARCHAR(20) NOT NULL UNIQUE,
  kick_username VARCHAR(50),
  display_name VARCHAR(100),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🎨 Personalización

### Colores (usa variables CSS de MindBreakers)

El componente usa las clases de Tailwind del proyecto:
- `lime-400` / `lime-500` - Color primario
- `blue-500` - Color secundario
- `gray-700` / `gray-800` / `gray-900` - Fondos

### Layouts disponibles

```typescript
const GRID_LAYOUTS = [
  { columns: 1, label: '1x1' },  // Un stream grande
  { columns: 2, label: '2x2' },  // Default - 4 streams
  { columns: 3, label: '3x3' },  // 9 streams
  { columns: 4, label: '4x4' },  // Hasta 12 streams
];
```

## 🧪 Testing

```tsx
// Mock de streamers activos para testing
const mockServerStreamers: ActiveGameStreamer[] = [
  {
    username: 'teststreamer',
    steamId: '76561198012345678',
    displayName: 'Test Streamer',
    inGameName: 'TestPlayer',
    game: 'humanitz',
    isOnlineInGame: true,
    lastSeenInGame: Date.now(),
    addedAt: Date.now(),
  },
];

<MultiViewer
  activeServerStreamers={mockServerStreamers}
  showServerStreamers={true}
  game="humanitz"
/>
```

## 📝 Notas técnicas

### Kick Embed API

Kick permite embeber streams usando iframes simples:

```html
<iframe 
  src="https://player.kick.com/USERNAME?muted=true&autoplay=true"
  allowfullscreen
/>
```

**Parámetros disponibles:**
- `muted` - Iniciar muteado (true/false)
- `autoplay` - Autoplay (true/false)
- `allowfullscreen` - Permitir fullscreen (true/false)

### Chat de Kick

Kick no tiene un embed oficial de chat separado. Usamos el chatroom como iframe:

```html
<iframe src="https://kick.com/USERNAME/chatroom" />
```

**Nota:** Esto carga toda la página del chatroom, lo cual puede ser pesado.

### Limitaciones conocidas

1. **Chat pesado**: El embed de chat carga la página completa de Kick
2. **Sin API pública de Kick**: No podemos obtener info como viewers, título, etc. sin API
3. **CORS**: Algunas interacciones pueden estar limitadas por políticas CORS

## 🤝 Contribuir

Ver [CONTRIBUTING.md](../../CONTRIBUTING.md) para guías de contribución al proyecto MindBreakers.

## 📄 Licencia

Este componente es parte del proyecto MindBreakers web-app.
