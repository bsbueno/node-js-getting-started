import React, { useEffect } from 'react'
import { useForm } from 'core/hooks/form'
import { requiredMessage, CnpjMask, CellPhoneMask } from 'core/constants'
import { Field } from 'core/components/form/field'
import { TextInput } from 'core/components/form/text-input'
import { submit } from 'helpers'
import { isCNPJ, isEmail } from 'core/helpers/validate'
import { Button } from 'core/components/button'
import { ErrorMessage } from 'core/components/form/error-message'
import { isObject } from 'core/helpers/misc'
import { applyMask } from 'core/helpers/mask'
import { AddressForm } from '../address'

export const ProviderForm = ({ route, service, basename }) => {
  const form = useForm(
    {
      displayName: ent => ent.name,
      initialEntity: {
        id: 0,
        cnpj: '',
        name: '',
        ie: '',
        email: '',
        phone: '',
        address: {
          postalCode: '',
          streetName: '',
          streetNumber: '',
          district: '',
          city: '',
          state: '',
          complement: '',
        },
      },
      validate: values => {
        const errors = {}

        if (!values.name) errors.name = requiredMessage
        else if (values.name.length > 80) errors.name = 'O nome deve ter no máximo 80 caracteres.'

        if (!values.cnpj) errors.cnpj = requiredMessage
        else if (!isCNPJ(values.cnpj)) errors.cnpj = 'Digite um CNPJ válido.'

        if (values.email && !isEmail(values.email))
          errors.email = 'Digite um endereço de email válido.'

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
        action: (id, ac) => service.getById('provider', id, ac.signal),
        errorFn: err => form.setErrors({ global: err.message }),
      })
    }
    // eslint-disable-next-line
  }, [])

  return fetching ? (
    'Carregando...'
  ) : (
    <div className="kt-portlet">
      <div className="kt-portlet__head">
        <div className="kt-portlet__head-label">
          <h3 className="kt-portlet__head-title">
            {form.displayName ? `Editar ${form.displayName}` : 'Novo Fornecedor'}
          </h3>
        </div>
      </div>
      <form
        autoComplete="off"
        className="kt-form kt-form--label-right"
        onSubmit={ev => {
          ev.preventDefault()
          form.handleSubmit(data => {
            submit({
              path: 'provider',
              callback: () => route.history.push(`${basename}/fornecedores`),
              data,
              service,
              form,
            })
          })
        }}
      >
        <div className="kt-portlet__body">
          <div className="row">
            <div className="col-lg">
              <Field label="Nome">
                <TextInput
                  meta={{
                    error: errors.name,
                    touched: touched.name,
                  }}
                  value={entity.name}
                  onChange={(name, type) =>
                    form.handleChange({
                      path: 'name',
                      type,
                      values: prev => ({
                        ...prev,
                        name,
                      }),
                    })
                  }
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="CNPJ">
                <TextInput
                  meta={{
                    error: errors.cnpj,
                    touched: touched.cnpj,
                  }}
                  mask={CnpjMask}
                  value={applyMask(CnpjMask, entity.cnpj)}
                  onChange={(cnpj, type) =>
                    form.handleChange({
                      path: 'cnpj',
                      type,
                      values: { cnpj },
                    })
                  }
                  disabled={form.hasId}
                />
              </Field>
            </div>
          </div>
          <div className="row">
            <div className="col-lg">
              <Field label="IE">
                <TextInput
                  meta={{
                    error: errors.ie,
                    touched: touched.ie,
                  }}
                  value={entity.ie}
                  onChange={(ie, type) =>
                    form.handleChange({
                      path: 'ie',
                      type,
                      values: prev => ({
                        ...prev,
                        ie,
                      }),
                    })
                  }
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="E-mail">
                <TextInput
                  type="email"
                  icon="fas fa-at"
                  value={entity.email}
                  meta={{
                    error: errors.email,
                    touched: touched.email,
                  }}
                  onChange={(email, type) =>
                    form.handleChange({
                      path: 'email',
                      type,
                      values: prev => ({
                        ...prev,
                        email,
                      }),
                    })
                  }
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Telefone">
                <TextInput
                  type="tel"
                  icon="fas fa-phone"
                  mask={CellPhoneMask}
                  value={entity.phone}
                  meta={{
                    error: errors.phone,
                    touched: touched.phone,
                  }}
                  onChange={(phone, type) =>
                    form.handleChange({
                      path: 'phone',
                      type,
                      values: prev => ({
                        ...prev,
                        phone,
                      }),
                    })
                  }
                />
              </Field>
            </div>
          </div>

          <div className="kt-separator kt-separator--border-dashed kt-separator--space-lg" />
          <div className="kt-heading kt-heading--sm">Endereço</div>

          <AddressForm
            address={entity.address}
            errors={errors}
            touched={touched}
            setValues={(property, value, type) => {
              if (isObject(property)) {
                form.handleChange({
                  type: 'object',
                  values: prev => ({
                    ...prev,
                    address: {
                      ...prev.address,
                      ...property,
                    },
                  }),
                })
              } else {
                entity.address[property] = value
                form.handleChange({
                  path: property,
                  type,
                  values: prev => ({
                    ...prev,
                    address: entity.address,
                  }),
                })
              }
            }}
          />
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
