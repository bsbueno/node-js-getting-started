import React, { useCallback, useState } from 'react'
import { classNames } from 'core/helpers/misc'

export const IntegerInput = ({
  refEl,
  meta = {},
  placeholder,
  disabled,
  value,
  min,
  max,
  step,
  icon,
  onChange,
  suffix,
  acceptEnter,
}) => {
  const [focused, setFocused] = useState(false)
  const handleChange = useCallback(
    (val, type) => {
      if (onChange) {
        let num = val === '' ? null : parseInt(val, 10)

        if (!!max && !!num) {
          num = Math.min(num, max)
        }

        if (!!min && !!num) {
          num = Math.max(min, num)
        }

        onChange(num, type)
      }
    },
    [max, min, onChange],
  )

  const hasError = meta.touched && !!meta.error

  return (
    <div
      className={classNames('input-field', {
        'kt-input-icon kt-input-icon--left': !!icon,
        'kt-spinner kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input':
          meta.loading,
        'input-group': suffix,
      })}
    >
      <input
        ref={refEl}
        disabled={disabled}
        placeholder={placeholder}
        type="number"
        className={classNames('form-control', {
          'is-invalid': hasError,
        })}
        onChange={ev => handleChange(ev.target.value, 'key')}
        onKeyDown={ev => ev.keyCode === 13 && !acceptEnter && ev.preventDefault()}
        onFocus={() => setFocused(true)}
        onBlur={ev => {
          setFocused(false)
          handleChange(ev.target.value, 'blur')
        }}
        value={focused && !value ? '' : value}
        min={min}
        max={max}
        step={step}
      />

      {icon && (
        <span className="kt-input-icon__icon">
          <span>
            <i className={icon} />
          </span>
        </span>
      )}

      {suffix && (
        <div className="input-group-append">
          <span className="input-group-text">{suffix}</span>
        </div>
      )}

      {hasError && <div className="form-text text-danger">{meta.error}</div>}
    </div>
  )
}
