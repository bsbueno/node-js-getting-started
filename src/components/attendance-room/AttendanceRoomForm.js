import React, { useEffect } from 'react'
import { useForm } from 'core/hooks/form'
import { Field } from 'core/components/form/field'
import { TextInput } from 'core/components/form/text-input'
import { requiredMessage } from 'core/constants'
import { ErrorMessage } from 'core/components/form/error-message'
import { ModalForm } from 'core/components/modal'
import { modalSubmit } from 'helpers'

export const AttendanceRoomForm = ({ route, service, id, show, refresh }) => {
  const form = useForm(
    {
      displayName: ent => ent.description,
      initialEntity: {
        id: 0,
        description: '',
      },
      validate: values => {
        const errors = {}
        if (!values.description) errors.description = requiredMessage
        else if (values.description.length > 30)
          errors.description = 'A descrição deve ter no máximo 30 caracteres.'
        return errors
      },
    },
    route,
  )

  const { entity, errors, touched } = form

  useEffect(() => {
    if (form.hasId) {
      form.handleFetch({
        action: (key, ac) => service.getById('attendanceroom', id, ac.signal),
        errorFn: err => form.setErrors({ global: err.message }),
      })
    }
    // eslint-disable-next-line
	}, [id])

  return (
    <ModalForm
      isLarge
      title={form.displayName || 'Nova Sala de Atendimento'}
      show={show}
      fetching={form.fetching}
      submitting={form.submitting}
      resetForm={form.resetForm}
      closeAction={() => route.history.goBack()}
      onSubmit={() =>
        form.handleSubmit(data =>
          modalSubmit({ path: 'attendanceroom', service, form, refresh, route, data }),
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
      <ErrorMessage error={errors.global} />
    </ModalForm>
  )
}
