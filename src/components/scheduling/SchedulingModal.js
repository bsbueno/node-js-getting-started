import React, { useEffect, useState } from 'react'
import { useForm } from 'core/hooks/form'
import { Field } from 'core/components/form/field'
import { ErrorMessage } from 'core/components/form/error-message'
import {
  TypeSchedulingDescription,
  SchedulingStatusDescription,
  CpfMask,
  CellPhoneMask,
  TypeScheduling,
  DateMask,
} from 'core/constants'
import { AsyncSelect } from 'core/components/form/async-select'
import { Select } from 'core/components/form/select'
import { ReadOnlyInput } from 'core/components/form/readonly-input'
import { useFilters } from 'core/hooks/filter'
import { useDebounce } from 'core/hooks/debounce'
import { TextInput } from 'core/components/form/text-input'
import { Button } from 'core/components/button'
import { LoadingCard } from 'core/components/loading-card'
import { classNames } from 'core/helpers/misc'
import { maskCpfCnpj } from 'core/helpers/mask'
import { toLocaleDate } from 'core/helpers/date'
import { Transition } from 'react-transition-group'
import { Link } from 'core/components/route'
import { WarningMessage } from 'core/components/form/warning-message'
import { Switch } from 'core/components/form/switch'
import { onlyNumbers } from 'core/helpers/format'
import { getDay } from 'date-fns'
import { DateInput } from 'core/components/form/date-input'
import { TextAreaInput } from 'core/components/form/textarea-input'
import { ModalPortal } from '../../core/components/modal'

