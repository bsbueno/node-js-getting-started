import React, { memo, useState, useEffect } from 'react'
import { parseNumber } from 'core/helpers/parse'
import { classNames, isEqual } from 'core/helpers/misc'
import { Button } from 'core/components/button'
import { Pagination } from './Pagination'
import { changeSorting, getValue, itemCountMessage } from './helpers'
import { renderColumnHeader, renderCheckAllButton, renderCheckButton } from './render'
import { ActionsList } from './ActionList'

export const List = memo(
  ({
    columns,
    primaryKey: pk,
    fetching: [fetching, setFetching],
    refresh,
    modal,
    initialQuery = {},
    actions = [],
    groupedActions = [],
    emptyMessage,
    filters,
    getItems,
    showItem = false,
    customRowClassName = () => ({}),
    onShowItem = () => {},
    useCustomList,
  }) => {
    const [entities, setEntities] = useState([])
    const [selected, setSelected] = useState([])
    const [ac, setAc] = useState(new AbortController())
    const [query, setQuery] = useState({ ...initialQuery, filters })
    const [pager, setPager] = useState({
      page: 1,
      pages: 1,
      perPage: 10,
      records: 0,
      usePager: true,
    })

    const cols = columns.filter(c => !c.hideWhen)

    useEffect(() => {
      let mounted = true
      ac.abort()

      const newAc = new AbortController()
      setAc(newAc)

      if (Array.isArray(getItems)) {
        setEntities(getItems)
      } else {
        setFetching(true)
        getItems(useCustomList ? filters : { ...query, filters }, newAc.signal)
          .then(resp => {
            if (mounted) {
              setPager(resp.pager)
              setEntities(resp.items)
              setFetching(false)
            }
          })
          .catch(error => {
            if (error.name === 'AbortError') return
            if (mounted) modal.alert(error.message)
          })
      }

      return () => {
        mounted = false
        newAc.abort()
      }
      // eslint-disable-next-line
		}, [query, filters, refresh.ref])

    const changeSort = (path, remove) =>
      setQuery(prev => ({
        ...prev,
        sort: changeSorting(path, prev.sort, remove),
      }))

    return (
      <>
        <div
          className={classNames(
            'kt-form kt-form--label-align-right kt-margin-t-20 kt-margin-b-20 collapse',
            {
              show: selected.length > 0,
            },
          )}
        >
          <div className="col-xl-12">
            <div className="kt-form__group kt-form__group--inline">
              <div className="kt-form__label kt-form__label-no-wrap">
                <label className="kt-font-bold">
                  <span id="kt_datatable_selected_number">{selected.length}</span>
                  itens selecionados:
                </label>
              </div>
              <div className="kt-form__control">
                <div className="btn-toolbar">
                  {groupedActions.map(g => (
                    <Button
                      key={g.title}
                      customClassName={g.className}
                      title={g.title}
                      icon={g.icon}
                      onClick={() =>
                        g.action({
                          items: selected,
                          forceRefresh: refresh.force,
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={classNames('kt-datatable kt-datatable--default kt-datatable--brand', {
            'kt-datatable--loaded': !fetching || entities.length > 0,
            'table-loading': fetching,
          })}
        >
          <table className="kt-datatable__table">
            <thead className="kt-datatable__head">
              <tr className="kt-datatable__row">
                {groupedActions.length > 0 &&
                  renderCheckAllButton(entities, selected, pk, setSelected)}

                {cols.map(col => renderColumnHeader(col, query, changeSort))}

                {showItem && <th aria-label="Ações" />}
                {actions.length > 0 && <th aria-label="Ações" />}
              </tr>
            </thead>
            <tbody className="kt-datatable__body">
              {entities.map(entity => (
                <tr
                  key={`${entity[pk]}`}
                  className={classNames('kt-datatable__row', customRowClassName(entity))}
                >
                  {groupedActions.length > 0 &&
                    renderCheckButton(entity, selected, pk, setSelected)}

                  {cols.map(col => {
                    const className = classNames('kt-datatable__cell', {
                      'no-wrap no-width': col.fixedWidth,
                    })

                    return 'render' in col ? (
                      <td key={col.title} className={className}>
                        <div>{col.render(entity)}</div>
                      </td>
                    ) : (
                      <td key={`${col.title}-${col.path}`} style={col.style} className={className}>
                        <div>{getValue(entity, col.path, col.format)}</div>
                      </td>
                    )
                  })}

                  {showItem && (
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-clean btn-icon btn-icon-sm"
                        onClick={() => onShowItem(entity)}
                      >
                        <i className="fas fa-eye" title="Mostrar" />
                      </button>
                    </td>
                  )}

                  {actions.length > 0 && (
                    <td className="kt-datatable__cell no-wrap no-width">
                      <ActionsList
                        actions={actions}
                        entity={entity}
                        primaryKey={pk}
                        forceRefresh={refresh.force}
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {entities.length === 0 && (
            <div className="kt-datatable--error">
              {emptyMessage || 'Nenhum item foi encontrado.'}
            </div>
          )}

          <div className="kt-datatable__pager kt-datatable--paging-loaded">
            {fetching && (
              <div className="blockui-overlay">
                <div className="blockui">
                  <span>Carregando...</span>
                  <span>
                    <div className="kt-spinner kt-spinner--loader kt-spinner--brand" />
                  </span>
                </div>
              </div>
            )}
            {!useCustomList && pager.usePager && (
              <>
                <Pagination
                  current={pager.page}
                  total={pager.pages}
                  changePage={page => {
                    setPager(p => ({ ...p, page }))
                    setQuery(q => ({ ...q, page }))
                  }}
                />

                <div className="kt-datatable__pager-info">
                  <div className="dropdown bootstrap-select kt-datatable__pager-size">
                    <select
                      value={pager.perPage}
                      className="custom-select form-control"
                      onChange={ev => {
                        const perPage = parseNumber(ev.target.value)
                        setPager(p => ({ ...p, page: 1, perPage }))
                        setQuery(q => ({ ...q, page: 1, perPage }))
                      }}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={30}>30</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                  <span className="kt-datatable__pager-detail">{itemCountMessage(pager)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </>
    )
  },
  isEqual,
)
