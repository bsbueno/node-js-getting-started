import React, { useEffect, useState, useRef } from 'react'
import { differenceInYears, differenceInDays } from 'date-fns'
import { useForm } from 'core/hooks/form'
import {
  ClearanceType,
  ClearanceTypeDescription,
  CellPhoneMask,
  PhoneMask,
  AttendanceStatus,
  TypeSchedulingDescription,
} from 'core/constants'
import { Field } from 'core/components/form/field'
import { TextInput } from 'core/components/form/text-input'
import { submit } from 'helpers'
import { ReadOnlyInput } from 'core/components/form/readonly-input'
import { toLocaleDate } from 'core/helpers/date'
import { TextAreaInput } from 'core/components/form/textarea-input'
import { IntegerInput } from 'core/components/form/integer-input'
import { Switch } from 'core/components/form/switch'
import { Button } from 'core/components/button'
import { ErrorMessage } from 'core/components/form/error-message'
import { DecimalInput } from 'core/components/form/decimal-input'
import { classNames, iframeDownload } from 'core/helpers/misc'
import { Select } from 'core/components/form/select'
import { applyMask } from 'core/helpers/mask'
import { useRefresh } from 'core/hooks/refresh'

import { localStore } from 'core/helpers/store'
import { config } from 'config'
import { DateInput } from 'core/components/form/date-input'
import { useOnClickOutside } from 'core/hooks/clickOutside'

import { useFilters } from 'core/hooks/filter'
import { List } from 'core/components/list'
import { ExamsModal } from './ExamsModal'
import { RecipeModal } from './RecipeModal'
import { ProceduresModal } from './ProceduresModal'
import { MedicalRecordModal } from './MedicalRecordModal'

const RenderInitialData = ({ form, justShow }) => {
  const { entity, errors, touched } = form
  return (
    <>
      <div className="row">
        <div className="col-lg">
          <Field label="Agendamento">
            <ReadOnlyInput customClassName="form-control-xl" value={entity.schedulingId} />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Data Atendimento">
            <ReadOnlyInput
              customClassName="form-control-xl"
              value={toLocaleDate(entity.createdAt)}
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Hora início">
            <ReadOnlyInput customClassName="form-control-xl" value={entity.start} />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Hora fim">
            <ReadOnlyInput customClassName="form-control-xl" value={entity.end} />
          </Field>
        </div>
      </div>
      <div className="row">
        <div className="col-lg">
          <Field label="Paciente">
            <ReadOnlyInput customClassName="form-control-xl" value={entity.patientName} />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Idade">
            <ReadOnlyInput customClassName="form-control-xl" value={entity.patientAge} />
          </Field>
        </div>
      </div>
      <div className="row">
        <div className="col-lg">
          <Field label="Profissional de Saude">
            <ReadOnlyInput
              customClassName="form-control-xl"
              value={entity.healthProfessionalName}
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Plano">
            <ReadOnlyInput customClassName="form-control-xl" value={entity.planTitle} />
          </Field>
        </div>
      </div>
      <div className="row">
        <div className="col-lg">
          <Field label="Data de Nascimento">
            <ReadOnlyInput
              customClassName="form-control-xl"
              value={toLocaleDate(entity.patientBirthDay)}
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="RG">
            <ReadOnlyInput customClassName="form-control-xl" value={entity.rg} />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Telefone">
            <ReadOnlyInput
              customClassName="form-control-xl"
              value={
                entity.phone.length > 10
                  ? applyMask(CellPhoneMask, entity.phone)
                  : applyMask(PhoneMask, entity.phone)
              }
            />
          </Field>
        </div>
      </div>
      <div className="row">
        <div className="col-lg">
          <Field label="Endereço">
            <ReadOnlyInput customClassName="form-control-xl" value={entity.address} />
          </Field>
        </div>
      </div>
      <div className="row">
        <div className="col-lg">
          <Field label="Queixa Principal / Duração">
            <TextAreaInput
              disabled={justShow}
              meta={{
                error: errors.mainComplaint,
                touched: touched.mainComplaint,
              }}
              rows={2}
              value={entity.mainComplaint}
              onChange={(mainComplaint, type) =>
                form.handleChange({
                  path: 'mainComplaint',
                  type,
                  values: prev => ({
                    ...prev,
                    mainComplaint,
                  }),
                })
              }
              maxLenght={200}
            />
          </Field>
        </div>
      </div>
      <div className="row">
        <div className="col-lg">
          <Field label="P.A.">
            <IntegerInput
              disabled={justShow}
              acceptEnter
              meta={{
                error: errors.highPA,
                touched: touched.highPA,
              }}
              value={entity.highPA}
              onChange={(highPA, type) =>
                form.handleChange({
                  path: 'highPA',
                  type,
                  values: prev => ({
                    ...prev,
                    highPA,
                  }),
                })
              }
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="">
            <IntegerInput
              disabled={justShow}
              acceptEnter
              meta={{
                error: errors.lowPA,
                touched: touched.lowPA,
              }}
              value={entity.lowPA}
              onChange={(lowPA, type) =>
                form.handleChange({
                  path: 'lowPA',
                  type,
                  values: prev => ({
                    ...prev,
                    lowPA,
                  }),
                })
              }
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Dextro">
            <IntegerInput
              disabled={justShow}
              acceptEnter
              meta={{
                error: errors.dextro,
                touched: touched.dextro,
              }}
              value={entity.dextro}
              onChange={(dextro, type) =>
                form.handleChange({
                  path: 'dextro',
                  type,
                  values: prev => ({
                    ...prev,
                    dextro,
                  }),
                })
              }
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Saturação">
            <IntegerInput
              disabled={justShow}
              acceptEnter
              meta={{
                error: errors.saturation,
                touched: touched.saturation,
              }}
              value={entity.saturation}
              onChange={(saturation, type) =>
                form.handleChange({
                  path: 'saturation',
                  type,
                  values: prev => ({
                    ...prev,
                    saturation,
                  }),
                })
              }
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Batimentos">
            <IntegerInput
              acceptEnter
              disabled={justShow}
              meta={{
                error: errors.pulse,
                touched: touched.pulse,
              }}
              value={entity.pulse}
              onChange={(pulse, type) =>
                form.handleChange({
                  path: 'pulse',
                  type,
                  values: prev => ({
                    ...prev,
                    pulse,
                  }),
                })
              }
            />
          </Field>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-2">
          <Switch
            id="allergy"
            disabled={justShow}
            className="button-add"
            label="Alérgico(a) a Medicação"
            checked={entity.allergy}
            onChange={(allergy, type) => {
              form.handleChange({
                path: 'allergy',
                type,
                values: prev => ({
                  ...prev,
                  allergy,
                  medicineAllergy: allergy ? entity.medicineAllergy : '',
                }),
              })
            }}
          />
        </div>
        <div className="col-lg">
          <Field label="Quais">
            <TextInput
              disabled={!entity.allergy || justShow}
              meta={{
                error: errors.medicineAllergy,
                touched: touched.medicineAllergy,
              }}
              value={entity.medicineAllergy}
              onChange={(medicineAllergy, type) =>
                form.handleChange({
                  path: 'medicineAllergy',
                  type,
                  values: prev => ({
                    ...prev,
                    medicineAllergy,
                  }),
                })
              }
              maxLength={100}
            />
          </Field>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-2">
          <Switch
            id="hypertensive"
            label="Hipertenso"
            checked={entity.hypertensive}
            disabled={justShow}
            className="button-add"
            onChange={(hypertensive, type) => {
              form.handleChange({
                path: 'hypertensive',
                type,
                values: prev => ({
                  ...prev,
                  hypertensive,
                }),
              })
            }}
          />
        </div>
        <div className="col-lg-2">
          <Switch
            id="diabetic"
            label="Diabético"
            checked={entity.diabetic}
            disabled={justShow}
            className="button-add"
            onChange={(diabetic, type) => {
              form.handleChange({
                path: 'diabetic',
                type,
                values: prev => ({
                  ...prev,
                  diabetic,
                }),
              })
            }}
          />
        </div>
      </div>
      <br />
      <div className="row">
        <div className="col-lg">
          <Field label="Medicações de Uso Contínuo">
            <TextAreaInput
              disabled={justShow}
              meta={{
                error: errors.medicineUseContiuous,
                touched: touched.medicineUseContiuous,
              }}
              rows={2}
              value={entity.medicineUseContiuous}
              onChange={(medicineUseContiuous, type) =>
                form.handleChange({
                  path: 'medicineUseContiuous',
                  type,
                  values: prev => ({
                    ...prev,
                    medicineUseContiuous,
                  }),
                })
              }
              maxLenght={200}
            />
          </Field>
        </div>
      </div>
      <div className="row">
        <div className="col-lg">
          <Field label="Observações">
            <TextAreaInput
              disabled={justShow}
              meta={{
                error: errors.initialObservation,
                touched: touched.initialObservation,
              }}
              rows={5}
              value={entity.initialObservation || ''}
              onChange={(initialObservation, type) =>
                form.handleChange({
                  path: 'initialObservation',
                  type,
                  values: prev => ({
                    ...prev,
                    initialObservation,
                  }),
                })
              }
              maxLenght={500}
            />
          </Field>
        </div>
      </div>
    </>
  )
}

