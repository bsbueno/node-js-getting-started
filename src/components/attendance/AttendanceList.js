import React, { useState } from 'react'
import startOfDay from 'date-fns/startOfDay'
import endOfDay from 'date-fns/endOfDay'
import { List } from 'core/components/list'
import { useRefresh } from 'core/hooks/refresh'
import { Field } from 'core/components/form/field'
import { TextInput } from 'core/components/form/text-input'
import { useFilters } from 'core/hooks/filter'
import { AsyncSelect } from 'core/components/form/async-select'
import { DateInput } from 'core/components/form/date-input'
import { onlyNumbers } from 'core/helpers/format'
import { Button } from 'core/components/button'
import { iframeDownload } from 'core/helpers/misc'
import { LoadingCard } from 'core/components/loading-card'
import { Select } from 'core/components/form/select'
import { TypeSchedulingDescription, CpfMask, AttendanceStatusDescription } from 'core/constants'

const getTypeFormat = ({ attendanceType }) => {
  const type = TypeSchedulingDescription.find(item => attendanceType === item.id)
  return type.name
}

const columns = [
  { path: 'id', title: '#', textAlign: 'center', sort: 'createdAt' },
  { path: 'patientName', title: 'Paciente' },
  { path: 'patientCpfCnpj', title: 'CPF/CNPJ', format: 'cpfcnpj' },
  { path: 'healthProfessionalName', title: 'Profissional de Saúde' },
  { path: 'createdAt', title: 'Data do Atendimento', format: 'date' },
  { path: 'start', title: 'Hora Início' },
  { path: 'end', title: 'Hora Fim' },
  { path: 'planTitle', title: 'Plano', format: ent => ent.planTitle ?? 'Particular' },
  {
    path: 'attendanceType',
    title: 'Tipo',
    format: getTypeFormat,
  },
]

const fields = [...columns.map(c => c.path), 'healthProfessionalId', 'patientId']

export const AttendanceList = ({ global, route, service, basename }) => {
  const { modal } = global

  const [dbFilters, setDbFilters] = useState({
    cpfCnpj: '',
    healthProfessionalId: '',
    patientName: '',
    minDate: startOfDay(new Date()),
    maxDate: endOfDay(new Date()),
    type: '',
    planId: undefined,
    statusId: 2,
  })

  const { setValues, filters } = useFilters(
    {
      cpfCnpj: '',
      healthProfessionalId: '',
      patientName: '',
      minDate: startOfDay(new Date()),
      maxDate: endOfDay(new Date()),
      type: '',
      planId: undefined,
      statusId: 2,
    },
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
          query.planId !== undefined
            ? {
                name: 'planId',
                value: query.planId,
              }
            : {},
          {
            name: 'healthProfessionalId',
            value: query.healthProfessionalId,
            comparer: 'Equals',
          },
          {
            name: 'Attendance.status',
            value: query.statusId,
            comparer: 'Equals',
          },
          query.type !== ''
            ? {
                name: 'scheduling.type',
                value: query.type,
                comparer: 'Equals',
              }
            : {},
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
        ],
      },
    ],
  )

  const fetching = useState(false)
  const [printFetching, setPrintFetching] = useState(false)
  const refresh = useRefresh()
  return (
    <>
      <div className="kt-portlet kt-portlet--mobile">
        <div className="kt-portlet__head kt-portlet__head--lg">
          <div className="kt-portlet__head-label">
            <span className="kt-portlet__head-icon">
              <i className="kt-font-brand fas fa-notes-medical" />
            </span>
            <h3 className="kt-portlet__head-title">Atendimentos</h3>
          </div>
          <div className="kt-portlet__head-toolbar">
            <div className="kt-portlet__head-wrapper">
              <div className="dropdown dropdown-inline buttons-header-padding">
                <Button
                  icon="fas fa-file-pdf"
                  customClassName="btn-info btn-icon-sm"
                  title="Baixar em PDF"
                  onClick={() => {
                    setPrintFetching(true)
                    service
                      .post(
                        'attendance.list',
                        {
                          filters,
                          isPdf: true,
                          usePager: false,
                          fields,
                          sort: [['Attendance.createdAt', 'DESC']],
                        },
                        undefined,
                        resp => resp.blob(),
                      )
                      .then(blob => iframeDownload(blob, 'atendimento.pdf'))
                      .catch(err => modal.alert(err.message))
                      .finally(() => setPrintFetching(false))
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
          </div>
          <div className="row">
            <div className="col-lg">
              <Field label="Data Inicial do Atendimento">
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
              <Field label="Data Final do Atendimento">
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
              <Field label="Tipo">
                <Select
                  isClearable
                  items={TypeSchedulingDescription}
                  selected={dbFilters.type}
                  getId={({ id }) => id}
                  getDisplay={({ name }) => name}
                  onChange={type => {
                    setDbFilters(prev => ({
                      ...prev,
                      type: type ? type.id : '',
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
                      .then(({ items }) => [{ id: null, title: 'Particular' }, ...items])
                  }
                  selected={dbFilters.planId}
                  onChange={plan =>
                    setDbFilters(prev => ({
                      ...prev,
                      planId: plan ? plan.id : undefined,
                    }))
                  }
                />
              </Field>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-3">
              <Field label="Status">
                <Select
                  isClearable
                  items={AttendanceStatusDescription}
                  selected={dbFilters.statusId}
                  getId={({ id }) => id}
                  getDisplay={({ name }) => name}
                  onChange={status => {
                    setDbFilters(prev => ({
                      ...prev,
                      statusId: status ? status.id : '',
                    }))
                  }}
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
            showItem
            onShowItem={entity =>
              route.history.push(`${basename}/atendimentos/${entity.id}/mostrar`)
            }
            modal={modal}
            route={route}
            refresh={refresh}
            fetching={fetching}
            filters={filters}
            initialQuery={{ fields, sort: [['createdAt', 'DESC']] }}
            getItems={(query, signal) => service.getList('attendance', query, signal)}
            actions={[
              {
                icon: 'fas fa-edit',
                title: 'Editar',
                action: `${basename}/atendimentos/:id`,
              },
              {
                icon: `fas fa-print`,
                title: 'Imprimir Ficha',
                action: async ent => {
                  setPrintFetching(true)
                  await service
                    .post('report.attendanceform', { id: ent.entity.id }, undefined, resp =>
                      resp.blob(),
                    )
                    .then(blob => iframeDownload(blob, 'ficha-atendimento.pdf'))
                    .catch(err => global.modal.alert(err.message))
                    .finally(() => setPrintFetching(false))
                },
              },
              {
                icon: `fas fa-print`,
                title: 'Imprimir Atestado',
                action: async ent => {
                  setPrintFetching(true)
                  await service
                    .post('report.medicalcertificate', { id: ent.entity.id }, undefined, resp =>
                      resp.blob(),
                    )
                    .then(blob => iframeDownload(blob, 'atestado.pdf'))
                    .catch(err => global.modal.alert(err.message))
                    .finally(() => setPrintFetching(false))
                },
              },
            ]}
            columns={columns}
          />
        </div>
      </div>
    </>
  )
}
