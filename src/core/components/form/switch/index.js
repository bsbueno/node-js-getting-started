import React, { useCallback } from 'react'

export const Switch = ({
  id,
  label,
  onChange,
  checked,
  className,
  hidden = false,
  disabled = false,
}) => {
  // eslint-disable-next-line
	const handleChange = useCallback(ev => onChange(ev.target.checked), [])

  return (
    <div className={`d-flex align-items-center ${className || ''}`} hidden={hidden}>
      <span className="kt-switch">
        <label>
          <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={ev => {
              if (!disabled) {
                handleChange(ev)
              }
            }}
          />
          <span />
        </label>
      </span>
      <label htmlFor={id} className="ml-2 cur-p">
        {label}
      </label>
    </div>
  )
}
