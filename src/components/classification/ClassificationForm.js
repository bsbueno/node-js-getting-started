import React, { useEffect } from 'react'
import { useForm } from 'core/hooks/form'
import { Field } from 'core/components/form/field'
import { TextInput } from 'core/components/form/text-input'
import { requiredMessage } from 'core/constants'
import { ErrorMessage } from 'core/components/form/error-message'
import { ModalForm } from 'core/components/modal'
import { modalSubmit } from 'helpers'
import { IntegerInput } from 'core/components/form/integer-input'
import { Select } from 'core/components/form/select'
import { ReadOnlyInput } from 'core/components/form/readonly-input'

export const ClassificationForm = ({ route, service, id, show, refresh, parent }) => {
  const form = useForm(
    {
      displayName: ent => ent.description,
      initialEntity: {
        id: 0,
        partialCode: 1,
        code: '',
        description: '',
        isGroup: false,
        parentId: parent?.id || null,
      },
      validate: values => {
        const errors = {}
        if (!values.description) errors.description = requiredMessage
        else if (values.description.length > 80)
          errors.description = 'A descrição deve ter no máximo 80 caracteres.'
        if (!values.partialCode) errors.partialCode = requiredMessage

        return errors
      },
    },
    route,
  )

  const { entity, errors, touched } = form

  useEffect(() => {
    if (form.hasId) {
      form.handleFetch({
        action: (key, ac) => service.getById('Classification', id, ac.signal),
        errorFn: err => form.setErrors({ global: err.message }),
      })
    }
    // eslint-disable-next-line
  }, [id])

  useEffect(() => {
    if (parent) {
      const nextCode = parent.children?.length + 1 || 1
      form.setValues(prev => ({
        ...prev,
        parentId: parent.id,
        partialCode: nextCode,
        code: `${parent.code}.${nextCode}`,
      }))
    }
  }, [parent])

  return (
    <ModalForm
      isLarge
      title={form.displayName || 'Nova Conta'}
      show={show}
      fetching={form.fetching}
      submitting={form.submitting}
      resetForm={form.resetForm}
      closeAction={() => route.history.goBack()}
      onSubmit={() =>
        form.handleSubmit(data =>
          modalSubmit({ path: 'Classification', service, form, refresh, route, data }),
        )
      }
    >
      <div className="row">
        <div className="col-lg">
          <Field label="Código">
            <ReadOnlyInput value={entity.code} />
          </Field>
        </div>
        {!form.hasId && (
          <div className="col-lg">
            <Field label="Código Parcial">
              <IntegerInput
                meta={{
                  error: errors.partialCode,
                  touched: touched.partialCode,
                }}
                acceptEnter
                value={entity.partialCode}
                onChange={(partialCode, type) =>
                  form.handleChange({
                    path: 'partialCode',
                    type,
                    values: prev => ({
                      ...prev,
                      partialCode,
                      code: `${
                        prev.code.includes('.')
                          ? prev.code.split('.').slice(0, -1).join('.')
                          : prev.code
                      }${partialCode ? `.${partialCode}` : ''}`,
                    }),
                  })
                }
              />
            </Field>
          </div>
        )}
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
        <div className="col-lg">
          <Field label="Grupo">
            <Select
              items={[
                { value: true, name: 'Sim' },
                { value: false, name: 'Não' },
              ]}
              selected={entity.isGroup}
              getId={({ value }) => value}
              getDisplay={({ name }) => name}
              onChange={(item, type) =>
                form.handleChange({
                  path: 'isGroup',
                  type,
                  values: prev => ({
                    ...prev,
                    isGroup: item.value,
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
