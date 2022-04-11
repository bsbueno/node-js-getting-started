import { onlyNumbers } from './format'

export const parseNumber = (txt = '') => parseInt(`0${onlyNumbers(txt)}`, 10)
export const parseMoney = (value = '0') => {
  let decimalPart
  let parsedValue

  value
    .split(/\D/)
    .reverse()
    .filter(e => !!e)
    .forEach((numberPiece, ind, arr) => {
      if (ind === 0 && arr.length > 1) {
        decimalPart = numberPiece
      }
    })

  parsedValue = value.replace(/\D/g, '')
  parsedValue = parsedValue.replace(new RegExp(`${decimalPart}$`), `.${decimalPart}`)

  return Number.parseFloat(parsedValue)
}
