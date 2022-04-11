import React, { useState } from 'react'
import startOfDay from 'date-fns/startOfDay'
import endOfDay from 'date-fns/endOfDay'
import { List } from 'core/components/list'
import { useRefresh } from 'core/hooks/refresh'
import { Field } from 'core/components/form/field'
import { TextInput } from 'core/components/form/text-input'
import { useFilters } from 'core/hooks/filter'
import { AsyncSelect } from 'core/components/form/async-select'
import { DateInput } from 'core/components/form/date-input'
import { onlyNumbers } from 'core/helpers/format'
import { Button } from 'core/components/button'
import { CpfMask } from 'core/constants'
import { parseNumber } from 'core/helpers/parse'
import { ContractRenewalForm } from './ContractRenewalForm'

const columns = [
  { path: 'id', title: '#', textAlign: 'center', sort: 'createdAt' },
  { path: 'patientName', title: 'Aderente' },
  { path: 'patientCpfCnpj', title: 'CPF/CNPJ', format: 'cpfcnpj' },
  { path: 'patientPhone', title: 'Telefone', format: 'cellAndPhone' },
  { path: 'createdAt', title: 'Data do Contrato', format: 'date' },
  { path: 'due', title: 'Vencimento', format: 'date' },
  { path: 'sellerName', title: 'Vendedor' },
  { path: 'planTitle', title: 'Plano' },
  { path: 'paymentMethodDescription', title: 'Opção Pagamento' },
]

const fields = columns.map(c => c.path)

export const ContractRenewalList = ({ global, route, service, basename }) => {
  const { modal } = global
  const [dbFilters, setDbFilters] = useState({
    id: '',
    institution: '',
    cpfCnpj: '',
    name: '',
    sellerId: '',
    paymentMethodId: '',
    planId: '',
    minDate: null,
    maxDate: null,
  })

  const { setValues, filters } = useFilters(
    {
      id: '',
      institution: '',
      cpfCnpj: '',
      name: '',
      sellerId: '',
      paymentMethodId: '',
      planId: '',
      minDate: null,
      maxDate: null,
    },
    query => [
      {
        items: [
          { name: 'Contract.id', value: query.id, comparer: 'Equals' },
          { name: 'institution', value: query.institution, comparer: 'Like' },
          {
            name: 'patient.cpfCnpj',
            value: onlyNumbers(query.cpfCnpj),
            comparer: 'Like',
          },
          {
            name: 'patient.name',
            value: `%${query.name}%`,
            comparer: 'iLike',
          },
          { name: 'sellerId', value: query.sellerId, comparer: 'Equals' },
          { name: 'paymentMethodId', value: query.paymentMethodId, comparer: 'Equals' },
          { name: 'planId', value: query.planId, comparer: 'Equals' },
          query.minDate
            ? {
                name: 'due',
                value: query.minDate,
                comparer: 'GreaterThanOrEqual',
              }
            : {},
          query.maxDate ? { name: 'due', value: query.maxDate, comparer: 'LessThanOrEqual' } : {},
        ],
      },
    ],
  )

  const fetching = useState(false)
  const refresh = useRefresh()
  const key = parseNumber(route.match.params.id)
  const showForm = key > 0

  return (
    <>
      <div className="kt-portlet kt-portlet--mobile">
        <div className="kt-portlet__head kt-portlet__head--lg">
          <div className="kt-portlet__head-label">
            <span className="kt-portlet__head-icon">
              <i className="kt-font-brand fas fa-file-signature" />
            </span>
            <h3 className="kt-portlet__head-title"> Renovação de Contratos</h3>
          </div>
          <div className="kt-portlet__head-toolbar">
            <div className="kt-portlet__head-wrapper" />
          </div>
        </div>
        <div className="kt-portlet__body kt-pb-0 position-relative">
          <div className="row">
            <div className="col-lg">
              <p className="table-label">Contratos Expirados</p>
            </div>
          </div>
          <br />
          <div className="row">
            <div className="col-lg">
              <Field label="CPF/CNPJ">
                <TextInput
                  mask={CpfMask}
                  isClearable
                  ignoreBlur
                  type="search"
                  value={dbFilters.cpfCnpj}
                  onChange={cpfCnpj => setDbFilters(prev => ({ ...prev, cpfCnpj }))}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Nome do Aderente">
                <TextInput
                  isClearable
                  ignoreBlur
                  type="search"
                  value={dbFilters.name}
                  onChange={name => setDbFilters(prev => ({ ...prev, name }))}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Vencido de">
                <DateInput
                  isClearable
                  customClassName="form-control-xl"
                  onChange={date =>
                    setDbFilters(prev => ({
                      ...prev,
                      minDate: date ? startOfDay(date) : null,
                    }))
                  }
                  value={dbFilters.minDate}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Vencido até">
                <DateInput
                  isClearable
                  customClassName="form-control-xl"
                  onChange={date =>
                    setDbFilters(prev => ({
                      ...prev,
                      maxDate: date ? endOfDay(date) : null,
                    }))
                  }
                  value={dbFilters.maxDate}
                />
              </Field>
            </div>
          </div>
          <div className="row">
            <div className="col-lg">
              <Field label="Nº do Contrato">
                <TextInput
                  isClearable
                  ignoreBlur
                  type="search"
                  value={dbFilters.id}
                  onChange={id => setDbFilters(prev => ({ ...prev, id }))}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Vendedor">
                <AsyncSelect
                  isClearable
                  getId={({ id }) => id}
                  getDisplay={({ name }) => name}
                  getItems={value =>
                    service
                      .getList('seller', {
                        usePager: false,
                        filters: [
                          {
                            items: [
                              {
                                name: 'name',
                                comparer: 'iLike',
                                value: `%${value}%`,
                              },
                            ],
                          },
                        ],
                      })
                      .then(({ items }) => items)
                  }
                  selected={dbFilters.sellerId}
                  onChange={seller =>
                    setDbFilters(prev => ({
                      ...prev,
                      sellerId: seller ? seller.id : '',
                      seller,
                    }))
                  }
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Opção de Pagamento">
                <AsyncSelect
                  isClearable
                  getId={({ id }) => id}
                  getDisplay={({ description }) => description}
                  getItems={value =>
                    service
                      .getList('paymentmethod', {
                        usePager: false,
                        filters: [
                          {
                            items: [
                              {
                                name: 'description',
                                comparer: 'Like',
                                value,
                              },
                            ],
                          },
                        ],
                      })
                      .then(({ items }) => items)
                  }
                  selected={dbFilters.paymentMethodId}
                  onChange={paymentMethod => {
                    setDbFilters(prev => ({
                      ...prev,
                      paymentMethodId: paymentMethod ? paymentMethod.id : '',
                    }))
                  }}
                />
              </Field>
            </div>
            <div className="col-lg">
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
                      .then(({ items }) => items)
                  }
                  selected={dbFilters.planId}
                  onChange={plan => {
                    setDbFilters(prev => ({
                      ...prev,
                      planId: plan ? plan.id : '',
                    }))
                  }}
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
            initialQuery={{
              fields,
              sort: [['due', 'ASC']],
            }}
            getItems={(query, signal) => service.getList('renewalcontract', query, signal)}
            actions={[
              {
                icon: 'fas fa-file-contract',
                title: 'Renovar Contrato',
                action: `${basename}/renovacao-contratos/:id`,
              },
            ]}
            columns={columns}
          />
        </div>
      </div>

      <ContractRenewalForm
        service={service}
        show={showForm}
        route={route}
        id={key}
        refresh={async () => {
          await global.refresh(true)
          refresh.force()
        }}
      />
    </>
  )
}
