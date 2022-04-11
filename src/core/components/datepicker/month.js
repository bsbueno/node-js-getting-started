import React, { useState, useLayoutEffect } from 'react'
import differenceInDays from 'date-fns/differenceInDays'
import isSameDay from 'date-fns/isSameDay'
import startOfWeek from 'date-fns/startOfWeek'
import addWeeks from 'date-fns/addWeeks'
import addDays from 'date-fns/addDays'
import getMonth from 'date-fns/getMonth'
import getDate from 'date-fns/getDate'
import { getMonthInfo, isDayDisabled, getDayOfWeekCode } from 'core/helpers/date'
import { classNames } from 'core/helpers/misc'
import { range } from 'core/helpers/functional'

const Day = ({ month, week, offset, weekStart, minDate, maxDate, onDayClick, selected }) => {
  const start = startOfWeek(addWeeks(weekStart, week))
  const day = addDays(start, offset)
  const isDisabled = isDayDisabled(day, minDate, maxDate)

  return (
    <div
      tabIndex={0}
      key={`${month}-${week}-${offset}`}
      className={classNames(
        'react-datepicker__day',
        `react-datepicker__day--${getDayOfWeekCode(day)}`,
        {
          'react-datepicker__day--disabled': isDisabled,
          'react-datepicker__day--outside-month': month !== getMonth(day),
          'react-datepicker__day--selected': isSameDay(day, selected),
          'react-datepicker__day--today': isSameDay(day, new Date()),
        },
      )}
      onClick={() => !isDisabled && onDayClick(day)}
      aria-label={`day-${getDate(day)}`}
      aria-selected={isSameDay(day, selected)}
      role="option"
    >
      {getDate(day)}
    </div>
  )
}

export const Month = ({ dateView, selected, maxDate, minDate, onDayClick }) => {
  const [monthInfo, setMonthInfo] = useState(getMonthInfo(dateView))

  useLayoutEffect(() => {
    setMonthInfo(getMonthInfo(dateView))
    // eslint-disable-next-line
	}, [dateView])

  const numberOfWeeks = Math.ceil(differenceInDays(monthInfo.end, monthInfo.start) / 7)

  return (
    <div className="react-datepicker__month" role="listbox">
      {range(0, numberOfWeeks - 1).map(week => {
        const month = getMonth(dateView)

        return (
          <div key={week} className="react-datepicker__week">
            {range(0, 6).map(offset => (
              <Day
                key={offset}
                month={month}
                week={week}
                offset={offset}
                weekStart={monthInfo.start}
                minDate={minDate}
                maxDate={maxDate}
                onDayClick={onDayClick}
                selected={selected}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}
