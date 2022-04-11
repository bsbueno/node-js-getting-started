import React, { useEffect } from 'react'
import { useForm } from 'core/hooks/form'
import { requiredMessage, DateMask } from 'core/constants'
import { Field } from 'core/components/form/field'
import { TextInput } from 'core/components/form/text-input'
import { submit } from 'helpers'
import { Button } from 'core/components/button'
import { ErrorMessage } from 'core/components/form/error-message'

import { DateInput } from 'core/components/form/date-input'
import { DecimalInput } from 'core/components/form/decimal-input'
import { AsyncSelect } from 'core/components/form/async-select'
import { IntegerInput } from 'core/components/form/integer-input'
import { classNames } from 'core/helpers/misc'
import { addMonths } from 'date-fns'

export const AccountPayableForm = ({ route, service, basename }) => {
  const form = useForm(
    {
      displayName: ent => ent.description,
      initialEntity: {
        id: 0,
        description: '',
        dueDate: new Date(),
        value: 0,
        discount: 0,
        addition: 0,
        numberInstallment: 1,
        installments: 1,
        providerId: null,
        number: 0,
        classificationId: null,
        subAccounts: [],
      },
      validate: values => {
        const errors = {}

        if (!values.description) errors.description = requiredMessage
        else if (values.description.length > 80)
          errors.name = 'O nome deve ter no máximo 80 caracteres.'

        if (!values.dueDate) errors.dueDate = requiredMessage

        if (!values.value) errors.value = requiredMessage

        if (values.subAccounts.length > 0) {
          if (values.subAccounts.some(a => !a.dueDate))
            errors.global = 'Todas as parcelas devem ter data de vencimento.'
          if (values.subAccounts.some(a => !a.value))
            errors.global = 'Todas as parcelas devem ter valor.'
          if (values.subAccounts.reduce((acc, curr) => acc + curr.value, 0) !== values.value)
            errors.global = 'A soma das parcelas deve ser igual ao valor da conta.'
        }

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
        action: (id, ac) => service.getById('accountPayable', id, ac.signal),
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
            {form.displayName ? `Editar ${form.displayName}` : 'Nova Conta a Pagar'}
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
              path: 'accountPayable',
              callback: () => route.history.push(`${basename}/contas-pagar`),
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
              <Field label="Descrição">
                <TextInput
                  disabled={entity.accountPaymentId}
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
              <Field label="Vencimento">
                <DateInput
                  disabled={entity.accountPaymentId}
                  customClassName="form-control-xl"
                  meta={{
                    error: errors.dueDate,
                    touched: touched.dueDate,
                  }}
                  mask={DateMask}
                  onChange={(dueDate, type) =>
                    form.handleChange({
                      path: 'dueDate',
                      type,
                      values: prev => ({
                        ...prev,
                        dueDate,
                      }),
                    })
                  }
                  value={entity.dueDate}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Classificação">
                <AsyncSelect
                  disabled={entity.accountPaymentId}
                  isClearable
                  getId={({ id }) => id}
                  getDisplay={({ code, description }) => `${code} - ${description}`}
                  getItems={() =>
                    service
                      .getList('classification', {
                        usePager: false,
                        filters: [
                          {
                            items: [
                              {
                                name: 'code',
                                comparer: 'GreaterThanOrEqual',
                                value: '2',
                              },
                            ],
                          },
                        ],
                        sort: [['code', 'ASC']],
                      })
                      .then(({ items }) => items)
                  }
                  selected={entity.classificationId}
                  onChange={classification =>
                    form.handleChange({
                      path: 'classificationId',
                      values: prev => ({
                        ...prev,
                        classificationId: classification ? classification.id : null,
                      }),
                    })
                  }
                />
              </Field>
            </div>
          </div>
          <div className="row">
            <div className="col-lg">
              <Field label="Valor">
                <DecimalInput
                  disabled={entity.accountPaymentId}
                  customClassName="form-control-xl"
                  icon="fas fa-dollar-sign"
                  meta={{
                    error: errors.value,
                    touched: touched.value,
                  }}
                  onChange={(value, type) =>
                    form.handleChange({
                      path: 'value',
                      type,
                      values: prev => ({
                        ...prev,
                        value,
                      }),
                    })
                  }
                  value={entity.value}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Desconto">
                <DecimalInput
                  disabled={entity.accountPaymentId}
                  customClassName="form-control-xl"
                  icon="fas fa-dollar-sign"
                  meta={{
                    error: errors.discount,
                    touched: touched.discount,
                  }}
                  onChange={(discount, type) =>
                    form.handleChange({
                      path: 'discount',
                      type,
                      values: prev => ({
                        ...prev,
                        discount,
                      }),
                    })
                  }
                  value={entity.discount}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Acréscimo">
                <DecimalInput
                  disabled={entity.accountPaymentId}
                  customClassName="form-control-xl"
                  icon="fas fa-dollar-sign"
                  meta={{
                    error: errors.addition,
                    touched: touched.addition,
                  }}
                  onChange={(addition, type) =>
                    form.handleChange({
                      path: 'addition',
                      type,
                      values: prev => ({
                        ...prev,
                        addition,
                      }),
                    })
                  }
                  value={entity.addition}
                />
              </Field>
            </div>
          </div>
          <div className="row">
            <div className="col-lg">
              <Field label="Fornecedor">
                <AsyncSelect
                  disabled={entity.accountPaymentId}
                  isClearable
                  getId={({ id }) => id}
                  getDisplay={({ name }) => name}
                  getItems={value =>
                    service
                      .getList('provider', {
                        usePager: false,
                        filters: [
                          {
                            items: [
                              {
                                name: 'name',
                                comparer: 'iLike',
                                value: `%${value}%`,
                              },
                            ],
                          },
                        ],
                      })
                      .then(({ items }) => items)
                  }
                  selected={entity.providerId}
                  onChange={provider =>
                    form.handleChange({
                      path: 'providerId',
                      values: prev => ({
                        ...prev,
                        providerId: provider ? provider.id : null,
                      }),
                    })
                  }
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Número Nota">
                <TextInput
                  disabled={entity.accountPaymentId}
                  meta={{
                    error: errors.number,
                    touched: touched.number,
                  }}
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
              <Field label="Parcela nº">
                <IntegerInput
                  disabled={entity.accountPaymentId || entity.id}
                  meta={{
                    error: errors.numberInstallment,
                    touched: touched.numberInstallment,
                  }}
                  value={entity.numberInstallment}
                  onChange={(numberInstallment, type) =>
                    form.handleChange({
                      path: 'numberInstallment',
                      type,
                      values: prev => ({
                        ...prev,
                        numberInstallment,
                      }),
                    })
                  }
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Total Parcelas">
                <IntegerInput
                  disabled={entity.accountPaymentId || entity.id}
                  meta={{
                    error: errors.installments,
                    touched: touched.installments,
                  }}
                  value={entity.installments}
                  onChange={(installments, type) =>
                    form.handleChange({
                      path: 'installments',
                      type,
                      values: prev => ({
                        ...prev,
                        installments,
                        subAccounts: Array(installments)
                          .fill()
                          .map((_, i) => ({
                            numberInstallment: i + 1,
                            dueDate: addMonths(prev.dueDate, i),
                            value: prev.value / installments,
                          })),
                      }),
                    })
                  }
                />
              </Field>
            </div>
          </div>

          {entity.subAccounts.length > 0 && (
            <>
              <div className="row">
                <div className="col-lg">
                  <p className="table-label">Parcelas:</p>
                </div>
              </div>
              <div className="kt-portlet__body kt-portlet__body--fit">
                <div
                  className={classNames(
                    'report-irregular kt-datatable kt-datatable--default kt-datatable--brand kt-datatable--loaded',
                  )}
                >
                  <table className="kt-datatable__table">
                    <thead className="kt-datatable__head">
                      <tr className="kt-datatable__row">
                        <th className="kt-datatable__cell">
                          <span>Nº da Parcela</span>
                        </th>
                        <th className="kt-datatable__cell">
                          <span>Data de Vencimento</span>
                        </th>
                        <th className="kt-datatable__cell">
                          <span>Valor</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="kt-datatable__body">
                      {entity.subAccounts.map((account, i) => (
                        <tr key={i} className="kt-datatable__row">
                          <td className="kt-datatable__cell">
                            <div>
                              {`00${account.numberInstallment}`.slice(-2)}/
                              {`00${entity.installments}`.slice(-2)}
                            </div>
                          </td>
                          <td className="kt-datatable__cell">
                            <DateInput
                              customClassName="form-control-xl"
                              mask={DateMask}
                              onChange={(dueDate, type) =>
                                form.handleChange({
                                  path: 'dueDate',
                                  type,
                                  values: prev => ({
                                    ...prev,
                                    subAccounts: [
                                      ...prev.subAccounts.slice(0, account.numberInstallment - 1),
                                      {
                                        numberInstallment: account.numberInstallment,
                                        value: account.value,
                                        dueDate,
                                      },
                                      ...prev.subAccounts.slice(account.numberInstallment),
                                    ],
                                  }),
                                })
                              }
                              value={account.dueDate}
                            />
                          </td>
                          <td className="kt-datatable__cell">
                            <DecimalInput
                              customClassName="form-control-xl"
                              icon="fas fa-dollar-sign"
                              onChange={(value, type) =>
                                form.handleChange({
                                  path: 'value',
                                  type,
                                  values: prev => ({
                                    ...prev,
                                    subAccounts: [
                                      ...prev.subAccounts.slice(0, account.numberInstallment - 1),
                                      {
                                        numberInstallment: account.numberInstallment,
                                        dueDate: account.dueDate,
                                        value,
                                      },
                                      ...prev.subAccounts.slice(account.numberInstallment),
                                    ],
                                  }),
                                })
                              }
                              value={account.value}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
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
