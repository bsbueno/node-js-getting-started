export const onlyNumbers = txt => `${txt}`.replace(/[^\d]/g, '')
export const onlyAlphaNumeric = txt => `${txt}`.replace(/[^a-z0-9]/gi, '')
export const removeAccents = txt => txt.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
export const plateFormater = txt => {
  const letters = txt.substring(0, 3)
  const numbers = txt.substring(3)
  return `${letters}-${numbers}`
}
