import React, { useState } from 'react'
import { List } from 'core/components/list'
import { Link } from 'core/components/route'
import { onlyNumbers } from 'core/helpers/format'
import { useRefresh } from 'core/hooks/refresh'
import { Field } from 'core/components/form/field'
import { TextInput } from 'core/components/form/text-input'
import { useFilters } from 'core/hooks/filter'
import { CpfMask } from 'core/constants'
import { Button } from 'core/components/button'

const columns = [
  { path: 'id', title: '#', textAlign: 'center' },
  { path: 'cpf', title: 'CPF', format: 'cpfcnpj' },
  { path: 'name', title: 'Nome' },
]

const fields = [...columns.map(c => c.path), 'disabledAt']

export const disableSeller = ({ modal, data: { id, name, disabledAt }, callback, service }) =>
  modal.confirm(
    `Deseja ${!disabledAt ? 'bloquear' : 'desbloquear'} ${name}?`,
    confirmed =>
      confirmed &&
      service
        .remove('seller', id)
        .then(callback)
        .catch(err => modal.alert(err.message)),
  )

export const SellerList = ({ global, route, service, basename }) => {
  const { modal } = global

  const [dbFilters, setDbFilters] = useState({ name: '', cpf: '', types: [] })

  const { setValues, filters } = useFilters({ name: '', cpf: '', types: [] }, query => [
    {
      items: [
        { name: 'name', value: `%${query.name}%`, comparer: 'iLike' },
        { name: 'cpf', value: onlyNumbers(query.cpf), comparer: 'Like' },
      ],
    },
    {
      items: query.types.map(({ id }) => ({ name: 'profileId', value: id })),
      kind: 'OR',
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
              <i className="kt-font-brand fas fa-user" />
            </span>
            <h3 className="kt-portlet__head-title">Vendedores</h3>
          </div>
          <div className="kt-portlet__head-toolbar">
            <div className="kt-portlet__head-wrapper">
              <div className="dropdown dropdown-inline">
                <Link
                  className="btn btn-success btn-icon-sm"
                  to={`${basename}/vendedores/cadastro`}
                >
                  <i className="fas fa-plus" /> Novo Vendedor
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
                  ignoreBlur
                  type="search"
                  mask={CpfMask}
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
            getItems={(query, signal) => service.getList('seller', query, signal)}
            actions={[
              {
                icon: 'fas fa-edit',
                title: 'Editar',
                action: `${basename}/vendedores/:id`,
              },
              {
                icon: 'fas fa-lock',
                title: 'Bloquear',
                hideWhen: ent => !!ent.disabledAt,
                action: ({ entity, forceRefresh }) =>
                  disableSeller({
                    callback: forceRefresh,
                    data: entity,
                    modal,
                    service,
                  }),
              },
              {
                icon: 'fas fa-unlock',
                title: 'Desbloquear',
                hideWhen: ent => !ent.disabledAt,
                action: ({ entity, forceRefresh }) =>
                  disableSeller({
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
