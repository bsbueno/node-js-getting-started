import React, { useState, useEffect, useRef } from 'react'
import { LoadingCard } from 'core/components/loading-card'
import { toLocaleDate, toDayOfWeek } from 'core/helpers/date'
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  getDay,
  startOfDay,
  differenceInYears,
} from 'date-fns'
import { parseNumber } from 'core/helpers/parse'
import { history } from 'core/helpers/history'
import {
  TypeSchedulingDescription,
  SchedulingStatusDescription,
  CellPhoneMask,
  PhoneMask,
  ClearanceType,
  AttendanceStatus,
} from 'core/constants'
import { localStore } from 'core/helpers/store'
import { config } from 'config'
import { Calendar } from 'core/components/datepicker/calendar'
import { applyMask } from 'core/helpers/mask'
import { classNames } from '../../core/helpers/misc'

const getCard = (schedulings, day, time, attendances) => {
  const scheduling = schedulings.filter(
    item => toLocaleDate(item.createdAt) === toLocaleDate(day) && item.start === time,
  )

  if (scheduling.length !== 0) {
    const status = SchedulingStatusDescription.filter(item => scheduling[0].status === item.id)[0]
    const type = TypeSchedulingDescription.filter(item => scheduling[0].type === item.id)[0]
    const attendance = attendances.filter(item => item.schedulingId === scheduling[0].id)
    const phone = scheduling[0].contactPhone || scheduling[0].patientPhone

    return {
      id:
        scheduling[0].relatedScheduling !== null
          ? scheduling[0].relatedScheduling
          : scheduling[0].id,
      patientName:
        scheduling[0].patientName !== null ? scheduling[0].patientName : scheduling[0].contactName,
      patientPhone: phone ? applyMask(CellPhoneMask, phone) : applyMask(PhoneMask, phone),
      status,
      type,
      scheduling: scheduling[0],
      attendance: attendance[0],
      onlyContact: scheduling[0].patientId === null,
      observation: scheduling[0].observation
        ? `${scheduling[0].observation.substring(0, 160)}...`
        : '',
    }
  }
  return {
    id: 0,
    scheduling: {},
    status: { id: 0 },
  }
}

const newAttendance = async (service, schedulingId, global) => {
  let attendanceId = 0
  await service.getById('scheduling', schedulingId).then(async resp => {
    const createdAt = new Date(resp.createdAt)
    await service
      .addOrUpdate('attendance', {
        id: 0,
        schedulingId,
        healthProfessionalId: resp.healthProfessionalId,
        healthProfessionalName: resp.healthProfessional.name,
        patientId: resp.patientId,
        patientName: resp.patient.name,
        patientAge: resp.patient.birthDate
          ? differenceInYears(Date.now(), new Date(resp.patient.birthDate.substr(0, 19)))
          : '',
        patientBirthDay: resp.patient.birthDate,
        planTitle: resp.planTitle,
        createdAt: resp.createdAt,
        start: resp.start,
        end: resp.end,
        address: resp.patientAddress,
        rg: resp.rg,
        phone: resp.phone,
        returnDays: 30,
        returnDate: new Date(
          createdAt.getFullYear(),
          createdAt.getMonth(),
          createdAt.getDate() + 30,
        ),
        mainComplaint: '',
        highPA: 0,
        lowPA: 0,
        dextro: 0,
        saturation: 0,
        pulse: 0,
        allergy: false,
        medicineAllergy: '',
        hypertensive: false,
        diabetic: false,
        medicineUseContiuous: '',
        clinicalHistory: '',
        patientWeight: 0,
        patientHeight: 0,
        temperature: 0,
        physicalExamination: '',
        cid: '',
        diagnosticHypothesis_1: '',
        diagnosticHypothesis_2: '',
        observation: '',
        conduct: '',
        clearanceType: ClearanceType.ATTENDANCETIME,
        daysAway: 0,
        companionName: '',
        companion: false,
        examsRequests: [],
        recipes: [],
        status: AttendanceStatus.INSERVICE,
        initialObservation: '',
        complementaryExams: '',
        attendanceProcedures: [],
      })
      .then(({ id }) => {
        attendanceId = id
      })
      .catch(err => global.modal.alert(err.message))
  })

  return attendanceId
}

