import React, { useEffect, useState } from 'react'
import { ModalForm } from 'core/components/modal'
import { toLocaleDate } from 'core/helpers/date'
import { classNames } from '../../core/helpers/misc'
import { tableMaskMoney } from '../../core/helpers/mask'

export const InstallmentModal = ({ route, service, contractId, show }) => {
  const [installments, setInstallments] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [max, setMax] = useState(0)

  useEffect(() => {
    if (contractId > 0) {
      service
        .getList('installment', {
          filters: [
            {
              items: [
                {
                  name: 'contractId',
                  value: contractId,
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
        })
        .then(resp => {
          setInstallments(resp.items)
          setMax(resp.maxInstallments)
        })
        .catch(err => global.modal.alert(err.message))

      service
        .getList('paymentmethod', {
          usePager: false,
        })
        .then(({ items }) => setPaymentMethods(items))
        .catch(err => global.modal.alert(err.message))
    }
  }, [service, contractId])

  const [fetching] = useState(false)

  return (
    <ModalForm
      isXLarge
      title={
        <>
          <i className="fas fa-money-check-alt" /> Parcelas
        </>
      }
      show={show}
      fetching={fetching}
      closeAction={() => route.history.goBack()}
      hideButton
    >
      <div className="kt-portlet__body kt-portlet__body--fit">
        <div
          className={classNames(
            'report-irregular kt-datatable kt-datatable--default kt-datatable--brand',
            {
              'kt-datatable--loaded': installments.length > 0,
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
                  <span>Dias de Atraso</span>
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
                  <span>Pago</span>
                </th>
                <th className="kt-datatable__cell">
                  <span>Método</span>
                </th>
              </tr>
            </thead>
            <tbody className="kt-datatable__body">
              {installments.map((installment, i) => (
                <tr
                  key={i}
                  className={classNames('kt-datatable__row', {
                    'table-success': installment.paid,
                  })}
                >
                  <td className="kt-datatable__cell">
                    {`00${installment.numberInstallment}`.slice(-2)}/{`00${max}`.slice(-2)}
                  </td>
                  <td className="kt-datatable__cell">{toLocaleDate(installment.dueDate, true)}</td>
                  <td className="kt-datatable__cell">{installment.delayedDays}</td>
                  <td className="kt-datatable__cell">{tableMaskMoney(installment.value)}</td>
                  <td className="kt-datatable__cell">{tableMaskMoney(installment.fineValue)}</td>
                  <td className="kt-datatable__cell">
                    {tableMaskMoney(installment.interestValue)}
                  </td>
                  <td className="kt-datatable__cell">{tableMaskMoney(installment.total)}</td>
                  <td className="kt-datatable__cell">{installment.paid ? `Sim` : `Não`}</td>
                  <td className="kt-datatable__cell">
                    {paymentMethods.length
                      ? paymentMethods.find(pm => pm.id === installment.paymentMethodId).description
                      : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {installments.length === 0 && (
            <div className="kt-datatable--error">Nenhuma parcela foi encontrada.</div>
          )}
        </div>
      </div>
    </ModalForm>
  )
}
