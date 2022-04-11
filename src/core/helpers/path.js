/* eslint-disable no-param-reassign */
export function setValueInPath(ent, path, value) {
  const paths = path.split('.')
  const newEnt = { ...ent }

  paths.reduce((o, key, index, keys) => {
    if (index < keys.length - 1) {
      o[key] = o[key] || (typeof keys[index + 1] === 'number' ? [] : {})
      return o[key]
    }
    o[key] = value
    return o
  }, newEnt)

  return newEnt
}

export function inPath(ent, path) {
  const paths = path.split('.')
  return paths.reduce((e, p) => (e ? e[p] : undefined), ent)
}
