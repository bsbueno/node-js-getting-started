import React, { useEffect } from 'react'
import { useForm } from 'core/hooks/form'
import { Field } from 'core/components/form/field'
import { ErrorMessage } from 'core/components/form/error-message'
import { ModalForm } from 'core/components/modal'
import { modalSubmit } from 'helpers'
import { DecimalInput } from 'core/components/form/decimal-input'

export const ContractRenewalForm = ({ route, service, id, show, refresh }) => {
  const form = useForm(
    {
      displayName: ent => ent.contractId,
      initialEntity: {
        id: 0,
        contractId: id,
        igmp: 0,
        installmentValue: 0,
        renovatedAt: new Date(),
        oldInstallmentValue: 0,
      },
      validate: values => {
        const errors = {}

        if (!values.renovatedAt) errors.createdAt = 'Data de Renovação inválida.'

        return errors
      },
    },
    route,
  )

  const { entity, errors, touched } = form

  useEffect(() => {
    if (form.hasId) {
      form.handleFetch({
        action: (key, ac) => service.post('renewalcontract.contractValue', { id }, ac.signal),
        errorFn: err => form.setErrors({ global: err.message }),
      })
    }
    // eslint-disable-next-line
	}, [id])

  return (
    <ModalForm
      isLarge
      title={`Renovação do Contrato ${form.displayName}`}
      show={show}
      fetching={form.fetching}
      submitting={form.submitting}
      resetForm={form.resetForm}
      closeAction={() => route.history.goBack()}
      onSubmit={() => {
        form.handleSubmit(data =>
          modalSubmit({ path: 'renewalcontract', service, form, refresh, route, data }),
        )
      }}
    >
      <div className="row">
        <div className="col-lg">
          <Field label="Valor Anterior da Parcela">
            <DecimalInput
              meta={{
                error: errors.oldInstallmentValue,
                touched: touched.oldInstallmentValue,
              }}
              acceptEnter
              customClassName="form-control-xl"
              icon="fas fa-dollar-sign"
              onChange={(oldInstallmentValue, type) => {
                form.handleChange({
                  path: 'oldInstallmentValue',
                  type,
                  values: { oldInstallmentValue },
                })
              }}
              value={entity.oldInstallmentValue}
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="IGPM">
            <DecimalInput
              meta={{
                error: errors.igmp,
                touched: touched.igmp,
              }}
              acceptEnter
              customClassName="form-control-xl"
              icon="fas fa-percentage"
              onChange={(igmp, type) => {
                form.handleChange({
                  path: 'igmp',
                  type,
                  values: {
                    igmp,
                    installmentValue:
                      entity.oldInstallmentValue + (entity.oldInstallmentValue * igmp) / 100,
                  },
                })
              }}
              value={entity.igmp}
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Valor Novo da Parcela">
            <DecimalInput
              meta={{
                error: errors.installmentValue,
                touched: touched.installmentValue,
              }}
              acceptEnter
              customClassName="form-control-xl"
              icon="fas fa-dollar-sign"
              onChange={(installmentValue, type) => {
                form.handleChange({
                  path: 'installmentValue',
                  type,
                  values: { installmentValue },
                })
              }}
              value={entity.installmentValue}
            />
          </Field>
        </div>
      </div>
      <ErrorMessage error={errors.global} />
    </ModalForm>
  )
}
