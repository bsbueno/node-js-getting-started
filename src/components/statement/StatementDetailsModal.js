import React, { useEffect, useState } from 'react'
import { ModalForm } from 'core/components/modal'
import { toLocaleDate, toLocaleDateTime } from 'core/helpers/date'
import { ReadOnlyInput } from 'core/components/form/readonly-input'
import { Field } from 'core/components/form/field'
import { OperationTypes, StatementTypes } from 'core/constants'
import { tableMaskMoney, maskDecimal } from '../../core/helpers/mask'

export const StatementDetailsModal = ({ route, service, show, statementId, global }) => {
  const [statement, setStatement] = useState({
    value: 0,
  })
  const [accountPayment, setAccountPayment] = useState({
    bankAccount: { description: '' },
    accountPaymentMean: { description: '' },
    accounts: [],
  })

  const [billing, setBilling] = useState({
    id: 0,
  })

  const [payment, setPayment] = useState({
    value: 0,
    cash: 0,
    card: 0,
    check: 0,
    bankSlip: 0,
    change: 0,
  })

  useEffect(() => {
    if (statementId > 0) {
      setAccountPayment({
        bankAccount: { description: '' },
        accountPaymentMean: { description: '' },
        accounts: [],
      })
      service
        .getById('statement', statementId)
        .then(resp => {
          setStatement(resp)
          if (resp.operationType === OperationTypes.find(t => t.name === 'Pagamento').id) {
            service
              .getById('accountPayment', resp.operationId)
              .then(subResp => setAccountPayment(subResp))
              .catch(err => global.modal.alert(err.message))
            setBilling({})
            setPayment({})
          }
          if (resp.operationType === OperationTypes.find(t => t.name === 'Faturamento').id) {
            service
              .getById('billing', resp.operationId)
              .then(subResp => setBilling(subResp))
              .catch(err => global.modal.alert(err.message))
            setAccountPayment([])
            setPayment([])
          }
          if (resp.operationType === OperationTypes.find(t => t.name === 'Recebimento').id) {
            service
              .getById('payment', resp.operationId)
              .then(subResp =>
                service
                  .getList('paymentdetails', {
                    usePager: false,
                    filters: [
                      {
                        items: [
                          {
                            name: 'paymentId',
                            value: resp.operationId,
                            comparer: 'Equals',
                          },
                        ],
                      },
                    ],
                  })
                  .then(detailsResp => {
                    setPayment({ ...subResp, details: detailsResp.items })
                  })
                  .catch(err => global.modal.alert(err.message)),
              )
              .catch(err => global.modal.alert(err.message))
            setAccountPayment([])
            setBilling({})
          }
        })
        .catch(err => global.modal.alert(err.message))
    }
  }, [statementId])

  const [fetching] = useState(false)

  return (
    <ModalForm
      isLarge
      title={
        <>
          <i className="fas fa-money-check-alt" /> Detalhes do Registro
        </>
      }
      show={show}
      fetching={fetching}
      closeAction={() => route.history.goBack()}
      hideButton
    >
      <div className="row">
        <div className="col-lg">
          <Field label="Data">
            <ReadOnlyInput
              customClassName="form-control-xl"
              value={toLocaleDateTime(statement.createdAt)}
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Tipo">
            <ReadOnlyInput
              customClassName="form-control-xl"
              value={StatementTypes.find(t => t.id === statement.type)?.name || ''}
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Valor">
            <ReadOnlyInput customClassName="form-control-xl" value={maskDecimal(statement.value)} />
          </Field>
        </div>
      </div>
      <div className="row">
        <div className="col-lg">
          <Field label="Descrição">
            <ReadOnlyInput customClassName="form-control-xl" value={statement.description} />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Tipo Operação">
            <ReadOnlyInput
              customClassName="form-control-xl"
              value={OperationTypes.find(t => t.id === statement.operationType)?.name || ''}
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Id Operação">
            <ReadOnlyInput customClassName="form-control-xl" value={statement.operationId} />
          </Field>
        </div>
      </div>
      {accountPayment.id && (
        <>
          <div className="kt-heading kt-heading--sm">Detalhes pagamento</div>
          <div className="row">
            <div className="col-lg">
              <Field label="Meio de Pagamento">
                <ReadOnlyInput
                  customClassName="form-control-xl"
                  value={accountPayment.paymentMean.description}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Conta">
                <ReadOnlyInput
                  customClassName="form-control-xl"
                  value={accountPayment.bankAccount.description}
                />
              </Field>
            </div>
          </div>
          <table className="table table-borderless">
            <thead>
              <tr>
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
              </tr>
            </thead>
            <tbody>
              {accountPayment.accounts.map((account, i) => (
                <tr key={i}>
                  <td className="kt-datatable__cell">
                    <div>{account.description}</div>
                  </td>
                  <td className="kt-datatable__cell">
                    <div>{toLocaleDate(account.dueDate, true)}</div>
                  </td>
                  <td className="kt-datatable__cell">
                    <div>{account.provider?.name || ''}</div>
                  </td>
                  <td className="kt-datatable__cell">
                    <div>{account.number || ''}</div>
                  </td>
                  <td className="kt-datatable__cell">
                    <div>{tableMaskMoney(account.value)}</div>
                  </td>
                  <td className="kt-datatable__cell">
                    <div>{tableMaskMoney(account.discount)}</div>
                  </td>
                  <td className="kt-datatable__cell">
                    <div>{tableMaskMoney(account.addition)}</div>
                  </td>
                  <td className="kt-datatable__cell">
                    <div>{tableMaskMoney(account.value - account.discount + account.addition)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {payment.id > 0 && (
        <>
          <div className="kt-heading kt-heading--sm">Detalhes do recebimento</div>
          <div className="row">
            <div className="col-lg">
              <Field label="Paciente">
                <ReadOnlyInput customClassName="form-control-xl" value={payment.patient.name} />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Colaborador">
                <ReadOnlyInput customClassName="form-control-xl" value={payment.employee.name} />
              </Field>
            </div>
          </div>
          <div className="row">
            <div className="col-lg">
              <Field label="Total">
                <ReadOnlyInput
                  customClassName="form-control-xl"
                  value={maskDecimal(payment.value)}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Desconto">
                <ReadOnlyInput
                  customClassName="form-control-xl"
                  value={maskDecimal(payment.discount)}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Dinheiro">
                <ReadOnlyInput
                  customClassName="form-control-xl"
                  value={maskDecimal(payment.cash)}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Cartão">
                <ReadOnlyInput
                  customClassName="form-control-xl"
                  value={maskDecimal(payment.card)}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Cheque">
                <ReadOnlyInput
                  customClassName="form-control-xl"
                  value={maskDecimal(payment.check)}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Boleto">
                <ReadOnlyInput
                  customClassName="form-control-xl"
                  value={maskDecimal(payment.bankSlip)}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Troco">
                <ReadOnlyInput
                  customClassName="form-control-xl"
                  value={maskDecimal(payment.change)}
                />
              </Field>
            </div>
          </div>
          <table className="table table-borderless">
            <thead>
              <tr>
                <th>
                  <span>Nº da Parcela</span>
                </th>
                <th>
                  <span>Data de Vencimento</span>
                </th>
                <th>
                  <span>Dias de Atraso</span>
                </th>
                <th>
                  <span>Valor</span>
                </th>
                <th>
                  <span>Multa</span>
                </th>
                <th>
                  <span>Correção</span>
                </th>
                <th>
                  <span>Total</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {payment.details.map((detail, i) => (
                <tr key={i}>
                  <td>
                    {`00${detail.numberInstallment}`.slice(-2)}/{`00${payment.max}`.slice(-2)}
                  </td>
                  <td>{toLocaleDate(detail.dueDate, true)}</td>
                  <td>{detail.delayedDays}</td>
                  <td>{tableMaskMoney(detail.value)}</td>
                  <td>{tableMaskMoney(detail.fine)}</td>
                  <td>{tableMaskMoney(detail.interest)}</td>
                  <td>{tableMaskMoney(detail.total)}</td>
                </tr>
              ))}
              <tr>
                <td />
                <td />
                <td />
                <td />
                <td />
                <td> Desconto </td>
                <td>
                  {tableMaskMoney(
                    (payment.details.reduce(
                      (acc, curr) => acc + curr.value + curr.fine + curr.interest,
                      0,
                    ) *
                      payment.discount) /
                      100,
                  )}
                </td>
              </tr>
              <tr>
                <td />
                <td />
                <td />
                <td />
                <td />
                <td> Total </td>
                <td>{tableMaskMoney(payment.value)}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}
      {/* // */}
      {billing.id > 0 && (
        <>
          <div className="kt-heading kt-heading--sm">Detalhes do Faturamento</div>
          <div className="row">
            <div className="col-lg">
              <Field label="Paciente">
                <ReadOnlyInput customClassName="form-control-xl" value={billing.patient.name} />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Colaborador">
                <ReadOnlyInput customClassName="form-control-xl" value={billing.employee.name} />
              </Field>
            </div>
          </div>
          <div className="row">
            <div className="col-lg">
              <Field label="Total">
                <ReadOnlyInput
                  customClassName="form-control-xl"
                  value={maskDecimal(billing.value)}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Forma de Pagamento">
                <ReadOnlyInput
                  customClassName="form-control-xl"
                  value={billing.payment?.description}
                />
              </Field>
            </div>
            {(billing.paymentMeanId === 9 || billing.paymentMeanId === 10) && (
              <>
                <div className="col-lg-2">
                  <Field label="Qtde Parcelas">
                    <ReadOnlyInput customClassName="form-control-xl" value={billing.installments} />
                  </Field>
                </div>
              </>
            )}
          </div>
          <table className="table table-borderless">
            <thead>
              <tr>
                <th>
                  <span>Descrição</span>
                </th>
                <th>
                  <span>Valor</span>
                </th>
              </tr>
            </thead>
            {billing.billingExams && (
              <tbody>
                {billing.billingProcedures.map((procedures, i) => (
                  <tr key={i}>
                    <td>{procedures.medicalProcedureDescription}</td>
                    <td>{tableMaskMoney(procedures.medicalProcedureValue)}</td>
                  </tr>
                ))}
              </tbody>
            )}
            {billing.billingExams && (
              <tbody>
                {billing.billingExams.map((exams, i) => (
                  <tr key={i}>
                    <td>{exams.examDescription}</td>
                    <td>{tableMaskMoney(exams.examValue)}</td>
                  </tr>
                ))}
              </tbody>
            )}
            <tbody>
              <tr>
                <td />
                <td>
                  Desconto
                  <br />
                  {tableMaskMoney(
                    (billing.discount *
                      (billing.billingProcedures.reduce(
                        (acc, curr) => acc + curr.medicalProcedureValue,
                        0,
                      ) +
                        billing.billingExams.reduce((acc, curr) => acc + curr.examValue, 0))) /
                      100,
                  )}{' '}
                  <br />
                  Total
                  {tableMaskMoney(billing.value)}
                </td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </ModalForm>
  )
}
