import React, { useEffect } from 'react'
import { useForm } from 'core/hooks/form'
import { Field } from 'core/components/form/field'
import { TextInput } from 'core/components/form/text-input'
import { requiredMessage } from 'core/constants'
import { submit } from 'helpers'
import { DecimalInput } from 'core/components/form/decimal-input'
import { Button } from 'core/components/button'
import { ErrorMessage } from 'core/components/form/error-message'
import { Switch } from 'core/components/form/switch'

export const PlanForm = ({ route, service, basename, id }) => {
  const form = useForm(
    {
      displayName: ent => ent.title,
      initialEntity: {
        id: 0,
        title: '',
        value: 0,
        planBenefits: [],
      },
      validate: values => {
        const errors = {}
        if (!values.title) errors.title = requiredMessage
        else if (values.title.length > 80)
          errors.name = 'O titulo deve ter no máximo 80 caracteres.'

        if (!values.value) errors.value = requiredMessage

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
        action: (id, ac) => service.getById('plan', id, ac.signal),
        errorFn: err => form.setErrors({ global: err.message }),
      })
    }
    // eslint-disable-next-line
	}, [])

  useEffect(() => {
    const planBenefits = entity.planBenefits.map(p => ({
      name: p.name,
    }))

    form.handleChange({
      path: 'planBenefits',
      values: prev => ({
        ...prev,
        planBenefits,
      }),
    })
    // eslint-disable-next-line
	}, [entity.id])

  return fetching ? (
    'Carregando...'
  ) : (
    <div className="kt-portlet">
      <div className="kt-portlet__head">
        <div className="kt-portlet__head-label">
          <h3 className="kt-portlet__head-title">
            {form.displayName ? `Editar ${form.displayName}` : 'Novo Plano'}
          </h3>
        </div>
      </div>
      <form
        autoComplete="off"
        className="kt-form kt-form--label-right"
        onSubmit={ev => {
          ev.preventDefault()
          form.handleSubmit(data =>
            submit({
              path: 'plan',
              callback: () => route.history.push(`${basename}/planos`),
              data,
              service,
              form,
            }),
          )
        }}
      >
        <div className="kt-portlet__body">
          <div className="row">
            <div className="col-lg-6">
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
            <div className="col-lg-3">
              <Field label="Valor">
                <DecimalInput
                  meta={{
                    error: errors.value,
                    touched: touched.value,
                  }}
                  acceptEnter
                  customClassName="form-control-xl"
                  icon="fas fa-dollar-sign"
                  onChange={(value, type) => {
                    form.handleChange({
                      path: 'value',
                      type,
                      values: { value },
                    })
                  }}
                  value={entity.value}
                />
              </Field>
            </div>
            <div className="col-lg-3">
              <Switch
                id="single"
                label="Individual"
                checked={entity.single}
                className="button-add"
                onChange={single =>
                  form.handleChange({
                    path: 'single',
                    values: { single },
                  })
                }
              />
            </div>
          </div>

          <div className="kt-separator kt-separator--border-dashed kt-separator--space-lg" />

          <div className="kt-heading kt-heading--sm">Benefícios</div>

          <div className="row">
            <div className="col-sm-10">
              <Field label="Nome">
                <TextInput
                  meta={{
                    error: errors.planBenefitName,
                    touched: touched.planBenefitName,
                  }}
                  value={entity.planBenefitName}
                  onChange={(planBenefitName, type) =>
                    form.handleChange({
                      path: 'planBenefitName',
                      type,
                      values: prev => ({
                        ...prev,
                        planBenefitName,
                        planId: id,
                      }),
                    })
                  }
                />
              </Field>
            </div>
            <div className="col-sm-2">
              <Button
                type="button"
                icon="fas fa-plus"
                customClassName="btn-success button-add btn-block"
                title="Adicionar"
                disabled={!entity.planBenefitName}
                onClick={() => {
                  entity.planBenefits.push({ name: entity.planBenefitName })
                  form.handleChange({
                    path: 'planBenefitName',
                    values: prev => ({
                      ...prev,
                      planBenefitName: '',
                    }),
                  })
                }}
              />
            </div>
          </div>

          {entity.planBenefits && entity.planBenefits.length > 0 && (
            <div className="">
              <table className="table table-borderless">
                <tr>
                  <th>Nome</th>
                  <th className="no-wrap no-width" />
                </tr>
                <tbody>
                  {entity.planBenefits.map((item, i) => (
                    <tr key={i}>
                      <td>{item.name}</td>
                      <td>
                        <Button
                          icon="fas fa-trash"
                          customClassName="btn-danger"
                          onClick={() => {
                            const planBenefits = [...entity.planBenefits]
                            planBenefits.splice(i, 1)
                            form.handleChange({
                              path: 'planBenefits',
                              values: prev => ({
                                ...prev,
                                planBenefits,
                              }),
                            })
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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
