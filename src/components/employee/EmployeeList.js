import React, { useState } from 'react'
import { List } from 'core/components/list'
import { Link } from 'core/components/route'
import { useRefresh } from 'core/hooks/refresh'
import { Field } from 'core/components/form/field'
import { TextInput } from 'core/components/form/text-input'
import { useFilters } from 'core/hooks/filter'
import { parseNumber } from 'core/helpers/parse'
import { CpfMask } from 'core/constants'
import { onlyNumbers } from 'core/helpers/format'
import { Button } from 'core/components/button'
import { EmployeeForm } from './EmployeeForm'

const columns = [
  { path: 'id', title: '#', textAlign: 'center' },
  { path: 'cpf', title: 'CPF', format: 'cpfcnpj' },
  { path: 'name', title: 'Nome' },
]

const fields = [...columns.map(c => c.path), 'disabledAt']

export const disableEmployee = ({ modal, data: { id, name, disabledAt }, callback, service }) =>
  modal.confirm(
    `Deseja ${!disabledAt ? 'desativar' : 'ativar'} ${name}?`,
    confirmed =>
      confirmed &&
      service
        .remove('employee', id)
        .then(callback)
        .catch(err => modal.alert(err.message)),
  )

export const EmployeeList = ({ global, route, service, basename }) => {
  const { modal } = global

  const [dbFilters, setDbFilters] = useState({ name: '', cpf: '' })

  const { setValues, filters } = useFilters({ name: '', cpf: '' }, query => [
    {
      items: [
        { name: 'cpf', value: onlyNumbers(query.cpf), comparer: 'Like' },
        { name: 'name', value: `%${query.name}%`, comparer: 'iLike' },
      ],
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
              <i className="kt-font-brand fas fa-user-tie" />
            </span>
            <h3 className="kt-portlet__head-title">Colaboradores</h3>
          </div>
          <div className="kt-portlet__head-toolbar">
            <div className="kt-portlet__head-wrapper">
              <div className="dropdown dropdown-inline">
                <Link
                  className="btn btn-success btn-icon-sm"
                  to={`${basename}/colaboradores/cadastro`}
                >
                  <i className="fas fa-plus" /> Novo Colaborador
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="kt-portlet__body kt-pb-0 position-relative">
          <div className="row">
            <div className="col-lg">
              <Field label="CPF">
                <TextInput
                  mask={CpfMask}
                  ignoreBlur
                  type="search"
                  value={dbFilters.cpf}
                  onChange={cpf => setDbFilters(prev => ({ ...prev, cpf }))}
                />
              </Field>
            </div>
            <div className="col-lg">
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
            getItems={(query, signal) => service.getList('employee', query, signal)}
            actions={[
              {
                icon: 'fas fa-edit',
                title: 'Editar',
                action: `${basename}/colaboradores/:id`,
              },
              {
                icon: 'fas fa-lock',
                title: 'Desabilitar',
                hideWhen: ent => !!ent.disabledAt,
                action: ({ entity, forceRefresh }) =>
                  disableEmployee({
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
                  disableEmployee({
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

      <EmployeeForm
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