const RenderAttendance = ({ form, justShow }) => {
  const { entity, errors, touched } = form
  return (
    <>
      <div className="row">
        <div className="col-lg">
          <Field label="História Clínica">
            <TextAreaInput
              disabled={justShow}
              meta={{
                error: errors.clinicalHistory,
                touched: touched.clinicalHistory,
              }}
              rows={5}
              value={entity.clinicalHistory}
              onChange={(clinicalHistory, type) =>
                form.handleChange({
                  path: 'clinicalHistory',
                  type,
                  values: prev => ({
                    ...prev,
                    clinicalHistory,
                  }),
                })
              }
              maxLenght={1500}
            />
          </Field>
        </div>
      </div>
      <div className="row">
        <div className="col-lg">
          <Field label="Peso">
            <DecimalInput
              disabled={justShow}
              meta={{
                error: errors.patientWeight,
                touched: touched.patientWeight,
              }}
              config={{ precision: 3 }}
              acceptEnter
              customClassName="form-control-xl"
              onChange={(patientWeight, type) => {
                form.handleChange({
                  path: 'patientWeight',
                  type,
                  values: { patientWeight },
                })
              }}
              value={entity.patientWeight || 0}
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Altura">
            <DecimalInput
              disabled={justShow}
              meta={{
                error: errors.patientHeight,
                touched: touched.patientHeight,
              }}
              acceptEnter
              customClassName="form-control-xl"
              onChange={(patientHeight, type) => {
                form.handleChange({
                  path: 'patientHeight',
                  type,
                  values: { patientHeight },
                })
              }}
              value={entity.patientHeight || 0}
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Temperatura">
            <DecimalInput
              disabled={justShow}
              meta={{
                error: errors.temperature,
                touched: touched.temperature,
              }}
              acceptEnter
              customClassName="form-control-xl"
              onChange={(temperature, type) => {
                form.handleChange({
                  path: 'temperature',
                  type,
                  values: { temperature },
                })
              }}
              value={entity.temperature || 0}
            />
          </Field>
        </div>
      </div>
      <div className="row">
        <div className="col-lg">
          <Field label="Exame Físico Geral">
            <TextAreaInput
              disabled={justShow}
              meta={{
                error: errors.physicalExamination,
                touched: touched.physicalExamination,
              }}
              rows={5}
              value={entity.physicalExamination || ''}
              onChange={(physicalExamination, type) =>
                form.handleChange({
                  path: 'physicalExamination',
                  type,
                  values: prev => ({
                    ...prev,
                    physicalExamination,
                  }),
                })
              }
              maxLenght={1500}
            />
          </Field>
        </div>
      </div>
      <div className="row">
        <div className="col-lg">
          <Field label="Antecedentes Pessoais">
            <TextAreaInput
              disabled={justShow}
              meta={{
                error: errors.personalAntecedent,
                touched: touched.personalAntecedent,
              }}
              rows={3}
              value={entity.personalAntecedent || ''}
              onChange={(personalAntecedent, type) =>
                form.handleChange({
                  path: 'personalAntecedent',
                  type,
                  values: prev => ({
                    ...prev,
                    personalAntecedent,
                  }),
                })
              }
              maxLenght={1500}
            />
          </Field>
        </div>
      </div>
      <div className="row">
        <div className="col-lg">
          <Field label="Exames Complementares">
            <TextAreaInput
              disabled={justShow}
              meta={{
                error: errors.complementaryExams,
                touched: touched.complementaryExams,
              }}
              rows={5}
              value={entity.complementaryExams || ''}
              onChange={(complementaryExams, type) =>
                form.handleChange({
                  path: 'complementaryExams',
                  type,
                  values: prev => ({
                    ...prev,
                    complementaryExams,
                  }),
                })
              }
              maxLenght={1500}
            />
          </Field>
        </div>
      </div>
      <div className="row">
        <div className="col-lg">
          <Field label="Hipótese Diagnóstica 1">
            <TextInput
              disabled={justShow}
              meta={{
                error: errors.diagnosticHypothesis_1,
                touched: touched.diagnosticHypothesis_1,
              }}
              value={entity.diagnosticHypothesis_1 || ''}
              onChange={(diagnosticHypothesis, type) =>
                form.handleChange({
                  path: 'diagnosticHypothesis_1',
                  type,
                  values: prev => ({
                    ...prev,
                    diagnosticHypothesis_1: diagnosticHypothesis,
                  }),
                })
              }
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Hipótese Diagnóstica 2">
            <TextInput
              disabled={justShow}
              meta={{
                error: errors.diagnosticHypothesis_2,
                touched: touched.diagnosticHypothesis_2,
              }}
              value={entity.diagnosticHypothesis_2 || ''}
              onChange={(diagnosticHypothesis, type) =>
                form.handleChange({
                  path: 'diagnosticHypothesis_2',
                  type,
                  values: prev => ({
                    ...prev,
                    diagnosticHypothesis_2: diagnosticHypothesis,
                  }),
                })
              }
            />
          </Field>
        </div>
      </div>
      <div className="row">
        <div className="col-lg">
          <Field label="Conduta">
            <TextAreaInput
              disabled={justShow}
              meta={{
                error: errors.conduct,
                touched: touched.conduct,
              }}
              rows={5}
              value={entity.conduct || ''}
              onChange={(conduct, type) =>
                form.handleChange({
                  path: 'conduct',
                  type,
                  values: prev => ({
                    ...prev,
                    conduct,
                  }),
                })
              }
              maxLenght={500}
            />
          </Field>
        </div>
      </div>
      <div className="row">
        <div className="col-lg">
          <Field label="Observações">
            <TextAreaInput
              disabled={justShow}
              meta={{
                error: errors.observation,
                touched: touched.observation,
              }}
              rows={5}
              value={entity.observation || ''}
              onChange={(observation, type) =>
                form.handleChange({
                  path: 'observation',
                  type,
                  values: prev => ({
                    ...prev,
                    observation,
                  }),
                })
              }
              maxLenght={500}
            />
          </Field>
        </div>
      </div>
    </>
  )
}