export const MedicalSchedule = ({ global, route, service, basename }) => {
  const [dbFilters, setDbFilters] = useState({
    professionalId: 0,
    professionalName: '',
  })
  const [fetching, setFetching] = useState(false)
  const [dateBase, setDateBase] = useState(startOfDay(Date.now()))
  const [startWeek, setStartWeek] = useState(startOfWeek(dateBase))
  const [endWeek, setEndWeek] = useState(endOfWeek(dateBase))
  const [week, setWeek] = useState(
    eachDayOfInterval({
      start: startWeek,
      end: endWeek,
    }),
  )
  const [times, setTimes] = useState([])
  const [activeTimes, setActiveTimes] = useState([])
  const id = parseNumber(route.match.params.id)
  const showForm = route.location.pathname.includes('cadastro') || id > 0
  const [schedulings, setSchedulings] = useState([])
  const [attendances, setAttendances] = useState([])
  // const [visualization, setVisualization] = useState('week')
  const visualization = 'day'
  const calendarRef = useRef(null)
  const [dateView, setDateView] = useState(new Date())

  useEffect(() => {
    const user = localStore.get(config.OPERATOR_KEY)
    if (user.healthProfessionalId !== null) {
      setDbFilters(prev => ({
        ...prev,
        professionalId: user.healthProfessionalId,
      }))
    }
  }, [])

  useEffect(() => {
    if (!dbFilters.professionalId && (route.location.pathname.includes('cadastro') || id > 0)) {
      history.push(`${basename}/agendamento`)
    }
    // eslint-disable-next-line
	}, [route])


  const search = () => {
    setFetching(true)
    service
      .post('schedule.professional', dbFilters)
      .then(resp => {
        setTimes(resp.allTimes)
        setActiveTimes(resp.activeTimes)
        service
          .getList('scheduling', {
            usePager: false,
            filters: [
              {
                items: [
                  {
                    name: 'healthProfessionalId',
                    comparer: 'Equals',
                    value: dbFilters.professionalId,
                  },
                  {
                    name: 'createdAt',
                    value: startWeek,
                    comparer: 'GreaterThanOrEqual',
                  },
                  {
                    name: 'createdAt',
                    value: endWeek,
                    comparer: 'LessThanOrEqual',
                  },
                  {
                    name: 'Scheduling.disabledAt',
                    comparer: 'Equals',
                    value: null,
                  },
                ],
              },
            ],
          })
          .then(({ items }) => setSchedulings(items))

        service
          .getList('attendance', {
            usePager: false,
            filters: [
              {
                items: [
                  {
                    name: 'healthProfessionalId',
                    comparer: 'Equals',
                    value: dbFilters.professionalId,
                  },
                  {
                    name: 'Attendance.createdAt',
                    value: startWeek,
                    comparer: 'GreaterThanOrEqual',
                  },
                  {
                    name: 'Attendance.createdAt',
                    value: endWeek,
                    comparer: 'LessThanOrEqual',
                  },
                ],
              },
            ],
          })
          .then(({ items }) => setAttendances(items))
      })
      .catch(err => {
        setTimes([])
        setActiveTimes([])
        setSchedulings([])
        setAttendances([])
        global.modal.alert(err.message)
      })
      .finally(() => setFetching(false))
  }

  useEffect(() => {
    if (dbFilters.professionalId && !showForm) {
      search()
    }
    // eslint-disable-next-line
	}, [showForm])

  useEffect(() => {
    if (visualization === 'week') {
      setStartWeek(startOfWeek(dateBase))
      setEndWeek(endOfWeek(dateBase))
    }
    if (visualization === 'day') {
      setStartWeek(dateBase)
      setEndWeek(dateBase)
    }
  }, [dateBase, visualization])

  useEffect(() => {
    setWeek(
      eachDayOfInterval({
        start: startWeek,
        end: endWeek,
      }),
    )
    if (dbFilters.professionalId) {
      search()
    }
    // eslint-disable-next-line
	}, [startWeek, endWeek])

  return (
    <>
      <div className="kt-portlet kt-portlet--mobile">
        <div className="kt-portlet__head kt-portlet__head--lg">
          <div className="kt-portlet__head-label">
            <span className="kt-portlet__head-icon">
              <i className="kt-font-brand fas fa-stethoscope" />
            </span>
            <h3 className="kt-portlet__head-title">Agenda Médica</h3>
          </div>
        </div>
        <div className="kt-portlet__body kt-pb-0 position-relative">
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
            <div className="row">
              <div className="col-lg-4">
                <div className="center-calendar">
                  <Calendar
                    ref={calendarRef}
                    selected={dateBase}
                    minDate={null}
                    maxDate={null}
                    dateView={dateView}
                    onSelect={date => {
                      setDateBase(date)
                    }}
                    setDateView={setDateView}
                  />
                </div>
              </div>
              <div className="col-lg">
                <div
                  className={classNames(
                    'report-irregular kt-datatable kt-datatable--default kt-datatable--brand',
                    {
                      'kt-datatable--loaded': !fetching || times.length > 0,
                      'table-loading': fetching,
                    },
                  )}
                >
                  <table className="kt-datatable__table">
                    <thead className="kt-datatable__head">
                      <tr className="kt-datatable__row">
                        <th className="kt-datatable__cell">
                          <span>
                            <i className="fas fa-clock" />
                          </span>
                        </th>
                        {week.map(day => (
                          <th key={day} className="kt-datatable__cell kt-align-center">
                            <span>{toDayOfWeek(day).toUpperCase()}</span>
                            <span>{toLocaleDate(day)}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="kt-datatable__body">
                      {times.length > 0 &&
                        times.map(time => (
                          <tr key={time} className="kt-datatable__row">
                            <td className="kt-datatable__cell table-column-fix">
                              <div>{time}</div>
                            </td>

                            {week.map(day => {
                              const optionTime = activeTimes.filter(
                                activeTime => activeTime.dayOfWeek === getDay(day),
                              )[0]
                              const optionTimeIndex = optionTime.hourlies.indexOf(time)

                              const card = getCard(schedulings, day, time, attendances)

                              return (
                                <td key={day} className="kt-datatable__cell kt-align-center">
                                  {optionTimeIndex !== -1 && card.status.id ? (
                                    <button
                                      type="button"
                                      className={`notice ${
                                        card.status.id !== 0 ? card.status.class : ''
                                      } card-medical`}
                                      onClick={async () => {
                                        if (card.onlyContact) {
                                          global.modal.alert(
                                            'Não é possível iniciar atendimento sem cadastro de paciente!',
                                          )
                                        } else {
                                          let attendanceId = 0
                                          if (card.attendance !== undefined) {
                                            attendanceId = card.attendance.id
                                          } else {
                                            attendanceId = await newAttendance(
                                              service,
                                              card.id,
                                              global,
                                            )
                                          }

                                          route.history.push(
                                            card.status.id === 0
                                              ? '#'
                                              : `${basename}/atendimentos/${attendanceId}`,
                                            {
                                              schedulingId: card.id,
                                              routeReturn: 'medicalSchedule',
                                            },
                                          )
                                        }
                                      }}
                                    >
                                      {card.onlyContact && <span>Contato: </span>}
                                      <span>{`${card.patientName} - ${card.patientPhone}`}</span>
                                      <br />
                                      <span>{card.type.name}</span>
                                      <br />
                                      <strong>{card.status.name}</strong>
                                      {card.observation !== '' && (
                                        <>
                                          <br />
                                          <span>{card.observation}</span>
                                        </>
                                      )}
                                    </button>
                                  ) : (
                                    <div>Sem Atendimento</div>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                    </tbody>
                  </table>

                  {times.length === 0 && (
                    <div className="kt-datatable--error">Nenhuma agenda encontrada.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        <br />
      </div>
    </>
  )
}
