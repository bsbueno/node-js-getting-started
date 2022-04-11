import React, { useState } from 'react'
import { startOfDay, endOfDay } from 'date-fns'
import { useDebounce } from 'core/hooks/debounce'
import { Field } from 'core/components/form/field'
import { TextInput } from 'core/components/form/text-input'
import { DateInput } from 'core/components/form/date-input'
import { Button } from 'core/components/button'
import { LoadingCard } from 'core/components/loading-card'
import { iframeDownload, classNames } from 'core/helpers/misc'
import { maskCpfCnpj, applyMask } from 'core/helpers/mask'
import { toLocaleDate } from 'core/helpers/date'
import { AsyncSelect } from 'core/components/form/async-select'
import { CellPhoneMask, PhoneMask } from 'core/constants'
import { Select } from 'core/components/form/select'

const contractTypes = [
  { id: 0, name: 'Todos' },
  { id: 1, name: 'Ativados' },
  { id: 2, name: 'Cancelados' },
]

export const Contract = ({ global, service }) => {
  const [items, setItems] = useState([])

  const [filters, setFilters] = useState({
    id: '',
    cpfCnpj: '',
    name: '',
    sellerId: '',
    paymentMethodId: '',
    planId: '',
    type: 0,
    minDate: null,
    maxDate: null,
  })

  const dbFilters = useDebounce(filters, 300)
  const [fetching, setFetching] = useState(false)

  return (
    <>
      <div className="kt-portlet kt-portlet--mobile">
        <div className="kt-portlet__head kt-portlet__head--lg">
          <div className="kt-portlet__head-label">
            <span className="kt-portlet__head-icon">
              <i className="kt-font-brand fas fa-file-contract" />
            </span>
            <h3 className="kt-portlet__head-title">Contratos</h3>
          </div>
          <div className="kt-portlet__head-toolbar">
            <div className="kt-portlet__head-wrapper">
              <div className="dropdown dropdown-inline">
                <Button
                  icon="fas fa-file-pdf"
                  customClassName="btn-info btn-icon-sm"
                  title="Baixar em PDF"
                  onClick={() => {
                    setFetching(true)
                    service
                      .post('report.contracts', { ...dbFilters, isPdf: true }, undefined, resp =>
                        resp.blob(),
                      )
                      .then(blob => iframeDownload(blob, 'contratos.pdf'))
                      .catch(err => global.modal.alert(err.message))
                      .finally(() => setFetching(false))
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="kt-portlet__body kt-pb-0 position-relative">
          <div className="row">
            <div className="col-lg">
              <Field label="CPF/CNPJ">
                <TextInput
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
                  isClearable
                  ignoreBlur
                  type="search"
                  value={filters.name}
                  onChange={name => setFilters(prev => ({ ...prev, name }))}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Nº do Contrato">
                <TextInput
                  isClearable
                  ignoreBlur
                  type="search"
                  value={filters.id}
                  onChange={id => setFilters(prev => ({ ...prev, id }))}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Data Inicial do Contrato">
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
              <Field label="Data Final do Contrato">
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
          </div>
          <div className="row">
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
                  onChange={paymentMethod => {
                    setFilters(prev => ({
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
                      .then(resp => resp.items)
                  }
                  selected={filters.planId}
                  onChange={plan => {
                    setFilters(prev => ({
                      ...prev,
                      planId: plan ? plan.id : '',
                    }))
                  }}
                />
              </Field>
            </div>

            <div className="col-lg-3">
              <Field label="Tipo">
                <Select
                  items={contractTypes}
                  selected={filters.type}
                  getId={({ id }) => id}
                  getDisplay={({ name }) => name}
                  onChange={({ id }) =>
                    setFilters(prev => ({
                      ...prev,
                      type: id,
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
                  icon="fas fa-search"
                  customClassName="btn-info btn-icon-sm"
                  title="Consultar"
                  onClick={() => {
                    setFetching(true)
                    service
                      .post('report.contracts', {
                        ...dbFilters,
                      })
                      .then(setItems)
                      .catch(err => global.modal.alert(err.message))
                      .finally(() => setFetching(false))
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
                      <span>Aderente</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span>CPF/CNPJ</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span>Telefone</span>
                    </th>
                    <th className="kt-datatable__cell no-width no-wrap">
                      <span>Data do Contrato</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span>Vendedor</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span>Plano</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span>Opção Pagamento</span>
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
                        <div>{i.patientName}</div>
                      </td>
                      <td className="kt-datatable__cell">
                        <div>{maskCpfCnpj(i.patientCpfCnpj)}</div>
                      </td>
                      <td className="kt-datatable__cell">
                        <div>
                          {i.patientPhone.length > 10
                            ? applyMask(CellPhoneMask, i.patientPhone)
                            : applyMask(PhoneMask, i.patientPhone)}
                        </div>
                      </td>
                      <td className="kt-datatable__cell kt-align-center">
                        <div>{toLocaleDate(i.createdAt)}</div>
                      </td>
                      <td className="kt-datatable__cell">
                        <div>{i.sellerName}</div>
                      </td>
                      <td className="kt-datatable__cell">
                        <div>{i.planTitle}</div>
                      </td>
                      <td className="kt-datatable__cell">
                        <div>{i.paymentMethodDescription}</div>
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
