import React, { useEffect, useState } from 'react'
import { useForm } from 'core/hooks/form'
import { Field } from 'core/components/form/field'
import { TextInput } from 'core/components/form/text-input'
import { requiredMessage, CellPhoneMask, DateMask } from 'core/constants'
import { submit } from 'helpers'
import { AddressForm } from 'components/address'
import { ErrorMessage } from 'core/components/form/error-message'
import { Button } from 'core/components/button'
import { DateInput } from 'core/components/form/date-input'
import { isCNPJ, isCPF } from 'core/helpers/validate'
import { toLocaleDate, toLocaleDateTime } from 'core/helpers/date'
import { Select } from 'core/components/form/select'
import { AsyncSelect } from 'core/components/form/async-select'
import { isEmptyOrDefault, isObject, iframeDownload } from 'core/helpers/misc'
import { API } from 'service'
import { onlyNumbers } from 'core/helpers/format'
import { maskCpfCnpj, maskMoney } from 'core/helpers/mask'
import { Switch } from 'core/components/form/switch'

import { DecimalInput } from 'core/components/form/decimal-input'
import { TextAreaInput } from 'core/components/form/textarea-input'

const CivilStatusType = [
  { id: 1, name: 'Solteiro(a)' },
  { id: 2, name: 'Casado(a)' },
  { id: 3, name: 'Viúvo(a)' },
  { id: 4, name: 'Separado(a)' },
  { id: 5, name: 'Divorciado(a)' },
]

