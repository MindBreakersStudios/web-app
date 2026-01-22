# Hooks

Custom React hooks for the MindBreakers frontend.

## Available Hooks

Currently, the main hook is `useAuth()` in `lib/auth.tsx`.

## Creating New Hooks

Place generic, reusable hooks here. Follow these patterns:

### Data Fetching Hook

```tsx
import { useState, useEffect } from 'react'

interface UseDataResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

export function useData<T>(fetchFn: () => Promise<T>): UseDataResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFn()
      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { data, loading, error, refetch: fetchData }
}
```

### UI State Hook

```tsx
import { useState, useCallback } from 'react'

export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue)
  
  const toggle = useCallback(() => setValue(v => !v), [])
  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])
  
  return { value, toggle, setTrue, setFalse }
}
```

## Guidelines

- Prefix hooks with `use`
- Return objects for multiple values
- Handle loading and error states
- Keep hooks focused on single concerns
