import React, { useEffect } from 'react'
import { useForm } from 'core/hooks/form'
import { Field } from 'core/components/form/field'
import { TextInput } from 'core/components/form/text-input'
import { requiredMessage } from 'core/constants'
import { ErrorMessage } from 'core/components/form/error-message'
import { ModalForm } from 'core/components/modal'
import { modalSubmit } from 'helpers'
import { DecimalInput } from 'core/components/form/decimal-input'
import { IntegerInput } from 'core/components/form/integer-input'

export const PaymentMethodForm = ({ route, service, id, show, refresh }) => {
  const form = useForm(
    {
      displayName: ent => ent.description,
      initialEntity: {
        id: 0,
        description: '',
        fine: 0,
        gracePeriod: 0,
        interest: 0,
        numberInstallments: 0,
        standardMessage: '',
        dueDay: 0,
      },
      validate: values => {
        const errors = {}
        if (!values.description) errors.description = requiredMessage
        else if (values.description.length > 80)
          errors.description = 'A descrição deve ter no máximo 80 caracteres.'

        if (values.standardMessage.length > 80)
          errors.standardMessage = 'A mensagem padrão deve ter no máximo 80 caracteres.'

        if (!values.numberInstallments) errors.numberInstallments = requiredMessage
        else if (values.numberInstallments <= 0)
          errors.numberInstallments = 'O número de parcelas deve ser maior que 0.'

        if (!values.dueDay) errors.dueDay = requiredMessage

        return errors
      },
    },
    route,
  )

  const { entity, errors, touched } = form

  useEffect(() => {
    if (form.hasId) {
      form.handleFetch({
        action: (key, ac) => service.getById('paymentmethod', id, ac.signal),
        errorFn: err => form.setErrors({ global: err.message }),
      })
    }
    // eslint-disable-next-line
	}, [id])

  return (
    <ModalForm
      isLarge
      title={form.displayName || 'Nova Opção de Pagamento'}
      show={show}
      fetching={form.fetching}
      submitting={form.submitting}
      resetForm={form.resetForm}
      closeAction={() => route.history.goBack()}
      onSubmit={() =>
        form.handleSubmit(data =>
          modalSubmit({ path: 'paymentMethod', service, form, refresh, route, data }),
        )
      }
    >
      <div className="row">
        <div className="col-lg-6">
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
          <Field label="Dia de Vencimento">
            <IntegerInput
              meta={{
                error: errors.dueDay,
                touched: touched.dueDay,
              }}
              acceptEnter
              value={entity.dueDay}
              onChange={(dueDay, type) =>
                form.handleChange({
                  path: 'dueDay',
                  type,
                  values: prev => ({
                    ...prev,
                    dueDay,
                  }),
                })
              }
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Nº de Parcelas">
            <IntegerInput
              acceptEnter
              meta={{
                error: errors.numberInstallments,
                touched: touched.numberInstallments,
              }}
              value={entity.numberInstallments}
              onChange={(numberInstallments, type) =>
                form.handleChange({
                  path: 'numberInstallments',
                  type,
                  values: prev => ({
                    ...prev,
                    numberInstallments,
                  }),
                })
              }
            />
          </Field>
        </div>
      </div>
      <div className="row">
        <div className="col-lg">
          <Field label="Multa">
            <DecimalInput
              icon="fas fa-percentage"
              value={entity.fine}
              onChange={(fine, type) =>
                form.handleChange({
                  path: 'fine',
                  type,
                  values: prev => ({
                    ...prev,
                    fine,
                  }),
                })
              }
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Período de Carência">
            <IntegerInput
              acceptEnter
              value={entity.gracePeriod}
              onChange={(gracePeriod, type) =>
                form.handleChange({
                  path: 'gracePeriod',
                  type,
                  values: prev => ({
                    ...prev,
                    gracePeriod,
                  }),
                })
              }
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Juros">
            <DecimalInput
              icon="fas fa-percentage"
              meta={{
                error: errors.interest,
                touched: touched.interest,
              }}
              value={entity.interest}
              onChange={(interest, type) =>
                form.handleChange({
                  path: 'interest',
                  type,
                  values: prev => ({
                    ...prev,
                    interest,
                  }),
                })
              }
            />
          </Field>
        </div>
      </div>
      <div className="row">
        <div className="col-lg">
          <Field label="Messagem Padrão">
            <TextInput
              meta={{
                error: errors.standardMessage,
                touched: touched.standardMessage,
              }}
              value={entity.standardMessage}
              onChange={(standardMessage, type) =>
                form.handleChange({
                  path: 'standardMessage',
                  type,
                  values: prev => ({
                    ...prev,
                    standardMessage,
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
