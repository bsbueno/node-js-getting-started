import { useState } from 'react'
import { cleanFilters } from 'service/helpers'
import { useDebounce } from './debounce'

export function useFilters(initialValues, getFilters) {
  const [values, setValues] = useState(initialValues)
  const [filters, setFilters] = useState(cleanFilters(getFilters(initialValues)))
  const debouncedFilters = useDebounce(filters, 300)

  return {
    filters: debouncedFilters,
    values,
    setValues: setter =>
      setValues(prev => {
        const newValues = setter(prev)
        setFilters(cleanFilters(getFilters(newValues)))
        return newValues
      }),
  }
}
