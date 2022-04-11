import React, { useState } from 'react'
import { startOfDay, endOfDay } from 'date-fns'
import { useDebounce } from 'core/hooks/debounce'
import { Field } from 'core/components/form/field'
import { TextInput } from 'core/components/form/text-input'
import { IntegerInput } from 'core/components/form/integer-input'
import { DateInput } from 'core/components/form/date-input'
import { Button } from 'core/components/button'
import { LoadingCard } from 'core/components/loading-card'
import { iframeDownload, isEqual, classNames } from 'core/helpers/misc'
import { maskCpfCnpj, tableMaskMoney } from 'core/helpers/mask'
import { toLocaleDate } from 'core/helpers/date'
import { InstallmentStatusDescription, CpfMask } from 'core/constants'
import { Select } from 'core/components/form/select'
import { AsyncSelect } from 'core/components/form/async-select'
import { Switch } from 'core/components/form/switch'

const dateTypes = [
  { id: 'due', name: 'Vencimento' },
  { id: 'payment', name: 'Pagamento' },
]

const initialFilters = {
  cpfCnpj: '',
  name: '',
  contractId: '',
  sellerId: '',
  planId: '',
  paymentMethodId: '',
  dateType: 'due',
  minDate: null,
  maxDate: null,
  contractCanceled: false,
  seller: null,
  delayedDaysStart: '',
  delayedDaysEnd: '',
}

