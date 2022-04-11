import React, { useState, useRef, forwardRef, useCallback } from 'react'
import { useOnClickOutside } from 'core/hooks/clickOutside'
import { classNames } from 'core/helpers/misc'
import { getMonthName } from 'core/helpers/date'

const DropDown = forwardRef(({ monthNames, month, onChange }, ref) => (
  <div ref={ref} className="react-datepicker__month-dropdown">
    {monthNames.map((m, i) => (
      <div
        key={m}
        onClick={() => onChange(i)}
        className={classNames('react-datepicker__month-option', {
          'react-datepicker__month-option--selected_month': month === i,
        })}
      >
        {month === i && <span className="react-datepicker__month-option--selected">✓</span>}
        {m}
      </div>
    ))}
  </div>
))

const MonthNames = [...Array(12)].map((_, month) => getMonthName(month))

export const MonthDropdown = ({ onChange, month }) => {
  const [visible, setVisible] = useState(false)
  const toggleDropdown = useCallback(() => setVisible(v => !v), [])
  const dropdown = useRef(null)

  useOnClickOutside(dropdown, toggleDropdown)

  return (
    <div className="react-datepicker__month-dropdown-container react-datepicker__month-dropdown-container--scroll">
      {visible && (
        <DropDown
          ref={dropdown}
          month={month}
          monthNames={MonthNames}
          onChange={m => {
            toggleDropdown()
            if (m !== month) onChange(m)
          }}
        />
      )}
      <div key="read" className="react-datepicker__month-read-view" onClick={toggleDropdown}>
        <span className="react-datepicker__month-read-view--selected-month">
          {MonthNames[month]}
        </span>
      </div>
    </div>
  )
}
