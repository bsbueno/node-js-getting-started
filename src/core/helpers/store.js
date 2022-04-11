import addMinutes from 'date-fns/addMinutes'
import isPast from 'date-fns/isPast'
import { config } from 'config'

const expire = 'expire_'
const namespace = config.NAMESPACE ? `${config.NAMESPACE}_` : ''
const keyName = (key, prefix = '') => `${prefix}${namespace}${key}`

const getExpirationDate = key => {
  const exp = localStorage.getItem(keyName(key, expire))
  return new Date(exp || Number.MIN_VALUE)
}

const remove = key => {
  localStorage.removeItem(keyName(key, expire))
  localStorage.removeItem(keyName(key))
}

function set(key, data, expireMinutes = 1430) {
  const expireDate = addMinutes(new Date(), expireMinutes)
  localStorage.setItem(keyName(key, expire), expireDate.toISOString())
  localStorage.setItem(keyName(key), JSON.stringify(data))
}

function get(key) {
  const expiration = getExpirationDate(key)
  const value = localStorage.getItem(keyName(key))

  if (!value || isPast(expiration)) {
    remove(key)
    return undefined
  }

  return JSON.parse(value)
}

export const localStore = { set, get, remove }
