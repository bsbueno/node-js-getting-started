import React, { useEffect, useState } from 'react'
import { useForm } from 'core/hooks/form'
import { Field } from 'core/components/form/field'
import { ErrorMessage } from 'core/components/form/error-message'
import { submit } from 'helpers'
import { TextInput } from 'core/components/form/text-input'
import { Button } from 'core/components/button'
import { classNames } from 'core/helpers/misc'
import { Transition } from 'react-transition-group'
import { parseNumber } from 'core/helpers/parse'
import { useFilters } from 'core/hooks/filter'
import { useDebounce } from 'core/hooks/debounce'
import { LoadingCard } from 'core/components/loading-card'
import { ModalPortal } from '../../core/components/modal'

export const ExamsModal = ({ route, service, show, basename, attendanceId }) => {
  const form = useForm(
    {
      displayName: ent => ent.id,
      initialEntity: {
        id: 0,
        attendanceId,
        examsRequestsItems: [],
      },
      validate: values => {
        const errors = {}
        if (values.examsRequestsItems.length === 0) errors.global = 'Informe ao menos um exame.'
        return errors
      },
    },
    route,
  )
  const id = parseNumber(route.match.params.id)
  const { entity, errors } = form

  useEffect(() => {
    if (form.hasId && route.location.pathname.includes('solicitacoes-exames')) {
      form.handleFetch({
        action: (key, ac) => service.getById('examsrequest', key, ac.signal),
        errorFn: err => form.setErrors({ global: err.message }),
      })
    }
    // eslint-disable-next-line
	}, [id, route])

  const resetForm = () => {
    form.resetForm()
    form.setValues(prev => ({
      ...prev,
      id: 0,
      attendanceId,
      examsRequestsItems: [],
    }))
  }

  useEffect(() => {
    if (!show) setTimeout(resetForm, 300)
    // eslint-disable-next-line
	}, [show])

  const [items, setItems] = useState([])
  const { values, setValues, filters } = useFilters(
    {
      description: '',
    },
    query => [
      {
        items: [{ name: 'description', value: `%${query.description}%`, comparer: 'iLike' }],
      },
    ],
  )

  const dbFilters = useDebounce(filters, 300)
  const [fetching, setFetching] = useState(false)

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
              <div role="document" className="modal-dialog modal-dialog-centered modal-xl">
                <div className="modal-content">
                  <form
                    onSubmit={ev => {
                      ev.preventDefault()
                      form.handleSubmit(data =>
                        submit({
                          path: 'examsrequest',
                          callback: () => {
                            setItems([])
                            route.history.push(`${basename}/atendimentos/${attendanceId}`, {
                              view: 'Exams',
                              refresh: true,
                            })
                          },
                          data,
                          service,
                          form,
                        }),
                      )
                    }}
                  >
                    <div className="modal-header">
                      <h5 className="modal-title">
                        {form.displayName
                          ? `Editar Solicitação de Exame ${form.displayName}`
                          : 'Nova Solicitação de Exame'}
                      </h5>

                      <Button
                        type="button"
                        className="close"
                        aria-label="close"
                        data-dismiss="modal"
                        onClick={() => {
                          setItems([])
                          route.history.push(`${basename}/atendimentos/${attendanceId}`, {
                            view: 'Exams',
                            refresh: true,
                          })
                        }}
                      />
                    </div>

                    <div className="modal-body">
                      {form.fetching ? (
                        <div className="spinner">
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          />
                          <span>Carregando...</span>
                        </div>
                      ) : (
                        <div className="kt-portlet__body">
                          <div className="row">
                            <div className="col-lg">
                              <Field label="Busca de Exames">
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
                                    form.setErrors({
                                      global: 'Para busca de exames, informe uma descrição.',
                                    })
                                  } else {
                                    form.setErrors({
                                      global: null,
                                    })
                                    setFetching(true)
                                    service
                                      .getList('exam', {
                                        usePager: false,
                                        filters: dbFilters,
                                        sort: [['description', 'ASC']],
                                      })
                                      .then(resp => setItems(resp.items))
                                      .catch(err =>
                                        form.setErrors({
                                          global: err.message,
                                        }),
                                      )
                                      .finally(() => setFetching(false))
                                  }
                                }}
                              />
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
                                        <span>Descrição</span>
                                      </th>
                                      <th className="kt-datatable__cell">
                                        <span>Opções</span>
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="kt-datatable__body">
                                    {items.map(i => (
                                      <tr key={i.id} className="kt-datatable__row">
                                        <td className="kt-datatable__cell">
                                          <div>{i.description}</div>
                                        </td>
                                        <td className="kt-datatable__cell">
                                          <Button
                                            type="button"
                                            icon="fas fa-plus"
                                            customClassName="btn-success"
                                            onClick={() => {
                                              form.setErrors({
                                                global: null,
                                              })
                                              form.handleChange({
                                                path: 'exams',
                                                values: prev => ({
                                                  ...prev,
                                                  examsRequestsItems: [
                                                    ...prev.examsRequestsItems,
                                                    {
                                                      description: i.description,
                                                      examId: i.id,
                                                    },
                                                  ],
                                                }),
                                              })
                                            }}
                                          />
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {items.length === 0 && (
                                  <div className="kt-datatable--error">
                                    Nenhum item foi encontrado.
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          <br />
                          <div className="row">
                            <div className="col-lg">
                              <p className="table-label">Exames Selecionados</p>
                            </div>
                          </div>
                          <div className="kt-portlet__body kt-portlet__body--fit">
                            <div
                              className={classNames(
                                'report-irregular kt-datatable kt-datatable--default kt-datatable--brand',
                                {
                                  'kt-datatable--loaded': entity.examsRequestsItems.length > 0,
                                },
                              )}
                            >
                              <table className="kt-datatable__table">
                                <thead className="kt-datatable__head">
                                  <tr className="kt-datatable__row">
                                    <th className="kt-datatable__cell">
                                      <span>Exame</span>
                                    </th>
                                    <th className="kt-datatable__cell">
                                      <span>Opções</span>
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="kt-datatable__body">
                                  {entity.examsRequestsItems.map((exams, i) => (
                                    <tr key={i} className="kt-datatable__row">
                                      <td className="kt-datatable__cell">
                                        <div>{exams.description}</div>
                                      </td>
                                      <td className="kt-datatable__cell">
                                        <Button
                                          icon="fas fa-trash"
                                          customClassName="btn-danger"
                                          onClick={() => {
                                            const examsSplice = [...entity.examsRequestsItems]
                                            examsSplice.splice(i, 1)
                                            form.handleChange({
                                              path: 'examsRequestsItems',
                                              values: prev => ({
                                                ...prev,
                                                examsRequestsItems: [...examsSplice],
                                              }),
                                            })
                                          }}
                                        />
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {entity.examsRequestsItems.length === 0 && (
                                <div className="kt-datatable--error">
                                  Nenhum exame foi selecionado.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      <ErrorMessage error={errors.global} />
                    </div>

                    <div className="modal-footer">
                      <Button
                        type="button"
                        customClassName="btn-secondary"
                        icon="fas fa-arrow-left"
                        title="Voltar"
                        onClick={() => {
                          setItems([])
                          route.history.push(`${basename}/atendimentos/${attendanceId}`, {
                            view: 'Exams',
                            refresh: true,
                          })
                        }}
                      />
                      {!form.fetching && (
                        <Button
                          customClassName="btn-primary"
                          title="Salvar"
                          icon="fas fa-save"
                          disabled={form.submitting}
                          loading={form.submitting}
                        />
                      )}
                    </div>
                  </form>
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
