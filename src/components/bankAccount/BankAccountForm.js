import React, { useEffect } from 'react'
import { useForm } from 'core/hooks/form'
import { Field } from 'core/components/form/field'
import { TextInput } from 'core/components/form/text-input'
import { requiredMessage } from 'core/constants'
import { ErrorMessage } from 'core/components/form/error-message'
import { ModalForm } from 'core/components/modal'
import { modalSubmit } from 'helpers'
import { IntegerInput } from 'core/components/form/integer-input'

export const BankAccountForm = ({ route, service, id, show, refresh }) => {
  const form = useForm(
    {
      displayName: ent => ent.description,
      initialEntity: {
        id: 0,
        description: '',
        institution: '',
        number: 0,
        verifyingDigit: 0,
        agency: 0,
      },
      validate: values => {
        const errors = {}
        if (!values.description) errors.description = requiredMessage
        else if (values.description.length > 80)
          errors.description = 'A descrição deve ter no máximo 80 caracteres.'

        if (values.institution.length > 80)
          errors.institution = 'A instituição deve ter no máximo 80 caracteres.'

        return errors
      },
    },
    route,
  )

  const { entity, errors, touched } = form

  useEffect(() => {
    if (form.hasId) {
      form.handleFetch({
        action: (key, ac) => service.getById('bankaccount', id, ac.signal),
        errorFn: err => form.setErrors({ global: err.message }),
      })
    }
    // eslint-disable-next-line
  }, [id])

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
          modalSubmit({ path: 'bankAccount', service, form, refresh, route, data }),
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
        <div className="col-lg">
          <Field label="Instituição">
            <TextInput
              meta={{
                error: errors.institution,
                touched: touched.institution,
              }}
              value={entity.institution}
              onChange={(institution, type) =>
                form.handleChange({
                  path: 'institution',
                  type,
                  values: prev => ({
                    ...prev,
                    institution,
                  }),
                })
              }
            />
          </Field>
        </div>
      </div>
      <div className="row">
        <div className="col-lg">
          <Field label="Número">
            <IntegerInput
              meta={{
                error: errors.number,
                touched: touched.number,
              }}
              acceptEnter
              value={entity.number}
              onChange={(number, type) =>
                form.handleChange({
                  path: 'number',
                  type,
                  values: prev => ({
                    ...prev,
                    number,
                  }),
                })
              }
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="DV">
            <IntegerInput
              acceptEnter
              meta={{
                error: errors.verifyingDigit,
                touched: touched.verifyingDigit,
              }}
              value={entity.verifyingDigit}
              onChange={(verifyingDigit, type) =>
                form.handleChange({
                  path: 'verifyingDigit',
                  type,
                  values: prev => ({
                    ...prev,
                    verifyingDigit,
                  }),
                })
              }
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Agência">
            <IntegerInput
              acceptEnter
              meta={{
                error: errors.agency,
                touched: touched.agency,
              }}
              value={entity.agency}
              onChange={(agency, type) =>
                form.handleChange({
                  path: 'agency',
                  type,
                  values: prev => ({
                    ...prev,
                    agency,
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
