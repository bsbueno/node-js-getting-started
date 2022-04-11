import React from 'react'
import { localStore } from 'core/helpers/store'
import { config } from 'config'
import { cleanObject, isEmptyOrDefault } from 'core/helpers/misc'

export const logOut = tokenKey => {
  localStore.remove(tokenKey)
  localStore.remove(config.OPERATOR_KEY)
  window.location.reload(true)
}

export const getHeader = tokenKey =>
  new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(tokenKey ? { Authorization: `Bearer ${localStore.get(tokenKey)}` } : {}),
  })

export const cleanFilters = filters =>
  filters
    .map(f => ({
      ...f,
      items: f.items.filter(i => !!i && !isEmptyOrDefault(i.value, true)),
    }))
    .filter(f => !!f && f.items.length > 0)

export const cleanFields = (fields, removeFields) => {
  const newFields = []
  if (fields) {
    fields.forEach(field => {
      const removeField = removeFields.find(f => f === field)
      if (!removeField) {
        newFields.push(field)
      }
    })
  }
  return newFields
}

export function convertQuery({
  page,
  perPage,
  usePager,
  fields,
  filters = [],
  sort = [],
  removeFields = [],
  additionalValues = [],
}) {
  const sorting = sort.reduce((acc, [name, order]) => [...acc, { name, order }], [])
  return cleanObject({
    page,
    perPage,
    usePager,
    fields: cleanFields(fields, removeFields),
    sort: sorting,
    filters: cleanFilters(filters),
    additionalValues,
  })
}

export async function parseStatus(res, tokenKey, callback) {
  const { status } = res
  const contentType = res.headers.get('content-type')

  if (status === 401) {
    logOut(tokenKey)
    throw Error('Erro 401: Token expirada ou não informada.')
  } else if (status === 403) {
    throw Error('Erro 403: Você não tem permissão pra executar essa ação.')
  } else if (status === 404 && !contentType) {
    throw Error('Erro 404: Não encontrado.')
  } else if ([400, 404, 409, 422].includes(status)) {
    const payload = await res.json()
    throw Error(`Erro ${status}: ${payload.message}`)
  } else if (status === 500) {
    const payload = await res.json()
    const object = {
      message: (
        <>
          <p>Erro 500: Erro interno do sistema, entre em contato com o suporte</p>

          <pre>
            <code>{payload.message}</code>
          </pre>
        </>
      ),
    }

    throw object
  } else if (status === 204) {
    return Promise.resolve(null)
  } else {
    return callback ? callback(res) : res.json()
  }
}
