import React, { useEffect } from 'react'
import { useForm } from 'core/hooks/form'
import { requiredMessage, CpfMask, CellPhoneMask } from 'core/constants'
import { Field } from 'core/components/form/field'
import { TextInput } from 'core/components/form/text-input'
import { submit } from 'helpers'
import { isCPF, isEmail } from 'core/helpers/validate'
import { Button } from 'core/components/button'
import { ErrorMessage } from 'core/components/form/error-message'
import { isObject } from 'core/helpers/misc'
import { AddressForm } from '../address'

export const SellerForm = ({ route, service, basename }) => {
  const form = useForm(
    {
      displayName: ent => ent.name,
      initialEntity: {
        id: 0,
        name: '',
        cpf: '',
        email: '',
        phone: '',
        password: '',
        passwordCheck: '',
        //
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
        else if (values.name.length < 8) errors.name = 'O nome deve ter pelo menos 8 caracteres.'
        else if (values.name.length > 100) errors.name = 'O nome deve ter no máximo 100 caracteres.'

        if (!values.cpf) errors.cpf = requiredMessage
        else if (!isCPF(values.cpf)) errors.cpf = 'Digite um CPF válido.'

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
        action: (id, ac) => service.getById('seller', id, ac.signal),
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
            {form.displayName ? `Editar ${form.displayName}` : 'Novo Vendedor'}
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
              path: 'seller',
              callback: () => route.history.push(`${basename}/vendedores`),
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
              <Field label="CPF">
                <TextInput
                  meta={{
                    error: errors.cpf,
                    touched: touched.cpf,
                  }}
                  mask={CpfMask}
                  value={entity.cpf}
                  onChange={(cpf, type) =>
                    form.handleChange({
                      path: 'cpf',
                      type,
                      values: prev => ({
                        ...prev,
                        cpf,
                      }),
                    })
                  }
                  disabled={form.hasId}
                />
              </Field>
            </div>
          </div>

          <div className="row">
            <div className="col-lg">
              <Field label="Rg">
                <TextInput
                  type="rg"
                  value={entity.rg}
                  onChange={(rg, type) =>
                    form.handleChange({
                      path: 'rg',
                      type,
                      values: prev => ({
                        ...prev,
                        rg,
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
                  meta={{
                    error: errors.email,
                    touched: touched.email,
                  }}
                  value={entity.email}
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
                  onChange={(phone, type) =>
                    form.handleChange({
                      path: 'phone',
                      type,
                      values: { phone },
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
