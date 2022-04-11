import React, { useEffect, useState } from 'react'
import { useForm } from 'core/hooks/form'
import { submit } from 'helpers'
import { Button } from 'core/components/button'
import { ErrorMessage } from 'core/components/form/error-message'
import { classNames } from 'core/helpers/misc'
import { Field } from 'core/components/form/field'
import { tableMaskMoney, maskDecimal } from 'core/helpers/mask'
import { ReadOnlyInput } from 'core/components/form/readonly-input'
import { toLocaleDate } from 'core/helpers/date'
import { Transition } from 'react-transition-group'
import { requiredMessage } from 'core/constants'
import { AsyncSelect } from 'core/components/form/async-select'
import { startOfDay } from 'date-fns'
import endOfDay from 'date-fns/endOfDay'
import { useFilters } from 'core/hooks/filter'
import { DateInput } from 'core/components/form/date-input'
import { TextInput } from 'core/components/form/text-input'
import { ModalPortal } from '../../core/components/modal'

export const AccountPaymentForm = ({ route, service, basename }) => {
  const form = useForm(
    {
      displayName: ent => ent.id,
      initialEntity: {
        id: 0,
        createdAt: new Date(),
        bankAccountId: '',
        paymentMeanId: 0,
        accounts: [],
        accountsSelected: [],
        value: 0,
        modalShow: false,
      },
      validate: values => {
        const errors = {}

        if (!values.bankAccountId) errors.bankAccountId = requiredMessage
        if (!values.paymentMeanId) errors.paymentMeanId = requiredMessage
        if (values.accountsSelected.length === 0)
          errors.global = 'Selecione pelo menos uma conta para pagar.'

        return errors
      },
    },
    route,
  )

  const { entity, errors, touched } = form
  const fetching = form.fetching || (form.hasId && entity.id === 0)

  const [dbFilters, setDbFilters] = useState({
    minDueDate: null,
    maxDueDate: null,
    providerId: '',
    number: '',
  })

  const { setValues, filters } = useFilters(
    {
      minDueDate: null,
      maxDueDate: null,
      providerId: '',
      number: '',
    },
    query => [
      {
        items: [
          query.minDueDate
            ? {
                name: 'dueDate',
                value: query.minDueDate,
                comparer: 'GreaterThanOrEqual',
              }
            : {},
          query.maxDueDate
            ? { name: 'dueDate', value: query.maxDueDate, comparer: 'LessThanOrEqual' }
            : {},
          { name: 'providerId', value: query.providerId, comparer: 'Equals' },
          {
            name: 'number',
            value: query.number,
            comparer: 'Like',
          },
          { name: 'accountPaymentId', value: null, comparer: 'Equals' },
        ],
      },
    ],
  )

  useEffect(() => {
    form.setValues(prev => ({
      ...prev,
      total: entity.accountsSelected.reduce((acc, curr) => acc + curr.total, 0),
    }))
    // eslint-disable-next-line
  }, [entity.accountsSelected])

  useEffect(() => {
    if (filters) {
      service
        .getList('accountPayable', {
          usePager: false,
          filters,
        })
        .then(resp => {
          form.setValues(prev => ({
            ...prev,
            accounts: resp.items.map(account => ({
              ...account,
              selected: false,
              invisible: false,
            })),
            accountsSelected: [],
            value: 0,
          }))
          form.setErrors({ global: null })
        })
        .catch(err => global.modal.alert(err.message))
    }
    // eslint-disable-next-line
  }, [filters])

  useEffect(() => {
    form.setValues(prev => ({
      ...prev,
      value: entity.accountsSelected.reduce(
        (acc, curr) => acc + curr.value - curr.discount + curr.addition,
        0,
      ),
    }))
  }, [entity.accountsSelected])

  return fetching ? (
    'Carregando...'
  ) : (
    <div className="kt-portlet">
      <div className="kt-portlet__head">
        <div className="kt-portlet__head-label">
          <h3 className="kt-portlet__head-title">
            {form.displayName ? `Editar ${form.displayName}` : 'Novo Pagamento'}
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
              path: 'accountPayment',
              callback: route.history.push(`${basename}/pagamento-contas`),
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
              <Field label="Meio de Pagamento">
                <AsyncSelect
                  meta={{
                    error: errors.paymentMeanId,
                    touched: touched.paymentMeanId,
                  }}
                  getId={({ id }) => id}
                  getDisplay={({ description }) => description}
                  getItems={value =>
                    service
                      .getList('paymentMean', {
                        usePager: false,
                        filters: [
                          {
                            items: [
                              {
                                name: 'description',
                                comparer: 'iLike',
                                value: `%${value}%`,
                              },
                            ],
                          },
                        ],
                      })
                      .then(({ items }) => items)
                  }
                  selected={entity.paymentMeanId}
                  onChange={(paymentMean, type) =>
                    form.handleChange({
                      path: 'cnpj',
                      type,
                      values: { paymentMeanId: paymentMean ? paymentMean.id : '' },
                    })
                  }
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Conta">
                <AsyncSelect
                  meta={{
                    error: errors.bankAccountId,
                    touched: touched.bankAccountId,
                  }}
                  getId={({ id }) => id}
                  getDisplay={({ description }) => description}
                  getItems={value =>
                    service
                      .getList('bankAccount', {
                        usePager: false,
                        filters: [
                          {
                            items: [
                              {
                                name: 'description',
                                comparer: 'iLike',
                                value: `%${value}%`,
                              },
                            ],
                          },
                        ],
                      })
                      .then(({ items }) => items)
                  }
                  selected={entity.bankAccountId}
                  onChange={(bankAccount, type) =>
                    form.handleChange({
                      path: 'cnpj',
                      type,
                      values: { bankAccountId: bankAccount ? bankAccount.id : '' },
                    })
                  }
                />
              </Field>
            </div>
          </div>
          <div className="row">
            <div className="col-lg kt-align-right">
              <Field>
                <Button
                  icon="fas fa-search"
                  customClassName="btn-info btn-icon-sm"
                  title="Selecionar Contas"
                  onClick={() => {
                    form.setValues(prev => ({
                      ...prev,
                      modalShow: true,
                    }))
                  }}
                />
              </Field>
            </div>
          </div>
          <ModalPortal>
            <Transition in={entity.modalShow} timeout={300}>
              {status => (
                <>
                  <div
                    className={classNames('modal fade', {
                      show: status === 'entered',
                    })}
                    style={{
                      display: status === 'exited' ? 'none' : 'block',
                    }}
                    tabIndex={-1}
                    role="dialog"
                    aria-modal="true"
                  >
                    <div role="document" className="modal-dialog modal-dialog-centered modal-xl">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title">Contas</h5>

                          <Button
                            type="button"
                            className="close"
                            aria-label="close"
                            data-dismiss="modal"
                            onClick={() => {
                              form.setValues(prev => ({
                                ...prev,
                                accounts: entity.accounts.map(account => ({
                                  ...account,
                                  selected: account.invisible,
                                })),
                                modalShow: false,
                              }))
                            }}
                          />
                        </div>
                        <div className="modal-body">
                          <div className="kt-portlet__body kt-portlet__body--fit">
                            <div className="row">
                              {' '}
                              <div className="col-lg">
                                <Field label="Data Inicial do Vencimento">
                                  <DateInput
                                    isClearable
                                    customClassName="form-control-xl"
                                    onChange={date =>
                                      setDbFilters(prev => ({
                                        ...prev,
                                        minDueDate: date ? startOfDay(date) : null,
                                      }))
                                    }
                                    value={dbFilters.minDueDate}
                                  />
                                </Field>
                              </div>
                              <div className="col-lg">
                                <Field label="Data Final do Vencimento">
                                  <DateInput
                                    isClearable
                                    customClassName="form-control-xl"
                                    onChange={date =>
                                      setDbFilters(prev => ({
                                        ...prev,
                                        maxDueDate: date ? endOfDay(date) : null,
                                      }))
                                    }
                                    value={dbFilters.maxDueDate}
                                  />
                                </Field>
                              </div>
                              <div className="col-lg">
                                <Field label="Fornecedor">
                                  <AsyncSelect
                                    isClearable
                                    getId={({ id }) => id}
                                    getDisplay={({ name }) => name}
                                    getItems={value =>
                                      service
                                        .getList('provider', {
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
                                    selected={dbFilters.providerId}
                                    onChange={provider =>
                                      setDbFilters(prev => ({
                                        ...prev,
                                        providerId: provider ? provider.id : undefined,
                                      }))
                                    }
                                  />
                                </Field>
                              </div>
                              <div className="col-lg">
                                <Field label="Nº Nota">
                                  <TextInput
                                    ignoreBlur
                                    type="search"
                                    value={dbFilters.number}
                                    onChange={number => setDbFilters(prev => ({ ...prev, number }))}
                                  />
                                </Field>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-lg kt-align-right">
                                <Field>
                                  <Button
                                    customClassName="btn-info btn-icon-sm"
                                    icon="fas fa-search"
                                    onClick={() => {
                                      setValues(prev => ({
                                        ...prev,
                                        ...dbFilters,
                                      }))
                                    }}
                                    title="Consultar"
                                  />
                                </Field>
                              </div>
                            </div>
                            <div
                              className={classNames(
                                'report-irregular kt-datatable kt-datatable--default kt-datatable--brand',
                                {
                                  'kt-datatable--loaded': entity.accounts.length > 0,
                                },
                              )}
                            >
                              <table className="kt-datatable__table">
                                <thead className="kt-datatable__head">
                                  <tr className="kt-datatable__row">
                                    <th className="kt-datatable__cell">
                                      <span>Descrição</span>
                                    </th>
                                    <th className="kt-datatable__cell">
                                      <span>Vencimento</span>
                                    </th>
                                    <th className="kt-datatable__cell">
                                      <span>Fornecedor</span>
                                    </th>
                                    <th className="kt-datatable__cell">
                                      <span>Nº Nota</span>
                                    </th>
                                    <th className="kt-datatable__cell">
                                      <span>Valor</span>
                                    </th>
                                    <th className="kt-datatable__cell">
                                      <span>Desconto</span>
                                    </th>
                                    <th className="kt-datatable__cell">
                                      <span>Acréscimo</span>
                                    </th>
                                    <th className="kt-datatable__cell">
                                      <span>Total</span>
                                    </th>
                                    <th className="kt-datatable__cell">
                                      <span />
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="kt-datatable__body">
                                  {entity.accounts.map(
                                    i =>
                                      !i.invisible && (
                                        <tr key={i.id} className="kt-datatable__row">
                                          <td className="kt-datatable__cell">
                                            <div>{i.description}</div>
                                          </td>
                                          <td className="kt-datatable__cell">
                                            <div>{toLocaleDate(i.dueDate)}</div>
                                          </td>
                                          <td className="kt-datatable__cell">
                                            <div>{i.providerName}</div>
                                          </td>
                                          <td className="kt-datatable__cell">
                                            <div>{i.number || ''}</div>
                                          </td>
                                          <td className="kt-datatable__cell">
                                            <div>{tableMaskMoney(i.value)}</div>
                                          </td>
                                          <td className="kt-datatable__cell">
                                            <div>{tableMaskMoney(i.discount)}</div>
                                          </td>
                                          <td className="kt-datatable__cell">
                                            <div>{tableMaskMoney(i.addition)}</div>
                                          </td>
                                          <td className="kt-datatable__cell">
                                            <div>
                                              {tableMaskMoney(i.value - i.discount + i.addition)}
                                            </div>
                                          </td>
                                          <td className="kt-datatable__cell">
                                            <Button
                                              icon={i.selected ? 'fas fa-minus' : 'fas fa-plus'}
                                              customClassName={`${
                                                i.selected ? 'btn-danger' : 'btn-success'
                                              } btn-icon-sm`}
                                              title=""
                                              onClick={() => {
                                                form.setValues(prev => ({
                                                  ...prev,
                                                  accounts: entity.accounts.map(account =>
                                                    account.id === i.id
                                                      ? {
                                                          ...account,
                                                          selected: !i.selected,
                                                        }
                                                      : account,
                                                  ),
                                                }))
                                              }}
                                            />
                                          </td>
                                        </tr>
                                      ),
                                  )}
                                </tbody>
                              </table>
                              {entity.accounts.length === 0 && (
                                <div className="kt-datatable--error">
                                  Nenhum item foi encontrado.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="modal-footer">
                          <Button
                            type="button"
                            customClassName="btn-secondary"
                            icon="fas fa-arrow-left"
                            title="Voltar"
                            onClick={() => {
                              form.setValues(prev => ({
                                ...prev,
                                accounts: entity.accounts.map(account => ({
                                  ...account,
                                  selected: account.invisible,
                                })),
                                modalShow: false,
                              }))
                            }}
                          />
                          <Button
                            customClassName="btn-primary"
                            title="Ir para Pagamento"
                            icon="fas fa-hand-holding-usd"
                            onClick={() => {
                              form.setValues(prev => ({
                                ...prev,
                                accounts: entity.accounts.map(account => ({
                                  ...account,
                                  invisible: account.selected,
                                })),
                                accountsSelected: entity.accounts.filter(
                                  account => account.selected === true,
                                ),
                                modalShow: false,
                              }))
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  {status !== 'exited' && (
                    <div
                      className={classNames('modal-backdrop fade', {
                        show: status === 'entered',
                      })}
                    />
                  )}
                </>
              )}
            </Transition>
          </ModalPortal>

          <div className="row">
            <div className="col-lg">
              <p className="table-label">Contas selecionadas:</p>
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
                      <span>Descrição</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span>Vencimento</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span>Fornecedor</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span>Nº Nota</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span>Valor</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span>Desconto</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span>Acréscimo</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span>Total</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span />
                    </th>
                  </tr>
                </thead>
                <tbody className="kt-datatable__body">
                  {entity.accountsSelected.map(i => (
                    <tr key={i.id} className="kt-datatable__row">
                      <td className="kt-datatable__cell">
                        <div>{i.description}</div>
                      </td>
                      <td className="kt-datatable__cell">
                        <div>{toLocaleDate(i.dueDate)}</div>
                      </td>
                      <td className="kt-datatable__cell">
                        <div>{i.providerName}</div>
                      </td>
                      <td className="kt-datatable__cell">
                        <div>{i.number || ''}</div>
                      </td>
                      <td className="kt-datatable__cell">
                        <div>{tableMaskMoney(i.value)}</div>
                      </td>
                      <td className="kt-datatable__cell">
                        <div>{tableMaskMoney(i.discount)}</div>
                      </td>
                      <td className="kt-datatable__cell">
                        <div>{tableMaskMoney(i.addition)}</div>
                      </td>
                      <td className="kt-datatable__cell">
                        <div>{tableMaskMoney(i.value - i.discount + i.addition)}</div>
                      </td>
                      <td className="kt-datatable__cell">
                        <Button
                          icon="fas fa-minus"
                          customClassName="btn-danger btn-icon-sm"
                          title=""
                          onClick={() => {
                            form.setValues(prev => ({
                              ...prev,
                              accounts: entity.accounts.map(account =>
                                account.id === i.id
                                  ? {
                                      ...account,
                                      selected: false,
                                      invisible: false,
                                    }
                                  : account,
                              ),
                              accountsSelected: entity.accountsSelected.filter(
                                account => account.id !== i.id,
                              ),
                            }))
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {entity.accountsSelected.length === 0 && (
                <div className="kt-datatable--error">Nenhum item foi selecionado.</div>
              )}
            </div>
          </div>
          <div className="row">
            <div className="col-lg-9" />
            <div className="col-lg">
              <Field label="Total Pagamento">
                <ReadOnlyInput
                  customClassName="form-control-xl"
                  value={maskDecimal(entity.value)}
                />
              </Field>
            </div>
          </div>
          <br />
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
