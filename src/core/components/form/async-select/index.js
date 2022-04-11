/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useEffect } from 'react'
import { useDebounce } from 'core/hooks/debounce'
import { Select } from 'core/components/form/select'

export const AsyncSelect = ({ getItems, watchValues = [], ...props }) => {
  const [value, setValue] = useState('')
  const [loadedValue, setLoadedValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [options, setOptions] = useState([])

  const debouncedValue = useDebounce(value, 300)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    getItems(debouncedValue)
      .then(items => {
        if (mounted) {
          setLoadedValue(debouncedValue)
          setOptions(items)
          setLoading(false)
        }
      })
      .catch(() => setLoading(false))

    return () => {
      mounted = false
    }
    // eslint-disable-next-line
	}, [debouncedValue, ...watchValues])

  const isLoading = loading || value !== loadedValue
  const items = isLoading ? [] : options

  return (
    <Select {...props} isLoading={isLoading} items={items} onInputChange={val => setValue(val)} />
  )
}
