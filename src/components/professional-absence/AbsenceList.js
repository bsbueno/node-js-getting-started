import React, { useState } from 'react'
import { List } from 'core/components/list'
import { Link } from 'core/components/route'
import { useRefresh } from 'core/hooks/refresh'
import { Field } from 'core/components/form/field'
import { TextInput } from 'core/components/form/text-input'
import { useFilters } from 'core/hooks/filter'
import { Button } from 'core/components/button'
import { parseNumber } from 'core/helpers/parse'
import { AbsenceForm } from './AbsenceForm'

const columns = [
  { path: 'id', title: '#', textAlign: 'center' },
  { path: 'professionalName', title: 'Nome' },
  { path: 'start', title: 'Data Inicio', format: 'date' },
  { path: 'end', title: 'Data Final', format: 'date' },
]

const fields = columns.map(c => c.path)

export const AbsenceList = ({ global, route, service, basename }) => {
  const { modal } = global

  const [dbFilters, setDbFilters] = useState({ name: '' })
  const { setValues, filters } = useFilters({ name: '' }, query => [
    {
      items: [{ name: 'professionalName', value: query.name, comparer: 'Like' }],
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
              <i className="kt-font-brand fas fa-user-md" />
            </span>
            <h3 className="kt-portlet__head-title">Ausências dos Profissionais</h3>
          </div>
          <div className="kt-portlet__head-toolbar">
            <div className="kt-portlet__head-wrapper">
              <div className="dropdown dropdown-inline">
                <Link className="btn btn-success btn-icon-sm" to={`${basename}/ausencias/cadastro`}>
                  <i className="fas fa-plus" /> Nova Ausência
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="kt-portlet__body kt-pb-0 position-relative">
          <div className="row">
            <div className="col-lg-4">
              <Field label="Nome">
                <TextInput
                  ignoreBlur
                  type="search"
                  value={dbFilters.name}
                  onChange={name => setDbFilters(prev => ({ ...prev, name }))}
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
            getItems={(query, signal) => service.getList('absence', query, signal)}
            actions={[
              {
                icon: 'fas fa-times',
                title: 'Remover',
                action: ({ entity, forceRefresh }) =>
                  modal.confirm(
                    'Deseja remover essa ausência?',
                    confirmed =>
                      confirmed &&
                      service
                        .remove('absence', entity.id)
                        .then(forceRefresh)
                        .catch(err => modal.alert(err.message)),
                  ),
              },
            ]}
            columns={columns}
          />
        </div>
      </div>

      <AbsenceForm
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
