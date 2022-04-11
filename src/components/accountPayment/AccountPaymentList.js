import React, { useState } from 'react'
import startOfDay from 'date-fns/startOfDay'
import endOfDay from 'date-fns/endOfDay'
import { List } from 'core/components/list'
import { Link } from 'core/components/route'
import { useRefresh } from 'core/hooks/refresh'
import { Field } from 'core/components/form/field'
import { useFilters } from 'core/hooks/filter'
import { AsyncSelect } from 'core/components/form/async-select'
import { DateInput } from 'core/components/form/date-input'
import { parseNumber } from 'core/helpers/parse'
import { Button } from 'core/components/button'
import { AccountPaymentDetailsModal } from './AccountPaymentDetailsModal'

const columns = [
  { path: 'id', title: '#', textAlign: 'center', sort: 'createdAt' },
  { path: 'createdAt', title: 'Data do Pagamento', format: 'datetime' },
  { path: 'paymentMeanDescription', title: 'Meio de Pagamento' },
  { path: 'bankAccountDescription', title: 'Conta' },
  { path: 'value', title: 'Valor', format: 'money' },
]

const fields = columns.map(c => c.path)

export const AccountPaymentList = ({ global, route, service, basename }) => {
  const { modal } = global

  const [dbFilters, setDbFilters] = useState({
    paymentMeanId: '',
    bankAccountId: '',
    minDate: null,
    maxDate: null,
  })

  const { setValues, filters } = useFilters(
    {
      paymentMeanId: '',
      bankAccountId: '',
      minDate: null,
      maxDate: null,
    },
    query => [
      {
        items: [
          { name: 'paymentMeanId', value: query.paymentMeanId, comparer: 'Equals' },
          { name: 'bankAccountId', value: query.bankAccountId, comparer: 'Equals' },
          query.minDate
            ? {
                name: 'createdAt',
                value: query.minDate,
                comparer: 'GreaterThanOrEqual',
              }
            : {},
          query.maxDate
            ? { name: 'createdAt', value: query.maxDate, comparer: 'LessThanOrEqual' }
            : {},
        ],
      },
    ],
  )

  const fetching = useState(false)
  const refresh = useRefresh()
  const accountPaymentId = parseNumber(route.match.params.id)
  const showForm = route.location.pathname.includes('detalhes')

  return (
    <>
      <div className="kt-portlet kt-portlet--mobile">
        <div className="kt-portlet__head kt-portlet__head--lg">
          <div className="kt-portlet__head-label">
            <span className="kt-portlet__head-icon">
              <i className="kt-font-brand fas fa-hand-holding-usd" />
            </span>
            <h3 className="kt-portlet__head-title">Pagamento de Contas</h3>
          </div>
          <div className="kt-portlet__head-toolbar">
            <div className="kt-portlet__head-wrapper">
              <div className="dropdown dropdown-inline">
                <Link
                  className="btn btn-success btn-icon-sm"
                  to={`${basename}/pagamento-contas/cadastro`}
                >
                  <i className="fas fa-plus" /> Novo Pagamento
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="kt-portlet__body kt-pb-0 position-relative">
          <div className="row">
            <div className="col-lg">
              <Field label="Data Inicial do Pagamento">
                <DateInput
                  isClearable
                  customClassName="form-control-xl"
                  onChange={date =>
                    setDbFilters(prev => ({
                      ...prev,
                      minDate: date ? startOfDay(date) : date,
                    }))
                  }
                  value={dbFilters.minDate}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Data Final do Pagamento">
                <DateInput
                  isClearable
                  customClassName="form-control-xl"
                  onChange={date =>
                    setDbFilters(prev => ({
                      ...prev,
                      maxDate: date ? endOfDay(date) : date,
                    }))
                  }
                  value={dbFilters.maxDate}
                />
              </Field>
            </div>
          </div>
          <div className="row">
            <div className="col-lg">
              <Field label="Conta">
                <AsyncSelect
                  isClearable
                  getId={({ id }) => id}
                  getDisplay={({ description }) => description}
                  getItems={value =>
                    service
                      .getList('bankAccount', {
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
                  selected={dbFilters.bankAccountId}
                  onChange={bankAccount =>
                    setDbFilters(prev => ({
                      ...prev,
                      bankAccountId: bankAccount ? bankAccount.id : '',
                    }))
                  }
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Meio de Pagamento">
                <AsyncSelect
                  isClearable
                  getId={({ id }) => id}
                  getDisplay={({ description }) => description}
                  getItems={value =>
                    service
                      .getList('paymentMean', {
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
                  selected={dbFilters.paymentMeanId}
                  onChange={paymentMean =>
                    setDbFilters(prev => ({
                      ...prev,
                      paymentMeanId: paymentMean ? paymentMean.id : '',
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
            modal={modal}
            route={route}
            refresh={refresh}
            fetching={fetching}
            filters={filters}
            initialQuery={{ fields, sort: [['createdAt', 'DESC']] }}
            getItems={(query, signal) => service.getList('accountPayment', query, signal)}
            actions={[
              {
                icon: 'fas fa-money-check-alt',
                title: 'Detalhes',
                action: `${basename}/pagamento-contas/detalhes/:id`,
              },
            ]}
            columns={columns}
          />
        </div>
      </div>
      <AccountPaymentDetailsModal
        service={service}
        show={showForm}
        route={route}
        accountPaymentId={accountPaymentId}
        refresh={async () => {
          await global.refresh(true)
          refresh.force()
        }}
        global={global}
      />
    </>
  )
}
