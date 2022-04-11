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
import startOfDay from 'date-fns/startOfDay'
import { DateInput } from 'core/components/form/date-input'
import { AsyncSelect } from 'core/components/form/async-select'

const columns = [
  { path: 'id', title: '#', textAlign: 'center' },
  { path: 'cpfCnpj', title: 'CPF', format: 'cpfcnpj' },
  { path: 'name', title: 'Nome' },
  { path: 'planTitle', title: 'Plano' },
  {
    path: 'customerId',
    title: 'Tipo',
    format: ent => (!ent.customerId ? 'Titular' : 'Dependente'),
  },
]

const fields = [...columns.map(c => c.path), 'customerId', 'particular']

export const disablePatient = ({ modal, data: { id, name }, callback, service }) =>
  modal.confirm(
    `Deseja remover ${name}?`,
    confirmed =>
      confirmed &&
      service
        .remove('patient', id)
        .then(callback)
        .catch(err => modal.alert(err.message)),
  )

export const PatientList = ({ global, route, service, basename }) => {
  const { modal } = global

  const [dbFilters, setDbFilters] = useState({
    name: '',
    cpfCnpj: '',
    phone: '',
    rg: '',
    birthDate: null,
    planId: '',
  })

  const { setValues, filters } = useFilters(
    { name: '', cpfCnpj: '', phone: '', rg: '', birthDate: null, planId: '' },
    query => [
      {
        items: [
          { name: 'name', value: `%${query.name}%`, comparer: 'iLike' },
          { name: 'cpfCnpj', value: onlyNumbers(query.cpfCnpj), comparer: 'Like' },
          { name: 'phone', value: onlyNumbers(query.phone), comparer: 'Like' },
          { name: 'rg', value: onlyNumbers(query.rg), comparer: 'Like' },
          ...(query.birthDate
            ? [{ name: 'birthDate', value: query.birthDate, comparer: 'Equals' }]
            : []),
          query.planId !== undefined
            ? { name: 'unityId', value: 1, comparer: 'Equals' }
            : { name: 'unityId', value: 1, comparer: 'Equals' },
        ],
        planId: query.planId,
      },
    ],
  )

  const fetching = useState(false)
  const refresh = useRefresh()

  return (
    <>
      <div className="kt-portlet kt-portlet--mobile">
        <div className="kt-portlet__head kt-portlet__head--lg">
          <div className="kt-portlet__head-label">
            <span className="kt-portlet__head-icon">
              <i className="kt-font-brand fas fa-user-injured" />
            </span>
            <h3 className="kt-portlet__head-title">Clientes</h3>
          </div>
          <div className="kt-portlet__head-toolbar">
            <div className="kt-portlet__head-wrapper">
              <div className="dropdown dropdown-inline">
                <Link className="btn btn-success btn-icon-sm" to={`${basename}/clientes/cadastro`}>
                  <i className="fas fa-plus" /> Novo Cliente
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
                  value={dbFilters.cpfCnpj}
                  onChange={cpfCnpj => setDbFilters(prev => ({ ...prev, cpfCnpj }))}
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
            <div className="col-lg">
              <Field label="Rg">
                <TextInput
                  ignoreBlur
                  type="search"
                  value={dbFilters.rg}
                  onChange={rg => setDbFilters(prev => ({ ...prev, rg }))}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Telefone">
                <TextInput
                  ignoreBlur
                  type="search"
                  value={dbFilters.phone}
                  onChange={phone => setDbFilters(prev => ({ ...prev, phone }))}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Data de nascimento">
                <DateInput
                  isClearable
                  customClassName="form-control-xl"
                  onChange={birthDate =>
                    setDbFilters(prev => ({
                      ...prev,
                      birthDate: birthDate ? startOfDay(birthDate) : null,
                    }))
                  }
                  value={dbFilters.birthDate}
                />
              </Field>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-3">
              <Field label="Plano">
                <AsyncSelect
                  isClearable
                  getId={({ id }) => id}
                  getDisplay={({ title }) => title}
                  getItems={value =>
                    service
                      .getList('plan', {
                        fields: ['id', 'title', 'disabledAt', 'single'],
                        usePager: false,
                        filters: [
                          {
                            items: [
                              {
                                name: 'title',
                                comparer: 'Like',
                                value,
                              },
                              {
                                name: 'disabledAt',
                                comparer: 'Equals',
                                value: null,
                              },
                            ],
                          },
                        ],
                      })
                      .then(({ items }) => [{ id: null, title: 'Particular' }, ...items])
                  }
                  selected={dbFilters.planId}
                  onChange={plan =>
                    setDbFilters(prev => ({
                      ...prev,
                      planId: plan ? plan.id : undefined,
                    }))
                  }
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
            showItem
            onShowItem={entity => route.history.push(`${basename}/clientes/${entity.id}/mostrar`)}
            modal={modal}
            route={route}
            refresh={refresh}
            fetching={fetching}
            filters={filters}
            initialQuery={{ fields }}
            getItems={(query, signal) =>
              service.getList(
                'patient',
                { ...query, usePager: false, perPage: 10, removeFields: ['planTitle'] },
                signal,
              )
            }
            actions={[
              {
                icon: 'fas fa-edit',
                title: 'Editar',
                action: `${basename}/clientes/:id`,
              },
              {
                icon: 'fas fa-eye',
                title: 'Ver Contrato',
                hideWhen: entity => !entity.contractId,
                action: ({ entity }) =>
                  route.history.push(`${basename}/contratos/${entity.contractId}/mostrar`),
              },
              {
                icon: 'fas fa-trash-alt',
                title: 'Remover',
                action: ({ entity, forceRefresh }) =>
                  disablePatient({
                    callback: forceRefresh,
                    data: entity,
                    modal,
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
