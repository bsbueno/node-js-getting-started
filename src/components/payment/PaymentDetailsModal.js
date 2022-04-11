import React, { useEffect, useState } from 'react'
import { ModalForm } from 'core/components/modal'
import { toLocaleDate } from 'core/helpers/date'
import { ReadOnlyInput } from 'core/components/form/readonly-input'
import { Field } from 'core/components/form/field'
import { tableMaskMoney, maskDecimal } from '../../core/helpers/mask'

export const PaymentDetailsModal = ({ route, service, paymentId, show, global }) => {
  const [details, setDetails] = useState([])
  const [max, setMax] = useState(0)
  const [total, setTotal] = useState(0)
  const [cash, setCash] = useState(0)
  const [card, setCard] = useState(0)
  const [check, setCheck] = useState(0)
  const [bankSlip, setbankSlip] = useState(0)
  const [change, setChange] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [grossTotal, setGrossTotal] = useState(0)
  useEffect(() => {
    if (paymentId > 0) {
      service
        .getList('paymentdetails', {
          usePager: false,
          filters: [
            {
              items: [
                {
                  name: 'paymentId',
                  value: paymentId,
                  comparer: 'Equals',
                },
              ],
            },
          ],
        })
        .then(resp => {
          setDetails(resp.items)
          setTotal(resp.items[0].payment.value)
          setCash(resp.items[0].payment.cash)
          setCheck(resp.items[0].payment.check)
          setCard(resp.items[0].payment.card)
          setbankSlip(resp.items[0].payment.bankSlip)
          setChange(resp.items[0].payment.change)
          setDiscount(resp.items[0].payment.discount)
          setGrossTotal(resp.items.reduce((acc, curr) => acc + curr.total, 0))
          service
            .post('installment.getmax', {
              contractId: resp.items[0].payment.contractId,
            })
            .then(res => {
              setMax(res.maxInstallments)
            })
            .catch(err => global.modal.alert(err.message))
        })
        .catch(err => global.modal.alert(err.message))
    }
    // eslint-disable-next-line
	}, [service, paymentId])

  const [fetching] = useState(false)

  return (
    <ModalForm
      isLarge
      title={
        <>
          <i className="fas fa-money-check-alt" /> Detalhes do Recebimento
        </>
      }
      show={show}
      fetching={fetching}
      closeAction={() => route.history.goBack()}
      hideButton
    >
      <div className="row">
        <div className="col-lg">
          <Field label="Total">
            <ReadOnlyInput customClassName="form-control-xl" value={maskDecimal(total)} />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Dinheiro">
            <ReadOnlyInput customClassName="form-control-xl" value={maskDecimal(cash)} />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Cartão">
            <ReadOnlyInput customClassName="form-control-xl" value={maskDecimal(card)} />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Cheque">
            <ReadOnlyInput customClassName="form-control-xl" value={maskDecimal(check)} />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Boleto">
            <ReadOnlyInput customClassName="form-control-xl" value={maskDecimal(bankSlip)} />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Troco">
            <ReadOnlyInput customClassName="form-control-xl" value={maskDecimal(change)} />
          </Field>
        </div>
      </div>
      {details.length > 0 && (
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
            {details.map((detail, i) => (
              <tr key={i}>
                <td>
                  {`00${detail.numberInstallment}`.slice(-2)}/{`00${max}`.slice(-2)}
                </td>
                <td>{toLocaleDate(detail.dueDate, true)}</td>
                <td>{detail.delayedDays}</td>
                <td>{tableMaskMoney(detail.value)}</td>
                <td>{tableMaskMoney(detail.fine)}</td>
                <td>{tableMaskMoney(detail.interest)}</td>
                <td>{tableMaskMoney(detail.total)}</td>
              </tr>
            ))}
          </tbody>
          <tr key={1}>
            <td />
            <td />
            <td />
            <td />
            <td />
            <td>
              <strong>Total Bruto</strong>
            </td>
            <td>{tableMaskMoney(grossTotal)}</td>
          </tr>
          <tr key={1}>
            <td />
            <td />
            <td />
            <td />
            <td />
            <td>
              <strong>Descontos </strong>
            </td>
            <td>{tableMaskMoney((discount / 100) * grossTotal)}</td>
          </tr>
          <tr key={1}>
            <td />
            <td />
            <td />
            <td />
            <td />
            <td>
              <strong>Total Liquido </strong>
            </td>
            <td>{tableMaskMoney(total)}</td>
          </tr>
          <tbody />
        </table>
      )}
    </ModalForm>
  )
}
