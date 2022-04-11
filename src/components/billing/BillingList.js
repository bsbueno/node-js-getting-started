import React, { useState } from 'react'
import startOfDay from 'date-fns/startOfDay'
import endOfDay from 'date-fns/endOfDay'
import { List } from 'core/components/list'
import { useRefresh } from 'core/hooks/refresh'
import { Field } from 'core/components/form/field'
import { useFilters } from 'core/hooks/filter'
import { DateInput } from 'core/components/form/date-input'
import { Button } from 'core/components/button'
import { CpfMask } from 'core/constants'
import { LoadingCard } from 'core/components/loading-card'
import { iframeDownload } from 'core/helpers/misc'
import { AsyncSelect } from 'core/components/form/async-select'
import { onlyNumbers } from 'core/helpers/format'
import { TextInput } from 'core/components/form/text-input'
import { Link } from 'core/components/route'

const columns = [
  { path: 'id', title: '#', textAlign: 'center', sort: 'createdAt' },
  { path: 'createdAt', title: 'Data', format: 'datetime' },
  { path: 'patientName', title: 'Paciente' },
  { path: 'patientCpfCnpj', title: 'CPF/CNPJ', format: 'cpfcnpj' },
  { path: 'healthProfessionalName', title: 'Profissional de Saúde' },
  { path: 'paymentMean', title: 'Forma de Pagamento' },
  { path: 'employeeName', title: 'Faturado por' },
  { path: 'value', title: 'Valor', format: 'money' },
]

const fields = columns.map(c => c.path)

