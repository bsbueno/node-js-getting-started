import React, { useEffect } from 'react'
import { useForm } from 'core/hooks/form'
import { requiredMessage } from 'core/constants'
import { Field } from 'core/components/form/field'
import { ErrorMessage } from 'core/components/form/error-message'
import { ModalForm } from 'core/components/modal'
import { modalSubmit } from 'helpers'
import { DateInput } from 'core/components/form/date-input'
import startOfDay from 'date-fns/startOfDay'
import { TextInput } from 'core/components/form/text-input'

const daysWeek = [
  'Domingo',
  'Segunda-Feira',
  'Terça-Feira',
  'Quarta-feira',
  'Quinta-Feira',
  'Sexta-Feira',
  'Sabado',
]
export const HolidayForm = ({ route, service, id, show, refresh }) => {
  const form = useForm(
    {
      displayName: ent => ent.id,
      initialEntity: {
        id: 0,
        dateHoliday: new Date(),
        dayWeek: '',
        description: '',
      },
      validate: values => {
        const errors = {}

        if (!values.dateHoliday) errors.dateHoliday = requiredMessage
        if (!values.description) errors.description = requiredMessage

        return errors
      },
    },
    route,
  )

  const { entity, errors, touched } = form

  useEffect(() => {
    if (form.hasId) {
      form.handleFetch({
        action: (key, ac) => service.getById('holidays', key, ac.signal),
        errorFn: err => form.setErrors({ global: err.message }),
        mapper: e => ({
          ...e,
          isHealthProfessional: e.healthProfessionalId !== null,
        }),
      })
    }
    // eslint-disable-next-line
  }, [id])
  useEffect(() => {
    form.setValues(prev => ({
      ...prev,
      dayWeek: daysWeek[new Date(entity.dateHoliday).getDay()] || '',
    }))
  }, [entity.dateHoliday])

  return (
    <ModalForm
      title={form.displayName || 'Novo Feriado'}
      show={show}
      fetching={form.fetching}
      submitting={form.submitting}
      resetForm={form.resetForm}
      closeAction={() => route.history.goBack()}
      onSubmit={() => {
        form.handleSubmit(data =>
          modalSubmit({ path: 'holidays', service, form, refresh, route, data }),
        )
      }}
    >
      <div className="row">
        <div className="col-lg">
          <Field label="Feriado">
            <DateInput
              customClassName="form-control-xl"
              meta={{ error: errors.start, touched: touched.start }}
              onChange={(dateHoliday, type) => {
                form.handleChange({
                  path: 'dateHoliday',
                  type,
                  values: prev => ({
                    ...prev,
                    dateHoliday: startOfDay(dateHoliday),
                  }),
                })
              }}
              value={entity.dateHoliday}
            />
          </Field>
        </div>
      </div>

      <div className="row">
        <div className="col-lg">
          <Field label="Dia da Semana">
            <TextInput
              meta={{
                error: errors.dayWeek,
                touched: touched.dayWeek,
              }}
              value={entity.dayWeek}
              onChange={(dayWeek, type) =>
                form.handleChange({
                  path: 'dayWeek',
                  type,
                  values: prev => ({
                    ...prev,
                    dayWeek,
                  }),
                })
              }
            />
          </Field>
        </div>
      </div>
      <div className="row">
        <div className="col-lg">
          <Field label="Descrição">
            <TextInput
              meta={{
                error: errors.description,
                touched: touched.description,
              }}
              value={entity.description}
              onChange={(description, type) =>
                form.handleChange({
                  path: 'description',
                  type,
                  values: prev => ({
                    ...prev,
                    description,
                  }),
                })
              }
            />
          </Field>
        </div>
      </div>

      <ErrorMessage error={errors.global} />
    </ModalForm>
  )
}
