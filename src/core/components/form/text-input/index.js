import React, { useState, useLayoutEffect, useRef } from 'react'
import { classNames } from 'core/helpers/misc'
import * as MASK from 'core/helpers/mask'

function handleChange(inputEl, value, type, previousValue, mask, setState, onChange) {
  if (!!onChange && !!inputEl) {
    if (mask) {
      const placeholder = MASK.convertMaskToPlaceholder(mask)
      const { end: caretPosition } = MASK.getInputSelection(inputEl)
      const maskedValue = MASK.conformToMask({
        caretPosition,
        mask,
        placeholder,
        previousValue,
        value,
      })
      const newCaretPosition = MASK.adjustCaretPosition({
        caretPosition,
        placeholder,
        previousValue,
        rawValue: value,
        value: maskedValue,
      })

      setState({
        caretPosition: newCaretPosition,
        previousValue: maskedValue,
      })

      const finalValue = maskedValue === placeholder ? '' : maskedValue

      onChange(finalValue, type)
    } else {
      onChange(value, type)
    }
  }
}

function handleFocus(value, inputEl, caretPos) {
  if (value.indexOf(MASK.placeholderChar) > -1 && !!inputEl) {
    MASK.setCaretPosition(inputEl, caretPos)
  }
}

export const TextInput = React.forwardRef(
  (
    {
      icon,
      type = 'text',
      meta = {},
      value,
      customClassName,
      placeholder,
      disabled,
      mask,
      onChange,
      acceptEnter,
      ignoreBlur,
      autoComplete,
      maxLength,
    },
    ref,
  ) => {
    if (!ref) {
      // eslint-disable-next-line
            ref = useRef(null)
    }

    const [state, setState] = useState({
      caretPosition: 0,
      previousValue: '',
    })
    const hasError = meta.touched && !!meta.error

    useLayoutEffect(() => {
      if (!!mask && !!value) {
        handleChange(ref.current, value, 'key', state.previousValue, mask, setState, onChange)
      }
      // eslint-disable-next-line
        }, [mask])

    useLayoutEffect(() => {
      if (!!mask && !!ref.current) {
        MASK.setCaretPosition(ref.current, state.caretPosition)
      }
    })

    return (
      <>
        <div
          className={classNames({
            'kt-input-icon kt-input-icon--left': !!icon,
            'kt-spinner kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input':
              meta.loading,
          })}
        >
          <input
            autoComplete={autoComplete}
            disabled={disabled}
            placeholder={placeholder}
            type={type}
            ref={ref}
            className={classNames('form-control', customClassName, {
              'is-invalid': hasError,
            })}
            onChange={ev =>
              handleChange(
                ev.target,
                ev.target.value,
                'key',
                state.previousValue,
                mask,
                setState,
                onChange,
              )
            }
            onBlur={ev =>
              !ignoreBlur &&
              handleChange(
                ev.target,
                ev.target.value,
                'blur',
                state.previousValue,
                mask,
                setState,
                onChange,
              )
            }
            onFocus={ev => !!mask && handleFocus(ev.target.value, ev.target, state.caretPosition)}
            onKeyDown={ev => ev.keyCode === 13 && !acceptEnter && ev.preventDefault()}
            value={value}
            maxLength={maxLength}
          />

          {icon && (
            <span className="kt-input-icon__icon">
              <span>
                <i className={icon} />
              </span>
            </span>
          )}
        </div>

        {hasError && <div className="form-text text-danger">{meta.error}</div>}
      </>
    )
  },
)
