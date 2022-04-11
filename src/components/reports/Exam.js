import React, { useState } from 'react'
import { startOfDay, endOfDay } from 'date-fns'
import { useDebounce } from 'core/hooks/debounce'
import { Field } from 'core/components/form/field'
import { TextInput } from 'core/components/form/text-input'
import { DateInput } from 'core/components/form/date-input'
import { Button } from 'core/components/button'
import { LoadingCard } from 'core/components/loading-card'
import { iframeDownload, isEqual, classNames } from 'core/helpers/misc'
import { maskCpfCnpj } from 'core/helpers/mask'
import { toLocaleDate } from 'core/helpers/date'
import { CpfMask } from 'core/constants'
import { AsyncSelect } from 'core/components/form/async-select'

export const Exam = ({ global, service }) => {
  const [items, setItems] = useState([])

  const initialFilters = {
    cpfCnpj: '',
    name: '',
    healthProfessionalId: '',
    minDueDate: null,
    maxDueDate: null,
  }

  const [filters, setFilters] = useState({
    cpfCnpj: '',
    name: '',
    healthProfessionalId: '',
    minDueDate: null,
    maxDueDate: null,
  })

  const dbFilters = useDebounce(filters, 300)
  const [fetching, setFetching] = useState(false)

  return (
    <>
      <div className="kt-portlet kt-portlet--mobile">
        <div className="kt-portlet__head kt-portlet__head--lg">
          <div className="kt-portlet__head-label">
            <span className="kt-portlet__head-icon">
              <i className="kt-font-brand fas fa-microscope" />
            </span>
            <h3 className="kt-portlet__head-title">Exames</h3>
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
                        .post('report.exams', { ...dbFilters, isPdf: true }, undefined, resp =>
                          resp.blob(),
                        )
                        .then(blob => iframeDownload(blob, 'exames.pdf'))
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
            <div className="col-lg">
              <Field label="CPF">
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
              <Field label="Nome do Paciente">
                <TextInput
                  ignoreBlur
                  type="search"
                  value={filters.name}
                  onChange={name => setFilters(prev => ({ ...prev, name }))}
                />
              </Field>
            </div>
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
                      .then(resp => resp.items)
                  }
                  selected={filters.healthProfessionalId}
                  onChange={professional =>
                    setFilters(prev => ({
                      ...prev,
                      healthProfessionalId: professional ? professional.id : '',
                    }))
                  }
                />
              </Field>
            </div>
          </div>
          <div className="row">
            <div className="col-lg">
              <Field label="Data Inicial de Atendimento">
                <DateInput
                  isClearable
                  customClassName="form-control-xl"
                  onChange={date =>
                    setFilters(prev => ({
                      ...prev,
                      minDueDate: date ? startOfDay(date) : null,
                    }))
                  }
                  value={filters.minDueDate}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Data Final de Atendimento">
                <DateInput
                  isClearable
                  customClassName="form-control-xl"
                  onChange={date =>
                    setFilters(prev => ({
                      ...prev,
                      maxDueDate: date ? endOfDay(date) : null,
                    }))
                  }
                  value={filters.maxDueDate}
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
                    if (isEqual(initialFilters, filters)) {
                      global.modal.alert('Selecione ao menos um filtro para a consulta!')
                    } else {
                      setFetching(true)
                      service
                        .post('report.exams', {
                          ...dbFilters,
                        })
                        .then(resp => {
                          setItems(resp.examsRequest)
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
                      <span>Exame</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span>Data Atendimento</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span>Atendimento</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span>CPF Paciente</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span>Paciente</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span>Profissional de Saúde</span>
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
                        <div>{i.examDescription}</div>
                      </td>
                      <td className="kt-datatable__cell">
                        <div>{toLocaleDate(i.createdAt)}</div>
                      </td>
                      <td className="kt-datatable__cell">
                        <div>{i.attendanceId}</div>
                      </td>
                      <td className="kt-datatable__cell">
                        <div>{maskCpfCnpj(i.patientCpfCnpj)}</div>
                      </td>
                      <td className="kt-datatable__cell">
                        <div>{i.patientName}</div>
                      </td>
                      <td className="kt-datatable__cell">
                        <div>{i.healthProfessionalName}</div>
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