const RenderExams = ({ form, route, basename, service, global, justShow }) => {
  const { modal } = global
  const { entity, setValues } = form

  const [print, setPrint] = useState(false)

  return (
    <>
      <div className="row">
        <div className="col-lg kt-align-right">
          {!justShow && (
            <Button
              customClassName="btn-info"
              title="Nova Solicitação de Exame"
              icon="fas fa-plus"
              onClick={() => {
                route.history.push(`${basename}/solicitacoes-exames/cadastro`)
              }}
            />
          )}
        </div>
      </div>
      <div className="kt-separator" />
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
                  <span>Descrição Solicitação Exame</span>
                </th>
                <th className="kt-datatable__cell">
                  <span> </span>
                </th>
              </tr>
            </thead>
            <tbody className="kt-datatable__body">
              {entity.examsRequests.map((exam, i) => (
                <tr key={i} className="kt-datatable__row">
                  <td className="kt-datatable__cell">
                    <div>{`Solicitação de Exame ${exam.id}`}</div>
                  </td>
                  <td className="kt-datatable__cell no-wrap no-width">
                    {!justShow && (
                      <Button
                        customClassName="btn-info"
                        icon="fas fa-edit"
                        title="Editar"
                        onClick={() => {
                          route.history.push(`${basename}/solicitacoes-exames/${exam.id}`)
                        }}
                      />
                    )}

                    {!justShow && (
                      <Button
                        customClassName="btn-danger  margin-left-10"
                        icon="fas fa-trash-alt"
                        title="Remover"
                        onClick={() => {
                          modal.confirm(
                            `Deseja remover Solicitação de Exame ${exam.id}?`,
                            confirmed =>
                              confirmed &&
                              service
                                .remove('examsrequest', exam.id)
                                .then(() =>
                                  setValues({
                                    ...entity,
                                    examsRequests: entity.examsRequests.filter(
                                      request => request.id !== exam.id,
                                    ),
                                  }),
                                )
                                .catch(err => modal.alert(err.message)),
                          )
                        }}
                      />
                    )}

                    <Button
                      customClassName="btn-print margin-left-10"
                      icon="fas fa-print"
                      title="Imprimir"
                      loading={print}
                      disabled={print}
                      onClick={async () => {
                        setPrint(true)
                        await service
                          .post('report.examsrequests', { items: [exam] }, undefined, resp =>
                            resp.blob(),
                          )
                          .then(blob => iframeDownload(blob, 'solicitacao-exames.pdf'))
                          .catch(err => global.modal.alert(err.message))
                          .finally(() => setPrint(false))
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {entity.examsRequests.length === 0 && (
            <div className="kt-datatable--error">Nenhuma solicitação de exame foi encontrada.</div>
          )}
        </div>
      </div>
    </>
  )
}

const RenderRecipes = ({ form, route, basename, service, global, justShow }) => {
  const { modal } = global
  const { entity, setValues } = form

  const [print, setPrint] = useState(false)

  return (
    <>
      <div className="row">
        <div className="col-lg kt-align-right">
          {!justShow && (
            <Button
              customClassName="btn-info"
              title="Nova Receita"
              icon="fas fa-plus"
              onClick={() => {
                route.history.push(`${basename}/receitas/cadastro`)
              }}
            />
          )}
        </div>
      </div>
      <div className="kt-separator" />
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
                  <span>Descrição Receita</span>
                </th>
                <th className="kt-datatable__cell">
                  <span> </span>
                </th>
              </tr>
            </thead>
            <tbody className="kt-datatable__body">
              {entity.recipes.map((recipe, i) => (
                <tr key={i} className="kt-datatable__row">
                  <td className="kt-datatable__cell">
                    <div>{`Receita ${recipe.id}`}</div>
                  </td>
                  <td className="kt-datatable__cell no-wrap no-width">
                    {!justShow && (
                      <Button
                        customClassName="btn-info"
                        icon="fas fa-edit"
                        title="Editar"
                        onClick={() => {
                          route.history.push(`${basename}/receitas/${recipe.id}`)
                        }}
                      />
                    )}

                    {!justShow && (
                      <Button
                        customClassName="btn-danger  margin-left-10"
                        icon="fas fa-trash-alt"
                        title="Remover"
                        onClick={() => {
                          modal.confirm(
                            `Deseja remover Receita ${recipe.id}?`,
                            confirmed =>
                              confirmed &&
                              service
                                .remove('recipe', recipe.id)
                                .then(() =>
                                  setValues({
                                    ...entity,
                                    recipes: entity.recipes.filter(
                                      request => request.id !== recipe.id,
                                    ),
                                  }),
                                )
                                .catch(err => modal.alert(err.message)),
                          )
                        }}
                      />
                    )}

                    <Button
                      customClassName="btn-print margin-left-10"
                      icon="fas fa-print"
                      title="Imprimir"
                      loading={print}
                      disabled={print}
                      onClick={async () => {
                        setPrint(true)
                        await service
                          .post('report.recipes', { items: [recipe] }, undefined, resp =>
                            resp.blob(),
                          )
                          .then(blob => iframeDownload(blob, 'receita.pdf'))
                          .catch(err => global.modal.alert(err.message))
                          .finally(() => setPrint(false))
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {entity.recipes.length === 0 && (
            <div className="kt-datatable--error">Nenhuma receita foi encontrada.</div>
          )}
        </div>
      </div>
    </>
  )
}

const RenderCertificate = ({ form, justShow }) => {
  const { entity, errors, touched } = form

  return (
    <>
      <div className="row">
        <div className="col-lg-3">
          <Field label="Período de Afastamento">
            <Select
              disabled={justShow}
              meta={{
                error: errors.clearanceType,
                touched: touched.clearanceType,
              }}
              placement="top"
              items={ClearanceTypeDescription}
              selected={entity.clearanceType}
              getId={({ id }) => id}
              getDisplay={({ description }) => description}
              onChange={clearanceType => {
                form.handleChange({
                  path: 'clearanceType',
                  values: prev => ({
                    ...prev,
                    clearanceType: clearanceType.id,
                  }),
                })
              }}
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Dias">
            <IntegerInput
              disabled={entity.clearanceType !== ClearanceType.DAYS || justShow}
              acceptEnter
              meta={{
                error: errors.daysAway,
                touched: touched.daysAway,
              }}
              value={entity.daysAway || ''}
              onChange={(daysAway, type) =>
                form.handleChange({
                  path: 'daysAway',
                  type,
                  values: prev => ({
                    ...prev,
                    daysAway,
                  }),
                })
              }
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="CID">
            <TextInput
              disabled={justShow}
              meta={{
                error: errors.cid,
                touched: touched.cid,
              }}
              value={entity.cid || ''}
              onChange={(cid, type) =>
                form.handleChange({
                  path: 'cid',
                  type,
                  values: prev => ({
                    ...prev,
                    cid,
                  }),
                })
              }
            />
          </Field>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-2">
          <Switch
            id="companion"
            className="button-add"
            label="Acompanhante"
            checked={entity.companion}
            disabled={justShow}
            onChange={(companion, type) => {
              form.handleChange({
                path: 'companion',
                type,
                values: prev => ({
                  ...prev,
                  companion,
                  companionName: companion ? entity.companionName : '',
                }),
              })
            }}
          />
        </div>
        <div className="col-lg">
          <Field label="Nome do Acompanhante">
            <TextInput
              disabled={!entity.companion || justShow}
              meta={{
                error: errors.companionName,
                touched: touched.companionName,
              }}
              value={entity.companionName}
              onChange={(companionName, type) =>
                form.handleChange({
                  path: 'companionName',
                  type,
                  values: prev => ({
                    ...prev,
                    companionName,
                  }),
                })
              }
              maxLength={100}
            />
          </Field>
        </div>
      </div>
    </>
  )
}

const RenderReturn = ({ form, justShow }) => {
  const { entity, errors, touched } = form

  return (
    <>
      <div className="row">
        <div className="col-lg">
          <Field label="Dias para o Retorno">
            <IntegerInput
              disabled={justShow}
              acceptEnter
              meta={{
                error: errors.returnDays,
                touched: touched.returnDays,
              }}
              value={entity.returnDays || 0}
              onChange={(returnDays, type) => {
                const createdAt = new Date(entity.createdAt)
                form.handleChange({
                  path: 'returnDays',
                  type,
                  values: prev => ({
                    ...prev,
                    returnDays,
                    returnDate: new Date(
                      createdAt.getFullYear(),
                      createdAt.getMonth(),
                      createdAt.getDate() + returnDays,
                    ),
                  }),
                })
              }}
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Data Limite do Retorno">
            <DateInput
              disabled={justShow}
              customClassName="form-control-xl"
              onChange={(returnDate, type) =>
                form.handleChange({
                  path: 'returnDate',
                  type,
                  values: prev => ({
                    ...prev,
                    returnDate,
                    returnDays: differenceInDays(returnDate, new Date(entity.createdAt)),
                  }),
                })
              }
              value={entity.returnDate}
            />
          </Field>
        </div>
      </div>
    </>
  )
}

const RenderProcedures = ({ form, justShow }) => {
  const { entity } = form

  return (
    <>
      <div className="row">
        <div className="col-lg kt-align-right">
          {!justShow && (
            <Button
              customClassName="btn-info"
              title="Novo Procedimento"
              icon="fas fa-plus"
              onClick={() => {
                form.setValues(prev => ({
                  ...prev,
                  procedureModalShow: true,
                }))
              }}
            />
          )}
        </div>
      </div>
      <div className="kt-separator" />
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
                  <span>Descrição Procedimento</span>
                </th>
                <th className="kt-datatable__cell">
                  <span> </span>
                </th>
              </tr>
            </thead>
            <tbody className="kt-datatable__body">
              {entity.attendanceProcedures.map((procedure, i) => (
                <tr key={i} className="kt-datatable__row">
                  <td className="kt-datatable__cell">
                    <div>{procedure.medicalProcedureDescription}</div>
                  </td>
                  <td className="kt-datatable__cell no-wrap no-width">
                    {!justShow && (
                      <Button
                        customClassName="btn-danger"
                        icon="fas fa-trash"
                        title="Remover"
                        onClick={() => {
                          const proceduresSplice = [...entity.attendanceProcedures]
                          proceduresSplice.splice(i, 1)

                          form.setValues(prev => ({
                            ...prev,
                            attendanceProcedures: [...proceduresSplice],
                          }))
                        }}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {entity.attendanceProcedures.length === 0 && (
            <div className="kt-datatable--error">Nenhum procedimento foi encontrado.</div>
          )}
        </div>
      </div>
    </>
  )
}

const RenderMedicalRecord = ({ form, service, global, route, setMedicalRecordSelected }) => {
  const { entity } = form

  const getTypeFormat = ({ attendanceType }) => {
    const type = TypeSchedulingDescription.find(item => attendanceType === item.id)
    return type.name
  }

  const columns = [
    { path: 'id', title: '#', textAlign: 'center', sort: 'createdAt' },
    { path: 'patientName', title: 'Paciente' },
    { path: 'patientCpfCnpj', title: 'CPF/CNPJ', format: 'cpfcnpj' },
    { path: 'healthProfessionalName', title: 'Profissional de Saúde' },
    { path: 'createdAt', title: 'Data do Atendimento', format: 'date' },
    { path: 'start', title: 'Hora Início' },
    { path: 'end', title: 'Hora Fim' },
    {
      path: 'attendanceType',
      title: 'Tipo',
      format: getTypeFormat,
    },
  ]

  const fields = columns.map(c => c.path)

  const { setValues, filters } = useFilters(
    {
      patientId: 0,
      attendanceId: null,
    },
    query => [
      {
        items: [
          {
            name: 'Attendance.patientId',
            value: query.patientId,
            comparer: 'Equals',
          },
          query.attendanceId
            ? {
                name: 'Attendance.id',
                value: query.attendanceId,
                comparer: 'NotEquals',
              }
            : {},
        ],
      },
    ],
  )

  useEffect(() => {
    if (entity.patientId !== 0) {
      setValues(prev => ({
        ...prev,
        patientId: entity.patientId,
        attendanceId: form.hasId ? entity.id : null,
      }))
    }
    // eslint-disable-next-line
	}, [entity.patientId])

  const fetching = useState(false)
  const refresh = useRefresh()

  return (
    <>
      <div className="kt-portlet__body kt-portlet__body--fit">
        <div className="kt-separator kt-separator--space-sm" />
        <List
          primaryKey="id"
          modal={global.modal}
          route={route}
          refresh={refresh}
          fetching={fetching}
          filters={filters}
          initialQuery={{ fields, sort: [['createdAt', 'DESC']] }}
          getItems={(query, signal) => service.getList('attendance', query, signal)}
          actions={[
            {
              icon: `fas fa-notes-medical`,
              title: 'Detalhes',
              action: async ent => {
                setMedicalRecordSelected(ent.entity.id)
                form.setValues(prev => ({
                  ...prev,
                  medicalRecordModalShow: true,
                }))
              },
            },
          ]}
          columns={columns}
        />
      </div>
    </>
  )
}

export const AttendanceForm = ({ route, service, basename, global }) => {
  const [routeReturn, setRouteReturn] = useState('attendance')
  const [healthProfessionalLogged, setHealthProfessionalLogged] = useState(null)
  const [medicalRecordSelected, setMedicalRecordSelected] = useState(0)
  const [activeTabs, setActiveTabs] = useState(true)
  const form = useForm(
    {
      displayName: ent => ent.id,
      initialEntity: {
        id: 0,
        healthProfessionalId: 0,
        healthProfessionalName: '',
        patientId: 0,
        patientName: '',
        patientAge: '',
        patientBirthDay: '',
        planTitle: '',
        planId: 0,
        schedulingId: 0,
        createdAt: '',
        start: '',
        end: '',
        address: '',
        rg: '',
        phone: '',
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
        cid: '',
        diagnosticHypothesis_1: '',
        diagnosticHypothesis_2: '',
        observation: '',
        conduct: '',
        clearanceType: ClearanceType.ATTENDANCETIME,
        daysAway: 0,
        companionName: '',
        companion: false,
        examsRequests: [],
        recipes: [],
        status: AttendanceStatus.INSERVICE,
        view: 'Initial',
        returnDays: 0,
        returnDate: null,
        initialObservation: '',
        complementaryExams: '',
        attendanceProcedures: [],
        procedureModalShow: false,
        medicalRecordModalShow: false,
      },
      validate: () => ({}),
    },
    route,
  )

  const refresh = useRefresh()
  const { entity, errors } = form
  const fetching = form.fetching || (form.hasId && entity.id === 0)
  const { state } = route.location
  const showRecipe = route.location.pathname.includes('receitas')
  const showExams = route.location.pathname.includes('solicitacoes-exames')
  const ref = useRef(null)
  const [opened, setOpened] = useState(false)
  useOnClickOutside(ref, () => setOpened(false))

  const justShow = /mostrar/.test(route.match.path)

  const getRecipes = () => {
    service
      .getList('recipe', {
        usePager: false,
        filters: [
          {
            items: [
              {
                name: 'attendanceId',
                comparer: 'Equals',
                value: entity.id,
              },
            ],
          },
        ],
      })
      .then(({ items }) => {
        form.setValues({
          recipes: items,
        })
      })
  }

  const getExamsRequest = () => {
    service
      .getList('examsrequest', {
        usePager: false,
        filters: [
          {
            items: [
              {
                name: 'attendanceId',
                comparer: 'Equals',
                value: entity.id,
              },
            ],
          },
        ],
      })
      .then(({ items }) => {
        form.setValues({
          examsRequests: items,
        })
      })
  }

  const callBackReturn = name => {
    if (name === 'attendance') {
      return '/atendimentos'
    }
    if (name === 'medicalSchedule') {
      return '/agenda-medica'
    }
    return '/agendamento'
  }

  useEffect(() => {
    const user = localStore.get(config.OPERATOR_KEY)
    if (user.healthProfessionalId !== null) {
      setHealthProfessionalLogged(user.healthProfessionalId)
      if (user.healthProfessionalId !== entity.healthProfessionalId) {
        setActiveTabs(false)
      }
    }
    // eslint-disable-next-line
	}, [])

  useEffect(() => {
    if (state) {
      form.setValues({
        schedulingId: state.schedulingId,
      })
      setRouteReturn(state.routeReturn ? state.routeReturn : 'attendance')
      if (state.view) {
        form.setValues({
          view: state.view,
        })
      }
      if (state.refresh) {
        getRecipes()
        getExamsRequest()
      }
    }
    // eslint-disable-next-line
	}, [state])

  useEffect(() => {
    if (entity.schedulingId && !form.hasId) {
      service.getById('scheduling', entity.schedulingId).then(resp => {
        const createdAt = new Date(resp.createdAt)
        form.setValues({
          healthProfessionalId: resp.healthProfessionalId,
          healthProfessionalName: resp.healthProfessional.name,
          patientId: resp.patientId,
          patientName: resp.patient.name,
          patientAge: resp.patient.birthDate
            ? differenceInYears(Date.now(), new Date(resp.patient.birthDate.substr(0, 19)))
            : '',
          patientBirthDay: resp.patient.birthDate,
          planId: resp.planId,
          planTitle: resp.planTitle,
          createdAt: resp.createdAt,
          start: resp.start,
          end: resp.end,
          address: resp.patientAddress,
          rg: resp.rg,
          phone: resp.phone,
          returnDays: 30,
          returnDate: new Date(
            createdAt.getFullYear(),
            createdAt.getMonth(),
            createdAt.getDate() + 30,
          ),
        })
      })
    }

    // eslint-disable-next-line
	}, [entity.schedulingId])

  useEffect(() => {
    if (form.hasId) {
      form.handleFetch({
        action: (id, ac) => service.getById('attendance', id, ac.signal),
        errorFn: err => form.setErrors({ global: err.message }),
        mapper: a => {
          const createdAt = new Date(a.createdAt)
          return {
            ...a,
            healthProfessionalName: a.healthProfessional.name,
            patientName: a.patient.name,
            patientAge: a.patient.birthDate
              ? differenceInYears(Date.now(), new Date(a.patient.birthDate.substr(0, 19)))
              : '',
            patientBirthDay: a.patient.birthDate,
            returnDays: a.returnDays !== null ? a.returnDays : 30,
            returnDate:
              a.returnDate !== null
                ? a.returnDate
                : new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate() + 30),
          }
        },
      })
    }
    // eslint-disable-next-line
	}, [])

  return fetching ? (
    'Carregando...'
  ) : (
    <>
      <div className="kt-portlet">
        <div className="kt-portlet__head">
          <div className="kt-portlet__head-label">
            <h3 className="kt-portlet__head-title">
              {form.displayName
                ? `Atendimento ${form.displayName} - ${entity.patientName}`
                : `Novo Atendimento - ${entity.patientName}`}
            </h3>
          </div>
        </div>
        <form
          autoComplete="off"
          className="kt-form kt-form--label-right"
          onSubmit={ev => {
            ev.preventDefault()
            form.handleSubmit(data => {
              submit({
                path: 'attendance',
                callback: () => {
                  if (healthProfessionalLogged !== entity.healthProfessionalId) {
                    route.history.push(`${basename}${callBackReturn(routeReturn)}`)
                  } else {
                    form.setSubmitting(false)
                  }
                },
                data,
                service,
                form,
              })
            })
          }}
        >
          <div className="kt-portlet__body">
            <ul className="nav nav-tabs kt-mb-0" role="tablist">
              <li className="nav-item">
                <button
                  className={classNames('nav-link', {
                    active: entity.view === 'Initial',
                  })}
                  onClick={() =>
                    form.setValues({
                      view: 'Initial',
                    })
                  }
                  type="button"
                >
                  <span className="btn kt-padding-0">Dados Iniciais e Anamnese</span>
                </button>
              </li>
              {!activeTabs && (
                <li className="nav-item">
                  <button
                    className={classNames('nav-link', {
                      active: entity.view === 'Attendance',
                    })}
                    onClick={() =>
                      form.setValues({
                        view: 'Attendance',
                      })
                    }
                    type="button"
                  >
                    <span className="btn kt-padding-0">Atendimento Médico</span>
                  </button>
                </li>
              )}

              {!activeTabs && (
                <li className="nav-item">
                  <button
                    className={classNames('nav-link', {
                      active: entity.view === 'Recipes',
                      disabled: !form.hasId,
                    })}
                    onClick={() =>
                      form.setValues({
                        view: 'Recipes',
                      })
                    }
                    type="button"
                  >
                    <span className="btn kt-padding-0">Receitas</span>
                  </button>
                </li>
              )}

              <li className="nav-item">
                <button
                  className={classNames('nav-link', {
                    active: entity.view === 'Exams',
                    disabled: !form.hasId,
                  })}
                  onClick={() =>
                    form.setValues({
                      view: 'Exams',
                    })
                  }
                  type="button"
                >
                  <span className="btn kt-padding-0">Solicitação de Exames</span>
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={classNames('nav-link', {
                    active: entity.view === 'Procedures',
                    disabled: !form.hasId,
                  })}
                  onClick={() =>
                    form.setValues({
                      view: 'Procedures',
                    })
                  }
                  type="button"
                >
                  <span className="btn kt-padding-0">Procedimentos</span>
                </button>
              </li>
              {!activeTabs && (
                <li className="nav-item">
                  <button
                    className={classNames('nav-link', {
                      active: entity.view === 'Certificate',
                      disabled: !form.hasId,
                    })}
                    onClick={() =>
                      form.setValues({
                        view: 'Certificate',
                      })
                    }
                    type="button"
                  >
                    <span className="btn kt-padding-0">Atestado Médico</span>
                  </button>
                </li>
              )}

              <li className="nav-item">
                <button
                  className={classNames('nav-link', {
                    active: entity.view === 'ReturnData',
                    disabled: !form.hasId,
                  })}
                  onClick={() =>
                    form.setValues({
                      view: 'ReturnData',
                    })
                  }
                  type="button"
                >
                  <span className="btn kt-padding-0">Retorno</span>
                </button>
              </li>
              {!activeTabs && (
                <li className="nav-item">
                  <button
                    className={classNames('nav-link', {
                      active: entity.view === 'MedicalRecord',
                      disabled: justShow,
                    })}
                    onClick={() =>
                      form.setValues({
                        view: 'MedicalRecord',
                      })
                    }
                    type="button"
                  >
                    <span className="btn kt-padding-0">Prontuário</span>
                  </button>
                </li>
              )}
            </ul>
            <div className="border border-top-0 rounded-bottom p-3">
              {entity.view === 'Initial' && (
                <RenderInitialData
                  form={form}
                  service={service}
                  global={global}
                  justShow={justShow}
                />
              )}
              {entity.view === 'Attendance' && (
                <RenderAttendance
                  form={form}
                  service={service}
                  global={global}
                  justShow={justShow}
                />
              )}
              {entity.view === 'Exams' && (
                <RenderExams
                  form={form}
                  route={route}
                  basename={basename}
                  refresh={refresh}
                  service={service}
                  global={global}
                  justShow={justShow}
                />
              )}
              {entity.view === 'Recipes' && (
                <RenderRecipes
                  form={form}
                  route={route}
                  basename={basename}
                  refresh={refresh}
                  service={service}
                  global={global}
                  justShow={justShow}
                />
              )}
              {entity.view === 'Certificate' && (
                <RenderCertificate
                  form={form}
                  service={service}
                  global={global}
                  justShow={justShow}
                />
              )}
              {entity.view === 'ReturnData' && (
                <RenderReturn form={form} service={service} global={global} justShow={justShow} />
              )}
              {entity.view === 'Procedures' && (
                <RenderProcedures
                  form={form}
                  service={service}
                  global={global}
                  justShow={justShow}
                />
              )}
              {entity.view === 'MedicalRecord' && (
                <RenderMedicalRecord
                  form={form}
                  service={service}
                  global={global}
                  route={route}
                  setMedicalRecordSelected={setMedicalRecordSelected}
                />
              )}
            </div>
            <br />
            <ErrorMessage error={errors.global} />
          </div>
          <div className="kt-portlet__foot">
            <div className="kt-form__actions">
              <div className="row">
                <div className="col-lg kt-align-right">
                  <div className="btn-group dropup">
                    <Button
                      type="button"
                      icon="fas fa-arrow-left"
                      customClassName="btn-secondary"
                      title="Voltar"
                      disabled={form.submitting}
                      onClick={() =>
                        route.history.push(`${basename}${callBackReturn(routeReturn)}`)
                      }
                    />
                    <div
                      ref={ref}
                      className={classNames('dropdown', {
                        show: opened,
                      })}
                    >
                      <button
                        type="button"
                        data-toggle="dropdown"
                        className="btn btn-print dropdown-print"
                        title="Imprimir"
                        onClick={() => setOpened(true)}
                      >
                        <i className="fas fa-print" /> Imprimir
                      </button>
                      <div
                        className={classNames('dropdown-menu dropdown-menu-right', {
                          show: opened,
                        })}
                      >
                        {entity.recipes.length > 0 && (
                          <Button
                            icon="fas fa-capsules"
                            className="dropdown-item"
                            title="Imprimir Receita(s)"
                            loading={form.submitting}
                            disabled={form.submitting}
                            onClick={async () => {
                              setOpened(false)
                              form.setSubmitting(true)
                              await service
                                .post(
                                  'report.recipes',
                                  { items: entity.recipes },
                                  undefined,
                                  resp => resp.blob(),
                                )
                                .then(blob => iframeDownload(blob, 'receitas.pdf'))
                                .catch(err => global.modal.alert(err.message))
                                .finally(() => form.setSubmitting(false))
                            }}
                          />
                        )}
                        {entity.examsRequests.length > 0 && (
                          <Button
                            icon="fas fa-file-medical"
                            className="dropdown-item"
                            title="Imprimir Solicitação(ões) de Exames"
                            loading={form.submitting}
                            disabled={form.submitting}
                            onClick={async () => {
                              setOpened(false)
                              form.setSubmitting(true)
                              await service
                                .post(
                                  'report.examsrequests',
                                  { items: entity.examsRequests },
                                  undefined,
                                  resp => resp.blob(),
                                )
                                .then(blob => iframeDownload(blob, 'solicitacoes-exames.pdf'))
                                .catch(err => global.modal.alert(err.message))
                                .finally(() => form.setSubmitting(false))
                            }}
                          />
                        )}
                        {form.hasId && (
                          <Button
                            icon="fas fa-print"
                            className="dropdown-item"
                            title="Imprimir Atestado"
                            loading={form.submitting}
                            disabled={form.submitting}
                            onClick={() => {
                              setOpened(false)
                              form.handleSubmit(data => {
                                submit({
                                  path: 'attendance',
                                  callback: async () => {
                                    await service
                                      .post(
                                        'report.medicalcertificate',
                                        { id: entity.id },
                                        undefined,
                                        resp => resp.blob(),
                                      )
                                      .then(blob => iframeDownload(blob, 'atestado.pdf'))
                                      .catch(err => global.modal.alert(err.message))
                                      .finally(() => form.setSubmitting(false))
                                  },
                                  data,
                                  service,
                                  form,
                                })
                              })
                            }}
                          />
                        )}
                        {form.hasId && (
                          <Button
                            icon="fas fa-print"
                            className="dropdown-item"
                            title="Imprimir Ficha"
                            loading={form.submitting}
                            disabled={form.submitting}
                            onClick={() => {
                              setOpened(false)
                              form.handleSubmit(data => {
                                submit({
                                  path: 'attendance',
                                  callback: async () => {
                                    await service
                                      .post(
                                        'report.attendanceform',
                                        { id: entity.id },
                                        undefined,
                                        resp => resp.blob(),
                                      )
                                      .then(blob => iframeDownload(blob, 'ficha-atendimento.pdf'))
                                      .catch(err => global.modal.alert(err.message))
                                      .finally(() => form.setSubmitting(false))
                                  },
                                  data,
                                  service,
                                  form,
                                })
                              })
                            }}
                          />
                        )}
                      </div>
                    </div>

                    {!justShow && (
                      <Button
                        icon="fas fa-save"
                        customClassName="btn-primary"
                        title="Salvar"
                        loading={form.submitting}
                        disabled={form.submitting}
                      />
                    )}

                    {justShow && (
                      <Button
                        icon="fas fa-edit"
                        type="button"
                        customClassName="btn-primary"
                        title="Editar"
                        loading={!justShow && form.submitting}
                        disabled={form.submitting}
                        onClick={() => {
                          route.history.push(`${basename}/atendimentos/${entity.id}`, { ...state })
                        }}
                      />
                    )}

                    {form.hasId &&
                      healthProfessionalLogged === entity.healthProfessionalId &&
                      !justShow && (
                        <Button
                          icon="fas fa-save"
                          customClassName="btn-primary"
                          title="Encerrar Atendimento"
                          loading={form.submitting}
                          disabled={form.submitting}
                          onClick={() => {
                            form.handleSubmit(data => {
                              submit({
                                path: 'attendance',
                                callback: () =>
                                  route.history.push(`${basename}${callBackReturn(routeReturn)}`),
                                data: {
                                  ...data,
                                  status: AttendanceStatus.ATTENDED,
                                },
                                service,
                                form,
                              })
                            })
                          }}
                        />
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      <RecipeModal
        service={service}
        show={showRecipe}
        route={route}
        attendanceId={entity.id}
        basename={basename}
        refresh={async () => {
          await global.refresh(true)
          refresh.force()
        }}
      />

      <ExamsModal
        service={service}
        show={showExams}
        route={route}
        attendanceId={entity.id}
        basename={basename}
        refresh={async () => {
          await global.refresh(true)
          refresh.force()
        }}
      />

      <ProceduresModal
        service={service}
        show={entity.procedureModalShow}
        onClose={() => form.setValues(prev => ({ ...prev, procedureModalShow: false }))}
        onSelect={procedure =>
          form.handleChange({
            path: 'attendanceProcedures',
            values: prev => ({
              ...prev,
              attendanceProcedures: [
                ...prev.attendanceProcedures,
                {
                  medicalProcedureId: procedure.id,
                  medicalProcedureDescription: procedure.description,
                },
              ],
              procedureModalShow: false,
            }),
          })
        }
      />

      <MedicalRecordModal
        service={service}
        show={entity.medicalRecordModalShow}
        form={form}
        attendanceId={medicalRecordSelected}
      />
    </>
  )
}
