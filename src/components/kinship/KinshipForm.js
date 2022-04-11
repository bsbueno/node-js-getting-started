import React, { useEffect } from 'react'
import { useForm } from 'core/hooks/form'
import { Field } from 'core/components/form/field'
import { TextInput } from 'core/components/form/text-input'
import { requiredMessage } from 'core/constants'
import { ErrorMessage } from 'core/components/form/error-message'
import { ModalForm } from 'core/components/modal'
import { modalSubmit } from 'helpers'

export const KinshipForm = ({ route, service, id, show, refresh }) => {
  const form = useForm(
    {
      displayName: ent => ent.title,
      initialEntity: {
        id: 0,
        title: '',
      },
      validate: values => {
        const errors = {}
        if (!values.title) errors.title = requiredMessage
        else if (values.title.length > 30)
          errors.title = 'O titulo deve ter no máximo 30 caracteres.'
        return errors
      },
    },
    route,
  )

  const { entity, errors, touched } = form

  useEffect(() => {
    if (form.hasId) {
      form.handleFetch({
        action: (key, ac) => service.getById('kinship', id, ac.signal),
        errorFn: err => form.setErrors({ global: err.message }),
      })
    }
    // eslint-disable-next-line
	}, [id])

  return (
    <ModalForm
      isLarge
      title={form.displayName || 'Novo Parentesco'}
      show={show}
      fetching={form.fetching}
      submitting={form.submitting}
      resetForm={form.resetForm}
      closeAction={() => route.history.goBack()}
      onSubmit={() =>
        form.handleSubmit(data =>
          modalSubmit({ path: 'kinship', service, form, refresh, route, data }),
        )
      }
    >
      <div className="row">
        <div className="col-lg">
          <Field label="Titulo">
            <TextInput
              meta={{
                error: errors.title,
                touched: touched.title,
              }}
              value={entity.title}
              onChange={(title, type) =>
                form.handleChange({
                  path: 'title',
                  type,
                  values: prev => ({
                    ...prev,
                    title,
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
