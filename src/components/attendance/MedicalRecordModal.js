import React, { useState, useEffect } from 'react'
import { Field } from 'core/components/form/field'
import { Button } from 'core/components/button'
import { classNames } from 'core/helpers/misc'
import { Transition } from 'react-transition-group'
import { TextAreaInput } from 'core/components/form/textarea-input'
import { ReadOnlyInput } from 'core/components/form/readonly-input'
import { ModalPortal } from '../../core/components/modal'

export const MedicalRecordModal = ({ service, show, form, attendanceId }) => {
  const [view, setView] = useState('Initial')
  const [attendanceSelected, setAttendanceSelected] = useState(0)
  const [attendance, setAttendance] = useState({
    mainComplaint: '',
    highPA: 0,
    lowPA: 0,
    dextro: 0,
    saturation: 0,
    pulse: 0,
    allergy: false,
    medicineAllergy: '',
    hypertensive: false,
    diabetic: false,
    medicineUseContiuous: '',
    clinicalHistory: '',
    patientWeight: 0,
    patientHeight: 0,
    temperature: 0,
    physicalExamination: '',
    diagnosticHypothesis_1: '',
    diagnosticHypothesis_2: '',
    observation: '',
    conduct: '',
    initialObservation: '',
    complementaryExams: '',
    recipeMedicines: [],
    exams: [],
    medicalProcedures: [],
  })

  useEffect(() => {
    if (attendanceSelected !== 0 && attendanceSelected !== undefined) {
      service.post('attendance.medicalrecord', { id: attendanceSelected }).then(res => {
        setAttendance(res)
      })
    }

    // eslint-disable-next-line
	}, [attendanceSelected])

  useEffect(() => {
    setAttendanceSelected(attendanceId)
    // eslint-disable-next-line
	}, [attendanceId])

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
                  <div className="modal-header">
                    <h5 className="modal-title">{`Prontuário - Atendimento ${attendanceId}`}</h5>

                    <Button
                      type="button"
                      className="close"
                      aria-label="close"
                      data-dismiss="modal"
                      onClick={() => {
                        form.setValues(prev => ({
                          ...prev,
                          medicalRecordModalShow: false,
                        }))
                      }}
                    />
                  </div>

                  <div className="modal-body">
                    <div className="kt-portlet__body">
                      <ul className="nav nav-tabs kt-mb-0" role="tablist">
                        <li className="nav-item">
                          <button
                            className={classNames('nav-link', {
                              active: view === 'Initial',
                            })}
                            onClick={() => setView('Initial')}
                            type="button"
                          >
                            <span className="btn kt-padding-0">Anamnese</span>
                          </button>
                        </li>
                        <li className="nav-item">
                          <button
                            className={classNames('nav-link', {
                              active: view === 'Attendance',
                            })}
                            onClick={() => setView('Attendance')}
                            type="button"
                          >
                            <span className="btn kt-padding-0">Atendimento Médico</span>
                          </button>
                        </li>
                        <li className="nav-item">
                          <button
                            className={classNames('nav-link', {
                              active: view === 'Recipes',
                            })}
                            onClick={() => setView('Recipes')}
                            type="button"
                          >
                            <span className="btn kt-padding-0">Receitas</span>
                          </button>
                        </li>
                        <li className="nav-item">
                          <button
                            className={classNames('nav-link', {
                              active: view === 'Exams',
                            })}
                            onClick={() => setView('Exams')}
                            type="button"
                          >
                            <span className="btn kt-padding-0">Solicitação de Exames</span>
                          </button>
                        </li>
                        <li className="nav-item">
                          <button
                            className={classNames('nav-link', {
                              active: view === 'Procedures',
                            })}
                            onClick={() => setView('Procedures')}
                            type="button"
                          >
                            <span className="btn kt-padding-0">Procedimentos</span>
                          </button>
                        </li>
                      </ul>
                      <div className="border border-top-0 rounded-bottom p-3">
                        {view === 'Initial' && (
                          <>
                            <div className="row">
                              <div className="col-lg">
                                <Field label="Queixa Principal / Duração">
                                  <TextAreaInput
                                    rows={2}
                                    value={attendance.mainComplaint}
                                    readOnly
                                  />
                                </Field>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-lg">
                                <Field label="P.A.">
                                  <ReadOnlyInput
                                    customClassName="form-control-xl"
                                    value={`${attendance.highPA}/${attendance.lowPA}`}
                                  />
                                </Field>
                              </div>
                              <div className="col-lg">
                                <Field label="Dextro">
                                  <ReadOnlyInput
                                    customClassName="form-control-xl"
                                    value={attendance.dextro}
                                  />
                                </Field>
                              </div>
                              <div className="col-lg">
                                <Field label="Saturação">
                                  <ReadOnlyInput
                                    customClassName="form-control-xl"
                                    value={attendance.saturation}
                                  />
                                </Field>
                              </div>
                              <div className="col-lg">
                                <Field label="Batimentos">
                                  <ReadOnlyInput
                                    customClassName="form-control-xl"
                                    value={attendance.pulse}
                                  />
                                </Field>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-lg">
                                <Field label="Alérgico(a) a Medicação">
                                  <ReadOnlyInput
                                    customClassName="form-control-xl"
                                    value={attendance.allergy ? 'Sim' : 'Não'}
                                  />
                                </Field>
                              </div>
                              {attendance.allergy && (
                                <div className="col-lg">
                                  <Field label="Quais">
                                    <ReadOnlyInput
                                      customClassName="form-control-xl"
                                      value={attendance.medicineAllergy}
                                    />
                                  </Field>
                                </div>
                              )}
                            </div>
                            <div className="row">
                              <div className="col-lg">
                                <Field label="Hipertenso">
                                  <ReadOnlyInput
                                    customClassName="form-control-xl"
                                    value={attendance.hypertensive ? 'Sim' : 'Não'}
                                  />
                                </Field>
                              </div>
                              <div className="col-lg">
                                <Field label="Diabético">
                                  <ReadOnlyInput
                                    customClassName="form-control-xl"
                                    value={attendance.diabetic ? 'Sim' : 'Não'}
                                  />
                                </Field>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-lg">
                                <Field label="Medicações de Uso Contínuo">
                                  <TextAreaInput
                                    rows={2}
                                    value={attendance.medicineUseContiuous}
                                    readOnly
                                  />
                                </Field>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-lg">
                                <Field label="Observações">
                                  <TextAreaInput
                                    rows={5}
                                    value={attendance.initialObservation}
                                    readOnly
                                  />
                                </Field>
                              </div>
                            </div>
                          </>
                        )}
                        {view === 'Attendance' && (
                          <>
                            <div className="row">
                              <div className="col-lg">
                                <Field label="História Clínica">
                                  <TextAreaInput
                                    rows={5}
                                    value={attendance.clinicalHistory}
                                    readOnly
                                  />
                                </Field>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-lg">
                                <Field label="Peso">
                                  <ReadOnlyInput
                                    customClassName="form-control-xl"
                                    value={attendance.patientWeight}
                                  />
                                </Field>
                              </div>
                              <div className="col-lg">
                                <Field label="Altura">
                                  <ReadOnlyInput
                                    customClassName="form-control-xl"
                                    value={attendance.patientHeight}
                                  />
                                </Field>
                              </div>
                              <div className="col-lg">
                                <Field label="Temperatura">
                                  <ReadOnlyInput
                                    customClassName="form-control-xl"
                                    value={attendance.temperature}
                                  />
                                </Field>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-lg">
                                <Field label="Exame Físico Geral">
                                  <TextAreaInput
                                    rows={2}
                                    value={attendance.physicalExamination}
                                    readOnly
                                  />
                                </Field>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-lg">
                                <Field label="Exames Complementares">
                                  <TextAreaInput
                                    rows={5}
                                    value={attendance.complementaryExams}
                                    readOnly
                                  />
                                </Field>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-lg">
                                <Field label="Hipótese Diagnóstica 1">
                                  <ReadOnlyInput
                                    customClassName="form-control-xl"
                                    value={attendance.diagnosticHypothesis_1}
                                  />
                                </Field>
                              </div>
                              <div className="col-lg">
                                <Field label="Hipótese Diagnóstica 2">
                                  <ReadOnlyInput
                                    customClassName="form-control-xl"
                                    value={attendance.diagnosticHypothesis_2}
                                  />
                                </Field>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-lg">
                                <Field label="Conduta">
                                  <TextAreaInput rows={5} value={attendance.conduct} readOnly />
                                </Field>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-lg">
                                <Field label="Observações">
                                  <TextAreaInput rows={5} value={attendance.observation} readOnly />
                                </Field>
                              </div>
                            </div>
                          </>
                        )}
                        {view === 'Exams' && (
                          <>
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
                                        <span>Descrição Exame</span>
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="kt-datatable__body">
                                    {attendance.exams.map((exam, i) => (
                                      <tr key={i} className="kt-datatable__row">
                                        <td className="kt-datatable__cell">
                                          <div>{exam.description}</div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {attendance.exams.length === 0 && (
                                  <div className="kt-datatable--error">
                                    Nenhum exame foi encontrado.
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                        {view === 'Recipes' && (
                          <>
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
                                        <span>Descrição do Medicamento</span>
                                      </th>
                                      <th className="kt-datatable__cell">
                                        <span>Apresentação</span>
                                      </th>
                                      <th className="kt-datatable__cell">
                                        <span>Posologia/Modo de Usar</span>
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="kt-datatable__body">
                                    {attendance.recipeMedicines.map((medicine, i) => (
                                      <tr key={i} className="kt-datatable__row">
                                        <td className="kt-datatable__cell">
                                          <div>{medicine.descriptionMedicine}</div>
                                        </td>
                                        <td className="kt-datatable__cell">
                                          <div>{medicine.presentation}</div>
                                        </td>
                                        <td className="kt-datatable__cell">
                                          <div>{medicine.dosage}</div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {attendance.recipeMedicines.length === 0 && (
                                  <div className="kt-datatable--error">
                                    Nenhum medicamento foi encontrado.
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                        {view === 'Procedures' && (
                          <>
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
                                        <span>Descrição do Procedimento</span>
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="kt-datatable__body">
                                    {attendance.medicalProcedures.map((procedure, i) => (
                                      <tr key={i} className="kt-datatable__row">
                                        <td className="kt-datatable__cell">
                                          <div>{procedure.medicalProcedureDescription}</div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {attendance.medicalProcedures.length === 0 && (
                                  <div className="kt-datatable--error">
                                    Nenhum procedimento foi encontrado.
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      <br />
                    </div>
                  </div>

                  <div className="modal-footer">
                    <Button
                      type="button"
                      customClassName="btn-secondary"
                      icon="fas fa-arrow-left"
                      title="Voltar"
                      onClick={() => {
                        form.setValues(prev => ({
                          ...prev,
                          medicalRecordModalShow: false,
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
  )
}
