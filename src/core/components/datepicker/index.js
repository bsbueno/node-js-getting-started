import React, { useRef, useState, useEffect, useMemo } from 'react'
import { Manager, Popper, Reference } from 'react-popper'
import isBefore from 'date-fns/isBefore'
import isAfter from 'date-fns/isAfter'
import isEqual from 'date-fns/isEqual'
import setHours from 'date-fns/setHours'
import getHours from 'date-fns/getHours'
import setMinutes from 'date-fns/setMinutes'
import getMinutes from 'date-fns/getMinutes'
import setSeconds from 'date-fns/setSeconds'
import getSeconds from 'date-fns/getSeconds'
import parseISO from 'date-fns/parseISO'
import { formatDate, isDayDisabled, parseDate } from 'core/helpers/date'
import { useOnClickOutside } from 'core/hooks/clickOutside'
import { onlyNumbers } from 'core/helpers/format'
import { Calendar } from './calendar'

const getDateInView = (initialDate, minDate, maxDate) => {
  const current = new Date()

  if (initialDate) {
    return initialDate
  }
  if (minDate && isBefore(current, minDate)) {
    return minDate
  }
  if (maxDate && isAfter(current, maxDate)) {
    return maxDate
  }

  return current
}

const dateInputMask = (date, keyRemoveChar) => {
  const oldDate = date.length > 8 ? date.substring(0, 8) : date
  let newDate = ''
  for (let i = 0; i < oldDate.length; i += 1) {
    if (i === 1) {
      if (keyRemoveChar) {
        if (oldDate.length > 2) newDate += `${oldDate.charAt(i)}/`
      } else {
        newDate += `${oldDate.charAt(i)}/`
      }
    } else if (i === 3) {
      if (keyRemoveChar) {
        if (oldDate.length > 4) newDate += `${oldDate.charAt(i)}/`
      } else {
        newDate += `${oldDate.charAt(i)}/`
      }
    } else {
      newDate += oldDate.charAt(i)
    }
  }

  return newDate
}

export const DatePicker = ({
  className,
  dateFormat = 'dd/MM/yyyy',
  value,
  minDate,
  maxDate,
  acceptEnter,
  disabled,
  readOnly,
  placeholder,
  onChange,
}) => {
  let popperUpdate = null
  const dateValue = typeof value === 'string' ? parseISO(value) : value
  const inputRef = useRef(null)
  const calendarRef = useRef(null)
  const [opened, setOpened] = useState(false)
  const [inputValue, setInputValue] = useState(formatDate(dateValue, dateFormat))
  const [dateView, setDateView] = useState(getDateInView(dateValue, minDate, maxDate))
  const [keyRemoveChar, setKeyRemoveChar] = useState(false)
  const setSelected = useMemo(
    () =>
      (date, fromKeyboard = true) => {
        let changedDate = date

        if (changedDate !== null && isDayDisabled(changedDate, minDate, maxDate)) {
          return
        }

        if (!isEqual(dateValue, changedDate)) {
          if (!!dateValue && !fromKeyboard) {
            changedDate = setHours(changedDate, getHours(dateValue))
            changedDate = setMinutes(changedDate, getMinutes(dateValue))
            changedDate = setSeconds(changedDate, getSeconds(dateValue))
          }

          if (onChange) onChange(changedDate)
        }
      },
    // eslint-disable-next-line
    [minDate, maxDate, dateFormat, value],
  )

  useEffect(() => {
    if (dateValue && isDayDisabled(dateValue, minDate, maxDate)) {
      if (minDate && isBefore(dateValue, minDate)) {
        setSelected(minDate)
      } else if (maxDate && isAfter(dateValue, maxDate)) {
        setSelected(maxDate)
      }
    }
    // eslint-disable-next-line
  }, [maxDate, minDate])

  useEffect(() => {
    setInputValue(formatDate(value, dateFormat))
    setDateView(dateValue || new Date())
    // eslint-disable-next-line
  }, [value])

  useEffect(() => {
    if (popperUpdate && opened) popperUpdate()
    // eslint-disable-next-line
  }, [opened])

  useOnClickOutside(calendarRef, () => setOpened(false))

  return (
    <Manager>
      <Reference>
        {({ ref }) => (
          <div className="react-datepicker-wrapper" ref={ref}>
            <input
              type="text"
              ref={inputRef}
              className={className}
              value={inputValue}
              disabled={disabled}
              placeholder={placeholder}
              onChange={({ target }) => {
                const newDate = dateInputMask(onlyNumbers(target.value), keyRemoveChar)
                setInputValue(newDate)

                if (target.value === '' && !!onChange) {
                  onChange(null)
                  return
                }

                const date = parseDate(target.value, dateFormat)
                if (date) {
                  setSelected(date, true)
                  setDateView(date)
                } else if (newDate.length >= 10) {
                  onChange(null)
                }
              }}
              onClick={() => !disabled && setOpened(true)}
              onFocus={() => setOpened(true)}
              onKeyDown={event => {
                const { key } = event
                setKeyRemoveChar(false)

                if (key === 'Backspace') setKeyRemoveChar(true)

                if (key === 'Enter') {
                  if (inputValue === '' && onChange) {
                    event.preventDefault()
                    onChange(new Date())
                  } else if (!acceptEnter) {
                    event.preventDefault()
                  }
                }

                if (['Escape', 'Tab', 'Enter'].includes(key)) {
                  setOpened(false)
                }
              }}
            />
          </div>
        )}
      </Reference>
      <Popper
        placement="bottom-start"
        modifiers={{
          preventOverflow: {
            boundariesElement: 'viewport',
            enabled: true,
            escapeWithReference: true,
          },
        }}
      >
        {({ ref, style, placement, scheduleUpdate }) => {
          popperUpdate = scheduleUpdate

          return (
            <div
              ref={ref}
              className="react-datepicker-popper"
              style={style}
              data-placement={placement}
            >
              {opened && !disabled && !readOnly && (
                <Calendar
                  ref={calendarRef}
                  selected={dateValue}
                  minDate={minDate}
                  maxDate={maxDate}
                  dateView={dateView}
                  onSelect={date => {
                    setSelected(date)
                    setOpened(false)
                  }}
                  setDateView={setDateView}
                />
              )}
            </div>
          )
        }}
      </Popper>
    </Manager>
  )
}
