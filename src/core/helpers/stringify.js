import { stringify } from 'qs'

export default (obj, addPrefix = true) =>
  stringify(obj, {
    addQueryPrefix: addPrefix,
    allowDots: true,
    encodeValuesOnly: true,
  })