export const Installment = ({ global, service }) => {
  const [items, setItems] = useState([])
  const [filters, setFilters] = useState(initialFilters)
  const [statusType, setStatusType] = useState(0)

  const dbFilters = useDebounce(filters, 300)
  const [fetching, setFetching] = useState(false)

  return (
    <>
      <div className="kt-portlet kt-portlet--mobile">
        <div className="kt-portlet__head kt-portlet__head--lg">
          <div className="kt-portlet__head-label">
            <span className="kt-portlet__head-icon">
              <i className="kt-font-brand fas fa-money-check-alt" />
            </span>
            <h3 className="kt-portlet__head-title">Parcelas</h3>
          </div>
          <div className="kt-portlet__head-toolbar">
            <div className="kt-portlet__head-wrapper">
              <div className="dropdown dropdown-inline">
                <Button
                  icon="fas fa-file-pdf"
                  customClassName="btn-info btn-icon-sm"
                  title="Baixar em PDF"
                  onClick={() => {
                    if (isEqual(initialFilters, filters)) {
                      global.modal.alert('Selecione ao menos um filtro para a consulta!')
                    } else {
                      setFetching(true)
                      service
                        .post(
                          'report.installments',
                          { ...dbFilters, isPdf: true, statusType },
                          undefined,
                          resp => resp.blob(),
                        )
                        .then(blob => iframeDownload(blob, 'parcelas.pdf'))
                        .catch(err => global.modal.alert(err.message))
                        .finally(() => setFetching(false))
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="kt-portlet__body kt-pb-0 position-relative">
          <div className="row">
            <div className="col-lg-1">
              <Field label="Nº do Contrato">
                <IntegerInput
                  ignoreBlur
                  type="search"
                  value={filters.contractId || ''}
                  onChange={contractId => setFilters(prev => ({ ...prev, contractId }))}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="CPF/CNPJ">
                <TextInput
                  mask={CpfMask}
                  ignoreBlur
                  type="search"
                  value={filters.cpfCnpj}
                  onChange={cpfCnpj => setFilters(prev => ({ ...prev, cpfCnpj }))}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Nome do Aderente">
                <TextInput
                  ignoreBlur
                  type="search"
                  value={filters.name}
                  onChange={name => setFilters(prev => ({ ...prev, name }))}
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
                      .then(resp => resp.items)
                  }
                  selected={filters.sellerId}
                  onChange={seller =>
                    setFilters(prev => ({
                      ...prev,
                      sellerId: seller ? seller.id : '',
                      seller,
                    }))
                  }
                />
              </Field>
            </div>
          </div>
          <div className="row">
            <div className="col-lg">
              <Field label="Status">
                <Select
                  isClearable
                  items={InstallmentStatusDescription}
                  selected={statusType}
                  getId={({ id }) => id}
                  getDisplay={({ description }) => description}
                  onChange={status => {
                    setStatusType(status ? status.id : 0)
                  }}
                />
              </Field>
            </div>
            <div className="col-lg-2">
              <Field label="Dias de Atraso Inical">
                <IntegerInput
                  ignoreBlur
                  type="search"
                  value={filters.delayedDaysStart || ''}
                  onChange={delayedDaysStart => setFilters(prev => ({ ...prev, delayedDaysStart }))}
                />
              </Field>
            </div>
            <div className="col-lg-2">
              <Field label="Dias de Atraso Final">
                <IntegerInput
                  ignoreBlur
                  type="search"
                  value={filters.delayedDaysEnd || ''}
                  onChange={delayedDaysEnd => setFilters(prev => ({ ...prev, delayedDaysEnd }))}
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
                        usePager: false,
                        filters: [
                          {
                            items: [
                              {
                                name: 'title',
                                comparer: 'Like',
                                value,
                              },
                            ],
                          },
                        ],
                      })
                      .then(resp => resp.items)
                  }
                  selected={filters.planId}
                  onChange={plan =>
                    setFilters(prev => ({
                      ...prev,
                      planId: plan ? plan.id : '',
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
                      .then(resp => resp.items)
                  }
                  selected={filters.paymentMethodId}
                  onChange={paymentMethod =>
                    setFilters(prev => ({
                      ...prev,
                      paymentMethodId: paymentMethod ? paymentMethod.id : '',
                    }))
                  }
                />
              </Field>
            </div>
          </div>

          <div className="row">
            <div className="col-lg">
              <Field label="Data Inicial">
                <DateInput
                  isClearable
                  customClassName="form-control-xl"
                  onChange={date =>
                    setFilters(prev => ({
                      ...prev,
                      minDate: date ? startOfDay(date) : null,
                    }))
                  }
                  value={filters.minDate}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Data Final">
                <DateInput
                  isClearable
                  customClassName="form-control-xl"
                  onChange={date =>
                    setFilters(prev => ({
                      ...prev,
                      maxDate: date ? endOfDay(date) : null,
                    }))
                  }
                  value={filters.maxDate}
                />
              </Field>
            </div>

            <div className="col-lg">
              <Field label="Tipo da Data">
                <Select
                  items={dateTypes}
                  selected={filters.dateType}
                  getId={({ id }) => id}
                  getDisplay={({ name }) => name}
                  onChange={type => setFilters(prev => ({ ...prev, dateType: type.id }))}
                />
              </Field>
            </div>

            <div className="col-lg-2">
              <Switch
                id="minor"
                label="Contratos Cancelados"
                checked={filters.contractCanceled}
                className="switch-layout"
                onChange={contractCanceled =>
                  setFilters(prev => ({
                    ...prev,
                    contractCanceled,
                  }))
                }
              />
            </div>
          </div>

          <div className="row">
            <div className="col-lg kt-align-right">
              <Field>
                <Button
                  icon="fas fa-search"
                  customClassName="btn-info btn-icon-sm"
                  title="Consultar"
                  onClick={() => {
                    if (isEqual(initialFilters, filters)) {
                      global.modal.alert('Selecione ao menos um filtro para a consulta!')
                    } else {
                      setFetching(true)
                      service
                        .post('report.installments', {
                          ...dbFilters,
                          statusType,
                        })
                        .then(resp => {
                          setItems(resp.installments)
                        })
                        .catch(err => global.modal.alert(err.message))
                        .finally(() => setFetching(false))
                    }
                  }}
                />
              </Field>
            </div>
          </div>

          {fetching && (
            <div className="blockui-overlay">
              <div className="blockui" />
            </div>
          )}
        </div>
        {fetching ? (
          <div className="kt-portlet__body kt-pb-0 position-relative">
            <div className="row">
              <LoadingCard />
            </div>
          </div>
        ) : (
          <div className="kt-portlet__body kt-portlet__body--fit">
            <div
              className={classNames(
                'report-irregular kt-datatable kt-datatable--default kt-datatable--brand',
                {
                  'kt-datatable--loaded': !fetching || items.length > 0,
                  'table-loading': fetching,
                },
              )}
            >
              <table className="kt-datatable__table">
                <thead className="kt-datatable__head">
                  <tr className="kt-datatable__row">
                    <th className="kt-datatable__cell">
                      <span>#</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span>CPF/CNPJ</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span>Aderente</span>
                    </th>
                    <th className="kt-datatable__cell no-width no-wrap">
                      <span>Contrato</span>
                    </th>
                    <th className="kt-datatable__cell no-width no-wrap">
                      <span>Parcela</span>
                    </th>
                    <th className="kt-datatable__cell no-width no-wrap">
                      <span>Vencimento</span>
                    </th>
                    <th className="kt-datatable__cell no-width no-wrap">
                      <span>Pagamento</span>
                    </th>
                    <th className="kt-datatable__cell no-width no-wrap">
                      <span>Atraso</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span>Valor</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span>Multa</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span>Correção</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span>Total</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span>Status</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span>Método</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span>Vendedor</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span>Plano</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="kt-datatable__body">
                  {items.map(i => (
                    <tr key={i.id} className="kt-datatable__row">
                      <td className="kt-datatable__cell">
                        <div>{i.id}</div>
                      </td>
                      <td className="kt-datatable__cell">
                        <div>{maskCpfCnpj(i.patientCpfCnpj)}</div>
                      </td>
                      <td className="kt-datatable__cell">
                        <div>{i.patientName}</div>
                      </td>
                      <td className="kt-datatable__cell kt-align-center">
                        <div>{i.contractId}</div>
                      </td>
                      <td className="kt-datatable__cell kt-align-center">
                        <div>
                          {i.numberInstallment}/{i.paymentMethodNumberInstallments}
                        </div>
                      </td>
                      <td className="kt-datatable__cell kt-align-center">
                        <div>{toLocaleDate(i.dueDate, true)}</div>
                      </td>
                      <td className="kt-datatable__cell kt-align-center">
                        <div>{toLocaleDate(i.paidDate, true)}</div>
                      </td>
                      <td className="kt-datatable__cell kt-align-center">
                        <div>{i.delayedDays}</div>
                      </td>
                      <td className="kt-datatable__cell">
                        <div>{tableMaskMoney(i.value)}</div>
                      </td>
                      <td className="kt-datatable__cell no-width no-wrap">
                        <div>{tableMaskMoney(i.fineValue)}</div>
                      </td>
                      <td className="kt-datatable__cell no-width no-wrap">
                        <div>{tableMaskMoney(i.interestValue)}</div>
                      </td>
                      <td className="kt-datatable__cell">
                        <div>{tableMaskMoney(i.total)}</div>
                      </td>
                      <td className="kt-datatable__cell">
                        <div>
                          {
                            InstallmentStatusDescription.find(
                              instalmment => instalmment.id === i.status,
                            ).description
                          }
                        </div>
                      </td>
                      <td className="kt-datatable__cell">
                        <div>{i.paymentMethodDescription}</div>
                      </td>
                      <td className="kt-datatable__cell">
                        <div>{i.sellerName}</div>
                      </td>
                      <td className="kt-datatable__cell">
                        <div>{i.planTitle}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {items.length > 0 && (
                  <tfoot className="kt-datatable__foot">
                    <tr className="kt-datatable__row">
                      <td className="kt-datatable__cell">{items.length}</td>
                      <td className="kt-datatable__cell" />
                      <td className="kt-datatable__cell" />
                      <td className="kt-datatable__cell" />
                      <td className="kt-datatable__cell" />
                      <td className="kt-datatable__cell" />
                      <td className="kt-datatable__cell" />
                      <td className="kt-datatable__cell">
                        {tableMaskMoney(items.reduce((acc, curr) => acc + curr.value, 0))}
                      </td>
                      <td className="kt-datatable__cell">
                        {tableMaskMoney(items.reduce((acc, curr) => acc + curr.fineValue, 0))}
                      </td>
                      <td className="kt-datatable__cell">
                        {tableMaskMoney(items.reduce((acc, curr) => acc + curr.interestValue, 0))}
                      </td>
                      <td className="kt-datatable__cell">
                        {tableMaskMoney(items.reduce((acc, curr) => acc + curr.total, 0))}
                      </td>
                      <td className="kt-datatable__cell" />
                      <td className="kt-datatable__cell" />
                      <td className="kt-datatable__cell" />
                      <td className="kt-datatable__cell" />
                    </tr>
                  </tfoot>
                )}
              </table>

              {items.length === 0 && (
                <div className="kt-datatable--error">Nenhum item foi encontrado.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
