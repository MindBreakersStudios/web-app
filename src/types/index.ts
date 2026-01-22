// TypeScript type definitions
// Add type files and re-export them here

// Example:
// export * from './user'
// export * from './game'
// export * from './api'

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
