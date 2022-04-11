import React, { useEffect, useState } from 'react'
import { differenceInYears } from 'date-fns'
import { useForm } from 'core/hooks/form'
import { requiredMessage, CpfMask, CellPhoneMask, DateMask, PhoneMask } from 'core/constants'
import { Field } from 'core/components/form/field'
import { TextInput } from 'core/components/form/text-input'
import { submit } from 'helpers'
import { isCPF, isEmail } from 'core/helpers/validate'
import { Button } from 'core/components/button'
import { ErrorMessage } from 'core/components/form/error-message'
import { isObject } from 'core/helpers/misc'
import { Switch } from 'core/components/form/switch'
import { DateInput } from 'core/components/form/date-input'
import { applyMask } from 'core/helpers/mask'
import { AddressForm } from '../address'

export const PatientForm = ({ route, service, basename }) => {
  const [routeReturn, setRouteReturn] = useState('patient')
  const [paramsRoute, setParamsRoute] = useState({})
  const [age, setAge] = useState('')
  const form = useForm(
    {
      displayName: ent => ent.name,
      initialEntity: {
        id: 0,
        name: '',
        cpfCnpj: '',
        birthDate: null,
        email: '',
        phone: '',
        rg: '',
        emittinOrgan: '',
        particular: true,
        minor: false,
        address: {
          postalCode: '',
          streetName: '',
          streetNumber: '',
          district: '',
          city: '',
          state: '',
          complement: '',
        },
        landline: '',
        cellPhone: '',
        customerId: 1,
      },
      validate: values => {
        const errors = {}

        if (!values.name) errors.name = requiredMessage
        else if (values.name.length < 8) errors.name = 'O nome deve ter pelo menos 8 caracteres.'
        else if (values.name.length > 100) errors.name = 'O nome deve ter no máximo 100 caracteres.'

        if (!values.cpfCnpj && !values.minor) errors.cpfCnpj = requiredMessage
        if (values.cpfCnpj && !isCPF(values.cpfCnpj)) errors.cpfCnpj = 'Digite um CPF válido.'

        if (values.email && !isEmail(values.email))
          errors.email = 'Digite um endereço de email válido.'

        return errors
      },
    },
    route,
  )

  const { entity, errors, touched } = form
  const fetching = form.fetching || (form.hasId && entity.id === 0)
  const { state } = route.location
  const [justShow, setJustShow] = useState(/mostrar/.test(route.match.path))

  useEffect(() => {
    if (form.hasId) {
      form.handleFetch({
        action: (id, ac) => service.getById('patient', id, ac.signal),
        errorFn: err => form.setErrors({ global: err.message }),
      })
    }
    // eslint-disable-next-line
	}, [])

  useEffect(() => {
    setJustShow(/mostrar/.test(route.match.path))
    // eslint-disable-next-line
	}, [route.location])

  useEffect(() => {
    if (state) {
      setRouteReturn(state.routeReturn ? state.routeReturn : 'patient')
      setParamsRoute(state.params ? state.params : {})
      if (!(Object.keys(state).length === 0 && state.constructor === Object)) {
        form.setValues(prev => ({
          ...prev,
          name: state.params.contactName ? state.params.contactName : '',
          phone: state.params.contactPhone
            ? applyMask(CellPhoneMask, state.params.contactPhone)
            : '',
        }))
      }
    }
    // eslint-disable-next-line
	}, [state])

  useEffect(() => {
    if (entity.birthDate) {
      setAge(
        differenceInYears(
          Date.now(),
          typeof entity.birthDate === 'string'
            ? new Date(entity.birthDate.substr(0, 19))
            : entity.birthDate,
        ),
      )
    } else {
      setAge('')
    }
    // eslint-disable-next-line
	}, [entity.birthDate])

  const callBackReturn = name => {
    if (name === 'scheduling') {
      if (paramsRoute.schedulingId !== null) {
        return `/agendamento/${paramsRoute.schedulingId}`
      }
      return '/agendamento/cadastro'
    }
    return '/clientes'
  }

  return fetching ? (
    'Carregando...'
  ) : (
    <div className="kt-portlet">
      <div className="kt-portlet__head">
        <div className="kt-portlet__head-label">
          <h3 className="kt-portlet__head-title">
            {form.displayName
              ? `${justShow ? 'Visualizar' : 'Editar'} ${form.displayName}  ${
                  age !== '' ? `- ${age} anos` : ''
                }`
              : 'Novo Cliente'}
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
              path: 'patient',
              callback: resp =>
                route.history.push(`${basename}${callBackReturn(routeReturn)}`, {
                  ...paramsRoute,
                  patientId: resp.id,
                  patientName: resp.name,
                }),
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
                  disabled={justShow}
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
                    error: errors.cpfCnpj,
                    touched: touched.cpfCnpj,
                  }}
                  disabled={justShow}
                  mask={CpfMask}
                  value={entity.cpfCnpj}
                  onChange={(cpfCnpj, type) =>
                    form.handleChange({
                      path: 'cpfCnpj',
                      type,
                      values: prev => ({
                        ...prev,
                        cpfCnpj,
                      }),
                    })
                  }
                />
              </Field>
            </div>
            <div className="col-lg-2">
              <Switch
                id="minor"
                label="Menor"
                disabled={justShow}
                checked={entity.minor}
                className="switch-layout"
                onChange={(minor, type) => {
                  form.handleChange({
                    path: 'minor',
                    type,
                    values: prev => ({
                      ...prev,
                      minor,
                    }),
                  })
                }}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-lg">
              <Field label="Data de Nasc.">
                <DateInput
                  disabled={justShow}
                  customClassName="form-control-xl"
                  meta={{
                    error: errors.birthDate,
                    touched: touched.birthDate,
                  }}
                  mask={DateMask}
                  onChange={(birthDate, type) => {
                    form.handleChange({
                      path: 'birthDate',
                      type,
                      values: prev => ({
                        ...prev,
                        birthDate,
                      }),
                    })
                  }}
                  value={entity.birthDate || null}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Rg">
                <TextInput
                  disabled={justShow}
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
                  disabled={justShow}
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
          </div>
          <div className="row">
            <div className="col-lg">
              <Field label="Telefone Principal">
                <TextInput
                  disabled={justShow}
                  type="tel"
                  icon="fas fa-phone"
                  mask={CellPhoneMask}
                  value={entity.phone || ''}
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
            <div className="col-lg">
              <Field label="Telefone Fixo">
                <TextInput
                  disabled={justShow}
                  type="tel"
                  icon="fas fa-phone"
                  mask={PhoneMask}
                  value={entity.landline || ''}
                  onChange={(landline, type) =>
                    form.handleChange({
                      path: 'landline',
                      type,
                      values: { landline },
                    })
                  }
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Telefone Celular">
                <TextInput
                  disabled={justShow}
                  type="tel"
                  icon="fas fa-phone"
                  mask={CellPhoneMask}
                  value={entity.cellPhone || ''}
                  onChange={(cellPhone, type) =>
                    form.handleChange({
                      path: 'cellPhone',
                      type,
                      values: { cellPhone },
                    })
                  }
                />
              </Field>
            </div>
          </div>
          {!entity.customerId && (
            <>
              <div className="row">
                <div className="col-lg-4">
                  <Field label="Senha Aplicativo">
                    <TextInput
                      type="password"
                      autoComplete="new-password"
                      meta={{
                        error: errors.password,
                        touched: touched.password,
                      }}
                      value={entity.password}
                      onChange={(password, type) =>
                        form.handleChange({
                          path: 'password',
                          type,
                          values: prev => ({
                            ...prev,
                            password,
                          }),
                        })
                      }
                    />
                  </Field>
                </div>
              </div>
            </>
          )}
          <div className="kt-separator kt-separator--border-dashed kt-separator--space-lg" />
          <div className="kt-heading kt-heading--sm">Endereço</div>

          <AddressForm
            disabled={justShow}
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
                  onClick={() =>
                    route.history.push(`${basename}${callBackReturn(routeReturn)}`, paramsRoute)
                  }
                />
                {justShow && (
                  <Button
                    type="button"
                    icon="fas fa-edit"
                    customClassName="btn-primary"
                    title="Editar"
                    disabled={form.submitting}
                    onClick={() => route.history.push(`${basename}/clientes/${entity.id}`)}
                  />
                )}
                {!justShow && (
                  <Button
                    icon="fas fa-save"
                    customClassName="btn-primary"
                    title="Salvar"
                    loading={form.submitting}
                    disabled={form.submitting}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
