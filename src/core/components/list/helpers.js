import { inPath } from 'core/helpers/path'
import { tableMaskMoney, applyMask, maskCpfCnpj } from 'core/helpers/mask'
import { CellPhoneMask, PhoneMask } from 'core/constants'
import { toLocaleDate, toLocaleDateTime } from 'core/helpers/date'

export function getSortClassName(path, { sort = [] }) {
  const item = sort.find(([prop]) => prop === path)
  if (!item) return undefined
  return item[1] === 'ASC' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'
}

export function hasSortIn(path, { sort = [] }) {
  return sort.some(([prop]) => prop === path)
}

export function getValue(entity, path, format) {
  if (!!format && format instanceof Function) {
    return format(entity)
  }

  const val = inPath(entity, path)

  if (typeof val === 'undefined' || val === null) return ''

  switch (format) {
    case 'money':
      return tableMaskMoney(val)
    case 'date':
      return toLocaleDate(val, true)
    case 'datetime':
      return toLocaleDateTime(val)
    case 'cpfcnpj':
      return maskCpfCnpj(val)
    case 'cellphone':
      return applyMask(CellPhoneMask, val)
    case 'phone':
      return applyMask(PhoneMask, val)
    case 'cellAndPhone':
      return val.length > 10 ? applyMask(CellPhoneMask, val) : applyMask(PhoneMask, val)
    default:
      return val.toString()
  }
}

export const itemCountMessage = p =>
  p.pages > 1
    ? `Exibindo ${1 + (p.page - 1) * p.perPage} - ${Math.min(p.page * p.perPage, p.records)}
		de ${p.records} registros.`
    : `Exibindo ${p.records} registro${p.records > 1 ? 's' : ''}.`

export function changeSorting(sortPath, prevSort = [], remove) {
  if (remove) {
    return prevSort.filter(([path]) => path !== sortPath)
  }

  let hasIn = false

  const newSort = prevSort.map(([path, order]) => {
    if (sortPath === path) {
      hasIn = true
      return [path, order === 'ASC' ? 'DESC' : 'ASC']
    }

    return [path, order]
  })

  const finalSort = newSort.concat(!hasIn ? [[sortPath, 'ASC']] : [])
  return finalSort
}