export const ContractForm = ({ route, global, service, basename }) => {
  const [history, setHistory] = useState([])
  const [parentType, setParentType] = useState([])
  const [plan, setPlan] = useState({})

  const form = useForm(
    {
      displayName: ent => ent.id,
      initialEntity: {
        id: 0,
        sellerId: 0,
        customerId: 0,
        planId: '',
        institution: '',
        cancelDescription: '',
        payerName: '',
        payerCpfCnpj: '',
        payerPhone: '',
        payerRg: '',
        paymentMethodId: 0,
        createdAt: new Date(),
        customer: {
          email: '',
          rg: '',
          emittinOrgan: '',
          phone: '',
          civilStatus: '',
          reference: '',
          referencePhone: '',
          address: {
            postalCode: '',
            streetName: '',
            streetNumber: '',
            district: '',
            city: '',
            state: '',
            complement: '',
          },
          patientAdherer: {
            id: 0,
            cpfCnpj: '',
            name: '',
            birthDate: '',
          },
          dependents: [],
        },
        reprocess: false,
        createdAtOld: new Date(),
        planIdOld: '',
        paymentMethodIdOld: 0,
        dependentAditional: false,
      },
      validate: values => {
        const errors = {
          customer: {
            address: {},
            patientAdherer: {},
          },
        }
        // customer/patient
        if (!values.customer.patientAdherer.cpfCnpj) errors.cpfCnpj = requiredMessage
        else if (
          !isCPF(values.customer.patientAdherer.cpfCnpj) &&
          !isCNPJ(values.customer.patientAdherer.cpfCnpj)
        )
          errors.cpfCnpj = 'Digite um CPF/CNPJ válido.'
        if (!values.createdAt) errors.createdAt = 'Data do Contrato inválida.'
        if (!values.customer.patientAdherer.birthDate)
          errors.birthDate = 'Data de Nascimento inválida.'
        if (!values.customer.patientAdherer.name) errors.name = requiredMessage
        if (!values.planId) errors.planId = requiredMessage
        if (!values.sellerId) errors.sellerId = requiredMessage
        if (!values.paymentMethodId) errors.paymentMethodId = requiredMessage

        // address
        if (!values.customer.address.postalCode)
          errors.customer.address.postalCode = requiredMessage
        if (!values.customer.address.streetName)
          errors.customer.address.streetName = requiredMessage
        if (!values.customer.address.streetNumber)
          errors.customer.address.streetNumber = requiredMessage
        if (!values.customer.address.city) errors.customer.address.city = requiredMessage

        // payment
        if (values.payerCpfCnpj && !isCPF(values.payerCpfCnpj) && !isCNPJ(values.payerCpfCnpj))
          errors.payerCpfCnpj = 'Digite um CPF/CNPJ válido.'

        if (isEmptyOrDefault(errors.customer.address)) delete errors.customer.address
        if (isEmptyOrDefault(errors.customer.patientAdherer)) delete errors.customer.patientAdherer
        if (isEmptyOrDefault(errors.customer)) delete errors.customer

        return errors
      },
    },
    route,
  )
  const justShow = /mostrar/.test(route.match.path)
  const { entity, errors, touched } = form
  const fetching = form.fetching || (form.hasId && entity.id === 0)

  useEffect(() => {
    if (form.hasId) {
      form.handleFetch({
        action: (id, ac) => service.getById('contract', id, ac.signal),
        errorFn: err => form.setErrors({ global: err.message }),
        mapper: c => ({
          ...c,
          createdAtOld: c.createdAt,
          planIdOld: c.planId,
          paymentMethodIdOld: c.paymentMethodId,
          dependentAditional: false,
        }),
      })

      API.get(`contract.history/${route.match.params.id}`)
        .then(setHistory)
        .catch(err => form.setErrors({ global: err.message }))
    }
    // eslint-disable-next-line
	}, [])

  const [dependent, setDependent] = useState({
    name: '',
    cpfCnpj: '',
    birthdate: '',
    kinshipId: '',
    minor: false,
    additionalValue: 0,
  })

  const hasAddDependent = () =>
    dependent.birthdate !== '' &&
    dependent.birthdate !== null &&
    dependent.name !== '' &&
    ((dependent.cpfCnpj && (isCPF(dependent.cpfCnpj) || isCNPJ(dependent.cpfCnpj))) ||
      (!dependent.cpfCnpj && dependent.minor)) &&
    dependent.kinshipId !== ''

  useEffect(() => {
    const dependents = entity.customer.dependents.map(p => ({
      id: p.id,
      name: p.name,
      birthDate: p.birthDate,
      cpfCnpj: p.cpfCnpj,
      kinshipId: p.kinshipId,
      minor: p.minor,
      additionalValue: p.additionalValue || 0,
    }))

    form.handleChange({
      path: 'planBenefits',
      values: {
        customer: {
          ...entity.customer,
          dependents,
        },
      },
    })

    setPlan(entity.plan)
    // eslint-disable-next-line
	}, [entity.id])

  useEffect(() => {
    API.getList('kinship', { usePager: false }).then(resp => setParentType(resp.items))
  }, [])

  const verifyReprocess = ({ entity: ent }) => {
    const dateNew = typeof ent.createdAt === 'string' ? new Date(ent.createdAt) : ent.createdAt
    const dateOld =
      typeof ent.createdAtOld === 'string' ? new Date(ent.createdAtOld) : ent.createdAtOld
    if (
      dateNew.getFullYear() !== dateOld.getFullYear() ||
      dateNew.getMonth() !== dateOld.getMonth() ||
      dateNew.getDate() !== dateOld.getDate()
    ) {
      return true
    }
    if (ent.planIdOld !== ent.planId) {
      return true
    }
    if (ent.paymentMethodIdOld !== ent.paymentMethodId) {
      return true
    }
    return ent.dependentAditional
  }

  const printContract = async (id, onCompleted) => {
    await service
      .post('report.contract', { id }, undefined, resp => resp.blob())
      .then(blob => iframeDownload(blob, 'contrato.pdf'))
      .catch(err => global.modal.alert(err.message))
      .finally(() => {
        if (typeof onCompleted === 'function') onCompleted()
      })
  }

  const onSubmit = (callback, isPrint = false) => {
    if (isPrint && justShow) {
      callback()
      return
    }

    if (typeof entity.plan !== 'undefined') {
      if (entity.plan.single) {
        entity.customer.dependents = []
      }
    }

    if (justShow) {
      route.history.push(`${basename}/contratos/${entity.id}`)
    }

    if (form.hasId) {
      if (verifyReprocess(form)) {
        API.post('contract.installments', entity).then(parcels => {
          global.modal.confirm(
            <>
              <p>As seguintes parcelas serão Reprocessadas: </p>
              <br />
              <ul>
                {parcels.map(parcel => (
                  <li>
                    Parcela {parcel.number}/{parcels.length} vencida em{' '}
                    {toLocaleDate(parcel.due, true)} de <strong>{maskMoney(parcel.value)}</strong>{' '}
                    para <strong>{toLocaleDate(parcel.newDue, true)}</strong>
                  </li>
                ))}
              </ul>
              <br />
              <p>Deseja confirmar?</p>
            </>,
            confirmed => {
              if (confirmed) {
                form.handleSubmit(data =>
                  submit({
                    path: 'contract',
                    callback,
                    data: confirmed ? { ...data, reprocess: true } : data,
                    service,
                    form,
                  }),
                )
              }
            },
          )
        })
      } else {
        form.handleSubmit(data =>
          submit({
            path: 'contract',
            callback,
            data,
            service,
            form,
          }),
        )
      }
    } else {
      form.handleSubmit(data =>
        submit({
          path: 'contract',
          callback,
          data,
          service,
          form,
        }),
      )
    }
  }

  return fetching ? (
    'Carregando...'
  ) : (
    <div className="kt-portlet">
      <div className="kt-portlet__head">
        <div className="kt-portlet__head-label">
          <h3 className="kt-portlet__head-title">
            {form.displayName
              ? `${justShow ? 'Visualizar' : 'Editar'} Contrato ${form.displayName}`
              : 'Novo Contrato'}
          </h3>
        </div>
      </div>
      <form
        autoComplete="off"
        className="kt-form kt-form--label-right"
        onSubmit={ev => {
          ev.preventDefault()
          onSubmit(() => route.history.push(`${basename}/contratos`))
        }}
      >
        <div className="kt-portlet__body">
          <div className="row">
            <div className="col-lg">
              <Field label="Nome completo do Responsável">
                <TextInput
                  disabled={justShow}
                  meta={{
                    error: errors.name,
                    touched:
                      touched.customer &&
                      touched.customer.patientAdherer &&
                      touched.customer.patientAdherer.name,
                  }}
                  value={entity.customer.patientAdherer.name}
                  onChange={(name, type) =>
                    form.handleChange({
                      path: 'customer.patientAdherer.name',
                      type,
                      values: prev => ({
                        ...prev,
                        customer: {
                          ...prev.customer,
                          patientAdherer: {
                            ...prev.customer.patientAdherer,
                            name,
                          },
                        },
                      }),
                    })
                  }
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Data de Nasc.">
                <DateInput
                  disabled={justShow}
                  customClassName="form-control-xl"
                  meta={{
                    error: errors.birthDate,
                    touched:
                      touched.customer &&
                      touched.customer.patientAdherer &&
                      touched.customer.patientAdherer.birthDate,
                  }}
                  mask={DateMask}
                  onChange={(birthDate, type) => {
                    form.handleChange({
                      path: 'birthDate',
                      type,
                      values: prev => ({
                        ...prev,
                        customer: {
                          ...prev.customer,
                          patientAdherer: {
                            ...prev.customer.patientAdherer,
                            birthDate,
                          },
                        },
                      }),
                    })
                  }}
                  value={entity.customer.patientAdherer.birthDate || null}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="CPF/CNPJ">
                <TextInput
                  meta={{
                    error: errors.cpfCnpj,
                    touched:
                      touched.customer &&
                      touched.customer.patientAdherer &&
                      touched.customer.patientAdherer.cpfCnpj,
                  }}
                  value={entity.customer.patientAdherer.cpfCnpj}
                  onChange={(cpfCnpj, type) =>
                    form.handleChange({
                      path: 'customer.patientAdherer.cpfCnpj',
                      type,
                      values: prev => ({
                        ...prev,
                        customer: {
                          ...prev.customer,
                          patientAdherer: {
                            ...prev.customer.patientAdherer,
                            cpfCnpj,
                          },
                        },
                      }),
                    })
                  }
                  disabled={justShow || form.hasId}
                />
              </Field>
            </div>
          </div>
          <div className="row">
            <div className="col-lg">
              <Field label="Plano">
                <AsyncSelect
                  disabled={justShow}
                  meta={{
                    error: errors.planId,
                    touched: touched.planId,
                  }}
                  getId={({ id }) => id}
                  getDisplay={({ title }) => title}
                  getItems={value =>
                    service
                      .getList('plan', {
                        fields: ['id', 'title', 'disabledAt', 'single'],
                        usePager: false,
                        filters: [
                          {
                            items: [
                              {
                                name: 'title',
                                comparer: 'Like',
                                value,
                              },
                              {
                                name: 'disabledAt',
                                comparer: 'Equals',
                                value: null,
                              },
                            ],
                          },
                        ],
                      })
                      .then(({ items }) => items)
                  }
                  selected={entity.planId}
                  onChange={item => {
                    setPlan(item)
                    form.handleChange({
                      path: 'plan',
                      values: prev => ({
                        ...prev,
                        planId: item ? item.id : 0,
                        plan: item,
                      }),
                    })
                  }}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Vendedor">
                <AsyncSelect
                  disabled={justShow}
                  meta={{
                    error: errors.sellerId,
                    touched: touched.sellerId,
                  }}
                  getId={({ id }) => id}
                  getDisplay={({ name }) => name}
                  getItems={value =>
                    service
                      .getList('seller', {
                        fields: ['id', 'name', 'disabledAt'],
                        usePager: false,
                        filters: [
                          {
                            items: [
                              {
                                name: 'name',
                                comparer: 'iLike',
                                value: `%${value}%`,
                              },
                              {
                                name: 'disabledAt',
                                comparer: 'Equals',
                                value: null,
                              },
                            ],
                          },
                        ],
                      })
                      .then(({ items }) => items)
                  }
                  selected={entity.sellerId}
                  onChange={seller => {
                    form.handleChange({
                      path: 'seller',
                      values: prev => ({
                        ...prev,
                        sellerId: seller ? seller.id : 0,
                        seller,
                      }),
                    })
                  }}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Data do Contrato">
                <DateInput
                  disabled={justShow}
                  customClassName="form-control-xl"
                  meta={{
                    error: errors.createdAt,
                    touched: touched.createdAt,
                  }}
                  mask={DateMask}
                  onChange={(createdAt, type) => {
                    form.handleChange({
                      path: 'createdAt',
                      type,
                      values: prev => ({
                        ...prev,
                        createdAt,
                      }),
                    })
                  }}
                  value={entity.createdAt || null}
                />
              </Field>
            </div>
          </div>
          <div className="row">
            <div className="col-lg">
              <Field label="Identidade (RG)">
                <TextInput
                  disabled={justShow}
                  value={entity.customer.rg}
                  onChange={(rg, type) =>
                    form.handleChange({
                      path: 'customer.rg',
                      type,
                      values: prev => ({
                        ...prev,
                        customer: {
                          ...entity.customer,
                          rg,
                        },
                      }),
                    })
                  }
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Orgão Emissor">
                <TextInput
                  disabled={justShow}
                  value={entity.customer.emittinOrgan}
                  onChange={(emittinOrgan, type) =>
                    form.handleChange({
                      path: 'customer.emittinOrgan',
                      type,
                      values: prev => ({
                        ...prev,
                        customer: {
                          ...prev.customer,
                          emittinOrgan,
                        },
                      }),
                    })
                  }
                />
              </Field>
            </div>
          </div>

          <div className="row">
            <div className="col-lg">
              <Field label="Estado Civil">
                <Select
                  disabled={justShow}
                  getDisplay={s => s.name}
                  getId={s => s.name}
                  items={CivilStatusType}
                  onChange={s =>
                    form.handleChange({
                      path: 'customer.civilStatus',
                      values: {
                        customer: {
                          ...entity.customer,
                          civilStatus: s.name,
                        },
                      },
                    })
                  }
                  placeholder="Selecione o estado civil..."
                  selected={entity.customer.civilStatus}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="E-mail">
                <TextInput
                  disabled={justShow}
                  type="email"
                  icon="fas fa-at"
                  value={entity.customer.email}
                  onChange={(email, type) =>
                    form.handleChange({
                      path: 'email',
                      type,
                      values: {
                        customer: {
                          ...entity.customer,
                          email,
                        },
                      },
                    })
                  }
                />
              </Field>
            </div>
          </div>

          <div className="row">
            <div className="col-lg">
              <Field label="Telefone">
                <TextInput
                  disabled={justShow}
                  type="tel"
                  icon="fas fa-phone"
                  mask={CellPhoneMask}
                  value={entity.customer.phone}
                  onChange={(phone, type) => {
                    entity.customer.phone = phone
                    return form.handleChange({
                      path: 'customer.phone',
                      type,
                      values: prev => ({
                        ...prev,
                        customer: {
                          ...prev.customer,
                          phone,
                        },
                      }),
                    })
                  }}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Referência">
                <TextInput
                  disabled={justShow}
                  value={entity.customer.reference}
                  onChange={(reference, type) =>
                    form.handleChange({
                      path: 'customer.reference',
                      type,
                      values: prev => ({
                        ...prev,
                        customer: {
                          ...entity.customer,
                          reference,
                        },
                      }),
                    })
                  }
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Telefone Referência">
                <TextInput
                  disabled={justShow}
                  mask={CellPhoneMask}
                  value={entity.customer.referencePhone}
                  onChange={(referencePhone, type) => {
                    entity.customer.referencePhone = referencePhone
                    return form.handleChange({
                      path: 'referencePhone',
                      type,
                      values: prev => ({
                        ...prev,
                        customer: {
                          ...entity.customer,
                          referencePhone,
                        },
                      }),
                    })
                  }}
                />
              </Field>
            </div>
          </div>

          <div className="kt-separator kt-separator--border-dashed kt-separator--space-lg" />
          <AddressForm
            disabled={justShow}
            address={entity.customer.address}
            errors={{
              postalCode:
                errors.customer && errors.customer.address && errors.customer.address.postalCode,
              city: errors.customer && errors.customer.address && errors.customer.address.city,
              streetName:
                errors.customer && errors.customer.address && errors.customer.address.streetName,
              streetNumber:
                errors.customer && errors.customer.address && errors.customer.address.streetNumber,
            }}
            touched={{
              postalCode:
                touched.customer && touched.customer.address && touched.customer.address.postalCode,
              city: touched.customer && touched.customer.address && touched.customer.address.city,
              streetName:
                touched.customer && touched.customer.address && touched.customer.address.streetName,
              streetNumber:
                touched.customer &&
                touched.customer.address &&
                touched.customer.address.streetNumber,
            }}
            setValues={(property, value, type) => {
              if (isObject(property)) {
                form.handleChange({
                  type: 'object',
                  values: {
                    customer: {
                      ...entity.customer,
                      address: {
                        ...entity.customer.address,
                        ...property,
                      },
                    },
                  },
                })
              } else {
                entity.customer.address[property] = value
                form.handleChange({
                  path: property,
                  type,
                  values: {
                    customer: {
                      ...entity.customer,
                      address: entity.customer.address,
                    },
                  },
                })
              }
            }}
          />
          {plan && !plan.single && (
            <>
              <div className="kt-separator kt-separator--border-dashed kt-separator--space-lg" />
              <h5 className="h5 subtitle">Dependentes</h5>

              {!justShow && (
                <>
                  <div className="row">
                    <div className="col-lg">
                      <Field label="Nome">
                        <TextInput
                          disabled={justShow}
                          type="text"
                          value={dependent.name}
                          onChange={name => setDependent(prev => ({ ...prev, name }))}
                        />
                      </Field>
                    </div>
                    <div className="col-lg">
                      <Field label="Data de Nasc.">
                        <DateInput
                          disabled={justShow}
                          customClassName="form-control-xl"
                          onChange={birthdate => setDependent(prev => ({ ...prev, birthdate }))}
                          value={dependent.birthdate || null}
                        />
                      </Field>
                    </div>
                    <div className="col-lg">
                      <Field label="CPF">
                        <TextInput
                          disabled={justShow}
                          meta={{
                            error: errors.dependentCpfCnpj,
                            touched: !!dependent.cpfCnpj,
                          }}
                          value={dependent.cpfCnpj}
                          onChange={cpfCnpj => {
                            // dependent
                            if (cpfCnpj && !isCPF(cpfCnpj) && !isCNPJ(cpfCnpj)) {
                              errors.dependentCpfCnpj = 'Digite um CPF/CNPJ válido'
                            } else {
                              delete errors.dependentCpfCnpj
                            }

                            setDependent(prev => ({ ...prev, cpfCnpj }))
                          }}
                        />
                      </Field>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg">
                      <Field label="Parentesco">
                        <AsyncSelect
                          disabled={justShow}
                          meta={{
                            error: errors.kinshipId,
                            touched: touched.kinshipId,
                          }}
                          getId={({ id }) => id}
                          getDisplay={({ title }) => title}
                          getItems={value =>
                            service
                              .getList('kinship', {
                                usePager: false,
                                filters: [
                                  {
                                    items: [
                                      {
                                        name: 'title',
                                        comparer: 'Like',
                                        value,
                                      },
                                      {
                                        name: 'disabledAt',
                                        comparer: 'Equals',
                                        value: null,
                                      },
                                    ],
                                  },
                                ],
                              })
                              .then(({ items }) => items)
                          }
                          selected={dependent.kinshipId}
                          onChange={kinship =>
                            setDependent(prev => ({
                              ...prev,
                              kinshipId: kinship ? kinship.id : 0,
                              kinship,
                            }))
                          }
                        />
                      </Field>
                    </div>
                    <div className="col-lg-2">
                      <Switch
                        id="minor"
                        label="Menor"
                        checked={dependent.minor}
                        className="switch-layout"
                        onChange={minor =>
                          setDependent(prev => ({
                            ...prev,
                            minor,
                          }))
                        }
                        hidden={justShow}
                      />
                    </div>
                    <div className="col-lg">
                      <Field label="Valor Adicional">
                        <DecimalInput
                          acceptEnter
                          customClassName="form-control-xl"
                          icon="fas fa-dollar-sign"
                          onChange={additionalValue =>
                            setDependent(prev => ({
                              ...prev,
                              additionalValue,
                            }))
                          }
                          value={dependent.additionalValue}
                          hidden={justShow}
                        />
                      </Field>
                    </div>
                    <div className="col-lg">
                      <Button
                        type="button"
                        icon="fas fa-plus"
                        customClassName="btn-success button-add btn-block"
                        title="Adicionar"
                        hidden={justShow}
                        onClick={() => {
                          if (!hasAddDependent()) {
                            if (
                              (!dependent.cpfCnpj && !dependent.minor) ||
                              (dependent.cpfCnpj &&
                                !isCPF(dependent.cpfCnpj) &&
                                !isCNPJ(dependent.cpfCnpj))
                            ) {
                              form.setErrors({
                                global: 'Digite um CPF/CNPJ válido para o dependente.',
                              })
                            } else {
                              delete errors.dependentCpfCnpj
                            }
                          } else {
                            const aditionalValue = dependent.additionalValue
                            entity.customer.dependents.push({
                              name: dependent.name,
                              birthDate: dependent.birthdate,
                              cpfCnpj: onlyNumbers(dependent.cpfCnpj),
                              kinshipId: dependent.kinshipId,
                              kinshipName: dependent.kinshipName,
                              minor: dependent.minor,
                              additionalValue: dependent.additionalValue,
                            })

                            setDependent({
                              name: '',
                              birthdate: '',
                              cpfCnpj: '',
                              kinshipId: '',
                              minor: false,
                              additionalValue: 0,
                            })

                            form.handleChange({
                              type: 'text',
                              values: {
                                customer: {
                                  ...entity.customer,
                                  dependents: entity.customer.dependents,
                                },
                                dependentAditional:
                                  aditionalValue > 0 ? true : entity.dependentAditional,
                              },
                            })
                          }
                        }}
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                {entity.customer.dependents && entity.customer.dependents.length > 0 && (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Data de Nascimento</th>
                        <th>CPF</th>
                        <th>Parentesco</th>
                        <th>Menor</th>
                        <th>Adicional</th>
                      </tr>
                    </thead>

                    <tbody>
                      {entity.customer.dependents.map((item, i) => (
                        <tr key={i}>
                          <td>{item.name}</td>
                          <td>{toLocaleDate(item.birthDate)}</td>
                          <td>{maskCpfCnpj(item.cpfCnpj)}</td>
                          <td>
                            {item.kinshipId > 0 &&
                              parentType.length > 0 &&
                              parentType.find(f => f.id === item.kinshipId).title}
                          </td>
                          <td>{item.minor ? 'Sim' : 'Não'}</td>
                          <td>
                            {item.additionalValue >= 0 ? maskMoney(item.additionalValue) : ''}
                          </td>
                          {!justShow && (
                            <td className="no-width no-wrap">
                              <Button
                                icon="fas fa-trash"
                                customClassName="btn-danger"
                                onClick={() => {
                                  const dependents = [...entity.customer.dependents]
                                  dependents.splice(i, 1)
                                  form.handleChange({
                                    path: 'dependents',
                                    values: {
                                      customer: {
                                        ...entity.customer,
                                        dependents,
                                      },
                                      dependentAditional:
                                        item.additionalValue > 0 ? true : entity.dependentAditional,
                                    },
                                  })
                                }}
                              />
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          <div className="kt-separator kt-separator--border-dashed kt-separator--space-lg" />
          <h5 className="h5 subtitle">Autorização Responsável Financeiro - Mensalidade</h5>

          <div className="row">
            <div className="col-lg">
              <Field label="Opção de Pagamento">
                <AsyncSelect
                  disabled={justShow}
                  meta={{
                    error: errors.paymentMethodId,
                    touched: touched.paymentMethodId,
                  }}
                  getId={({ id }) => id}
                  getDisplay={({ description }) => description}
                  getItems={value =>
                    service
                      .getList('paymentmethod', {
                        usePager: false,
                        filters: [
                          {
                            items: [
                              {
                                name: 'description',
                                comparer: 'Like',
                                value,
                              },
                            ],
                          },
                        ],
                      })
                      .then(({ items }) => items)
                  }
                  selected={entity.paymentMethodId}
                  onChange={paymentMethod => {
                    form.handleChange({
                      path: 'paymentMethod',
                      values: prev => ({
                        ...prev,
                        paymentMethodId: paymentMethod ? paymentMethod.id : 0,
                      }),
                    })
                  }}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Instituição de Cobrança">
                <TextInput
                  disabled={justShow}
                  type="text"
                  value={entity.institution}
                  onChange={(institution, type) =>
                    form.handleChange({
                      path: 'institution',
                      type,
                      values: { institution },
                    })
                  }
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Responsável Financeiro">
                <TextInput
                  disabled={justShow}
                  type="text"
                  value={entity.payerName}
                  onChange={(payerName, type) =>
                    form.handleChange({
                      path: 'payerName',
                      type,
                      values: { payerName },
                    })
                  }
                />
              </Field>
            </div>
          </div>
          <div className="row">
            <div className="col-lg">
              <Field label="CPF/CNPJ">
                <TextInput
                  disabled={justShow}
                  meta={{
                    error: errors.payerCpfCnpj,
                    touched: touched.payerCpfCnpj,
                  }}
                  value={entity.payerCpfCnpj}
                  onChange={(payerCpfCnpj, type) =>
                    form.handleChange({
                      path: 'payerCpfCnpj',
                      type,
                      values: { payerCpfCnpj },
                    })
                  }
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="RG">
                <TextInput
                  disabled={justShow}
                  type="text"
                  value={entity.payerRg}
                  onChange={(payerRg, type) =>
                    form.handleChange({
                      path: 'payerRg',
                      type,
                      values: { payerRg },
                    })
                  }
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Telefone">
                <TextInput
                  disabled={justShow}
                  type="tel"
                  icon="fas fa-phone"
                  mask={CellPhoneMask}
                  value={entity.payerPhone}
                  onChange={(payerPhone, type) =>
                    form.handleChange({
                      path: 'payerPhone',
                      type,
                      values: { payerPhone },
                    })
                  }
                />
              </Field>
            </div>
          </div>

          <div className="kt-separator kt-separator--border-dashed kt-separator--space-lg" />

          <div className="row">
            <div className="col-lg">
              <Field label="Motivo de Cancelamento">
                <TextAreaInput
                  disabled={justShow}
                  meta={{
                    error: errors.cancelDescription,
                    touched: touched.cancelDescription,
                  }}
                  rows={5}
                  value={entity.cancelDescription}
                  onChange={(cancelDescription, type) =>
                    form.handleChange({
                      path: 'cancelDescription',
                      type,
                      values: prev => ({
                        ...prev,
                        cancelDescription,
                      }),
                    })
                  }
                  maxLenght={1500}
                />
              </Field>
            </div>
          </div>

          {history.length > 0 && (
            <>
              <div className="kt-separator kt-separator--border-dashed kt-separator--space-lg" />
              <h5 className="h5 subtitle">Histórico de Mudança de Plano</h5>

              <table className="table">
                <thead>
                  <tr>
                    <th>Atualizado em</th>
                    <th>Plano Anterior</th>
                    <th>Plano Novo</th>
                    <th>Reprocessado</th>
                  </tr>
                </thead>

                <tbody>
                  {history.map((item, i) => (
                    <tr key={i}>
                      <td>{toLocaleDateTime(item.changedAt)}</td>
                      <td>{item.oldPlan.title}</td>
                      <td>{item.newPlan.title}</td>
                      <td>{item.reprocessed ? 'Sim' : 'Não'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
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
                  onClick={() => route.history.push(`${basename}/contratos`)}
                />
                <Button
                  icon="fas fa-print"
                  customClassName="btn-print"
                  title="Imprimir"
                  loading={form.submitting}
                  disabled={form.submitting}
                  onClick={() => {
                    onSubmit(
                      data =>
                        printContract(data && data.id ? data.id : entity.id, () =>
                          route.history.push(`${basename}/contratos`),
                        ),
                      true,
                    )
                  }}
                />
                <Button
                  icon={justShow ? 'fas fa-edit' : 'fas fa-save'}
                  customClassName="btn-primary"
                  title={justShow ? 'Editar' : 'Salvar'}
                  loading={!justShow && form.submitting}
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
