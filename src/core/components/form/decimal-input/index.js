import React, { useRef, useLayoutEffect, useState, useCallback } from 'react'
import { classNames } from 'core/helpers/misc'
import { parseNumber } from 'core/helpers/parse'
import {
  adjustDecimalCaret,
  maskDecimal,
  getInputSelection,
  setCaretPosition,
  DecimalConfig,
} from 'core/helpers/mask'

export const DecimalInput = ({
  value,
  onChange,
  icon,
  acceptEnter,
  config = {},
  meta = {},
  disabled,
}) => {
  const conf = { ...DecimalConfig, ...config }
  const hasError = meta.touched && !!meta.error
  const [caret, setCaret] = useState(0)
  const inputRef = useRef(null)

  const handleChange = useCallback(
    ev => {
      const text = ev.target.value

      if (!!onChange && !!inputRef.current) {
        const precision = Math.max(0, Math.min(20, conf.precision))
        const divider = 10 ** precision
        const { end: caretPosition } = getInputSelection(inputRef.current)
        const convertedValue = Math.min(parseNumber(text) / divider, Number.MAX_SAFE_INTEGER)
        const masked = maskDecimal(convertedValue, { ...conf, prefix: '' })

        setCaret(adjustDecimalCaret({ caretPosition, masked, text }))
        onChange(convertedValue, ev.type === 'change' ? 'key' : 'blur')
      }
    },
    // eslint-disable-next-line
    [config],
  )

  const handleFocus = useCallback(
    ev => conf.selectAllOnFocus && ev.target.select(),
    [conf.selectAllOnFocus],
  )

  const handleKeyDown = useCallback(
    ev => ev.keyCode === 13 && !acceptEnter && ev.preventDefault(),
    [acceptEnter],
  )

  useLayoutEffect(() => {
    if (inputRef.current) {
      setCaretPosition(inputRef.current, caret)
    }
  })

  return (
    <>
      <div className={classNames({ 'kt-input-icon kt-input-icon--left': !!icon })}>
        <input
          type="tel"
          ref={inputRef}
          disabled={disabled}
          value={maskDecimal(value, { ...conf, prefix: '' })}
          className={classNames('form-control', { 'is-invalid': hasError })}
          onChange={handleChange}
          onBlur={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
        />

        {icon && (
          <span className="kt-input-icon__icon">
            <span>
              <i className={icon} />
            </span>
          </span>
        )}
      </div>

      {hasError && <p className="form-text text-danger">{meta.error}</p>}
    </>
  )
}
