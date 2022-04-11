import React, { useState } from 'react'

import { List } from 'core/components/list'
import { Link } from 'core/components/route'
import { useRefresh } from 'core/hooks/refresh'
import { Field } from 'core/components/form/field'
import { TextInput } from 'core/components/form/text-input'
import { useFilters } from 'core/hooks/filter'

const columns = [
  { path: 'id', title: '#', textAlign: 'center' },
  { path: 'title', title: 'Titulo' },
  { path: 'value', title: 'Valor', format: 'money' },
]

const fields = [...columns.map(c => c.path), 'disabledAt']

export const disablePlan = ({ modal, data: { id, title, disabledAt }, callback, service }) =>
  modal.confirm(
    `Deseja ${!disabledAt ? 'desativar' : 'ativar'} ${title}?`,
    confirmed =>
      confirmed &&
      service
        .remove('plan', id)
        .then(callback)
        .catch(err => modal.alert(err.message)),
  )

export const PlanList = ({ global, route, service, basename }) => {
  const { modal } = global
  const { values, setValues, filters } = useFilters({ title: '' }, query => [
    {
      items: [{ name: 'title', value: query.title, comparer: 'Like' }],
    },
  ])

  const fetching = useState(false)
  const refresh = useRefresh()

  return (
    <>
      <div className="kt-portlet kt-portlet--mobile">
        <div className="kt-portlet__head kt-portlet__head--lg">
          <div className="kt-portlet__head-label">
            <span className="kt-portlet__head-icon">
              <i className="kt-font-brand fas fa-columns" />
            </span>
            <h3 className="kt-portlet__head-title">Planos</h3>
          </div>
          <div className="kt-portlet__head-toolbar">
            <div className="kt-portlet__head-wrapper">
              <div className="dropdown dropdown-inline">
                <Link className="btn btn-success btn-icon-sm" to={`${basename}/planos/cadastro`}>
                  <i className="fas fa-plus" /> Novo Plano
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="kt-portlet__body kt-pb-0 position-relative">
          <div className="row">
            <div className="col-lg">
              <Field label="Titulo">
                <TextInput
                  ignoreBlur
                  type="search"
                  value={values.title}
                  onChange={title => setValues(prev => ({ ...prev, title }))}
                />
              </Field>
            </div>
          </div>

          {fetching[0] && (
            <div className="blockui-overlay">
              <div className="blockui" />
            </div>
          )}
        </div>
        <div className="kt-portlet__body kt-portlet__body--fit">
          <div className="kt-separator kt-separator--space-sm" />

          <List
            primaryKey="id"
            modal={modal}
            route={route}
            refresh={refresh}
            fetching={fetching}
            filters={filters}
            initialQuery={{ fields }}
            getItems={(query, signal) => service.getList('plan', query, signal)}
            actions={[
              {
                icon: 'fas fa-edit',
                title: 'Editar',
                action: `${basename}/planos/:id`,
              },
              {
                icon: 'fas fa-lock',
                title: 'Desabilitar',
                hideWhen: ent => !!ent.disabledAt,
                action: ({ entity, forceRefresh }) =>
                  disablePlan({
                    callback: forceRefresh,
                    data: entity,
                    modal,
                    service,
                  }),
              },
              {
                icon: 'fas fa-unlock',
                title: 'Habilitar',
                hideWhen: ent => !ent.disabledAt,
                action: ({ entity, forceRefresh }) =>
                  disablePlan({
                    modal,
                    callback: forceRefresh,
                    data: entity,
                    service,
                  }),
              },
            ]}
            columns={columns}
          />
        </div>
      </div>
    </>
  )
}
