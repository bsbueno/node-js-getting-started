import React, { forwardRef } from 'react'
import addDays from 'date-fns/addDays'
import addMonths from 'date-fns/addMonths'
import subMonths from 'date-fns/subMonths'
import getMonth from 'date-fns/getMonth'
import setMonth from 'date-fns/setMonth'
import setYear from 'date-fns/setYear'
import getYear from 'date-fns/getYear'
import startOfWeek from 'date-fns/startOfWeek'
import { monthDisabledBefore, monthDisabledAfter, formatDate } from 'core/helpers/date'
import { range } from 'core/helpers/functional'
import { YearDropdown } from './year_dropdown'
import { MonthDropdown } from './month_dropdown'
import { Month } from './month'

export const Calendar = forwardRef(
  ({ dateView, minDate, maxDate, setDateView, selected, onSelect }, ref) => {
    const hidePrev = monthDisabledBefore(dateView, minDate)
    const hideNext = monthDisabledAfter(dateView, maxDate)
    const start = startOfWeek(dateView)

    return (
      <div ref={ref} className="react-datepicker">
        <div className="react-datepicker__triangle" />

        {hidePrev ? null : (
          <button
            type="button"
            label="Anterior"
            className="react-datepicker__navigation react-datepicker__navigation--previous"
            onClick={() => setDateView(date => subMonths(date, 1))}
          />
        )}

        {hideNext ? null : (
          <button
            type="button"
            label="Próximo"
            className="react-datepicker__navigation react-datepicker__navigation--next"
            onClick={() => setDateView(date => addMonths(date, 1))}
          />
        )}

        <div className="react-datepicker__month-container">
          <div className="react-datepicker__header">
            <div className="react-datepicker__current-month">
              <MonthDropdown
                onChange={month => setDateView(date => setMonth(date, month))}
                month={getMonth(dateView)}
              />

              <YearDropdown
                date={dateView}
                onSelect={onSelect}
                onChange={year => setDateView(date => setYear(date, year))}
                minDate={minDate}
                maxDate={maxDate}
                year={getYear(dateView)}
              />
            </div>

            <div className="react-datepicker__day-names">
              {range(0, 6).map(offset => {
                const day = addDays(start, offset)
                const weekDayName = formatDate(day, 'EEEEEE')

                return (
                  <div key={offset} className="react-datepicker__day-name">
                    {weekDayName}
                  </div>
                )
              })}
            </div>
          </div>

          <Month
            dateView={dateView}
            onDayClick={onSelect}
            minDate={minDate}
            maxDate={maxDate}
            selected={selected}
          />
        </div>
      </div>
    )
  },
)
