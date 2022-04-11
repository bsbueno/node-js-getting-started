import React, { useState, useEffect, useRef } from 'react'
import { Button } from 'core/components/button'
import { LoadingCard } from 'core/components/loading-card'
import { toLocaleDate, toDayOfWeek } from 'core/helpers/date'
import { startOfWeek, endOfWeek, eachDayOfInterval, getDay, startOfDay } from 'date-fns'
import { useRefresh } from 'core/hooks/refresh'
import { parseNumber } from 'core/helpers/parse'
import { history } from 'core/helpers/history'
import {
  TypeSchedulingDescription,
  SchedulingStatusDescription,
  CellPhoneMask,
  PhoneMask,
} from 'core/constants'
import { Calendar } from 'core/components/datepicker/calendar'
import { applyMask } from 'core/helpers/mask'
import { SearchInput } from 'core/components/form/search-input'
import { SchedulingModal } from './SchedulingModal'
import { SchedulingCard } from './SchedulingCard'
import { classNames } from '../../core/helpers/misc'

const getCard = (schedulings, day, time) => {
  const scheduling = schedulings.filter(
    item => toLocaleDate(item.createdAt) === toLocaleDate(day) && item.start === time,
  )

  if (scheduling.length !== 0) {
    const status = SchedulingStatusDescription.filter(item => scheduling[0].status === item.id)[0]
    const type = TypeSchedulingDescription.filter(item => scheduling[0].type === item.id)[0]
    const phone = scheduling[0].contactPhone || scheduling[0].patientPhone

    return {
      id: scheduling[0].id,
      patientName:
        scheduling[0].patientName !== null ? scheduling[0].patientName : scheduling[0].contactName,
      patientPhone:
        phone.length > 10 ? applyMask(CellPhoneMask, phone) : applyMask(PhoneMask, phone),
      status,
      type,
      scheduling: scheduling[0],
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

const filterProfessionals = (professionals, filterField) => {
  if (filterField !== '') {
    return professionals.filter(
      professional =>
        professional.name.toUpperCase().includes(filterField.toUpperCase()) ||
        professional.medicalSpecialtyDescription.toUpperCase().includes(filterField.toUpperCase()),
    )
  }
  return professionals
}

export const SchedulingForm = ({ global, route, service, basename }) => {
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
  const refresh = useRefresh()
  const [dateSelected, setDateSelected] = useState(Date.now())
  const [timeStartSelected, setTimeStartSelected] = useState('')
  const [timeEndSelected, setTimeEndSelected] = useState('')
  const [schedulings, setSchedulings] = useState([])
  const [healthProfessionals, setHealthProfessionals] = useState([])
  const calendarRef = useRef(null)
  const [dateView, setDateView] = useState(new Date())
  const { state } = route.location
  const [filterField, setFilterField] = useState('')

  const searchProfessionals = day => {
    service
      .get('healthprofessional.list', `?day=${day?.toISOString()}`)
      .then(items => setHealthProfessionals(filterProfessionals(items, filterField)))
  }

  const refreshScheduling = schedulingId => {
    route.history.push(`${basename}/agendamento/${schedulingId}`, {})
  }

  useEffect(() => {
    searchProfessionals(dateBase)
    // eslint-disable-next-line
  }, [dateBase])

  useEffect(() => {
    if (state) {
      if (!(Object.keys(state).length === 0 && state.constructor === Object)) {
        setDbFilters(prev => ({
          ...prev,
          professionalId: state.healthProfessionalId,
          professionalName: state.healthProfessionalName,
        }))
        if (state.schedulingId !== null && state.patientId !== null) {
          const { schedulingId } = state
          service
            .update('scheduling', {
              id: state.schedulingId,
              patientId: state.patientId,
              healthProfessionalId: state.healthProfessionalId,
              contactName: null,
              contactPhone: null,
              relatedScheduling: state.relatedScheduling,
              createdAt: state.createdAt,
              start: state.start,
              end: state.end,
            })
            .then(() => {
              refreshScheduling(schedulingId)
            })
            .catch(err => global.modal.alert(err.message))
        }
      }
    }
    // eslint-disable-next-line
  }, [state])

  useEffect(() => {
    if (!dbFilters.professionalId && (route.location.pathname.includes('cadastro') || id > 0)) {
      if (!route.location.state) {
        history.push(`${basename}/agendamento`)
      }
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
      })
      .catch(err => {
        setTimes([])
        setActiveTimes([])
        setSchedulings([])
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
    setStartWeek(dateBase)
    setEndWeek(dateBase)
  }, [dateBase])

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

  useEffect(() => {
    if (dbFilters.professionalId) {
      search()
    }
    // eslint-disable-next-line
  }, [dbFilters.professionalId])

  return (
    <>
      <div className="kt-portlet kt-portlet--mobile">
        <div className="kt-portlet__head kt-portlet__head--lg">
          <div className="kt-portlet__head-label">
            <span className="kt-portlet__head-icon">
              <i className="kt-font-brand fas fa-calendar-alt" />
            </span>
            <h3 className="kt-portlet__head-title">Agendamento</h3>
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
              <div className="col-lg">
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
                <br />
                <div className="container-search">
                  <div className="row">
                    <div className="col-lg">
                      <SearchInput
                        ignoreBlur
                        type="search"
                        value={filterField}
                        onChange={setFilterField}
                        onClick={() => {
                          setDbFilters(prev => ({
                            ...prev,
                            professionalId: 0,
                            professionalName: '',
                          }))
                          setTimes([])
                          setActiveTimes([])
                          setSchedulings([])
                          searchProfessionals(dateBase)
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div
                  className={classNames(
                    'report-irregular kt-datatable kt-datatable--default kt-datatable--brand',
                    {
                      'kt-datatable--loaded': !fetching || healthProfessionals.length > 0,
                      'table-loading': fetching,
                    },
                  )}
                >
                  <table className="kt-datatable__table">
                    <thead className="kt-datatable__head">
                      <tr className="kt-datatable__row">
                        <th className="kt-datatable__cell">
                          <span>Agendas</span>
                        </th>
                        <th className="kt-datatable__cell">
                          <span> </span>
                        </th>
                        <th className="kt-datatable__cell">
                          <span> </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="kt-datatable__body">
                      {healthProfessionals.map(professional => (
                        <tr
                          key={professional.id}
                          className={classNames('kt-datatable__row', {
                            'background-selected': dbFilters.professionalId === professional.id,
                          })}
                        >
                          <td className="kt-datatable__cell">
                            <div>{professional.name}</div>
                          </td>
                          <td className="kt-datatable__cell">
                            <div>{professional.medicalSpecialtyDescription}</div>
                          </td>

                          <td className="kt-datatable__cell no-wrap no-width">
                            <Button
                              customClassName="btn-info btn-icon-sm"
                              icon="fas fa-calendar-alt"
                              title=""
                              onClick={() => {
                                setDbFilters(prev => ({
                                  ...prev,
                                  professionalId: professional ? professional.id : 0,
                                  professionalName: professional ? professional.name : '',
                                }))
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {healthProfessionals.length === 0 && (
                    <div className="kt-datatable--error">
                      Nenhuma profissional de saúde encontrado.
                    </div>
                  )}
                </div>
              </div>
              <div className="col-lg-5">
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
                        times.map(time =>
                          week.map(day => {
                            const optionTime = activeTimes.filter(
                              activeTime => activeTime.dayOfWeek === getDay(day),
                            )[0]
                            const optionTimeIndex = optionTime.hourlies.indexOf(time)

                            const card = getCard(schedulings, day, time)

                            return optionTimeIndex !== -1 ? (
                              <tr key={time} className="kt-datatable__row">
                                <td className="kt-datatable__cell table-column-fix">
                                  <div>{time}</div>
                                </td>
                                <td key={day} className="kt-datatable__cell kt-align-center">
                                  <SchedulingCard
                                    className={`notice ${
                                      card.status.id !== 0 ? card.status.class : ''
                                    }`}
                                    to={`${basename}/agendamento/cadastro`}
                                    onClick={() => {
                                      setDateSelected(day)
                                      setTimeStartSelected(time)
                                      setTimeEndSelected(optionTime.endHourlies[optionTimeIndex])
                                      if (card.status.id === 0)
                                        history.push(`${basename}/agendamento/cadastro`)
                                      else history.push(`${basename}/agendamento/${card.id}`)
                                    }}
                                    draggable={card.status.id !== 0}
                                    scheduling={card.scheduling}
                                    modal={global.modal}
                                    onDrop={data => {
                                      const newScheduling = JSON.parse(data)
                                      service
                                        .update('scheduling', {
                                          ...newScheduling,
                                          createdAt: day,
                                          start: time,
                                          end: optionTime.endHourlies[optionTimeIndex],
                                        })
                                        .then(() => search())
                                        .catch(err => global.modal.alert(err.message))
                                    }}
                                  >
                                    {card.status.id !== 0 && (
                                      <>
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
                                      </>
                                    )}
                                  </SchedulingCard>
                                </td>
                              </tr>
                            ) : null
                          }),
                        )}
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
      </div>
      <SchedulingModal
        service={service}
        show={showForm}
        route={route}
        id={id}
        refresh={async () => {
          await global.refresh(true)
          refresh.force()
        }}
        dateSelected={dateSelected}
        timeStartSelected={timeStartSelected}
        timeEndSelected={timeEndSelected}
        healthProfessionalNameSelected={dbFilters.professionalName}
        healthProfessionalIdSelected={dbFilters.professionalId}
        basename={basename}
        global={global}
        activeTimes={activeTimes}
      />
    </>
  )
}
