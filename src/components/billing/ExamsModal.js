import React, { useState } from 'react'
import { Field } from 'core/components/form/field'
import { ErrorMessage } from 'core/components/form/error-message'
import { TextInput } from 'core/components/form/text-input'
import { Button } from 'core/components/button'
import { classNames } from 'core/helpers/misc'
import { Transition } from 'react-transition-group'
import { useFilters } from 'core/hooks/filter'
import { useDebounce } from 'core/hooks/debounce'
import { ModalPortal } from '../../core/components/modal'

export const ExamsModal = ({ service, show, onClose, onSelect }) => {
  const [items, setItems] = useState([])
  const { values, setValues, filters } = useFilters({ description: '' }, query => [
    { items: [{ name: 'description', value: `%${query.description}%`, comparer: 'iLike' }] },
  ])

  const dbFilters = useDebounce(filters, 300)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState(null)

  return (
    <ModalPortal>
      <Transition in={show} timeout={300}>
        {status => (
          <>
            <div
              className={classNames('modal fade', { show: status === 'entered' })}
              style={{ display: status === 'exited' ? 'none' : 'block' }}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
            >
              <div role="document" className="modal-dialog modal-dialog-centered modal-xl">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Exames</h5>

                    <Button
                      type="button"
                      className="close"
                      aria-label="close"
                      data-dismiss="modal"
                      onClick={onClose}
                    />
                  </div>

                  <div className="modal-body">
                    {fetching ? (
                      <div className="spinner">
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        />
                        <span>Carregando...</span>
                      </div>
                    ) : (
                      <>
                        <div className="row">
                          <div className="col-lg">
                            <Field label="Descrição do Exame">
                              <TextInput
                                ignoreBlur
                                type="search"
                                value={values.description}
                                onChange={description =>
                                  setValues(prev => ({
                                    ...prev,
                                    description,
                                  }))
                                }
                              />
                            </Field>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-lg kt-align-right">
                            <Button
                              icon="fas fa-search"
                              customClassName="btn-info btn-icon-sm margin-left-5"
                              title="Consultar"
                              onClick={() => {
                                if (values.description === '') {
                                  setError('Para busca de exames, informe ao menos uma descrição.')
                                } else {
                                  setError(null)
                                  setFetching(true)
                                  service
                                    .getList('exam', {
                                      usePager: false,
                                      filters: dbFilters,
                                      sort: [['description', 'ASC']],
                                    })
                                    .then(resp => setItems(resp.items))
                                    .catch(err => setError(err.message))
                                    .finally(() => setFetching(false))
                                }
                              }}
                            />
                          </div>
                        </div>
                        <div className="kt-portlet__body kt-portlet__body--fit">
                          <div
                            className={classNames(
                              'report-irregular kt-datatable kt-datatable--default kt-datatable--brand',
                              {
                                'kt-datatable--loaded': items.length > 0,
                              },
                            )}
                          >
                            <table className="kt-datatable__table">
                              <thead className="kt-datatable__head">
                                <tr className="kt-datatable__row">
                                  <th className="kt-datatable__cell">
                                    <span>Descrição do Exame</span>
                                  </th>
                                  <th className="kt-datatable__cell">
                                    <span>Opções</span>
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="kt-datatable__body">
                                {items.map((exam, i) => (
                                  <tr key={i} className="kt-datatable__row">
                                    <td className="kt-datatable__cell">
                                      <div>{exam.description}</div>
                                    </td>
                                    <td className="kt-datatable__cell">
                                      <Button
                                        icon="fas fa-hand-holding-medical"
                                        customClassName="btn-info"
                                        onClick={() => onSelect(exam)}
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {items.length === 0 && (
                              <div className="kt-datatable--error">
                                Nenhum exame foi encontrado.
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                    <ErrorMessage error={error} />
                  </div>

                  <div className="modal-footer">
                    <Button
                      type="button"
                      customClassName="btn-secondary"
                      icon="fas fa-arrow-left"
                      title="Voltar"
                      onClick={onClose}
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
