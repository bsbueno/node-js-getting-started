import React, { useEffect, useState } from 'react'
import { useForm } from 'core/hooks/form'
import { submit } from 'helpers'
import { Button } from 'core/components/button'
import { ErrorMessage } from 'core/components/form/error-message'
import { classNames, iframeDownload } from 'core/helpers/misc'
import { Field } from 'core/components/form/field'
import { TextInput } from 'core/components/form/text-input'
import { useFilters } from 'core/hooks/filter'
import { onlyNumbers } from 'core/helpers/format'
import { LoadingCard } from 'core/components/loading-card'
import { maskCpfCnpj, tableMaskMoney, maskDecimal } from 'core/helpers/mask'
import { useDebounce } from 'core/hooks/debounce'
import { ReadOnlyInput } from 'core/components/form/readonly-input'

import { toLocaleDate } from 'core/helpers/date'
import { Transition } from 'react-transition-group'
import { DecimalInput } from 'core/components/form/decimal-input'

import { DateMask } from 'core/constants'
import { DateInput } from 'core/components/form/date-input'
import { ModalPortal } from '../../core/components/modal'

function setDiscount(entity, discount) {
  if (discount === 0) {
    return entity.grossTotal
  }
  return entity.grossTotal > 0 ? entity.grossTotal - (entity.grossTotal * discount) / 100 : 0
}

