import React, { useEffect } from 'react'
import { useForm } from 'core/hooks/form'
import { requiredMessage, CpfMask, CellPhoneMask, BrazilStates, Councils } from 'core/constants'
import { Field } from 'core/components/form/field'
import { TextInput } from 'core/components/form/text-input'
import { submit } from 'helpers'
import { isCPF, isEmail } from 'core/helpers/validate'
import { Button } from 'core/components/button'
import { ErrorMessage } from 'core/components/form/error-message'
import { AsyncSelect } from 'core/components/form/async-select'

import { Select } from 'core/components/form/select'
import { DurationInput } from 'core/components/form/duration-input'

const days = [
  { id: 1, name: 'Segunda' },
  { id: 2, name: 'Terça' },
  { id: 3, name: 'Quarta' },
  { id: 4, name: 'Quinta' },
  { id: 5, name: 'Sexta' },
  { id: 6, name: 'Sábado' },
  { id: 0, name: 'Domingo' },
]

const shifts = [
  { id: 1, name: '1 turno' },
  { id: 2, name: '2 turnos' },
  { id: 3, name: '3 turnos' },
  { id: 4, name: '4 turnos' },
  { id: 0, name: 'Fechado' },
]

export const ProfessionalForm = ({ route, service, basename }) => {
  const form = useForm(
    {
      displayName: ent => ent.name,
      initialEntity: {
        id: 0,
        name: '',
        cpf: '',
        email: '',
        phone: '',
        medicalSpecialtyId: '',
        council: '',
        councilNumber: '',
        councilState: '',
        duration: 30,
        times: [
          { dayOfWeek: 1, period: 1, start: '08:00:00', end: '18:00:00' },
          { dayOfWeek: 2, period: 1, start: '08:00:00', end: '18:00:00' },
          { dayOfWeek: 3, period: 1, start: '08:00:00', end: '18:00:00' },
          { dayOfWeek: 4, period: 1, start: '08:00:00', end: '18:00:00' },
          { dayOfWeek: 5, period: 1, start: '08:00:00', end: '18:00:00' },
          { dayOfWeek: 6, period: 1, start: '08:00:00', end: '18:00:00' },
        ],
      },
      validate: values => {
        const errors = {}

        if (!values.name) errors.name = requiredMessage
        else if (values.name.length < 8) errors.name = 'O nome deve ter pelo menos 8 caracteres.'
        else if (values.name.length > 100) errors.name = 'O nome deve ter no máximo 100 caracteres.'

        if (!values.cpf) errors.cpf = requiredMessage
        else if (!isCPF(values.cpf)) errors.cpf = 'Digite um CPF válido.'

        if (values.email && !isEmail(values.email))
          errors.email = 'Digite um endereço de email válido.'

        if (!values.medicalSpecialtyId) errors.medicalSpecialtyId = requiredMessage

        return errors
      },
    },
    route,
  )

  const { entity, errors, touched } = form
  const fetching = form.fetching || (form.hasId && entity.id === 0)

  useEffect(() => {
    if (form.hasId) {
      form.handleFetch({
        action: (id, ac) => service.getById('healthprofessional', id, ac.signal),
        errorFn: err => form.setErrors({ global: err.message }),
      })
    }
    // eslint-disable-next-line
	}, [])

  const renderDays = day => (
    <tr key={day.id} className="kt-datatable__row">
      <td className="kt-datatable__cell">{day.name}</td>
      <td className="kt-datatable__cell">
        <Select
          items={shifts}
          getId={s => s.id}
          getDisplay={s => s.name}
          selected={entity.times.filter(t => t.dayOfWeek === day.id).length}
          onChange={time => {
            const prevSize = entity.times.filter(t => t.dayOfWeek === day.id).length
            form.handleChange({
              path: 'times',
              values: prev => ({
                ...prev,
                times:
                  time.id > prevSize
                    ? [
                        ...entity.times,
                        ...[...Array(time.id - prevSize).keys()].map(i => ({
                          dayOfWeek: day.id,
                          period: prevSize + i + 1,
                          start: '08:00:00',
                          end: '18:00:00',
                        })),
                      ]
                    : entity.times.filter(t => !(t.dayOfWeek === day.id && t.period > time.id)),
              }),
            })
          }}
        />
      </td>

      {[1, 2, 3, 4].map(period => {
        const time = entity.times.find(t => t.dayOfWeek === day.id && t.period === period)

        return time ? (
          <td key={period} className="kt-datatable__cell">
            <div className="input-group">
              <input
                required
                type="time"
                className="form-control"
                value={time.start}
                onChange={ev => {
                  const start = ev.target.value
                  form.handleChange({
                    path: 'times',
                    values: prev => ({
                      ...prev,
                      times: entity.times.map(t =>
                        t.dayOfWeek === day.id && t.period === period ? { ...t, start } : t,
                      ),
                    }),
                  })
                }}
              />

              <input
                required
                type="time"
                className="form-control"
                value={time.end}
                onChange={ev => {
                  const end = ev.target.value
                  form.handleChange({
                    path: 'times',
                    values: prev => ({
                      ...prev,
                      times: entity.times.map(t =>
                        t.dayOfWeek === day.id && t.period === period ? { ...t, end } : t,
                      ),
                    }),
                  })
                }}
              />
            </div>
          </td>
        ) : (
          <td key={period} className="kt-datatable__cell" />
        )
      })}
    </tr>
  )

  return fetching ? (
    'Carregando...'
  ) : (
    <div className="kt-portlet">
      <div className="kt-portlet__head">
        <div className="kt-portlet__head-label">
          <h3 className="kt-portlet__head-title">
            {form.displayName ? `Editar ${form.displayName}` : 'Novo Profissional de Saúde'}
          </h3>
        </div>
      </div>
      <form
        autoComplete="off"
        className="kt-form kt-form--label-right"
        onSubmit={ev => {
          ev.preventDefault()
          form.handleSubmit(data => {
            submit({
              path: 'healthprofessional',
              callback: () => route.history.push(`${basename}/profissionais`),
              data,
              service,
              form,
            })
          })
        }}
      >
        <div className="kt-portlet__body">
          <div className="row">
            <div className="col-lg">
              <Field label="Nome">
                <TextInput
                  meta={{
                    error: errors.name,
                    touched: touched.name,
                  }}
                  value={entity.name}
                  onChange={(name, type) =>
                    form.handleChange({
                      path: 'name',
                      type,
                      values: prev => ({
                        ...prev,
                        name,
                      }),
                    })
                  }
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="CPF">
                <TextInput
                  meta={{
                    error: errors.cpf,
                    touched: touched.cpf,
                  }}
                  mask={CpfMask}
                  value={entity.cpf}
                  onChange={(cpf, type) =>
                    form.handleChange({
                      path: 'cpf',
                      type,
                      values: prev => ({
                        ...prev,
                        cpf,
                      }),
                    })
                  }
                  disabled={form.hasId}
                />
              </Field>
            </div>
          </div>

          <div className="row">
            <div className="col-lg">
              <Field label="E-mail">
                <TextInput
                  type="email"
                  icon="fas fa-at"
                  meta={{
                    error: errors.email,
                    touched: touched.email,
                  }}
                  value={entity.email}
                  onChange={(email, type) =>
                    form.handleChange({
                      path: 'email',
                      type,
                      values: prev => ({
                        ...prev,
                        email,
                      }),
                    })
                  }
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Telefone">
                <TextInput
                  type="tel"
                  icon="fas fa-phone"
                  mask={CellPhoneMask}
                  value={entity.phone}
                  onChange={(phone, type) =>
                    form.handleChange({
                      path: 'phone',
                      type,
                      values: { phone },
                    })
                  }
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Especialidade Médica">
                <AsyncSelect
                  isClearable
                  meta={{
                    error: errors.medicalSpecialtyId,
                    touched: touched.medicalSpecialtyId,
                  }}
                  getId={({ id }) => id}
                  getDisplay={({ description }) => description}
                  getItems={value =>
                    service
                      .getList('medicalspecialty', {
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
                  selected={entity.medicalSpecialtyId}
                  onChange={medicalspecialty => {
                    form.handleChange({
                      path: 'medicalSpecialty',
                      values: prev => ({
                        ...prev,
                        medicalSpecialtyId: medicalspecialty ? medicalspecialty.id : 0,
                      }),
                    })
                  }}
                />
              </Field>
            </div>
          </div>
          <div className="row">
            <div className="col-lg">
              <Field label="Conselho">
                <Select
                  items={Councils}
                  selected={entity.council}
                  getId={({ value }) => value}
                  getDisplay={({ name }) => name}
                  onChange={council => {
                    form.handleChange({
                      path: 'council',
                      values: prev => ({
                        ...prev,
                        council: council.value,
                      }),
                    })
                  }}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Nº do Conselho">
                <TextInput
                  meta={{
                    error: errors.councilNumber,
                    touched: touched.councilNumber,
                  }}
                  value={entity.councilNumber}
                  onChange={(councilNumber, type) =>
                    form.handleChange({
                      path: 'councilNumber',
                      type,
                      values: prev => ({
                        ...prev,
                        councilNumber,
                      }),
                    })
                  }
                />
              </Field>
            </div>
            <div className="col-lg-3">
              <Field label="UF do Conselho">
                <Select
                  items={BrazilStates}
                  selected={entity.councilState}
                  getId={({ uf }) => uf}
                  getDisplay={({ name }) => name}
                  onChange={({ uf: state }, type) =>
                    form.handleChange({
                      path: 'councilState',
                      type,
                      values: prev => ({
                        ...prev,
                        councilState: state,
                      }),
                    })
                  }
                />
              </Field>
            </div>
          </div>
          <div className="kt-separator kt-separator--border-dashed kt-separator--space-lg" />
          <h5 className="h5 subtitle">Agenda</h5>
          <div className="row">
            <div className="col-lg-3">
              <Field label="Tempo de duração dos atendimentos">
                <DurationInput
                  value={entity.duration}
                  onChange={(duration, type) =>
                    form.handleChange({
                      path: 'duration',
                      type,
                      values: prev => ({
                        ...prev,
                        duration,
                      }),
                    })
                  }
                />
              </Field>
            </div>
          </div>
          <div className="kt-mb-0 kt-datatable kt-datatable--default kt-datatable--brand kt-datatable--loaded">
            <table className="kt-datatable__table">
              <thead className="kt-datatable__head">
                <tr className="kt-datatable__row">
                  <th className="kt-datatable__cell">
                    <span>Dia</span>
                  </th>
                  <th className="kt-datatable__cell">
                    <span>Turnos</span>
                  </th>
                  <th className="kt-datatable__cell">
                    <span>1º turno</span>
                  </th>
                  <th className="kt-datatable__cell">
                    <span>2º turno</span>
                  </th>
                  <th className="kt-datatable__cell">
                    <span>3º turno</span>
                  </th>
                  <th className="kt-datatable__cell">
                    <span>4º turno</span>
                  </th>
                </tr>
              </thead>
              <tbody className="kt-datatable__body">{days.map(renderDays)}</tbody>
            </table>
          </div>

          <ErrorMessage error={errors.global} />
        </div>
        <div className="kt-portlet__foot">
          <div className="kt-form__actions">
            <div className="row">
              <div className="col-lg kt-align-right">
                <Button
                  type="button"
                  icon="fas fa-arrow-left"
                  customClassName="btn-secondary"
                  title="Voltar"
                  disabled={form.submitting}
                  onClick={() => route.history.goBack()}
                />
                <Button
                  icon="fas fa-save"
                  customClassName="btn-primary"
                  title="Salvar"
                  loading={form.submitting}
                  disabled={form.submitting}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
