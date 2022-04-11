import { config } from 'config'
import { localStore } from 'core/helpers/store'
import { getHeader, parseStatus, convertQuery } from './helpers'

export async function getUnities(ignoreOld) {
  const oldUnities = localStore.get('unities')

  if (!!oldUnities && !ignoreOld) {
    return Promise.resolve(oldUnities)
  }

  const resp = await fetch(`${config.API_URL}/unity.list`)

  if (![200, 304].includes(resp.status)) {
    throw new Error('Erro ao carregar as unidades')
  }

  const unities = await resp.json()

  localStore.set('unities', unities, 360)

  return unities
}

export async function loginAdmin(data) {
  const response = await fetch(`${config.API_URL}/login.admin/`, {
    body: JSON.stringify(data),
    headers: getHeader(),
    method: 'POST',
  })

  return parseStatus(response, config.SA_TOKEN_KEY)
}

export async function loginRequest(data) {
  const response = await fetch(`${config.API_URL}/login.employee/`, {
    body: JSON.stringify(data),
    headers: getHeader(),
    method: 'POST',
  })

  return parseStatus(response, config.TOKEN_KEY)
}

const add = tokenKey => async (name, data) => {
  const response = await fetch(`${config.API_URL}/${name}.add/`, {
    body: JSON.stringify(data),
    headers: getHeader(tokenKey),
    method: 'POST',
  })

  return parseStatus(response, tokenKey)
}

const update = tokenKey => async (name, data) => {
  const response = await fetch(`${config.API_URL}/${name}.update/`, {
    body: JSON.stringify(data),
    headers: getHeader(tokenKey),
    method: 'PUT',
  })

  return parseStatus(response, tokenKey)
}

const APIMaker = (tokenKey = config.TOKEN_KEY) => ({
  get: async (endpoint, params = '', signal) => {
    const response = await fetch(`${config.API_URL}/${endpoint}/${params}`, {
      headers: getHeader(tokenKey),
      signal,
    })

    return parseStatus(response, tokenKey)
  },
  post: async (endpoint, data, signal, callback) => {
    const response = await fetch(`${config.API_URL}/${endpoint}/`, {
      body: JSON.stringify(Array.isArray(data) ? data : data),
      headers: getHeader(tokenKey),
      method: 'POST',
      signal,
    })

    return parseStatus(response, tokenKey, callback)
  },
  getList: async (name, query, signal) => {
    const response = await fetch(`${config.API_URL}/${name}.list/`, {
      body: JSON.stringify(convertQuery(query)),
      headers: getHeader(tokenKey),
      method: 'POST',
      signal,
    })

    return parseStatus(response, tokenKey)
  },
  getById: async (name, id, signal) => {
    const response = await fetch(`${config.API_URL}/${name}.key/${id}`, {
      headers: getHeader(tokenKey),
      signal,
    })

    return parseStatus(response, tokenKey)
  },
  add: add(tokenKey),
  update: update(tokenKey),
  addOrUpdate: async (name, data) =>
    data.id > 0 ? update(tokenKey)(name, data) : add(tokenKey)(name, data),
  remove: async (name, key) => {
    const response = await fetch(`${config.API_URL}/${name}.delete/${key}`, {
      headers: getHeader(tokenKey),
      method: 'DELETE',
    })

    return parseStatus(response, tokenKey)
  },
  getPhoto: async (name, id, signal) => {
    const res = await fetch(`${config.API_URL}/${name}.photo/${id}`, {
      headers: getHeader(tokenKey),
      signal,
    })

    if (res.status === 404) {
      return null
    }

    return res.blob()
  },
})

export const API = APIMaker()
export const AdminAPI = APIMaker(config.SA_TOKEN_KEY)
