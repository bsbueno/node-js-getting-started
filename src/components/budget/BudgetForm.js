import { ProceduresModal } from 'components/attendance'
import { Button } from 'core/components/button'
import { Field } from 'core/components/form/field'
import { TextInput } from 'core/components/form/text-input'
import { tableMaskMoney } from 'core/helpers/mask'
import { iframeDownload } from 'core/helpers/misc'
import React, { useState } from 'react'
import { BudgetExamModal } from './BudgetExamModal'

export const BudgetForm = ({ service, global }) => {
  const [items, setItems] = useState([])
  const [name, setName] = useState()
  const [showProcedure, setShowProcedure] = useState(false)
  const [showExam, setShowExam] = useState(false)

  return (
    <div className="kt-portlet">
      <div className="kt-portlet__head">
        <div className="kt-portlet__head-label">
          <h3 className="kt-portlet__head-title">Orçamento</h3>
        </div>
      </div>
      <form
        autoComplete="off"
        className="kt-form kt-form--label-r	ight"
        onSubmit={ev => {
          ev.preventDefault()
        }}
      >
        <div className="kt-portlet__body">
          <div className="row">
            <div className="col-lg-4">
              <Field label="Nome">
                <TextInput value={name} onChange={setName} />
              </Field>
            </div>
          </div>
          <div className="row">
            <div className="col-lg kt-align-right">
              <Button
                customClassName="btn-info"
                title="Procedimento"
                icon="fas fa-plus"
                onClick={() => setShowProcedure(true)}
              />
              <Button
                customClassName="btn-info kt-ml-10"
                title="Exame"
                icon="fas fa-plus"
                onClick={() => setShowExam(true)}
              />
            </div>
          </div>

          <div className="report-irregular kt-datatable kt-datatable--default kt-datatable--brand kt-datatable--loaded">
            <table className="kt-datatable__table">
              <thead className="kt-datatable__head">
                <tr className="kt-datatable__row">
                  <th className="kt-datatable__cell">
                    <span>Descrição</span>
                  </th>
                  <th className="kt-datatable__cell">
                    <span>Tipo</span>
                  </th>
                  <th className="kt-datatable__cell" style={{ width: '20%' }}>
                    <span>Valor Particular</span>
                  </th>
                  <th className="kt-datatable__cell" style={{ width: '20%' }}>
                    <span>Valor Plano</span>
                  </th>
                  <th className="kt-datatable__cell">
                    <span />
                  </th>
                </tr>
              </thead>
              <tbody className="kt-datatable__body">
                {items.map((item, i) => (
                  <tr key={i} className="kt-datatable__row">
                    <td className="kt-datatable__cell">
                      <div>{item.description}</div>
                    </td>
                    <td className="kt-datatable__cell">
                      <div>{item.type === 'procedure' ? 'Procedimento' : 'Exame'}</div>
                    </td>
                    <td className="kt-datatable__cell">
                      <div>{tableMaskMoney(item.valueParticular)}</div>
                    </td>
                    <td className="kt-datatable__cell">
                      <div>{tableMaskMoney(item.valuePlan)}</div>
                    </td>
                    <td className="kt-datatable__cell no-wrap no-width">
                      <Button
                        customClassName="btn-danger"
                        icon="fas fa-trash"
                        title="Remover"
                        onClick={() => setItems(prev => prev.filter((_, n) => n !== i))}
                      />
                    </td>
                  </tr>
                ))}

                {items.length > 0 && (
                  <tr className="kt-datatable__row">
                    <th className="kt-datatable__cell" aria-label="Vazio" />
                    <th className="kt-datatable__cell" aria-label="Vazio" />
                    <th className="kt-datatable__cell">
                      <div>
                        {tableMaskMoney(items.reduce((acc, curr) => acc + curr.valueParticular, 0))}
                      </div>
                    </th>
                    <th className="kt-datatable__cell">
                      <div>
                        {tableMaskMoney(items.reduce((acc, curr) => acc + curr.valuePlan, 0))}
                      </div>
                    </th>
                    <th className="kt-datatable__cell" aria-label="Vazio" />
                  </tr>
                )}
              </tbody>
            </table>

            {items.length === 0 && (
              <div className="kt-datatable--error">Nenhum item foi adicionado.</div>
            )}
          </div>
        </div>
        <div className="kt-portlet__foot">
          <div className="kt-form__actions">
            <div className="row">
              <div className="col-lg kt-align-right">
                <Button
                  icon="fas fa-print"
                  customClassName="btn-print"
                  title="Imprimir"
                  onClick={() =>
                    service
                      .post('report.budget', { name, items }, undefined, resp => resp.blob())
                      .then(blob => iframeDownload(blob, 'orçamento.pdf'))
                      .catch(err => global.modal.alert(err.message))
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      <ProceduresModal
        service={service}
        show={showProcedure}
        onClose={() => setShowProcedure(false)}
        onSelect={procedure => {
          setItems(prev => [...prev, { ...procedure, type: 'procedure' }])
          setShowProcedure(false)
        }}
      />

      <BudgetExamModal
        service={service}
        show={showExam}
        onClose={() => setShowExam(false)}
        onSelect={exam => {
          setItems(prev => [...prev, { ...exam, type: 'exam' }])
          setShowExam(false)
        }}
      />
    </div>
  )
}
