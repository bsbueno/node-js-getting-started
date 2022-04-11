import React, { useState } from 'react'

import { List } from 'core/components/list'
import { Link } from 'core/components/route'
import { useRefresh } from 'core/hooks/refresh'
import { Field } from 'core/components/form/field'
import { TextInput } from 'core/components/form/text-input'
import { useFilters } from 'core/hooks/filter'
import { parseNumber } from 'core/helpers/parse'
import { Button } from 'core/components/button'
import { KinshipForm } from './KinshipForm'

const columns = [
  { path: 'id', title: '#', textAlign: 'center' },
  { path: 'title', title: 'Titulo' },
]

const fields = [...columns.map(c => c.path), 'disabledAt']

export const disableKinship = ({ modal, data: { id, title, disabledAt }, callback, service }) =>
  modal.confirm(
    `Deseja ${!disabledAt ? 'desativar' : 'ativar'} ${title}?`,
    confirmed =>
      confirmed &&
      service
        .remove('kinship', id)
        .then(callback)
        .catch(err => modal.alert(err.message)),
  )

export const KinshipList = ({ global, route, service, basename }) => {
  const { modal } = global

  const [dbFilters, setDbFilters] = useState({ title: '' })

  const { setValues, filters } = useFilters({ title: '' }, query => [
    {
      items: [{ name: 'title', value: query.title, comparer: 'Like' }],
    },
  ])

  const fetching = useState(false)
  const refresh = useRefresh()
  const id = parseNumber(route.match.params.id)
  const showForm = route.location.pathname.includes('cadastro') || id > 0

  return (
    <>
      <div className="kt-portlet kt-portlet--mobile">
        <div className="kt-portlet__head kt-portlet__head--lg">
          <div className="kt-portlet__head-label">
            <span className="kt-portlet__head-icon">
              <i className="kt-font-brand fas fa-users" />
            </span>
            <h3 className="kt-portlet__head-title">Parentesco</h3>
          </div>
          <div className="kt-portlet__head-toolbar">
            <div className="kt-portlet__head-wrapper">
              <div className="dropdown dropdown-inline">
                <Link
                  className="btn btn-success btn-icon-sm"
                  to={`${basename}/parentesco/cadastro`}
                >
                  <i className="fas fa-plus" /> Novo Parentesco
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
                  value={dbFilters.title}
                  onChange={title => setDbFilters(prev => ({ ...prev, title }))}
                />
              </Field>
            </div>
          </div>
          <div className="row">
            <div className="col-lg kt-align-right">
              <Field>
                <Button
                  customClassName="btn-info btn-icon-sm"
                  icon="fas fa-search"
                  onClick={() => {
                    setValues(prev => ({
                      ...prev,
                      ...dbFilters,
                    }))
                  }}
                  title="Consultar"
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
            getItems={(query, signal) => service.getList('kinship', query, signal)}
            actions={[
              {
                icon: 'fas fa-edit',
                title: 'Editar',
                action: `${basename}/parentesco/:id`,
              },
              {
                icon: 'fas fa-lock',
                title: 'Desabilitar',
                hideWhen: ent => !!ent.disabledAt,
                action: ({ entity, forceRefresh }) =>
                  disableKinship({
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
                  disableKinship({
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

      <KinshipForm
        service={service}
        show={showForm}
        route={route}
        id={id}
        refresh={async () => {
          await global.refresh(true)
          refresh.force()
        }}
      />
    </>
  )
}