export const BillingList = ({ global, route, service, basename }) => {
  const { modal } = global
  const { permissions, id: employeeid } = global.operator

  const forEmployee = permissions.indexOf('BillingForEmployee', 0) >= 0
  const forDay = permissions.indexOf('BillingDay', 0) >= 0
  const [dbFilters, setDbFilters] = useState({
    paymentMeanId: '',
    minDate: forDay ? startOfDay(new Date()) : null,
    maxDate: forDay ? endOfDay(new Date()) : null,
    cpfCnpj: '',
    patientName: '',
    healthProfessionalId: '',
    employeeId: forEmployee ? employeeid : '',
  })
  const { setValues, filters } = useFilters(
    {
      cpfCnpj: '',
      patientName: '',
      healthProfessionalId: '',
      employeeId: forEmployee ? employeeid : '',
      minDate: '',
      maxDate: '',
    },
    query => [
      {
        items: [
          query.minDate
            ? {
                name: 'Billing.createdAt',
                value: query.minDate,
                comparer: 'GreaterThanOrEqual',
              }
            : {},
          query.maxDate
            ? {
                name: 'Billing.createdAt',
                value: query.maxDate,
                comparer: 'LessThanOrEqual',
              }
            : {},
          {
            name: 'patient.cpfCnpj',
            value: onlyNumbers(query.cpfCnpj),
            comparer: 'Like',
          },
          {
            name: 'patient.name',
            value: `%${query.patientName}%`,
            comparer: 'iLike',
          },
          {
            name: 'healthProfessionalId',
            value: query.healthProfessionalId,
            comparer: 'Equals',
          },
          {
            name: 'employeeId',
            value: query.employeeId,
            comparer: 'Equals',
          },
          {
            name: 'paymentMeanId',
            value: query.paymentMeanId,
            comparer: 'Equals',
          },
        ],
      },
    ],
  )

  const fetching = useState(false)
  const refresh = useRefresh()
  const [printFetching, setPrintFetching] = useState(false)

  return (
    <>
      <div className="kt-portlet kt-portlet--mobile">
        <div className="kt-portlet__head kt-portlet__head--lg">
          <div className="kt-portlet__head-label">
            <span className="kt-portlet__head-icon">
              <i className="kt-font-brand fas fa-dollar-sign" />
            </span>
            <h3 className="kt-portlet__head-title">Faturamento</h3>
          </div>
          <div className="kt-portlet__head-toolbar">
            <div className="kt-portlet__head-wrapper">
              <div className="dropdown dropdown-inline">
                <Link
                  className="btn btn-success btn-icon-sm"
                  to={`${basename}/faturamento/cadastro`}
                >
                  <i className="fas fa-plus" /> Novo Faturamento
                </Link>
              </div>
              <div className="dropdown dropdown-inline buttons-header-padding">
                <Button
                  icon="fas fa-file-pdf"
                  customClassName="btn-info btn-icon-sm"
                  title="Baixar em PDF"
                  onClick={() => {
                    setPrintFetching(true)
                    service
                      .post(
                        'billing.list',
                        {
                          filters,
                          isPdf: true,
                          usePager: false,
                          fields,
                          sort: [['createdAt', 'DESC']],
                        },
                        undefined,
                        resp => resp.blob(),
                      )
                      .then(blob => iframeDownload(blob, 'faturamento.pdf'))
                      .catch(err => modal.alert(err.message))
                      .finally(() => setPrintFetching(false))
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        {printFetching && (
          <div className="kt-portlet__body kt-pb-0 position-relative">
            <div className="row">
              <LoadingCard text="Gerando PDF" />
            </div>
          </div>
        )}
        <div className="kt-portlet__body kt-pb-0 position-relative">
          <div className="row">
            <div className="col-lg">
              <Field label="Data Inicial">
                <DateInput
                  disabled={forDay}
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
              <Field label="Data Final">
                <DateInput
                  disabled={forDay}
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
            <div className="col-lg">
              <Field label="CPF">
                <TextInput
                  mask={CpfMask}
                  ignoreBlur
                  type="search"
                  value={dbFilters.cpfCnpj}
                  onChange={cpfCnpj => setDbFilters(prev => ({ ...prev, cpfCnpj }))}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Nome do Paciente">
                <TextInput
                  ignoreBlur
                  type="search"
                  value={dbFilters.patientName}
                  onChange={patientName => setDbFilters(prev => ({ ...prev, patientName }))}
                />
              </Field>
            </div>
          </div>
          <div className="row">
            <div className="col-lg">
              <Field label="Profissional de Saúde">
                <AsyncSelect
                  isClearable
                  getId={({ id }) => id}
                  getDisplay={({ name }) => name}
                  getItems={value =>
                    service
                      .getList('healthprofessional', {
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
                  selected={dbFilters.healthProfessionalId}
                  onChange={professional =>
                    setDbFilters(prev => ({
                      ...prev,
                      healthProfessionalId: professional ? professional.id : '',
                    }))
                  }
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Faturado por">
                <AsyncSelect
                  disabled={forEmployee}
                  isClearable
                  getId={({ id }) => id}
                  getDisplay={({ name }) => name}
                  getItems={value =>
                    service
                      .getList('employee', {
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
                  selected={dbFilters.employeeId}
                  onChange={employee =>
                    setDbFilters(prev => ({
                      ...prev,
                      employeeId: employee ? employee.id : '',
                    }))
                  }
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Forma de Pagamento">
                <AsyncSelect
                  isClearable
                  getId={({ id }) => id}
                  getDisplay={({ description }) => description}
                  getItems={value =>
                    service
                      .getList('paymentmean', {
                        usePager: false,
                        filters: [
                          {
                            items: [
                              {
                                name: 'description',
                                comparer: 'iLike',
                                value: `%${value}%`,
                              },
                            ],
                          },
                        ],
                      })
                      .then(({ items }) => items)
                  }
                  selected={dbFilters.paymentMeanId}
                  onChange={payment =>
                    setDbFilters(prev => ({
                      ...prev,
                      paymentMeanId: payment ? payment.id : '',
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
            getItems={(query, signal) => service.getList('billing', query, signal)}
            actions={[
              {
                icon: 'fas fa-money-check-alt',
                title: 'Detalhes',
                action: `${basename}/faturamento/:id`,
              },
            ]}
            columns={columns}
          />
        </div>
      </div>
    </>
  )
}
