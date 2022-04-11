export const distinct = array => Array.from(new Set(array))
export const zip = (first, second) => first.map((f, i) => [f, second[i]])

export const range = (start, end, step = 1) =>
  Array(Math.ceil((end - start + 1) / step))
    .fill(start)
    .map((x, y) => x + y * step)

export const unionWith =
  (...arrays) =>
  comparator =>
    arrays
      .reduce((a, b) => a.concat(b), [])
      .reduce(
        (result, computed) =>
          !result.some(s => comparator(computed, s)) ? [...result, computed] : result,
        [],
      )

export const groupBy = (collection, accessor) => {
  const aggr = new Map()
  const getKey = ent => (accessor instanceof Function ? accessor(ent) : ent[accessor])

  collection.forEach(c => {
    const key = getKey(c)
    const list = aggr.get(key)

    if (list) {
      aggr.set(key, [...list, c])
    } else {
      aggr.set(key, [c])
    }
  })

  return aggr
}

export const sortBy = (collection, sorting) =>
  sorting.reduceRight(
    (list, [prop, order]) => {
      const path = prop.split('.')

      return list.sort((a, b) => {
        const value = path.reduce((obj, p) => (obj ? obj[p] : undefined), a)
        const other = path.reduce((obj, p) => (obj ? obj[p] : undefined), b)

        if (value !== other) {
          const valIsDefined = value !== undefined
          const valIsNull = value === null
          // eslint-disable-next-line
          const valIsReflexive = value === value
          const valIsSymbol = typeof value === 'symbol' || value instanceof Symbol

          const othIsDefined = other !== undefined
          const othIsNull = other === null
          // eslint-disable-next-line
          const othIsReflexive = other === other
          const othIsSymbol = typeof other === 'symbol' || other instanceof Symbol

          if (
            (!othIsNull && !othIsSymbol && !valIsSymbol && value > other) ||
            (valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol) ||
            (valIsNull && othIsDefined && othIsReflexive) ||
            (!valIsDefined && othIsReflexive) ||
            !valIsReflexive
          ) {
            return order === 'ASC' ? 1 : -1
          }
          if (
            (!valIsNull && !valIsSymbol && !othIsSymbol && value < other) ||
            (othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol) ||
            (othIsNull && valIsDefined && valIsReflexive) ||
            (!othIsDefined && valIsReflexive) ||
            !othIsReflexive
          ) {
            return order === 'ASC' ? -1 : 1
          }
        }

        return 0
      })
    },
    [...collection],
  )

export function deepMerge(target, source) {
  if (source == null) return {}

  const destination = {}
  const isMergeable = object =>
    !!object &&
    object instanceof Object &&
    !(object instanceof Date) &&
    !(object instanceof RegExp) &&
    !(object instanceof Array) &&
    object.$$typeof !== Symbol.for('react.element')

  if (isMergeable(target)) {
    Object.keys(target).forEach(key => {
      destination[key] = isMergeable(target[key]) ? deepMerge({}, target[key]) : target[key]
    })
  }

  Object.keys(source).forEach(key => {
    if (!isMergeable(source[key])) {
      destination[key] = source[key]
    } else {
      destination[key] = deepMerge(target[key], source[key])
    }
  })

  return destination
}
