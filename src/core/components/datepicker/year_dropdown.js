import React, { useState, useRef, forwardRef, useCallback } from 'react'
import getYear from 'date-fns/getYear'
import { useOnClickOutside } from 'core/hooks/clickOutside'
import { classNames } from 'core/helpers/misc'

function generateYears(year, minDate, maxDate) {
  const noOfYear = 5
  const maxYear = maxDate ? getYear(maxDate) : null
  const minYear = minDate ? getYear(minDate) : null
  const list = []

  for (let i = 0; i < 2 * noOfYear + 1; i += 1) {
    const newYear = year + noOfYear - i
    let isInRange = true

    if (minYear) {
      isInRange = minYear <= newYear
    }

    if (maxYear && isInRange) {
      isInRange = maxYear >= newYear
    }

    if (isInRange) {
      list.push(newYear)
    }
  }

  return list
}

const DropDown = forwardRef(({ years, year, minDate, maxDate, shiftYears, onChange }, ref) => {
  const maxYear = maxDate ? getYear(maxDate) : null
  const minYear = minDate ? getYear(minDate) : null
  const showNext = !maxYear || !years.includes(maxYear)
  const showPrev = !minYear || !years.includes(minYear)

  return (
    <div ref={ref} className="react-datepicker__year-dropdown">
      {showNext && (
        <div className="react-datepicker__year-option" onClick={() => shiftYears(1)}>
          <button
            type="button"
            label="Próximo"
            className="react-datepicker__navigation react-datepicker__navigation--years react-datepicker__navigation--years-upcoming"
          />
        </div>
      )}

      {years.map(y => (
        <div
          key={y}
          onClick={() => onChange(y)}
          className={classNames('react-datepicker__year-option', {
            'react-datepicker__year-option--selected_year': year === y,
          })}
        >
          {year === y && <span className="react-datepicker__year-option--selected">✓</span>}
          {y}
        </div>
      ))}

      {showPrev && (
        <div className="react-datepicker__year-option" onClick={() => shiftYears(-1)}>
          <button
            type="button"
            label="Anterior"
            className="react-datepicker__navigation react-datepicker__navigation--years react-datepicker__navigation--years-previous"
          />
        </div>
      )}
    </div>
  )
})

export const YearDropdown = ({ onChange, year, minDate, maxDate }) => {
  const [visible, setVisible] = useState(false)
  const [years, setYears] = useState(generateYears(year, minDate, maxDate))
  const toggleDropdown = useCallback(() => setVisible(v => !v), [])
  const dropdown = useRef(null)

  useOnClickOutside(dropdown, toggleDropdown)

  return (
    <div className="react-datepicker__year-dropdown-container react-datepicker__year-dropdown-container--scroll">
      {visible && (
        <DropDown
          ref={dropdown}
          year={year}
          years={years}
          minDate={minDate}
          maxDate={maxDate}
          shiftYears={amount => setYears(prev => prev.map(y => y + amount))}
          onChange={y => {
            toggleDropdown()
            if (y !== year) onChange(y)
          }}
        />
      )}

      <div className="react-datepicker__year-read-view" onClick={toggleDropdown}>
        <span className="react-datepicker__year-read-view--selected-year">{year}</span>
      </div>
    </div>
  )
}
