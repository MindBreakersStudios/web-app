---
name: tailwind-styling
description: >
  Patrones de Tailwind CSS para MindBreakers. Tema oscuro, colores de marca, responsive.
  Trigger: When styling components, working with colors, or responsive design.
license: MIT
metadata:
  author: mindbreakers
  version: "1.0"
  scope: [root]
  auto_invoke: "Trabajar con estilos Tailwind"
allowed-tools: Read, Edit, Write, Glob, Grep
---

## Brand Colors

MindBreakers usa un tema oscuro con acentos de color:

```tsx
// Colores principales
const colors = {
  // Backgrounds
  'gray-900': '#111827',     // Fondo principal
  'gray-800': '#1f2937',     // Cards, containers
  'gray-700': '#374151',     // Bordes, separadores
  
  // Acentos (marca)
  'lime-400': '#a3e635',     // Primario brillante
  'lime-500': '#84cc16',     // Primario
  'blue-500': '#3b82f6',     // Secundario
  'blue-600': '#2563eb',     // Secundario hover
  
  // Texto
  'white': '#ffffff',        // Texto principal
  'gray-400': '#9ca3af',     // Texto secundario
  'gray-500': '#6b7280',     // Texto muted
}
```

## Critical Rules

### ✅ ALWAYS

```tsx
// 1. Tema oscuro por defecto
<div className="bg-gray-900 text-white">

// 2. Usar clases de Tailwind, no estilos inline
<button className="bg-lime-500 hover:bg-lime-600">  // ✅
<button style={{ backgroundColor: '#84cc16' }}>     // ❌

// 3. Mobile-first responsive
<div className="text-sm md:text-base lg:text-lg">

// 4. Espaciado consistente (múltiplos de 4)
<div className="p-4 m-2 gap-4">  // 4, 8, 12, 16, 20, 24...

// 5. Transiciones suaves
<button className="transition-colors duration-200">
```

### ❌ NEVER

```tsx
// 1. No colores hardcoded
<div style={{ color: '#ccff00' }}>  // ❌

// 2. No important
<div className="!bg-red-500">  // ❌

// 3. No mezclar sistemas
<div className="p-4" style={{ margin: '10px' }}>  // ❌
```

## Common Patterns

### Cards
```tsx
<div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
  <h3 className="text-lg font-semibold text-white mb-2">Title</h3>
  <p className="text-gray-400">Description</p>
</div>
```

### Buttons
```tsx
// Primary (lime)
<button className="bg-lime-500 hover:bg-lime-600 text-black font-medium px-4 py-2 rounded-lg transition-colors">
  Primary
</button>

// Secondary (blue)
<button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors">
  Secondary
</button>

// Ghost
<button className="bg-transparent hover:bg-gray-800 text-white font-medium px-4 py-2 rounded-lg transition-colors border border-gray-700">
  Ghost
</button>
```

### Inputs
```tsx
<input 
  type="text"
  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-lime-500 transition-colors"
  placeholder="Enter text..."
/>
```

### Links & Navigation
```tsx
// Nav link
<a className="text-gray-400 hover:text-white transition-colors">
  Link
</a>

// Active nav link
<a className="text-lime-400 font-medium">
  Active Link
</a>
```

## Responsive Breakpoints

```tsx
// Mobile first approach
// sm: 640px, md: 768px, lg: 1024px, xl: 1280px

// Grid example
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Hide/show
<div className="hidden md:block">   // Solo desktop
<div className="block md:hidden">   // Solo mobile

// Padding responsive
<div className="px-4 md:px-8 lg:px-16">
```

## Layout Patterns

### Container centrado
```tsx
<div className="max-w-7xl mx-auto px-4">
  {/* Content */}
</div>
```

### Flexbox centering
```tsx
<div className="flex items-center justify-center min-h-screen">
  {/* Centered content */}
</div>
```

### Grid dashboard
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatsCard />
  <StatsCard />
  <StatsCard />
  <StatsCard />
</div>
```

### Sidebar layout
```tsx
<div className="flex">
  <aside className="w-64 bg-gray-800 min-h-screen p-4">
    {/* Sidebar */}
  </aside>
  <main className="flex-1 p-6">
    {/* Content */}
  </main>
</div>
```

## States

```tsx
// Hover
className="hover:bg-gray-700"

// Focus
className="focus:outline-none focus:ring-2 focus:ring-lime-500"

// Disabled
className="disabled:opacity-50 disabled:cursor-not-allowed"

// Active/Selected
className="bg-lime-500/20 border-lime-500"
```

## Animations

```tsx
// Fade in
className="animate-fade-in"

// Pulse (loading)
className="animate-pulse"

// Custom transition
className="transition-all duration-300 ease-in-out"
```

## Spacing Reference

```
p-1 = 4px    m-1 = 4px
p-2 = 8px    m-2 = 8px
p-3 = 12px   m-3 = 12px
p-4 = 16px   m-4 = 16px
p-6 = 24px   m-6 = 24px
p-8 = 32px   m-8 = 32px
```

## Checklist: Styling

- [ ] Usar tema oscuro (bg-gray-900, text-white)
- [ ] Mobile-first responsive
- [ ] Transiciones en elementos interactivos
- [ ] Estados hover/focus/disabled
- [ ] Espaciado consistente (múltiplos de 4px)
- [ ] Colores de marca para acentos
