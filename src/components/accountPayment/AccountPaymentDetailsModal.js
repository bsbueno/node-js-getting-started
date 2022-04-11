import React, { useEffect, useState } from 'react'
import { ModalForm } from 'core/components/modal'
import { toLocaleDate, toLocaleDateTime } from 'core/helpers/date'
import { ReadOnlyInput } from 'core/components/form/readonly-input'
import { Field } from 'core/components/form/field'
import { tableMaskMoney, maskDecimal } from '../../core/helpers/mask'

export const AccountPaymentDetailsModal = ({ route, service, show, accountPaymentId, global }) => {
  const [payment, setPayment] = useState({
    bankAccount: { description: '' },
    paymentMean: { description: '' },
    value: 0,
    accounts: [],
  })

  useEffect(() => {
    if (accountPaymentId > 0) {
      service
        .getById('accountPayment', accountPaymentId)
        .then(resp => setPayment(resp))
        .catch(err => global.modal.alert(err.message))
    }
  }, [accountPaymentId])

  const [fetching] = useState(false)

  return (
    <ModalForm
      isLarge
      title={
        <>
          <i className="fas fa-money-check-alt" /> Detalhes do Pagamento
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
              value={toLocaleDateTime(payment.createdAt)}
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Meio de Pagamento">
            <ReadOnlyInput
              customClassName="form-control-xl"
              value={payment.paymentMean.description}
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Conta">
            <ReadOnlyInput
              customClassName="form-control-xl"
              value={payment.bankAccount.description}
            />
          </Field>
        </div>
      </div>
      {payment.accounts.length > 0 && (
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
            {payment.accounts.map((account, i) => (
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
      )}
      <div className="row">
        <div className="col-lg-9" />
        <div className="col-lg">
          <Field label="Total Pagamento">
            <ReadOnlyInput customClassName="form-control-xl" value={maskDecimal(payment.value)} />
          </Field>
        </div>
      </div>
    </ModalForm>
  )
}