const RenderContract = ({ form, service, global }) => {
  const { setValues: contract } = form
  const [items, setItems] = useState([])
  const { values, setValues, filters } = useFilters(
    {
      idContract: '',
      cpfCnpj: '',
      name: '',
    },
    query => [
      {
        items: [
          {
            name: 'patient.cpfCnpj',
            value: onlyNumbers(query.cpfCnpj),
            comparer: 'Like',
          },
          { name: 'Contract.id', value: query.idContract, comparer: 'Equals' },
          { name: 'patient.name', value: `%${query.name}%`, comparer: 'iLike' },
        ],
      },
    ],
  )

  const dbFilters = useDebounce(filters, 300)
  const [fetching, setFetching] = useState(false)
  return (
    <>
      <div className="row">
        <div className="col-lg">
          <Field label="CPF/CNPJ">
            <TextInput
              ignoreBlur
              type="search"
              value={values.cpfCnpj}
              onChange={cpfCnpj => setValues(prev => ({ ...prev, cpfCnpj }))}
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Nome do Aderente">
            <TextInput
              ignoreBlur
              type="search"
              value={values.name}
              onChange={name => setValues(prev => ({ ...prev, name }))}
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Nº Contrato">
            <TextInput
              ignoreBlur
              type="search"
              value={values.idContract}
              onChange={idContract => setValues(prev => ({ ...prev, idContract }))}
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
              title="Consultar"
              onClick={() => {
                contract(prev => ({
                  ...prev,
                  contractId: 0,
                }))
                setFetching(true)
                service
                  .getList('contract', {
                    usePager: false,
                    filters: dbFilters,
                  })
                  .then(resp => setItems(resp.items))
                  .catch(err => global.modal.alert(err.message))
                  .finally(() => setFetching(false))
              }}
            />
          </Field>
        </div>
      </div>
      {fetching ? (
        <div className="kt-portlet__body kt-pb-0 position-relative">
          <div className="row">
            <LoadingCard />
          </div>
        </div>
      ) : (
        <div className="kt-portlet__body kt-portlet__body--fit">
          <div
            className={classNames(
              'report-irregular kt-datatable kt-datatable--default kt-datatable--brand',
              {
                'kt-datatable--loaded': !fetching || items.length > 0,
                'table-loading': fetching,
              },
            )}
          >
            <table className="kt-datatable__table">
              <thead className="kt-datatable__head">
                <tr className="kt-datatable__row">
                  <th className="kt-datatable__cell">
                    <span>CPF/CNPJ do Aderente</span>
                  </th>
                  <th className="kt-datatable__cell">
                    <span>Nome do Aderente</span>
                  </th>
                  <th className="kt-datatable__cell">
                    <span>Nº Contrato</span>
                  </th>
                  <th className="kt-datatable__cell">
                    <span>Selecionar</span>
                  </th>
                </tr>
              </thead>
              <tbody className="kt-datatable__body">
                {items.map(i => (
                  <tr key={i.id} className="kt-datatable__row">
                    <td className="kt-datatable__cell">
                      <div>{maskCpfCnpj(i.patientCpfCnpj)}</div>
                    </td>
                    <td className="kt-datatable__cell">
                      <div>{i.patientName}</div>
                    </td>
                    <td className="kt-datatable__cell">
                      <div>{i.id}</div>
                    </td>
                    <td className="kt-datatable__cell">
                      <Button
                        icon="fas fa-hand-holding-usd"
                        customClassName="btn-info btn-icon-sm"
                        title=""
                        onClick={() => {
                          contract(prev => ({
                            ...prev,
                            contractName: i.patientName,
                            contractCnpjCpf: i.patientCpfCnpj,
                            contractId: i.id,
                            modalShow: true,
                          }))
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 && (
              <div className="kt-datatable--error">Nenhum item foi encontrado.</div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

const RenderPayment = ({ form, show }) => {
  const { entity, setValues, errors, touched } = form
  return (
    <>
      <div className="row">
        <div className="col-lg">
          <Field label="CPF/CNPJ">
            <ReadOnlyInput customClassName="form-control-xl" value={entity.contractCnpjCpf} />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Nome do Aderente">
            <ReadOnlyInput customClassName="form-control-xl" value={entity.contractName} />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Nº Contrato">
            <ReadOnlyInput customClassName="form-control-xl" value={entity.contractId} />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Data do Recebimento">
            <DateInput
              customClassName="form-control-xl"
              meta={{
                error: errors.createdAt,
                touched: touched.createdAt,
              }}
              mask={DateMask}
              onChange={createdAt => setValues(prev => ({ ...prev, createdAt }))}
              value={entity.createdAt || null}
              maxDate={new Date()}
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
              title="Selecionar Parcelas"
              onClick={() => {
                setValues(prev => ({
                  ...prev,
                  modalShow: true,
                }))
              }}
            />
          </Field>
        </div>
      </div>
      <ModalPortal>
        <Transition in={show} timeout={300}>
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
                <div role="document" className="modal-dialog modal-dialog-centered modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">{`Parcelas em Aberto - Contrato ${entity.contractId}`}</h5>

                      <Button
                        type="button"
                        className="close"
                        aria-label="close"
                        data-dismiss="modal"
                        onClick={() => {
                          setValues(prev => ({
                            ...prev,
                            installments: entity.installments.map(installment => ({
                              ...installment,
                              selected: installment.invisible,
                            })),
                            modalShow: false,
                          }))
                        }}
                      />
                    </div>
                    <div className="modal-body">
                      <div className="kt-portlet__body kt-portlet__body--fit">
                        <div
                          className={classNames(
                            'report-irregular kt-datatable kt-datatable--default kt-datatable--brand',
                            {
                              'kt-datatable--loaded': entity.installments.length > 0,
                            },
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
                                  <span>Dias de atraso</span>
                                </th>
                                <th className="kt-datatable__cell">
                                  <span>Valor</span>
                                </th>
                                <th className="kt-datatable__cell">
                                  <span>Multa</span>
                                </th>
                                <th className="kt-datatable__cell">
                                  <span>Correção</span>
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
                              {entity.installments.map(
                                i =>
                                  !i.invisible && (
                                    <tr key={i.id} className="kt-datatable__row">
                                      <td className="kt-datatable__cell">
                                        <div>
                                          {`00${i.numberInstallment}`.slice(-2)}/
                                          {`00${entity.maxInstallments}`.slice(-2)}
                                        </div>
                                      </td>
                                      <td className="kt-datatable__cell">
                                        <div>{toLocaleDate(i.dueDate, true)}</div>
                                      </td>
                                      <td className="kt-datatable__cell">
                                        <div>{i.delayedDays}</div>
                                      </td>
                                      <td className="kt-datatable__cell">
                                        <div>{tableMaskMoney(i.value)}</div>
                                      </td>
                                      <td className="kt-datatable__cell">
                                        <div>{tableMaskMoney(i.fineValue)}</div>
                                      </td>
                                      <td className="kt-datatable__cell">
                                        <div>{tableMaskMoney(i.interestValue)}</div>
                                      </td>
                                      <td className="kt-datatable__cell">
                                        <div>{tableMaskMoney(i.total)}</div>
                                      </td>
                                      <td className="kt-datatable__cell">
                                        <Button
                                          icon={i.selected ? 'fas fa-minus' : 'fas fa-plus'}
                                          customClassName={`${
                                            i.selected ? 'btn-danger' : 'btn-success'
                                          } btn-icon-sm`}
                                          title=""
                                          onClick={() => {
                                            setValues(prev => ({
                                              ...prev,
                                              installments: entity.installments.map(installment =>
                                                installment.id === i.id
                                                  ? {
                                                      ...installment,
                                                      selected: !i.selected,
                                                    }
                                                  : installment,
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
                          {entity.installments.length === 0 && (
                            <div className="kt-datatable--error">Nenhum item foi encontrado.</div>
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
                          setValues(prev => ({
                            ...prev,
                            installments: entity.installments.map(installment => ({
                              ...installment,
                              selected: installment.invisible,
                            })),
                            modalShow: false,
                          }))
                        }}
                      />
                      <Button
                        customClassName="btn-primary"
                        title="Ir para Recebimento"
                        icon="fas fa-hand-holding-usd"
                        onClick={() => {
                          setValues(prev => ({
                            ...prev,
                            installments: entity.installments.map(installment => ({
                              ...installment,
                              invisible: installment.selected,
                            })),
                            installmentsSelected: entity.installments.filter(
                              installment => installment.selected === true,
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
          <p className="table-label">Parcelas selecionadas:</p>
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
                  <span>Dias de atraso</span>
                </th>
                <th className="kt-datatable__cell">
                  <span>Valor</span>
                </th>
                <th className="kt-datatable__cell">
                  <span>Multa</span>
                </th>
                <th className="kt-datatable__cell">
                  <span>Correção</span>
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
              {entity.installmentsSelected.map(i => (
                <tr key={i.id} className="kt-datatable__row">
                  <td className="kt-datatable__cell">
                    <div>
                      {`00${i.numberInstallment}`.slice(-2)}/
                      {`00${entity.maxInstallments}`.slice(-2)}
                    </div>
                  </td>
                  <td className="kt-datatable__cell">
                    <div>{toLocaleDate(i.dueDate, true)}</div>
                  </td>
                  <td className="kt-datatable__cell">
                    <div>{i.delayedDays}</div>
                  </td>
                  <td className="kt-datatable__cell">
                    <div>{tableMaskMoney(i.value)}</div>
                  </td>
                  <td className="kt-datatable__cell">
                    <div>{tableMaskMoney(i.fineValue)}</div>
                  </td>
                  <td className="kt-datatable__cell">
                    <div>{tableMaskMoney(i.interestValue)}</div>
                  </td>
                  <td className="kt-datatable__cell">
                    <div>{tableMaskMoney(i.total)}</div>
                  </td>
                  <td className="kt-datatable__cell">
                    <Button
                      icon="fas fa-minus"
                      customClassName="btn-danger btn-icon-sm"
                      title=""
                      onClick={() => {
                        setValues(prev => ({
                          ...prev,
                          installments: entity.installments.map(installment =>
                            installment.id === i.id
                              ? {
                                  ...installment,
                                  selected: false,
                                  invisible: false,
                                }
                              : installment,
                          ),
                          installmentsSelected: entity.installmentsSelected.filter(
                            installment => installment.id !== i.id,
                          ),
                        }))
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {entity.installmentsSelected.length === 0 && (
            <div className="kt-datatable--error">Nenhum item foi selecionado.</div>
          )}
        </div>
      </div>
      <div className="row">
        <div className="col-lg-2">
          <Field label="Total Recebimento">
            <ReadOnlyInput customClassName="form-control-xl" value={maskDecimal(entity.total)} />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Desconto">
            <DecimalInput
              disabled={entity.forValue === true}
              acceptEnter
              customClassName="form-control-xl"
              icon="fas fa-percentage"
              onChange={discount =>
                setValues(prev => ({ ...prev, discount, forValue: discount > 0 ? false : 3 }))
              }
              value={entity.discount}
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="">
            <DecimalInput
              disabled={entity.forValue === false}
              acceptEnter
              customClassName="form-control-xl"
              icon="fas fa-dollar-sign"
              onChange={discountValue =>
                setValues(prev => ({
                  ...prev,
                  discountValue,
                  forValue: discountValue > 0 ? true : 3,
                }))
              }
              value={entity.discountValue || 0}
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Dinheiro">
            <DecimalInput
              acceptEnter
              customClassName="form-control-xl"
              icon="fas fa-dollar-sign"
              onChange={cash => setValues(prev => ({ ...prev, cash }))}
              value={entity.cash}
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Cartão">
            <DecimalInput
              acceptEnter
              customClassName="form-control-xl"
              icon="fas fa-dollar-sign"
              onChange={card => setValues(prev => ({ ...prev, card }))}
              value={entity.card}
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Cheque">
            <DecimalInput
              acceptEnter
              customClassName="form-control-xl"
              icon="fas fa-dollar-sign"
              onChange={check => setValues(prev => ({ ...prev, check }))}
              value={entity.check}
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Boleto">
            <DecimalInput
              acceptEnter
              customClassName="form-control-xl"
              icon="fas fa-dollar-sign"
              onChange={bankSlip => setValues(prev => ({ ...prev, bankSlip }))}
              value={entity.bankSlip}
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Troco">
            <ReadOnlyInput customClassName="form-control-xl" value={maskDecimal(entity.change)} />
          </Field>
        </div>
      </div>
      {entity.discount > 0 && (
        <>
          <div className="row">
            <div className="col-lg-2">
              <Field label="Senha Desconto">
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
    </>
  )
}

export const PaymentForm = ({ route, service, basename, global }) => {
  const form = useForm(
    {
      displayName: ent => ent.id,
      initialEntity: {
        id: 0,
        createdAt: new Date(),
        contractName: '',
        contractCnpjCpf: '',
        contractId: 0,
        installments: [],
        installmentsSelected: [],
        maxInstallments: 0,
        view: 'Contracts',
        modalShow: false,
        cash: 0,
        card: 0,
        check: 0,
        change: 0,
        bankSlip: 0,
        total: 0,
        discount: 0,
        discountValue: 0,
        forValue: 0,
        grossTotal: 0,
      },
      validate: values => {
        const errors = {}
        if (!values.createdAt) errors.createdAt = 'Data do Recebimento inválida.'
        if (!values.password && values.discount > 0)
          errors.password = 'Informe a senha para liberar o desconto'
        return errors
      },
    },
    route,
  )

  const { entity, errors } = form
  const fetching = form.fetching || (form.hasId && entity.id === 0)

  useEffect(() => {
    if (entity.contractId > 0) {
      service
        .getList('installment', {
          usePager: false,
          filters: [
            {
              items: [
                {
                  name: 'contractId',
                  value: entity.contractId,
                  comparer: 'Equals',
                },
                {
                  name: 'paid',
                  value: false,
                  comparer: 'Equals',
                },
                {
                  name: 'Installment.disabledAt',
                  value: null,
                  comparer: 'Equals',
                },
              ],
            },
          ],
          additionalValues: [
            {
              createdAt: entity.createdAt,
            },
          ],
        })
        .then(resp => {
          form.setValues(prev => ({
            ...prev,
            installments: resp.items.map(installment => ({
              ...installment,
              selected: false,
              invisible: false,
            })),
            installmentsSelected: [],
            maxInstallments: resp.maxInstallments,
            view: 'Payment',
            cash: 0,
            card: 0,
            check: 0,
            bankSlip: 0,
            change: 0,
            total: 0,
          }))
          form.setErrors({ global: null })
        })
        .catch(err => global.modal.alert(err.message))
    }
    // eslint-disable-next-line
	}, [entity.contractId])

  useEffect(() => {
    if (entity.createdAt !== new Date()) {
      const updatedInstallmentsSelected = []

      for (const installment of entity.installmentsSelected) {
        const dueDate = new Date(installment.dueDate)
        const dueLimitDate = new Date(
          dueDate.getFullYear(),
          dueDate.getMonth(),
          dueDate.getDate() + installment.gracePeriod,
        )
        let interestValue = 0.0
        let fineValue = 0.0
        let total = parseFloat(installment.value)
        let delayedDays = 0

        if (dueLimitDate < entity.createdAt && !installment.paid) {
          delayedDays = Math.trunc((entity.createdAt - dueLimitDate) / (60 * 60 * 24 * 1000))
          fineValue = parseFloat(installment.value) * (parseFloat(installment.fine) / 100)
          interestValue =
            (parseFloat(installment.interest) / 100 / 30) *
            delayedDays *
            parseFloat(installment.value)
          total = parseFloat(installment.value) + fineValue + interestValue
        }

        updatedInstallmentsSelected.push({
          ...installment,
          delayedDays,
          fineValue,
          interestValue,
          total,
        })
      }

      const updatedInstallments = []

      for (const installment of entity.installments) {
        const dueDate = new Date(installment.dueDate)
        const dueLimitDate = new Date(
          dueDate.getFullYear(),
          dueDate.getMonth(),
          dueDate.getDate() + installment.gracePeriod,
        )
        let interestValue = 0.0
        let fineValue = 0.0
        let total = parseFloat(installment.value)
        let delayedDays = 0

        if (dueLimitDate < entity.createdAt && !installment.paid) {
          delayedDays = Math.trunc((entity.createdAt - dueLimitDate) / (60 * 60 * 24 * 1000))
          fineValue = parseFloat(installment.value) * (parseFloat(installment.fine) / 100)
          interestValue =
            (parseFloat(installment.interest) / 100 / 30) *
            delayedDays *
            parseFloat(installment.value)
          total = parseFloat(installment.value) + fineValue + interestValue
        }

        updatedInstallments.push({
          ...installment,
          delayedDays,
          fineValue,
          interestValue,
          total,
        })
      }

      form.setValues(prev => ({
        ...prev,
        installmentsSelected: updatedInstallmentsSelected,
        installments: updatedInstallments,
      }))
    }
    // eslint-disable-next-line
	}, [entity.createdAt])

  useEffect(() => {
    form.setValues(prev => ({
      ...prev,
      total: entity.installmentsSelected.reduce((acc, curr) => acc + curr.total, 0),
      grossTotal: entity.installmentsSelected.reduce((acc, curr) => acc + curr.total, 0),
    }))
    // eslint-disable-next-line
	}, [entity.installmentsSelected])
  useEffect(() => {
    if (entity.total === 0) {
      form.setValues(prev => ({
        ...prev,
        cash: 0,
        card: 0,
        check: 0,
        bankSlip: 0,
        change: 0,
      }))
    } else {
      form.setValues(prev => ({
        ...prev,
        change:
          entity.cash + entity.card + entity.check + entity.bankSlip > entity.total
            ? entity.cash + entity.card + entity.check + entity.bankSlip - entity.total
            : 0,
      }))
    }
    // eslint-disable-next-line
	}, [entity.total, entity.cash, entity.card, entity.check, entity.bankSlip])

  useEffect(() => {
    form.setValues(prev => ({
      ...prev,
      discountValue: (entity.grossTotal * entity.discount) / 100 || 0,
      total: setDiscount(entity, entity.discount),
    }))
  }, [entity.discount])
  useEffect(
    () => {
      // eslint-disable-next-line no-nested-ternary

      form.setValues(prev => ({
        ...prev,
        discount: (entity.discountValue / entity.grossTotal) * 100 || 0,
        total: setDiscount(entity, entity.discount),
      }))
    },
    [entity.discountValue],
    // [entity.value],
  )
  useEffect(() => {
    form.setValues(prev => ({
      ...prev,
      total: setDiscount(entity, entity.discount),
    }))
  }, [entity.discount])

  const print = async (id, onCompleted) => {
    await service
      .post('report.paymentreceipt', { id }, undefined, resp => resp.blob())
      .then(blob => iframeDownload(blob, 'recibo.pdf'))
      .catch(err => global.modal.alert(err.message))
      .finally(() => {
        if (typeof onCompleted === 'function') onCompleted()
      })
  }
  const onSubmit = callback => {
    if (entity.contractId <= 0) {
      form.setErrors({ global: 'Selecionar ao menos um contrato.' })
    } else if (entity.installmentsSelected.length === 0) {
      form.setErrors({
        global: 'Selecionar ao menos uma parcela para recebimento.',
      })
    } else if (
      entity.cash + entity.card + entity.check + entity.bankSlip <
      entity.total.toFixed(2)
    ) {
      form.setErrors({
        global: 'Valores pagos menor que o total de parcelas.',
      })
    } else {
      form.handleSubmit(data => {
        submit({
          path: 'payment',
          callback,
          data,
          service,
          form,
        })
      })
    }
  }

  return fetching ? (
    'Carregando...'
  ) : (
    <div className="kt-portlet">
      <div className="kt-portlet__head">
        <div className="kt-portlet__head-label">
          <h3 className="kt-portlet__head-title">
            {form.displayName ? `Editar ${form.displayName}` : 'Novo Recebimento'}
          </h3>
        </div>
      </div>
      <form
        autoComplete="off"
        className="kt-form kt-form--label-right"
        onSubmit={ev => {
          ev.preventDefault()
          onSubmit(() => route.history.push(`${basename}/pagamentos`))
        }}
      >
        <div className="kt-portlet__body">
          <ul className="nav nav-tabs kt-mb-0" role="tablist">
            <li className="nav-item">
              <button
                className={classNames('nav-link', {
                  active: entity.view === 'Contracts',
                })}
                onClick={() =>
                  form.setValues({
                    view: 'Contracts',
                  })
                }
                type="button"
              >
                <span className="btn kt-padding-0">Contratos</span>
              </button>
            </li>
            <li className="nav-item">
              <button
                className={classNames('nav-link', {
                  active: entity.view === 'Payment',
                  disabled: entity.contractId === 0,
                })}
                onClick={() =>
                  form.setValues({
                    view: 'Payment',
                  })
                }
                type="button"
              >
                <span className="btn kt-padding-0">Recebimento</span>
              </button>
            </li>
          </ul>
          <div className="border border-top-0 rounded-bottom p-3">
            {entity.view === 'Contracts' && (
              <RenderContract form={form} service={service} global={global} />
            )}
            {entity.view === 'Payment' && <RenderPayment form={form} show={entity.modalShow} />}
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
                  icon="fas fa-print"
                  customClassName="btn-print"
                  title="Imprimir"
                  loading={form.submitting}
                  disabled={form.submitting}
                  onClick={() => {
                    onSubmit(data =>
                      print(data.id, () => route.history.push(`${basename}/pagamentos`)),
                    )
                  }}
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
