import React, { useState } from 'react'
import { Field } from 'core/components/form/field'
import { ErrorMessage } from 'core/components/form/error-message'
import { TextInput } from 'core/components/form/text-input'
import { Button } from 'core/components/button'
import { classNames } from 'core/helpers/misc'
import { Transition } from 'react-transition-group'
import { useFilters } from 'core/hooks/filter'
import { CpfMask } from 'core/constants'
import { AsyncSelect } from 'core/components/form/async-select'
import { DateInput } from 'core/components/form/date-input'
import { startOfDay } from 'date-fns'
import endOfDay from 'date-fns/endOfDay'
import { onlyNumbers } from 'core/helpers/format'
import { toLocaleDate } from 'core/helpers/date'
import { ModalPortal } from '../../core/components/modal'

export const AttendanceModal = ({ service, show, onClose, onSelect }) => {
  const [items, setItems] = useState([])
  const { values, setValues, filters } = useFilters(
    { cpfCnpj: '', patientName: '', healthProfessionalId: '', minDate: null, maxDate: null },
    query => [
      {
        items: [
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
          query.minDate
            ? {
                name: 'Attendance.createdAt',
                value: query.minDate,
                comparer: 'GreaterThanOrEqual',
              }
            : {},
          query.maxDate
            ? {
                name: 'Attendance.createdAt',
                value: query.maxDate,
                comparer: 'LessThanOrEqual',
              }
            : {},
          {
            name: 'Attendance.billedAt',
            value: null,
            comparer: 'Equals',
          },
          {
            name: 'Attendance.status',
            value: 2,
            comparer: 'Equals',
          },
        ],
      },
    ],
  )

  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState(null)

  return (
    <ModalPortal>
      <Transition in={show} timeout={300}>
        {status => (
          <>
            <div
              className={classNames('modal fade', { show: status === 'entered' })}
              style={{ display: status === 'exited' ? 'none' : 'block' }}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
            >
              <div role="document" className="modal-dialog modal-dialog-centered modal-xl">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Atendimentos</h5>

                    <Button
                      type="button"
                      className="close"
                      aria-label="close"
                      data-dismiss="modal"
                      onClick={onClose}
                    />
                  </div>

                  <div className="modal-body">
                    {fetching ? (
                      <div className="spinner">
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        />
                        <span>Carregando...</span>
                      </div>
                    ) : (
                      <>
                        <div className="row">
                          <div className="col-lg">
                            <Field label="CPF">
                              <TextInput
                                mask={CpfMask}
                                ignoreBlur
                                type="search"
                                value={values.cpfCnpj}
                                onChange={cpfCnpj => setValues(prev => ({ ...prev, cpfCnpj }))}
                              />
                            </Field>
                          </div>
                          <div className="col-lg">
                            <Field label="Nome do Paciente">
                              <TextInput
                                ignoreBlur
                                type="search"
                                value={values.patientName}
                                onChange={patientName =>
                                  setValues(prev => ({ ...prev, patientName }))
                                }
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
                                    .then(({ items: professionals }) => professionals)
                                }
                                selected={values.healthProfessionalId}
                                onChange={professional =>
                                  setValues(prev => ({
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
                            <Field label="Data Inicial do Atendimento">
                              <DateInput
                                isClearable
                                customClassName="form-control-xl"
                                onChange={date =>
                                  setValues(prev => ({
                                    ...prev,
                                    minDate: date ? startOfDay(date) : date,
                                  }))
                                }
                                value={values.minDate}
                              />
                            </Field>
                          </div>
                          <div className="col-lg">
                            <Field label="Data Final do Atendimento">
                              <DateInput
                                isClearable
                                customClassName="form-control-xl"
                                onChange={date =>
                                  setValues(prev => ({
                                    ...prev,
                                    maxDate: date ? endOfDay(date) : date,
                                  }))
                                }
                                value={values.maxDate}
                              />
                            </Field>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-lg kt-align-right">
                            <Button
                              icon="fas fa-search"
                              customClassName="btn-info btn-icon-sm margin-left-5"
                              title="Consultar"
                              onClick={() => {
                                if (
                                  !values.minDate &&
                                  !values.maxDate &&
                                  !values.healthProfessionalId &&
                                  !values.cpfCnpj &&
                                  !values.patientName
                                ) {
                                  setError(
                                    'Para busca de atendimentos, informe ao menos um filtro.',
                                  )
                                } else {
                                  setError(null)
                                  setFetching(true)
                                  service
                                    .getList('attendance', {
                                      usePager: false,
                                      filters,
                                      sort: [['createdAt', 'DESC']],
                                    })
                                    .then(resp => setItems(resp.items))
                                    .catch(err => setError(err.message))
                                    .finally(() => setFetching(false))
                                }
                              }}
                            />
                          </div>
                        </div>
                        <div className="kt-portlet__body kt-portlet__body--fit">
                          <div
                            className={classNames(
                              'report-irregular kt-datatable kt-datatable--default kt-datatable--brand',
                              {
                                'kt-datatable--loaded': items.length > 0,
                              },
                            )}
                          >
                            <table className="kt-datatable__table">
                              <thead className="kt-datatable__head">
                                <tr className="kt-datatable__row">
                                  <th className="kt-datatable__cell">
                                    <span>Data</span>
                                  </th>
                                  <th className="kt-datatable__cell">
                                    <span>Inicio</span>
                                  </th>
                                  <th className="kt-datatable__cell">
                                    <span>Fim</span>
                                  </th>
                                  <th className="kt-datatable__cell">
                                    <span>Paciente</span>
                                  </th>
                                  <th className="kt-datatable__cell">
                                    <span>CPF/CNPJ</span>
                                  </th>
                                  <th className="kt-datatable__cell">
                                    <span>Profissional</span>
                                  </th>
                                  <th className="kt-datatable__cell">
                                    <span>Opções</span>
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="kt-datatable__body">
                                {items.map((attendance, i) => (
                                  <tr key={i} className="kt-datatable__row">
                                    <td className="kt-datatable__cell">
                                      <div>{toLocaleDate(attendance.createdAt)}</div>
                                    </td>
                                    <td className="kt-datatable__cell">
                                      <div>{attendance.start}</div>
                                    </td>
                                    <td className="kt-datatable__cell">
                                      <div>{attendance.end}</div>
                                    </td>
                                    <td className="kt-datatable__cell">
                                      <div>{attendance.patientName}</div>
                                    </td>
                                    <td className="kt-datatable__cell">
                                      <div>{attendance.patientCpfCnpj}</div>
                                    </td>
                                    <td className="kt-datatable__cell">
                                      <div>{attendance.healthProfessionalName}</div>
                                    </td>
                                    <td className="kt-datatable__cell">
                                      <Button
                                        icon="fas fa-hand-holding-medical"
                                        customClassName="btn-info"
                                        onClick={() =>
                                          service
                                            .getById('attendance', attendance.id)
                                            .then(resp => onSelect(resp))
                                            .catch(err => setError(err.message))
                                        }
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {items.length === 0 && (
                              <div className="kt-datatable--error">
                                Nenhum atendimento foi encontrado.
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                    <ErrorMessage error={error} />
                  </div>

                  <div className="modal-footer">
                    <Button
                      type="button"
                      customClassName="btn-secondary"
                      icon="fas fa-arrow-left"
                      title="Voltar"
                      onClick={onClose}
                    />
                  </div>
                </div>
              </div>
            </div>

            {status !== 'exited' && (
              <div
                className={classNames('modal-backdrop fade', {
                  show: status === 'entered',
                })}
              />
            )}
          </>
        )}
      </Transition>
    </ModalPortal>
  )
}
