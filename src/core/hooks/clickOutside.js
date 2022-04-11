import { useEffect } from 'react'

const passive = typeof document !== 'undefined'

export function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = event => {
      if (!ref.current || ref.current.contains(event.target)) {
        return
      }

      handler()
    }

    document.addEventListener('mousedown', listener, { passive })
    document.addEventListener('touchstart', listener, { passive })

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}
