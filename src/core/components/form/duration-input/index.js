import React, { useState, useRef } from 'react'
import { classNames } from 'core/helpers/misc'
import { useOnClickOutside } from 'core/hooks/clickOutside'

const types = [
  { id: 'min', name: 'minutos' },
  { id: 'hour', name: 'horas' },
  { id: 'day', name: 'dias' },
]

function getInitialType(value) {
  if (value === 0 || !value) return types[0]
  if ((value / 60) % 24 === 0) return types[2]
  if (value % 60 === 0) return types[1]
  return types[0]
}

function getViewValue(value, type) {
  if (type.id === 'day') return value / 60 / 24
  if (type.id === 'hour') return value / 60
  return value
}

function getMinutes(value, type) {
  if (type.id === 'day') return value * 60 * 24
  if (type.id === 'hour') return value * 60
  return value
}

export const DurationInput = ({ value, onChange }) => {
  const groupRef = useRef()
  const [type, setType] = useState(getInitialType(value))
  const [show, setShow] = useState(false)
  const [focused, setFocused] = useState(false)
  const viewValue = getViewValue(value, type)

  useOnClickOutside(groupRef, () => setShow(false))

  return (
    <div className="input-group">
      <input
        min={0}
        type="number"
        className="form-control"
        value={focused && viewValue === 0 ? '' : viewValue}
        onBlur={() => setFocused(false)}
        onFocus={() => setFocused(true)}
        onChange={({ target }) =>
          onChange(target.value === '' ? null : getMinutes(parseInt(target.value, 10), type))
        }
      />

      <div ref={groupRef} className="input-group-append">
        <button
          type="button"
          className="btn btn-brand dropdown-toggle"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded={show ? 'true' : 'false'}
          onClick={() => setShow(op => !op)}
          style={{ zIndex: '0' }}
        >
          {type.name}
        </button>

        <div className={classNames('dropdown-menu dropdown-menu-right', { show })}>
          {types.map(t => (
            <button
              key={t.id}
              type="button"
              className={classNames('dropdown-item', { active: t.id === type.id })}
              onClick={() => {
                setType(t)
                setShow(false)
              }}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