const RenderPatient = ({ form, service, basename, setAttendanceWithoutPatient }) => {
  const { setValues: setValuesForm, entity } = form
  const [items, setItems] = useState([])
  const {
    values,
    setValues: patientSearch,
    filters,
  } = useFilters(
    {
      cpfCnpj: '',
      name: '',
    },
    query => [
      {
        items: [
          { name: 'cpfCnpj', value: onlyNumbers(query.cpfCnpj), comparer: 'Like' },
          { name: 'name', value: `%${query.name}%`, comparer: 'iLike' },
        ],
      },
    ],
  )

  const patientFilters = useDebounce(filters, 300)
  const [fetching, setFetching] = useState(false)

  return (
    <>
      <div className="row">
        <div className="col-lg-2">
          <Switch
            id="justContact"
            className="button-add"
            label="Apenas contato"
            checked={entity.justContact}
            onChange={justContact => {
              setAttendanceWithoutPatient(false)
              form.setErrors({ global: null })
              setValuesForm(prev => ({
                ...prev,
                justContact,
              }))
            }}
          />
        </div>
      </div>
      <br />
      {!entity.justContact && (
        <>
          <div className="row">
            <div className="col-lg">
              <Field label="CPF/CNPJ">
                <TextInput
                  mask={CpfMask}
                  ignoreBlur
                  type="search"
                  value={values.cpfCnpj}
                  onChange={cpfCnpj => patientSearch(prev => ({ ...prev, cpfCnpj }))}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Nome do Paciente">
                <TextInput
                  ignoreBlur
                  type="search"
                  value={values.name}
                  onChange={name => patientSearch(prev => ({ ...prev, name }))}
                />
              </Field>
            </div>
          </div>
          <div className="row">
            <div className="col-lg kt-align-right">
              <Link
                className="btn btn-success btn-icon-sm"
                to={`${basename}/clientes/cadastro`}
                routeParams={{
                  routeReturn: 'scheduling',
                  params: {
                    healthProfessionalId: entity.healthProfessionalId,
                    healthProfessionalName: entity.healthProfessionalName,
                    createdAt: entity.createdAt,
                    start: entity.start,
                    end: entity.end,
                    schedulingId: form.hasId ? entity.id : null,
                  },
                }}
              >
                <i className="fas fa-plus" /> Novo Paciente
              </Link>
              <Button
                icon="fas fa-search"
                customClassName="btn-info btn-icon-sm margin-left-5"
                title="Consultar"
                onClick={() => {
                  if (values.cpfCnpj === '' && values.name === '') {
                    form.setErrors({
                      global:
                        'Para busca de pacientes, informe ao menos CPF/CNPJ ou Nome do Paciente',
                    })
                  } else {
                    setAttendanceWithoutPatient(false)
                    form.setErrors({ global: null })
                    setValuesForm(prev => ({
                      ...prev,
                      patientId: null,
                    }))
                    setFetching(true)
                    service
                      .getList('patient', {
                        usePager: false,
                        filters: patientFilters,
                      })
                      .then(resp => setItems(resp.items))
                      .catch(err => form.setErrors({ global: err.message }))
                      .finally(() => setFetching(false))
                  }
                }}
              />
            </div>
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
                        <span>CPF Paciente/Responsável</span>
                      </th>
                      <th className="kt-datatable__cell">
                        <span>Nome do Paciente</span>
                      </th>
                      <th className="kt-datatable__cell">
                        <span>Plano</span>
                      </th>
                      <th className="kt-datatable__cell">
                        <span>Menor</span>
                      </th>
                      <th className="kt-datatable__cell">
                        <span> </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="kt-datatable__body">
                    {items.map(i => (
                      <tr key={i.id} className="kt-datatable__row">
                        <td className="kt-datatable__cell">
                          <div>{maskCpfCnpj(i.cpfCnpj)}</div>
                        </td>
                        <td className="kt-datatable__cell">
                          <div>{i.name}</div>
                        </td>
                        <td className="kt-datatable__cell">
                          <div>{i.planTitle}</div>
                        </td>
                        <td className="kt-datatable__cell">
                          <div>{i.minor ? 'Sim' : 'Não'}</div>
                        </td>
                        <td className="kt-datatable__cell">
                          <Button
                            icon="fas fa-calendar-alt"
                            customClassName="btn-info btn-icon-sm"
                            title=""
                            onClick={() => {
                              form.setErrors({ global: null })
                              setValuesForm(prev => ({
                                ...prev,
                                patientName: i.name,
                                patientId: i.id,
                                contactPhone: i.contactPhone || i.patientPhone,
                                view: 'Scheduling',
                                type: TypeScheduling.ATTENDANCE,
                              }))
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {items.length === 0 && (
                  <div className="kt-datatable--error">Nenhum item foi encontrado.</div>
                )}
              </div>
            </div>
          )}
        </>
      )}
      {entity.justContact && (
        <>
          <div className="row">
            <div className="col-lg">
              <Field label="Nome do Paciente">
                <TextInput
                  value={entity.contactName || ''}
                  onChange={contactName =>
                    setValuesForm(prev => ({
                      ...prev,
                      contactName,
                    }))
                  }
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Telefone de contato">
                <TextInput
                  type="tel"
                  icon="fas fa-phone"
                  mask={CellPhoneMask}
                  value={entity.contactPhone || ''}
                  onChange={contactPhone =>
                    setValuesForm(prev => ({
                      ...prev,
                      contactPhone,
                    }))
                  }
                />
              </Field>
            </div>
            <div className="col-lg-1">
              <Button
                icon="fas fa-calendar-alt"
                customClassName="btn-info btn-icon-sm button-add"
                title=""
                onClick={() => {
                  form.setErrors({
                    global: null,
                  })
                  if (!entity.contactName) {
                    form.setErrors({
                      global: 'Nome do paciente é obrigatório.',
                    })
                  } else if (!entity.contactPhone) {
                    form.setErrors({
                      global: 'Telefone de contato é obrigatório.',
                    })
                  } else {
                    setValuesForm(prev => ({
                      ...prev,
                      view: 'Scheduling',
                      type: TypeScheduling.ATTENDANCE,
                    }))
                  }
                }}
              />
            </div>
          </div>
        </>
      )}
    </>
  )
}

const RenderScheduling = ({ form, service, startHourlies, endHourlies }) => {
  const { entity, errors, touched } = form
  const [startHourSelected, setStartHourSelected] = useState(0)
  const [endHourSelected, setEndHourSelected] = useState(0)
  const [hoursStart, setHoursStart] = useState([])
  const [hoursEnd, setHoursEnd] = useState([])

  useEffect(() => {
    setHoursStart([])
    for (let index = 0; index < startHourlies.length; index += 1) {
      const element = startHourlies[index]
      setHoursStart(prev => [...prev, { id: index, name: element }])
    }
    // eslint-disable-next-line
  }, [startHourlies])

  useEffect(() => {
    setHoursEnd([])
    for (let index = 0; index < endHourlies.length; index += 1) {
      const element = endHourlies[index]
      setHoursEnd(prev => [...prev, { id: index, name: element }])
    }
    // eslint-disable-next-line
  }, [endHourlies])

  useEffect(() => {
    const optionTimeIndex = startHourlies.indexOf(entity.start)
    setStartHourSelected(optionTimeIndex)
    // eslint-disable-next-line
  }, [entity.start])

  useEffect(() => {
    const optionTimeIndex = endHourlies.indexOf(entity.end)
    setEndHourSelected(optionTimeIndex)
    // eslint-disable-next-line
  }, [entity.end])

  return (
    <>
      <div className="row">
        <div className="col-lg">
          <Field label="Profissional de Saude">
            <ReadOnlyInput
              customClassName="form-control-xl"
              value={entity.healthProfessionalName}
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Paciente">
            <ReadOnlyInput
              customClassName="form-control-xl"
              value={entity.patientId !== null ? entity.patientName : entity.contactName}
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Telefone">
            <TextInput
              type="tel"
              icon="fas fa-phone"
              mask={CellPhoneMask}
              value={entity.contactPhone}
              customClassName="form-control-xl"
              onChange={(contactPhone, type) =>
                form.handleChange({
                  path: 'contactPhone',
                  type,
                  values: { contactPhone },
                })
              }
            />
          </Field>
        </div>
      </div>
      <div className="row">
        <div className="col-lg">
          <Field label="Data">
            <DateInput
              customClassName="form-control-xl"
              mask={DateMask}
              onChange={createdAt => {
                form.handleChange({
                  path: 'createdAt',
                  values: prev => ({
                    ...prev,
                    createdAt,
                  }),
                })
              }}
              value={entity.createdAt || null}
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Hora início">
            <Select
              items={hoursStart}
              placement="bottom"
              selected={startHourSelected}
              getId={({ id }) => id}
              getDisplay={({ name }) => name}
              onChange={start => {
                form.handleChange({
                  path: 'start',
                  values: prev => ({
                    ...prev,
                    start: start.name,
                    end: endHourlies[start.id],
                  }),
                })
              }}
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Hora fim">
            {form.hasId && <ReadOnlyInput customClassName="form-control-xl" value={entity.end} />}
            {!form.hasId && (
              <Select
                items={hoursEnd}
                placement="bottom"
                selected={endHourSelected}
                getId={({ id }) => id}
                getDisplay={({ name }) => name}
                onChange={end => {
                  form.handleChange({
                    path: 'end',
                    values: prev => ({
                      ...prev,
                      end: end.name,
                    }),
                  })
                }}
              />
            )}
          </Field>
        </div>
      </div>
      <div className="row">
        <div className="col-lg">
          <Field label="Sala de Atendimento">
            <AsyncSelect
              meta={{
                error: errors.attendanceRoomId,
                touched: touched.attendanceRoomId,
              }}
              placement="top"
              isClearable
              getId={({ id }) => id}
              getDisplay={({ description }) => description}
              getItems={value =>
                service
                  .getList('attendanceroom', {
                    usePager: false,
                    filters: [
                      {
                        items: [
                          {
                            name: 'description',
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
              selected={entity.attendanceRoomId}
              onChange={(attendanceroom, type) =>
                form.handleChange({
                  path: 'attendanceroom',
                  type,
                  values: prev => ({
                    ...prev,
                    attendanceRoomId: attendanceroom ? attendanceroom.id : null,
                  }),
                })
              }
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Tipo">
            <Select
              meta={{
                error: errors.type,
                touched: touched.type,
              }}
              placement="top"
              items={TypeSchedulingDescription}
              selected={entity.type}
              getId={({ id }) => id}
              getDisplay={({ name }) => name}
              onChange={type => {
                if (type.id === TypeScheduling.RETURN && entity.patientId === null) {
                  form.setErrors({
                    global: 'Para selecionar RETORNO é preciso informar um paciente cadastrado!',
                  })
                } else {
                  form.setErrors({ global: null })
                  form.handleChange({
                    path: 'type',
                    values: prev => ({
                      ...prev,
                      type: type.id,
                      view: type.id === TypeScheduling.RETURN ? 'AttendanceReturn' : 'Scheduling',
                    }),
                  })
                }
              }}
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Status">
            <Select
              meta={{
                error: errors.status,
                touched: touched.status,
              }}
              placement="top"
              items={SchedulingStatusDescription}
              selected={entity.status}
              getId={({ id }) => id}
              getDisplay={({ name }) => name}
              onChange={status => {
                form.handleChange({
                  path: 'status',
                  values: prev => ({
                    ...prev,
                    status: status.id,
                  }),
                })
              }}
            />
          </Field>
        </div>
      </div>
      {entity.type === TypeScheduling.RETURN && (
        <>
          <br />
          <div className="row">
            <div className="col-lg">
              <p className="table-label">Solicitação de Retorno</p>
            </div>
          </div>
          <div className="kt-portlet__body kt-portlet__body--fit">
            <div
              className={classNames(
                'report-irregular kt-datatable kt-datatable--default kt-datatable--brand kt-datatable--loaded',
              )}
            >
              <table className="kt-datatable__table">
                <thead className="kt-datatable__head">
                  <tr className="kt-datatable__row">
                    <th className="kt-datatable__cell">
                      <span>#</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span>Data do Atendimento</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span>Profissional de Saúde</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span> </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="kt-datatable__body">
                  {entity.attendanceReturnId !== null && (
                    <tr key={entity.attendanceReturnId} className="kt-datatable__row">
                      <td className="kt-datatable__cell">
                        <div>{entity.attendanceReturnId}</div>
                      </td>
                      <td className="kt-datatable__cell">
                        <div>{entity.attendanceReturnCreatedAt}</div>
                      </td>
                      <td className="kt-datatable__cell">
                        <div>{entity.attendanceReturnProfessionalName}</div>
                      </td>
                      <td className="kt-datatable__cell">
                        <Button
                          icon="fas fa-trash"
                          customClassName="btn-danger btn-icon-sm"
                          title=""
                          onClick={() => {
                            form.setValues({
                              attendanceReturnId: null,
                              attendanceReturnCreatedAt: '',
                              attendanceReturnProfessionalName: '',
                            })
                          }}
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {entity.attendanceReturnId === null && (
                <div className="kt-datatable--error">Nenhum retorno selecionado.</div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}

const RenderReturn = ({ form, attendances, fetchingAttendances }) => (
  <>
    {fetchingAttendances ? (
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
              'kt-datatable--loaded': !fetchingAttendances || attendances.length > 0,
              'table-loading': fetchingAttendances,
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
                  <span>Data do Atendimento</span>
                </th>
                <th className="kt-datatable__cell">
                  <span>Profissional de Saúde</span>
                </th>
                <th className="kt-datatable__cell">
                  <span> </span>
                </th>
              </tr>
            </thead>
            <tbody className="kt-datatable__body">
              {attendances.map(i => (
                <tr key={i.id} className="kt-datatable__row">
                  <td className="kt-datatable__cell">
                    <div>{i.id}</div>
                  </td>
                  <td className="kt-datatable__cell">
                    <div>{toLocaleDate(i.createdAt)}</div>
                  </td>
                  <td className="kt-datatable__cell">
                    <div>{i.healthProfessionalName}</div>
                  </td>
                  <td className="kt-datatable__cell">
                    <Button
                      icon="fas fa-calendar-alt"
                      customClassName="btn-info btn-icon-sm"
                      title=""
                      onClick={() => {
                        form.setValues({
                          attendanceReturnId: i.id,
                          attendanceReturnCreatedAt: toLocaleDate(i.createdAt),
                          attendanceReturnProfessionalName: i.healthProfessionalName,
                          view: 'Scheduling',
                        })
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {attendances.length === 0 && (
            <div className="kt-datatable--error">Nenhum item foi encontrado.</div>
          )}
        </div>
      </div>
    )}
  </>
)

export const SchedulingModal = ({
  route,
  service,
  id,
  show,
  dateSelected,
  timeStartSelected,
  timeEndSelected,
  healthProfessionalNameSelected,
  healthProfessionalIdSelected,
  basename,
  global,
  activeTimes,
}) => {
  const [attendanceId, setAttendanceId] = useState(0)
  const [paramsRoute, setParamsRoute] = useState({})
  const [patientOverdue, setPatientOverdue] = useState(0)
  const [attendanceWithoutPatient, setAttendanceWithoutPatient] = useState(false)
  const [attendances, setAttendances] = useState([])
  const [fetchingAttendances, setFetchingAttendances] = useState(false)
  const [activeTimesWeek, setActiveTimesWeek] = useState(activeTimes)
  const [startHourlies, setStartHourlies] = useState([])
  const [endHourlies, setEndHourlies] = useState([])
  const form = useForm(
    {
      displayName: ent => ent.id,
      initialEntity: {
        id: 0,
        healthProfessionalId: 0,
        healthProfessionalName: '',
        patientId: null,
        patientName: '',
        createdAt: '',
        start: '',
        end: '',
        attendanceRoomId: null,
        type: TypeScheduling.ATTENDANCE,
        status: 1,
        view: 'Patients',
        contactName: null,
        contactPhone: null,
        justContact: false,
        patientPhone: '',
        attendanceReturnId: null,
        attendanceReturnCreatedAt: '',
        attendanceReturnProfessionalName: '',
        observation: '',
        relatedScheduling: null,
      },
      validate: values => {
        const errors = {}
        if (values.type === TypeScheduling.RETURN && values.attendanceReturnId === null)
          errors.global =
            'Para agendamento de RETORNO é necessário selecionar uma solicitação de retorno.'
        if (values.start === '') errors.global = 'A Hora de início é obrigatória.'
        if (patientOverdue > 30 && !values.disabledAt)
          errors.global = 'Atraso de débitos é maior que 30 dias.'

        return errors
      },
    },
    route,
  )

  const { entity, errors } = form
  const { state } = route.location

  useEffect(() => {
    if (state) {
      form.setValues(prev => ({
        ...prev,
        ...state,
      }))
      if (state.patientId) {
        form.setValues(prev => ({
          ...prev,
          view: 'Scheduling',
        }))
      }
      setParamsRoute(state)
    }
    // eslint-disable-next-line
  }, [state])

  useEffect(() => {
    if (entity.justContact) {
      form.setValues(prev => ({
        ...prev,
        patientId: null,
        patientName: '',
      }))
    } else {
      form.setValues(prev => ({
        ...prev,
        contactName: null,
        contactPhone: null,
      }))
    }
    // eslint-disable-next-line
  }, [entity.justContact])

  useEffect(() => {
    if (form.hasId) {
      form.handleFetch({
        action: (key, ac) => service.getById('scheduling', key, ac.signal),
        errorFn: err => form.setErrors({ global: err.message }),
        mapper: s => ({
          ...s,
          patientName: s.patient !== null ? s.patient.name : '',
          justContact: s.patientId === null,
          attendanceReturnCreatedAt: toLocaleDate(s.attendanceReturnCreatedAt),
          view: 'Scheduling',
        }),
      })
    }
    // eslint-disable-next-line
  }, [id, route])

  useEffect(() => {
    if (entity.id !== 0) {
      service
        .post('scheduling.attendance', {
          id: entity.relatedScheduling !== null ? entity.relatedScheduling : entity.id,
        })
        .then(res => {
          if (res) {
            setAttendanceId(res.id)
          } else {
            setAttendanceId(0)
          }
        })
        .catch(() => setAttendanceId(0))
    }
    // eslint-disable-next-line
  }, [entity.id])

  useEffect(() => {
    if (entity.patientId !== null) {
      service.post('patient.overdue', { id: entity.patientId }).then(res => {
        setPatientOverdue(res.overdue)
      })
    }
    // eslint-disable-next-line
  }, [entity.patientId])

  useEffect(() => {
    if (!state) {
      form.resetForm()
      form.setValues(prev => ({
        ...prev,
        healthProfessionalId: healthProfessionalIdSelected,
        healthProfessionalName: healthProfessionalNameSelected,
        createdAt: dateSelected,
        start: timeStartSelected,
        end: timeEndSelected,
      }))
    }

    // eslint-disable-next-line
  }, [
    healthProfessionalIdSelected,
    healthProfessionalNameSelected,
    dateSelected,
    timeStartSelected,
    timeEndSelected,
  ])

  useEffect(() => {
    if (entity.type === TypeScheduling.RETURN && entity.patientId !== null) {
      setFetchingAttendances(true)
      service
        .getList('attendance', {
          usePager: false,
          filters: [
            {
              items: [
                {
                  name: 'Attendance.disabledAt',
                  comparer: 'Equals',
                  value: null,
                },
                {
                  name: 'returnDate',
                  comparer: 'NotEquals',
                  value: null,
                },
                {
                  name: 'returnDate',
                  comparer: 'GreaterThanOrEqual',
                  value: entity.createdAt,
                },
                {
                  name: 'schedulingReturnId',
                  comparer: 'Equals',
                  value: null,
                },
                {
                  name: 'Attendance.patientId',
                  comparer: 'Equals',
                  value: entity.patientId,
                },
              ],
            },
          ],
        })
        .then(({ items }) => setAttendances(items))
        .finally(setFetchingAttendances(false))
    }
    // eslint-disable-next-line
  }, [entity.type])

  useEffect(() => {
    setActiveTimesWeek(activeTimes)
  }, [activeTimes])

  useEffect(() => {
    if (entity.createdAt !== '') {
      const day = getDay(entity.createdAt)
      activeTimesWeek.forEach(schedule => {
        if (schedule.dayOfWeek === day) {
          setStartHourlies(schedule.hourlies)
          setEndHourlies(schedule.endHourlies)
        }
      })
    }
    // eslint-disable-next-line
  }, [entity.createdAt])

  useEffect(() => {
    if (entity.createdAt !== dateSelected) {
      form.setValues(prev => ({
        ...prev,
        start: startHourlies.lenght > 0 ? startHourlies[0] : '',
        end: endHourlies.lenght > 0 ? endHourlies[0] : '',
      }))
    }
    // eslint-disable-next-line
  }, [startHourlies])

  const resetForm = () => {
    const { healthProfessionalId, healthProfessionalName, createdAt, start, end } = entity
    form.resetForm()
    form.setValues(prev => ({
      ...prev,
      healthProfessionalId,
      healthProfessionalName,
      createdAt,
      start,
      end,
      type: TypeScheduling.ATTENDANCE,
    }))
    setAttendanceId(0)
    setPatientOverdue(0)
  }

  const onSubmit = () => {
    if (endHourlies.indexOf(entity.end) - startHourlies.indexOf(entity.start) < 0) {
      form.setErrors({ global: 'Hora fim não deve ser menor que Hora início' })
    } else if (endHourlies.indexOf(entity.end) - startHourlies.indexOf(entity.start) > 0) {
      let index = startHourlies.indexOf(entity.start)
      const hoursSelected = []
      for (index; index <= endHourlies.indexOf(entity.end); index += 1) {
        hoursSelected.push({ start: startHourlies[index], end: endHourlies[index] })
      }
      service
        .post('scheduling.checkavailabletime', {
          hoursSelected,
          createdAt: entity.createdAt,
          healthProfessionalId: entity.healthProfessionalId,
          id: entity.id,
        })
        .then(() => {
          const firstHour = startHourlies.indexOf(entity.start)
          form.handleSubmit(data =>
            service
              .addOrUpdate('scheduling', {
                ...data,
                start: startHourlies[firstHour],
                end: endHourlies[firstHour],
              })
              .then(async res => {
                const firstScheduling = res.id
                for (let i = firstHour + 1; i <= endHourlies.indexOf(entity.end); i += 1) {
                  service.addOrUpdate('scheduling', {
                    ...data,
                    start: startHourlies[i],
                    end: endHourlies[i],
                    relatedScheduling: firstScheduling,
                  })
                }
                form.setSubmitting(false)
                resetForm()
                route.history.push(`${basename}/agendamento`, paramsRoute)
              })
              .catch(err => form.setErrors({ global: err.message })),
          )
        })
        .catch(err => form.setErrors({ global: err.message }))
    } else {
      form.handleSubmit(data =>
        service
          .addOrUpdate('scheduling', data)
          .then(() => {
            form.setSubmitting(false)
            resetForm()
            route.history.push(`${basename}/agendamento`, paramsRoute)
          })
          .catch(err => form.setErrors({ global: err.message })),
      )
    }
  }

  useEffect(() => {
    if (entity.disabledAt) {
      onSubmit()
    }
    // eslint-disable-next-line
  }, [entity.disabledAt])

  return (
    <ModalPortal>
      <Transition in={show} timeout={300}>
        {status => (
          <>
            <div
              className={classNames('modal fade', {
                show: status === 'entered',
              })}
              style={{
                display: status === 'exited' ? 'none' : 'block',
              }}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
            >
              <div role="document" className="modal-dialog modal-dialog-centered modal-xl">
                <div className="modal-content">
                  <form
                    onSubmit={ev => {
                      ev.preventDefault()
                      onSubmit()
                    }}
                  >
                    <div className="modal-header">
                      <h5 className="modal-title">
                        {form.displayName
                          ? `Editar Agendamento ${form.displayName}`
                          : 'Novo Agendamento'}
                      </h5>

                      <Button
                        type="button"
                        className="close"
                        aria-label="close"
                        data-dismiss="modal"
                        onClick={() => {
                          resetForm()
                          route.history.push(`${basename}/agendamento`)
                        }}
                      />
                    </div>
                    <div className="modal-body">
                      {form.fetching ? (
                        <div className="spinner">
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          />
                          <span>Carregando...</span>
                        </div>
                      ) : (
                        <div className="kt-portlet__body">
                          <ul className="nav nav-tabs kt-mb-0" role="tablist">
                            <li className="nav-item">
                              <button
                                className={classNames('nav-link', {
                                  active: entity.view === 'Patients',
                                })}
                                onClick={() =>
                                  form.setValues({
                                    view: 'Patients',
                                  })
                                }
                                type="button"
                              >
                                <span className="btn kt-padding-0">Paciente</span>
                              </button>
                            </li>
                            <li className="nav-item">
                              <button
                                className={classNames('nav-link', {
                                  active: entity.view === 'Scheduling',
                                  disabled:
                                    entity.patientId === null ||
                                    (entity.contactName === null && entity.contactPhone === null),
                                })}
                                onClick={() =>
                                  form.setValues({
                                    view: 'Scheduling',
                                  })
                                }
                                type="button"
                              >
                                <span className="btn kt-padding-0">Agendamento</span>
                              </button>
                            </li>
                            {entity.type === TypeScheduling.RETURN && (
                              <li className="nav-item">
                                <button
                                  className={classNames('nav-link', {
                                    active: entity.view === 'AttendanceReturn',
                                    disabled: entity.type !== TypeScheduling.RETURN,
                                  })}
                                  onClick={() =>
                                    form.setValues({
                                      view: 'AttendanceReturn',
                                    })
                                  }
                                  type="button"
                                >
                                  <span className="btn kt-padding-0">Solicitações de Retorno</span>
                                </button>
                              </li>
                            )}
                          </ul>
                          <div className="border border-top-0 rounded-bottom p-3">
                            {entity.view === 'Patients' && (
                              <RenderPatient
                                form={form}
                                service={service}
                                global={global}
                                basename={basename}
                                setAttendanceWithoutPatient={setAttendanceWithoutPatient}
                              />
                            )}
                            {entity.view === 'Scheduling' && (
                              <RenderScheduling
                                form={form}
                                service={service}
                                global={global}
                                startHourlies={startHourlies}
                                endHourlies={endHourlies}
                              />
                            )}
                            {entity.view === 'AttendanceReturn' && (
                              <RenderReturn
                                form={form}
                                attendances={attendances}
                                fetchingAttendances={fetchingAttendances}
                              />
                            )}
                          </div>
                          <br />
                          <div className="row">
                            <div className="col-lg">
                              <Field label="Observações">
                                <TextAreaInput
                                  rows={5}
                                  value={entity.observation || ''}
                                  onChange={(observation, type) =>
                                    form.handleChange({
                                      path: 'observation',
                                      type,
                                      values: prev => ({
                                        ...prev,
                                        observation,
                                      }),
                                    })
                                  }
                                  maxLenght={500}
                                />
                              </Field>
                            </div>
                          </div>
                          <br />
                          {patientOverdue > 0 && (
                            <>
                              <WarningMessage
                                message={`O Paciente possui débito atrasado em ${patientOverdue} dias!`}
                              />
                              <br />
                            </>
                          )}
                          <ErrorMessage error={errors.global} />
                          {attendanceWithoutPatient && (
                            <div className="alert alert-outline-primary" role="alert">
                              <div className="alert-icon">
                                <i className="fas fa-exclamation-triangle" />
                              </div>
                              <div className="alert-text">
                                É necessário um paciente cadastrado para iniciar um atendimento.
                                Deseja cadastrar?
                              </div>
                              <div className="alert-close">
                                <div className="col-lg kt-align-right">
                                  <Button
                                    customClassName="btn-info btn-icon-sm"
                                    title="Cadastrar"
                                    onClick={() => {
                                      route.history.push(`${basename}/clientes/cadastro`, {
                                        routeReturn: 'scheduling',
                                        params: {
                                          healthProfessionalId: entity.healthProfessionalId,
                                          healthProfessionalName: entity.healthProfessionalName,
                                          createdAt: entity.createdAt,
                                          start: entity.start,
                                          end: entity.end,
                                          schedulingId: form.hasId ? entity.id : null,
                                          contactName: entity.contactName,
                                          contactPhone: entity.contactPhone,
                                          relatedScheduling: entity.relatedScheduling,
                                        },
                                      })
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="modal-footer">
                      <Button
                        type="button"
                        customClassName="btn-secondary"
                        icon="fas fa-arrow-left"
                        title="Voltar"
                        onClick={() => {
                          route.history.push(`${basename}/agendamento`)
                          resetForm()
                        }}
                      />
                      {!form.fetching && form.hasId && (
                        <Button
                          customClassName="btn-danger"
                          title="Cancelar"
                          icon="fas fa-calendar-times"
                          onClick={() => form.setValues({ disabledAt: new Date() })}
                        />
                      )}

                      {!form.fetching && form.hasId && (
                        <Button
                          customClassName="btn-info"
                          title={`${attendanceId ? 'Visualizar' : 'Iniciar'} Atendimento`}
                          icon="fas fa-notes-medical"
                          onClick={() => {
                            if (entity.patientId !== null) {
                              route.history.push(
                                attendanceId
                                  ? `${basename}/atendimentos/${attendanceId}/mostrar`
                                  : `${basename}/atendimentos/cadastro`,
                                {
                                  schedulingId:
                                    entity.relatedScheduling !== null
                                      ? entity.relatedScheduling
                                      : entity.id,
                                  routeReturn: 'scheduling',
                                },
                              )
                            } else {
                              setAttendanceWithoutPatient(true)
                            }
                          }}
                        />
                      )}
                      {!form.fetching && (
                        <Button
                          customClassName="btn-primary"
                          title="Salvar"
                          icon="fas fa-save"
                          disabled={form.submitting}
                          loading={form.submitting}
                        />
                      )}
                    </div>
                  </form>
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
