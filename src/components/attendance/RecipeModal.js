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
import {
  TypeAdministrationDescription,
  TypeAdministration,
  getTypeAdministrationDescription,
} from 'core/constants'
import { Select } from 'core/components/form/select'
import { TextAreaInput } from 'core/components/form/textarea-input'
import { API } from 'service'
import { ModalPortal } from '../../core/components/modal'

export const RecipeModal = ({ route, service, show, basename, attendanceId }) => {
  const form = useForm(
    {
      displayName: ent => ent.id,
      initialEntity: {
        id: 0,
        attendanceId,
        recipeItems: [],
      },
      validate: values => {
        const errors = {}
        if (values.recipeItems.length === 0) errors.global = 'Informe ao menos um medicamento.'
        return errors
      },
    },
    route,
  )

  const id = parseNumber(route.match.params.id)
  const { entity, errors } = form

  useEffect(() => {
    if (form.hasId && route.location.pathname.includes('receitas')) {
      form.handleFetch({
        action: (key, ac) => service.getById('recipe', key, ac.signal),
        errorFn: err => form.setErrors({ global: err.message }),
      })
    }
    // eslint-disable-next-line
	}, [id, route])

  const [medicine, setMedicine] = useState({
    descriptionMedicine: '',
    dosage: '',
    presentation: '',
    administration: TypeAdministration.INTERNAL,
    manipulation: '',
  })

  const [config, setConfig] = useState({})
  useEffect(() => {
    API.get('configuration.get')
      .then(resp => setConfig(resp))
      .catch(err => form.setErrors({ global: err.message }))
    // eslint-disable-next-line
	}, [])

  const maxLines = config.maxLinesManipulationAttendance

  const manipulationLineCount = medicine.manipulation.split('\n').length
  const manipulationMsgError = `Numero máximo de ${maxLines} linhas excedido!`
  const manipulationLineError = manipulationLineCount > maxLines ? manipulationMsgError : null

  const resetForm = () => {
    form.resetForm()
    form.setValues(prev => ({
      ...prev,
      id: 0,
      attendanceId,
      recipeItems: [],
    }))
  }

  useEffect(() => {
    if (!show) setTimeout(resetForm, 300)
    // eslint-disable-next-line
	}, [show])

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
                          path: 'recipe',
                          callback: () =>
                            route.history.push(`${basename}/atendimentos/${attendanceId}`, {
                              view: 'Recipes',
                              refresh: true,
                            }),
                          data,
                          service,
                          form,
                        }),
                      )
                    }}
                  >
                    <div className="modal-header">
                      <h5 className="modal-title">
                        {form.displayName ? `Editar Receita ${form.displayName}` : 'Nova Receita'}
                      </h5>

                      <Button
                        type="button"
                        className="close"
                        aria-label="close"
                        data-dismiss="modal"
                        onClick={() => {
                          route.history.push(`${basename}/atendimentos/${attendanceId}`, {
                            view: 'Recipes',
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
                        <>
                          <div className="row">
                            <div className="col-lg">
                              <Field label="Medicamento">
                                <TextInput
                                  type="text"
                                  value={medicine.descriptionMedicine}
                                  onChange={descriptionMedicine =>
                                    setMedicine(prev => ({
                                      ...prev,
                                      descriptionMedicine,
                                    }))
                                  }
                                />
                              </Field>
                            </div>
                            <div className="col-lg">
                              <Field label="Apresentação">
                                <TextInput
                                  type="text"
                                  value={medicine.presentation}
                                  onChange={presentation =>
                                    setMedicine(prev => ({
                                      ...prev,
                                      presentation,
                                    }))
                                  }
                                />
                              </Field>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-lg">
                              <Field label="Posologia/Modo de Usar">
                                <TextInput
                                  type="text"
                                  value={medicine.dosage}
                                  onChange={dosage =>
                                    setMedicine(prev => ({
                                      ...prev,
                                      dosage,
                                    }))
                                  }
                                />
                              </Field>
                            </div>
                            <div className="col-lg">
                              <Field label="Administração">
                                <Select
                                  items={TypeAdministrationDescription}
                                  selected={medicine.administration}
                                  getId={item => item.id}
                                  getDisplay={({ name }) => name}
                                  onChange={administration => {
                                    setMedicine(prev => ({
                                      ...prev,
                                      administration: administration.id,
                                    }))
                                  }}
                                />
                              </Field>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-lg">
                              <Field label="Mão Livre">
                                <TextAreaInput
                                  meta={{
                                    touched: true,
                                    error: manipulationLineError,
                                  }}
                                  rows={7}
                                  value={medicine.manipulation || ''}
                                  onChange={manipulation =>
                                    setMedicine(prev => ({
                                      ...prev,
                                      manipulation,
                                    }))
                                  }
                                  maxLenght={1000}
                                />
                                <p>
                                  {manipulationLineCount}/{maxLines}
                                </p>
                              </Field>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-lg-2 offset-md-10">
                              <Button
                                type="button"
                                icon="fas fa-plus"
                                customClassName="btn-success button-add btn-block"
                                title="Adicionar"
                                onClick={() => {
                                  if (manipulationLineCount > maxLines) {
                                    form.setErrors({
                                      global: manipulationMsgError,
                                    })
                                    return
                                  }

                                  if (
                                    medicine.descriptionMedicine === '' &&
                                    medicine.manipulation === ''
                                  ) {
                                    form.setErrors({
                                      global:
                                        'É preciso informar ao menos uma descrição ou manipulação.',
                                    })
                                  } else {
                                    form.setErrors({
                                      global: null,
                                    })
                                    form.handleChange({
                                      path: 'medicines',
                                      values: prev => ({
                                        ...prev,
                                        recipeItems: [...prev.recipeItems, medicine],
                                      }),
                                    })
                                    setMedicine({
                                      descriptionMedicine: '',
                                      dosage: '',
                                      presentation: '',
                                      administration: TypeAdministration.INTERNAL,
                                      manipulation: '',
                                    })
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
                                  'kt-datatable--loaded': entity.recipeItems.length > 0,
                                },
                              )}
                            >
                              <table className="kt-datatable__table">
                                <thead className="kt-datatable__head">
                                  <tr className="kt-datatable__row">
                                    <th className="kt-datatable__cell">
                                      <span>Descrição do Medicamento</span>
                                    </th>
                                    <th className="kt-datatable__cell">
                                      <span>Apresentação</span>
                                    </th>
                                    <th className="kt-datatable__cell">
                                      <span>Posologia/Modo de Usar</span>
                                    </th>
                                    <th className="kt-datatable__cell">
                                      <span>Administração</span>
                                    </th>
                                    <th className="kt-datatable__cell">
                                      <span>Manipulação</span>
                                    </th>
                                    <th className="kt-datatable__cell">
                                      <span>Opções</span>
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="kt-datatable__body">
                                  {entity.recipeItems.map((medicines, i) => (
                                    <tr key={i} className="kt-datatable__row">
                                      <td className="kt-datatable__cell">
                                        <div>{medicines.descriptionMedicine}</div>
                                      </td>
                                      <td className="kt-datatable__cell">
                                        <div>{medicines.presentation}</div>
                                      </td>
                                      <td className="kt-datatable__cell">
                                        <div>{medicines.dosage}</div>
                                      </td>
                                      <td className="kt-datatable__cell">
                                        <div>
                                          {getTypeAdministrationDescription(
                                            medicines.administration,
                                          )}
                                        </div>
                                      </td>
                                      <td className="kt-datatable__cell">
                                        <div>{medicines.manipulation.substring(0, 55)}</div>
                                      </td>
                                      <td className="kt-datatable__cell">
                                        <Button
                                          icon="fas fa-trash"
                                          customClassName="btn-danger"
                                          onClick={() => {
                                            const recipesSplice = [...entity.recipeItems]
                                            recipesSplice.splice(i, 1)
                                            form.handleChange({
                                              path: 'recipeItems',
                                              values: prev => ({
                                                ...prev,
                                                recipeItems: [...recipesSplice],
                                              }),
                                            })
                                          }}
                                        />
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {entity.recipeItems.length === 0 && (
                                <div className="kt-datatable--error">
                                  Nenhum medicamento foi encontrado.
                                </div>
                              )}
                            </div>
                          </div>
                        </>
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
                          route.history.push(`${basename}/atendimentos/${attendanceId}`, {
                            view: 'Recipes',
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
