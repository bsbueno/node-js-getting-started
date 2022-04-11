import React, { useEffect, useState } from 'react'
import { Transition } from 'react-transition-group'
import { ModalPortal } from '../../core/components/modal'
import { useForm } from '../../core/hooks/form'
import { ErrorMessage } from '../../core/components/form/error-message'
import { Switch } from '../../core/components/form/switch'
import { forceDownload, classNames } from '../../core/helpers/misc'

import { Button } from '../../core/components/button'

export const CardIssuanceModal = ({ contractId, route, service, basename, show }) => {
  const form = useForm(
    {
      initialEntity: {
        patients: [],
      },
      validate: () => ({}),
    },
    route,
  )

  const [selectAll, setSelectAll] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (contractId > 0) {
      form.resetForm()
      service
        .post('contract.patients', { id: contractId })
        .then(res => {
          form.setValues(prev => ({
            ...prev,
            patients: res,
          }))
        })
        .catch(err => form.setErrors({ global: err.message }))
    }
    // eslint-disable-next-line
	}, [contractId])

  useEffect(() => {
    form.setValues(prev => ({
      patients: prev.patients.map(patient => ({ ...patient, selected: selectAll })),
    }))
    // eslint-disable-next-line
	}, [selectAll])

  const { entity, errors } = form

  return (
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
                    <h5 className="modal-title">{`Emissão de Carteirinhas - Contrato ${contractId}`}</h5>

                    <Button
                      type="button"
                      className="close"
                      aria-label="close"
                      data-dismiss="modal"
                      onClick={() => {
                        route.history.push(`${basename}/contratos`, {
                          contract: 0,
                        })
                      }}
                    />
                  </div>
                  <div className="modal-body">
                    <div className="marginLeft">
                      <div>
                        <Switch
                          id="marcarTodos"
                          label={selectAll ? 'Desmarcar Todos' : 'Marcar Todos'}
                          checked={selectAll}
                          className="button-add"
                          onChange={selected => {
                            setSelectAll(selected)
                          }}
                        />
                      </div>
                    </div>
                    <div className="kt-portlet__body kt-pb-0 position-relative">
                      <div className="kt-datatable kt-datatable--default kt-datatable--brand kt-datatable--loaded">
                        <table className="kt-datatable__table">
                          <thead className="kt-datatable__head">
                            <tr className="kt-datatable__row">
                              <th className="kt-datatable__cell">
                                <span>Nome</span>
                              </th>
                              <th className="kt-datatable__cell">
                                <span>CPF</span>
                              </th>
                              <th className="kt-datatable__cell">
                                <span>Selecionar</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="kt-datatable__body">
                            {entity.patients.map(i => (
                              <tr key={i.id} className="kt-datatable__row">
                                <td className="kt-datatable__cell">
                                  <div>{i.name}</div>
                                </td>
                                <td className="kt-datatable__cell">
                                  <div>{i.cpfCnpj}</div>
                                </td>
                                <td className="kt-datatable__cell">
                                  <Switch
                                    id={i.id}
                                    label=""
                                    checked={i.selected}
                                    className="button-add"
                                    onChange={selected => {
                                      form.setValues(prev => ({
                                        patients: prev.patients.map(patient =>
                                          i.id === patient.id
                                            ? {
                                                ...patient,
                                                selected,
                                              }
                                            : patient,
                                        ),
                                      }))
                                    }}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <ErrorMessage error={errors.global} />
                  </div>
                  <div className="modal-footer">
                    <Button
                      type="button"
                      customClassName="btn-secondary"
                      icon="fas fa-arrow-left"
                      title="Voltar"
                      onClick={() => {
                        route.history.push(`${basename}/contratos`, {
                          contract: 0,
                        })
                      }}
                    />
                    <Button
                      customClassName="btn-primary"
                      title="Imprimir"
                      icon="fas fa-print"
                      disabled={submitting}
                      loading={submitting}
                      onClick={() => {
                        setSubmitting(true)
                        const items = entity.patients
                          .filter(patient => patient.selected)
                          .map(patient => patient.id)

                        if (items.length > 0) {
                          form.setErrors({
                            global: null,
                          })
                          service
                            .post('report.card', { items }, undefined, resp => resp.blob())
                            .then(blob => forceDownload(blob, 'carteirinhas_contrato.csv'))
                            .catch(err => form.setErrors({ global: err.message }))
                            .finally(() => {
                              setSubmitting(false)
                              setSelectAll(false)
                              form.resetForm()
                              route.history.push(`${basename}/contratos`, {
                                contract: 0,
                              })
                            })
                        } else {
                          setSubmitting(false)
                          form.setErrors({
                            global: 'Selecione ao menos uma carteirinha.',
                          })
                        }
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
  )
}
