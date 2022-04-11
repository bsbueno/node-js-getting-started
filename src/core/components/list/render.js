import React from 'react'
import { classNames } from 'core/helpers/misc'
import { hasSortIn, getSortClassName } from './helpers'

function someIn(items, pk, not = false) {
  if (not) return search => !items.some(i => i[pk] === search[pk])
  return search => items.some(i => i[pk] === search[pk])
}

export function renderCheckAllButton(items, selected, pk, setter) {
  return (
    <th className="kt-datatable__cell--center kt-datatable__cell kt-datatable__cell--check">
      <span style={{ width: 20 }}>
        <label className="kt-checkbox kt-checkbox--single kt-checkbox--all kt-checkbox--solid">
          <input
            type="checkbox"
            checked={items.length === selected.filter(someIn(items, pk)).length}
            onChange={ev =>
              ev.target.checked
                ? setter(prev => [...prev, ...items.filter(someIn(prev, pk, true))])
                : setter(prev => prev.filter(someIn(items, pk, true)))
            }
          />
          <span />
        </label>
      </span>
    </th>
  )
}

export function renderCheckButton(entity, selected, pk, setter) {
  return (
    <td className="kt-datatable__cell--center kt-datatable__cell kt-datatable__cell--check">
      <span style={{ width: 20 }}>
        <label className="kt-checkbox kt-checkbox--single kt-checkbox--solid">
          <input
            type="checkbox"
            checked={selected.some(s => s[pk] === entity[pk])}
            onChange={ev =>
              ev.target.checked
                ? setter(prev => [...prev, entity])
                : setter(prev => prev.filter(i => i[pk] !== entity[pk]))
            }
          />
          <span />
        </label>
      </span>
    </td>
  )
}

export function renderColumnHeader(col, query, changeSort) {
  if ('render' in col) {
    return (
      <th key={col.title} className="kt-datatable__cell">
        <span>{col.title}</span>
      </th>
    )
  }

  const path = col.sort ? col.sort : col.path
  const sorted = hasSortIn(path, query)

  return (
    <th
      key={col.title}
      onClick={() => changeSort(col.sort || col.path, false)}
      className={classNames('kt-datatable__cell kt-datatable__cell--sort', {
        'kt-datatable__cell--sorted': sorted,
      })}
    >
      <span>
        {col.title}
        {sorted && <i className={getSortClassName(path, query)} />}
        {sorted && (
          <button
            aria-label="Remover ordenação"
            type="button"
            onClick={ev => {
              ev.stopPropagation()
              changeSort(path, true)
            }}
          />
        )}
      </span>
    </th>
  )
}
