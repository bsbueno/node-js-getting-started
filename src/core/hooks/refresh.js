import { useState } from 'react'

export function useRefresh() {
  const [refresh, setRefresh] = useState(false)
  return {
    ref: refresh,
    force: () => setRefresh(prev => !prev),
  }
}
