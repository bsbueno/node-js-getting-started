import { onlyNumbers } from './format'

const isRepeatingChars = txt => txt.split('').every(char => char === txt.charAt(0))

const CPFSum = (list, multiplier) => {
  let factor = multiplier
  return list.reduce((result, num) => {
    const val = result + num * factor
    factor -= 1
    return val
  }, 0)
}

const CNPJSum = (list, multiplier) => {
  let factor = multiplier
  return list.reduce((result, num) => {
    factor = factor === 1 ? 9 : factor
    const val = result + num * factor
    factor -= 1
    return val
  }, 0)
}

const getValidationDigit = (digits, multiplier, calculator) => {
  const num = calculator(digits, multiplier) % 11
  return num > 1 ? 11 - num : 0
}

export const isEmail = emailTxt =>
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    emailTxt,
  )

export const isCPF = cpfTxt => {
  const cpf = onlyNumbers(cpfTxt)

  if (cpf.length !== 11 || isRepeatingChars(cpf)) {
    return false
  }

  const digits = cpf
    .substring(0, 9)
    .split('')
    .map(n => parseInt(n, 10))
  const checker = cpf.substring(9)

  const firstDigit = getValidationDigit(digits, 10, CPFSum)
  const secondDigit = getValidationDigit([...digits, firstDigit], 11, CPFSum)

  return checker === `${firstDigit}${secondDigit}`
}

export const isCNPJ = cnpjTxt => {
  const cnpj = onlyNumbers(cnpjTxt)

  if (cnpj.length !== 14 || isRepeatingChars(cnpj)) {
    return false
  }

  const digits = cnpj
    .substring(0, 12)
    .split('')
    .map(n => parseInt(n, 10))
  const checker = cnpj.substring(12)

  const firstDigit = getValidationDigit(digits, 5, CNPJSum)
  const secondDigit = getValidationDigit([...digits, firstDigit], 6, CNPJSum)

  return checker === `${firstDigit}${secondDigit}`
}

export const isPlate = plateTxt => {
  const regex = /^[A-Z]{3}[0-9]{1}[A-Z]{1}[0-9]{2}\b|^[A-Z]{3}[0-9]{4}\b/
  return regex.test(plateTxt)
}

export const isOnlyNumbers = number => /^\d+$/.test(number)

export const isCellPhone = phone => {
  if (phone.length === 11) {
    return phone.slice(2)[0] === '9'
  }
  if (phone.length === '9') {
    return phone[0] === 9
  }
  return false
}
