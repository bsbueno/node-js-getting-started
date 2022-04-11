import locale from 'date-fns/locale/pt-BR'
import parse from 'date-fns/parse'
import format from 'date-fns-tz/format'
import addMonths from 'date-fns/addMonths'
import subMonths from 'date-fns/subMonths'
import setMonth from 'date-fns/setMonth'
import startOfMonth from 'date-fns/startOfMonth'
import endOfMonth from 'date-fns/endOfMonth'
import startOfWeek from 'date-fns/startOfWeek'
import endOfWeek from 'date-fns/endOfWeek'
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays'
import differenceInCalendarMonths from 'date-fns/differenceInCalendarMonths'
import isValid from 'date-fns/isValid'
import zonedTimeToUtc from 'date-fns-tz/zonedTimeToUtc'

export function parseDate(value, dateFormat) {
  const date = parse(value, dateFormat, new Date(), { locale })
  return isValid(date) && value === format(date, dateFormat, { awareOfUnicodeTokens: true })
    ? date
    : null
}

export function formatDate(date, dateFormat, timeZone = false) {
  if (!date) return ''
  let parsedDate
  const isString = typeof date === 'string'
  if (timeZone) parsedDate = isString ? new Date(date.substr(0, 19)) : date
  else parsedDate = isString ? zonedTimeToUtc(date, 'UTC') : date
  return format(parsedDate, dateFormat, { locale })
}

export const getMonthName = month => {
  const monthName = formatDate(setMonth(new Date(), month), 'LLLL')
  return monthName.charAt(0).toUpperCase() + monthName.slice(1)
}

export const getDayOfWeekCode = day => formatDate(day, 'ddd')
export const toLocaleDate = (date, timeZone = false) => formatDate(date, 'dd/MM/yyyy', timeZone)
export const toLocaleDateTime = (date, timeZone = false) =>
  formatDate(date, 'dd/MM/yyyy HH:mm:ss', timeZone)
export const toLocaleTime = (date, timeZone = false) => formatDate(date, 'HH:mm', timeZone)
export const toDayOfWeek = day => formatDate(day, 'EEEE')

export const getMonthInfo = dateView => ({
  start: startOfWeek(startOfMonth(dateView)),
  end: endOfWeek(endOfMonth(dateView)),
})

export const isDayDisabled = (day, minDate, maxDate) =>
  (minDate && differenceInCalendarDays(day, minDate) < 0) ||
  (maxDate && differenceInCalendarDays(day, maxDate) > 0)

export const monthDisabledBefore = (day, minDate) =>
  minDate && differenceInCalendarMonths(minDate, subMonths(day, 1)) > 0

export const monthDisabledAfter = (day, maxDate) =>
  maxDate && differenceInCalendarMonths(maxDate, addMonths(day, 1)) > 0
