import React, { useState } from 'react'
import startOfDay from 'date-fns/startOfDay'
import endOfDay from 'date-fns/endOfDay'
import { List } from 'core/components/list'
import { Link } from 'core/components/route'
import { useRefresh } from 'core/hooks/refresh'
import { Field } from 'core/components/form/field'
import { TextInput } from 'core/components/form/text-input'
import { useFilters } from 'core/hooks/filter'
import { AsyncSelect } from 'core/components/form/async-select'
import { LoadingCard } from 'core/components/loading-card'
import { DateInput } from 'core/components/form/date-input'
import { onlyNumbers } from 'core/helpers/format'
import { iframeDownload } from 'core/helpers/misc'
import { parseNumber } from 'core/helpers/parse'
import { Button } from 'core/components/button'
import { CpfMask } from 'core/constants'
import { PaymentDetailsModal } from './PaymentDetailsModal'

const columns = [
  { path: 'id', title: '#', textAlign: 'center', sort: 'createdAt' },
  { path: 'patientName', title: 'Cliente' },
  { path: 'patientCpfCnpj', title: 'CPF/CNPJ', format: 'cpfcnpj' },
  { path: 'createdAt', title: 'Data do Pagamento', format: 'date' },
  { path: 'employeeName', title: 'Colaborador' },
  { path: 'value', title: 'Valor', format: 'money' },
]

const fields = columns.map(c => c.path)

export const PaymentList = ({ global, route, service, basename }) => {
  const { modal } = global

  const [dbFilters, setDbFilters] = useState({
    cpfCnpj: '',
    employeeId: '',
    patientName: '',
    minDate: null,
    maxDate: null,
  })
  const { setValues, filters } = useFilters(
    {
      cpfCnpj: '',
      employeeId: '',
      patientName: '',
      minDate: null,
      maxDate: null,
    },
    query => [
      {
        items: [
          {
            name: 'patient.cpfCnpj',
            value: onlyNumbers(query.cpfCnpj),
            comparer: 'Like',
          },
          { name: 'employee.id', value: query.employeeId, comparer: 'Equals' },
          {
            name: 'patient.name',
            value: `%${query.patientName}%`,
            comparer: 'iLike',
          },
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
  const [printFetching, setPrintFetching] = useState(false)
  const paymentId = parseNumber(route.match.params.id)
  const showForm = route.location.pathname.includes('detalhes')
  return (
    <>
      <div className="kt-portlet kt-portlet--mobile">
        <div className="kt-portlet__head kt-portlet__head--lg">
          <div className="kt-portlet__head-label">
            <span className="kt-portlet__head-icon">
              <i className="kt-font-brand fas fa-hand-holding-usd" />
            </span>
            <h3 className="kt-portlet__head-title">Recebimentos</h3>
          </div>
          <div className="kt-portlet__head-toolbar">
            <div className="kt-portlet__head-wrapper">
              <div className="dropdown dropdown-inline">
                <Link
                  className="btn btn-success btn-icon-sm"
                  to={`${basename}/pagamentos/cadastro`}
                >
                  <i className="fas fa-plus" /> Novo Recebimento
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="kt-portlet__body kt-pb-0 position-relative">
          <div className="row">
            <div className="col-lg-3">
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
              <Field label="Data Inicial do Recebimento">
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
              <Field label="Data Final do Recebimento">
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
            <div className="col-lg">
              <Field label="Colaborador">
                <AsyncSelect
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
                      employee,
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
        {printFetching && (
          <div className="kt-portlet__body kt-pb-0 position-relative">
            <div className="row">
              <LoadingCard text="Gerando PDF" />
            </div>
          </div>
        )}
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
            getItems={(query, signal) => service.getList('payment', query, signal)}
            actions={[
              {
                icon: 'fas fa-money-check-alt',
                title: 'Detalhes',
                action: `${basename}/pagamentos/detalhes/:id`,
              },
              {
                icon: `fas fa-print`,
                title: 'Imprimir Recibo',
                action: async ent => {
                  setPrintFetching(true)
                  await service
                    .post('report.paymentreceipt', { id: ent.entity.id }, undefined, resp =>
                      resp.blob(),
                    )
                    .then(blob => iframeDownload(blob, 'pagamentos.pdf'))
                    .catch(err => global.modal.alert(err.message))
                    .finally(() => setPrintFetching(false))
                },
              },
            ]}
            columns={columns}
          />
        </div>
      </div>
      <PaymentDetailsModal
        service={service}
        show={showForm}
        route={route}
        paymentId={paymentId}
        refresh={async () => {
          await global.refresh(true)
          refresh.force()
        }}
        global={global}
      />
    </>
  )
}
