import React from 'react'
import { classNames } from 'core/helpers/misc'

export const TextAreaInput = ({
  refEl,
  meta = {},
  value,
  placeholder,
  disabled,
  label,
  onChange,
  rows,
  readOnly,
  maxLenght,
}) => {
  const hasError = meta.touched && !!meta.error

  return (
    <div
      className={classNames('form-group', {
        'is-loading': meta.loading,
      })}
    >
      {label && <label>{label}</label>}

      <textarea
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        ref={refEl}
        className="form-control"
        onChange={ev => onChange && onChange(ev.target.value, 'key')}
        onBlur={ev => onChange && onChange(ev.target.value, 'blur')}
        value={value}
        readOnly={readOnly}
        maxLength={maxLenght}
      />

      {hasError && <p className="form-text text-danger">{meta.error}</p>}
    </div>
  )
}
