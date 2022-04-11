import React from 'react'
import { CnpjMask, CpfMask } from 'core/constants'
import { zip } from './functional'
import { parseNumber } from './parse'
import { isCNPJ } from './validate'

export const placeholderChar = '_'

export const getInputSelection = ({ selectionStart, selectionEnd }) => ({
  end: selectionEnd || 0,
  start: selectionStart || 0,
})

export function setCaretPosition(element, pos) {
  if (document.activeElement === element) {
    const callback = () => element.setSelectionRange(pos, pos, 'none')

    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(callback)
    } else {
      setTimeout(callback, 0)
    }
  }
}

export const convertMaskToPlaceholder = (mask = []) =>
  mask.map(char => (char instanceof RegExp ? placeholderChar : char)).join('')

export const conformToMask = config => {
  const { value = '', previousValue, mask, placeholder, caretPosition } = config

  const editDistance = value.length - previousValue.length
  const isAddition = editDistance > 0
  const startIndex = caretPosition + (isAddition ? -editDistance : 0)

  const valueArr = value.split('').filter((char, i) => {
    const shouldOffset = i >= startIndex && previousValue.length === mask.length

    return !(char !== placeholderChar && char === placeholder[shouldOffset ? i - editDistance : i])
  })

  let counter = 0

  const maskMapper = (pch, currentMask) => {
    const ch = valueArr[counter]
    const isEditable = pch === placeholderChar && !!ch
    const isValidChar =
      ch !== placeholderChar && currentMask instanceof RegExp && currentMask.test(ch)

    if (isEditable || isValidChar) {
      counter += 1
    }

    if (isEditable && isValidChar) {
      return ch
    }

    return isEditable ? maskMapper(pch, currentMask) : pch
  }

  return zip(placeholder.split(''), mask)
    .map(([pch, cm]) => maskMapper(pch, cm))
    .join('')
}

export const adjustCaretPosition = props => {
  const { caretPosition, placeholder, previousValue, rawValue, value } = props

  if (caretPosition === 0) {
    return 0
  }

  if (rawValue === previousValue) {
    return caretPosition
  }

  const editLength = rawValue.length - previousValue.length
  const isAddition = editLength > 0
  const isMultiCharDelete = editLength > 1 && !isAddition && previousValue.length !== 0
  const hasRejectedChar = isAddition && (previousValue === value || value === placeholder)

  if (isMultiCharDelete) {
    return caretPosition
  }

  let startingSearchIndex = 0

  if (hasRejectedChar) {
    startingSearchIndex = caretPosition - editLength
  } else {
    const index = value.indexOf(placeholderChar)
    startingSearchIndex = index === -1 ? placeholder.length : index
  }

  if (isAddition) {
    return placeholder
      .split('')
      .findIndex(
        (char, i) =>
          i >= startingSearchIndex && (char === placeholderChar || i === placeholder.length),
      )
  }

  for (let i = startingSearchIndex; i >= 0; i -= 1) {
    if (placeholder[i - 1] === placeholderChar || i === 0) {
      return i
    }
  }

  return 0
}

export const applyMask = (mask, value) => {
  if (value === '') return ''

  return conformToMask({
    caretPosition: value.length - 1,
    mask,
    placeholder: convertMaskToPlaceholder(mask),
    previousValue: '',
    value,
  })
}

export const DecimalConfig = {
  decimalSeparator: ',',
  precision: 2,
  prefix: '',
  selectAllOnFocus: true,
  thousandSeparator: '.',
}

export function splitDecimal(value, precision = 2) {
  const num = value.toLocaleString('en-US', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  })
  const [int, fract] = num.toString().split('.')

  return [parseNumber(int), parseNumber(fract)]
}

export function maskDecimal(value, config = {}) {
  const {
    prefix,
    precision: _prc,
    decimalSeparator,
    thousandSeparator,
  } = {
    ...DecimalConfig,
    ...config,
  }
  const precision = Math.max(0, Math.min(10, _prc))
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  })

  if (precision === 0) {
    return prefix + formatted.split(',').join(thousandSeparator)
  }

  const [int, fract] = formatted.split('.')

  return prefix + int.split(',').join(thousandSeparator) + decimalSeparator + fract
}

export function adjustDecimalCaret({ caretPosition, masked, text }) {
  const { length: maskedLen } = masked
  const { length } = text

  const pos = maskedLen - length + caretPosition
  const isNumericPos = /^\d+$/.test(masked[pos - 1])

  return isNumericPos ? pos : pos - 1
}

export const maskMoney = value => maskDecimal(value, { prefix: 'R$ ' })

export const tableMaskMoney = value => (
  <div className="flexTable">
    <div className="currency">R$</div>
    <div className="value">{maskDecimal(value)}</div>
  </div>
)

export const maskCpfCnpj = cpfcnpj => {
  if (!cpfcnpj) return ''
  return isCNPJ(cpfcnpj) ? applyMask(CnpjMask, cpfcnpj) : applyMask(CpfMask, cpfcnpj)
}
