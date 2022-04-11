/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useEffect } from 'react'
import { useDebounce } from 'core/hooks/debounce'
import { Select } from 'core/components/form/select'
import { Button } from 'core/components/button'

export const AsyncSelectAdd = ({
  getItems,
  watchValues = [],
  disabledAdd,
  onClickAdd,
  Component,
  service,
  route,
  getListConditions,
  ...props
}) => {
  const [value, setValue] = useState('')
  const [loadedValue, setLoadedValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [options, setOptions] = useState([])
  const [showForm, setShowForm] = useState(false)

  const debouncedValue = useDebounce(value, 300)

  function loadItems(_debouncedValue, _mounted) {
    getItems(_debouncedValue)
      .then(items => {
        if (_mounted) {
          setLoadedValue(_debouncedValue)
          setOptions(items)
          setLoading(false)
        }
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    let mounted = true
    setLoading(true)
    loadItems(debouncedValue, mounted)

    return () => {
      mounted = false
    }
    // eslint-disable-next-line
	}, [debouncedValue, ...watchValues])

  const isLoading = loading || value !== loadedValue
  const items = isLoading ? [] : options

  return (
    <div className="field-button-add-select">
      <div className="field-select">
        <Select
          {...props}
          isLoading={isLoading}
          items={items}
          onInputChange={val => setValue(val)}
        />
      </div>
      <Button
        type="button"
        icon="fas fa-plus"
        customClassName="btn-success btn-select"
        disabled={disabledAdd}
        onClick={() => {
          setShowForm(true)
        }}
      />
      <Component
        service={service}
        show={showForm}
        onClick={() => {
          setShowForm(false)
        }}
        refresh={() => {
          setShowForm(false)
          loadItems(debouncedValue, true)
        }}
        onClose={() => {
          setShowForm(false)
          loadItems(debouncedValue, true)
        }}
        route={route}
        global={global}
        getItems={getItems}
      />
    </div>
  )
}
