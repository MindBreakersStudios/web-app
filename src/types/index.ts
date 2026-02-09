// TypeScript type definitions
// Add type files and re-export them here

export * from './watchparty'

// Common utility types
export type Nullable<T> = T | null
export type Optional<T> = T | undefined

// Component prop helpers
export interface BaseProps {
  className?: string
}

export interface ChildrenProps {
  children: React.ReactNode
}
