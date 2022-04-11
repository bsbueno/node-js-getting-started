import { useState, useEffect } from 'react'

const isClient = typeof window === 'object'
const getSize = () => ({
  width: isClient ? window.innerWidth : 0,
  height: isClient ? window.innerHeight : 0,
})

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState(getSize)

  useEffect(() => {
    function handleResize() {
      setWindowSize(getSize())
    }

    if (isClient) {
      window.addEventListener('resize', handleResize)
    }

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}
