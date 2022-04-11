import React, { useEffect } from 'react'
import { useForm } from 'core/hooks/form'
import { requiredMessage } from 'core/constants'
import { Field } from 'core/components/form/field'
import { ErrorMessage } from 'core/components/form/error-message'
import { ModalForm } from 'core/components/modal'
import { modalSubmit } from 'helpers'
import { AsyncSelect } from 'core/components/form/async-select'
import { DateInput } from 'core/components/form/date-input'
import startOfDay from 'date-fns/startOfDay'
import endOfDay from 'date-fns/endOfDay'

export const AbsenceForm = ({ route, service, id, show, refresh }) => {
  const form = useForm(
    {
      displayName: ent => ent.professional.name,
      initialEntity: {
        id: 0,
        healthProfessionalId: 0,
        start: null,
        end: null,
      },
      validate: values => {
        const errors = {}

        if (!values.healthProfessionalId) errors.healthProfessionalId = requiredMessage
        if (!values.start) errors.start = requiredMessage
        if (!values.end) errors.end = requiredMessage

        return errors
      },
    },
    route,
  )

  const { entity, errors, touched } = form

  useEffect(() => {
    if (form.hasId) {
      form.handleFetch({
        action: (key, ac) => service.getById('absence', key, ac.signal),
        errorFn: err => form.setErrors({ global: err.message }),
        mapper: e => ({
          ...e,
          isHealthProfessional: e.healthProfessionalId !== null,
        }),
      })
    }
    // eslint-disable-next-line
	}, [id])

  return (
    <ModalForm
      title={form.displayName || 'Nova Ausência'}
      show={show}
      fetching={form.fetching}
      submitting={form.submitting}
      resetForm={form.resetForm}
      closeAction={() => route.history.goBack()}
      onSubmit={() => {
        form.handleSubmit(data =>
          modalSubmit({ path: 'absence', service, form, refresh, route, data }),
        )
      }}
    >
      <div className="row">
        <div className="col-lg">
          <Field label="Profissional de Saúde">
            <AsyncSelect
              maxMenuHeight={180}
              meta={{
                error: errors.healthProfessionalId,
                touched: touched.healthProfessionalId,
              }}
              getId={item => item.id}
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
              selected={entity.healthProfessionalId}
              onChange={healthProfessional => {
                form.handleChange({
                  path: 'healthProfessionalId',
                  values: prev => ({
                    ...prev,
                    healthProfessionalName: healthProfessional ? healthProfessional.name : '',
                    healthProfessionalId: healthProfessional ? healthProfessional.id : 0,
                  }),
                })
              }}
            />
          </Field>
        </div>
      </div>

      <div className="row">
        <div className="col-lg">
          <Field label="Data Inicial">
            <DateInput
              customClassName="form-control-xl"
              meta={{ error: errors.start, touched: touched.start }}
              onChange={(start, type) => {
                form.handleChange({
                  path: 'start',
                  type,
                  values: prev => ({
                    ...prev,
                    start: startOfDay(start),
                  }),
                })
              }}
              value={entity.start}
            />
          </Field>
        </div>
      </div>

      <div className="row">
        <div className="col-lg">
          <Field label="Data Final">
            <DateInput
              customClassName="form-control-xl"
              meta={{ error: errors.end, touched: touched.end }}
              onChange={(end, type) => {
                form.handleChange({
                  path: 'end',
                  type,
                  values: prev => ({
                    ...prev,
                    end: endOfDay(end),
                  }),
                })
              }}
              value={entity.end}
            />
          </Field>
        </div>
      </div>

      <ErrorMessage error={errors.global} />
    </ModalForm>
  )
}
