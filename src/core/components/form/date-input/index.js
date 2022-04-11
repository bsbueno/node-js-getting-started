import React from 'react'
import { classNames } from 'core/helpers/misc'
import { DatePicker } from 'core/components/datepicker'

export const DateInput = ({
  meta = {},
  placeholder = 'DD/MM/YYYY',
  onChange = () => {},
  dateFormat,
  value = null,
  minDate = null,
  maxDate = null,
  disabled,
  isClearable,
}) => {
  const hasError = meta.touched && !!meta.error
  const canClear = value !== null && !disabled && isClearable

  return (
    <div
      className={classNames('kt-input-icon kt-input-icon--left', {
        'kt-input-icon--right': canClear,
        'kt-spinner kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input':
          meta.loading,
      })}
    >
      <DatePicker
        className={classNames('form-control', {
          'is-invalid': hasError,
        })}
        placeholder={placeholder}
        dateFormat={dateFormat}
        maxDate={maxDate}
        minDate={minDate}
        disabled={disabled}
        onChange={onChange}
        value={value}
      />

      <span className="kt-input-icon__icon">
        <span>
          <i className="fa fa-calendar-alt" />
        </span>
      </span>

      {canClear && (
        <span
          className="kt-input-icon__icon kt-input-icon__icon--right clear-button"
          onClick={() => onChange(null)}
        >
          <span>
            <i className="fa fa-times" />
          </span>
        </span>
      )}

      {hasError && <div className="form-text text-danger">{meta.error}</div>}
    </div>
  )
}
