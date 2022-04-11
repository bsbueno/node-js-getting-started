import React, { useEffect } from 'react'
import { useForm } from 'core/hooks/form'
import { Field } from 'core/components/form/field'
import { TextInput } from 'core/components/form/text-input'
import { requiredMessage } from 'core/constants'
import { ErrorMessage } from 'core/components/form/error-message'
import { ModalForm } from 'core/components/modal'
import { modalSubmit } from 'helpers'
import { DecimalInput } from 'core/components/form/decimal-input'

export const ExamForm = ({ route, service, id, show, refresh }) => {
  const form = useForm(
    {
      displayName: ent => ent.description,
      initialEntity: {
        id: 0,
        description: '',
        valueParticular: 0,
        valuePlan: 0,
      },
      validate: values => {
        const errors = {}
        if (!values.description) errors.description = requiredMessage
        else if (values.description.length > 200)
          errors.description = 'A descrição deve ter no máximo 200 caracteres.'

        if (!values.valueParticular) errors.valueParticular = requiredMessage

        if (!values.valuePlan) errors.valuePlan = requiredMessage

        return errors
      },
    },
    route,
  )

  const { entity, errors, touched } = form

  useEffect(() => {
    if (form.hasId) {
      form.handleFetch({
        action: (key, ac) => service.getById('exam', id, ac.signal),
        errorFn: err => form.setErrors({ global: err.message }),
      })
    }
    // eslint-disable-next-line
	}, [id])

  return (
    <ModalForm
      isLarge
      title={form.displayName || 'Novo Exame'}
      show={show}
      fetching={form.fetching}
      submitting={form.submitting}
      resetForm={form.resetForm}
      closeAction={() => route.history.goBack()}
      onSubmit={() =>
        form.handleSubmit(data =>
          modalSubmit({ path: 'exam', service, form, refresh, route, data }),
        )
      }
    >
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
      <div className="row">
        <div className="col-lg">
          <Field label="Valor Particular">
            <DecimalInput
              meta={{
                error: errors.valueParticular,
                touched: touched.valueParticular,
              }}
              acceptEnter
              customClassName="form-control-xl"
              icon="fas fa-dollar-sign"
              onChange={(valueParticular, type) => {
                form.handleChange({
                  path: 'valueParticular',
                  type,
                  values: prev => ({
                    ...prev,
                    valueParticular,
                  }),
                })
              }}
              value={entity.valueParticular}
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Valor Plano">
            <DecimalInput
              meta={{
                error: errors.valuePlan,
                touched: touched.valuePlan,
              }}
              acceptEnter
              customClassName="form-control-xl"
              icon="fas fa-dollar-sign"
              onChange={(valuePlan, type) => {
                form.handleChange({
                  path: 'valuePlan',
                  type,
                  values: prev => ({
                    ...prev,
                    valuePlan,
                  }),
                })
              }}
              value={entity.valuePlan}
            />
          </Field>
        </div>
      </div>
      <ErrorMessage error={errors.global} />
    </ModalForm>
  )
}
