import React, { useEffect, useState } from 'react'
import { useForm } from 'core/hooks/form'
import { submit } from 'helpers'
import { Button } from 'core/components/button'
import { ErrorMessage } from 'core/components/form/error-message'
import { classNames } from 'core/helpers/misc'
import { Field } from 'core/components/form/field'
import { tableMaskMoney, maskDecimal, maskCpfCnpj } from 'core/helpers/mask'
import { ReadOnlyInput } from 'core/components/form/readonly-input'
import { requiredMessage } from 'core/constants'
import { AsyncSelect } from 'core/components/form/async-select'
import { ProceduresModal } from 'components/attendance'

import { DecimalInput } from 'core/components/form/decimal-input'
import { TextInput } from 'core/components/form/text-input'
import { IntegerInput } from 'core/components/form/integer-input'
import { AttendanceModal } from './AttendanceModal'
import { PatientsModal } from './PatientModal'
import { ExamsModal } from './ExamsModal'

function setDiscount(entity, discount) {
  if (discount === 0) {
    return entity.total
  }
  return entity.total > 0 ? entity.total - (entity.total * discount) / 100 : 0
}

export const BillingForm = ({ global, route, service, basename }) => {
  const { operator } = global

  const form = useForm(
    {
      displayName: ent => ent.id,
      initialEntity: {
        id: 0,
        createdAt: new Date(),
        patientId: '',
        patientCpfCnpj: '',
        patientName: '',
        healthProfessionalId: 0,
        planId: 0,
        billingProcedures: [],
        billingExams: [],
        value: 0,
        attendanceModalShow: false,
        procedureModalShow: false,
        patientModalShow: false,
        examModalShow: false,
        employeeBankAccountId: operator.employeeBankAccountId,
        paymentMeanId: '',
        discount: 0,
        password: '',
        installments: 0,
        discountValue: 0,
        forValue: 0,
      },
      validate: values => {
        const errors = {}

        if (!values.patientId) errors.global = 'Selecione o paciente.'
        if (!values.healthProfessionalId) errors.healthProfessionalId = requiredMessage
        if (values.planId === 0) errors.planId = requiredMessage
        if (values.paymentMeanId === 9 && !values.installments)
          errors.global = 'Forma de pagamento informada exige que informe quantidade de parcelas'
        // if (values.billingProcedures.length === 0 && values.billingExams.length === 0)
        //   errors.global = 'Selecione pelo menos um procedimento ou exame para faturar.'

        return errors
      },
    },
    route,
  )

  const { entity, errors, touched } = form

  const fetching = form.fetching || (form.hasId && entity.id === 0)
  const [medicalprocedure, setProcedure] = useState({
    id: '',
    description: '',
    valuePlan: 0,
    valueParticular: 0,
  })
  useEffect(() => {
    service
      .getById('medicalprocedure', 1)
      .then(resp => setProcedure(resp))
      .catch(err => global.modal.alert(err.message))
  }, [])
  useEffect(() => {
    form.setValues(prev => ({
      ...prev,
      value: setDiscount(entity, entity.discount),
      discountValue: (entity.total * entity.discount) / 100 || 0,
    }))
  }, [entity.discount])

  useEffect(
    () => {
      // eslint-disable-next-line no-nested-ternary

      form.setValues(prev => ({
        ...prev,
        discount: (entity.discountValue / entity.total) * 100 || 0,
        value: setDiscount(entity, entity.discount),
      }))
    },
    [entity.discountValue],
    // [entity.value],
  )
  useEffect(() => {
    form.setValues(prev => ({
      ...prev,
      value: setDiscount(entity, entity.discount),
    }))
  }, [entity.discount])

  useEffect(() => {
    form.setValues(prev => ({
      ...prev,
      value:
        entity.billingProcedures.reduce((acc, curr) => acc + curr.medicalProcedureValue, 0) +
        entity.billingExams.reduce((acc, curr) => acc + curr.examValue, 0),
      total:
        entity.billingProcedures.reduce((acc, curr) => acc + curr.medicalProcedureValue, 0) +
        entity.billingExams.reduce((acc, curr) => acc + curr.examValue, 0),
    }))
  }, [entity.billingProcedures])
  useEffect(() => {
    form.setValues(prev => ({
      ...prev,
      value:
        entity.billingProcedures.reduce((acc, curr) => acc + curr.medicalProcedureValue, 0) +
        entity.billingExams.reduce((acc, curr) => acc + curr.examValue, 0),
      total:
        entity.billingProcedures.reduce((acc, curr) => acc + curr.medicalProcedureValue, 0) +
        entity.billingExams.reduce((acc, curr) => acc + curr.examValue, 0),
    }))
  }, [entity.billingExams])
  useEffect(() => {
    if (form.hasId) {
      form.handleFetch({
        action: (id, ac) => service.getById('billing', id, ac.signal),
        errorFn: err => form.setErrors({ global: err.message }),
      })
    }
    // eslint-disable-next-line
  }, [])

  return fetching ? (
    'Carregando...'
  ) : (
    <div className="kt-portlet">
      <div className="kt-portlet__head">
        <div className="kt-portlet__head-label">
          <h3 className="kt-portlet__head-title">
            {form.displayName ? `Faturamento ${form.displayName}` : 'Novo Faturamento'}
          </h3>
        </div>
        {!form.hasId && (
          <div className="kt-portlet__head-toolbar">
            <div className="kt-portlet__head-wrapper">
              <div className="dropdown dropdown-inline">
                <Button
                  icon="fas fa-hand-holding-medical"
                  customClassName="btn-info btn-icon-sm"
                  title="Faturar Atendimento"
                  onClick={() => {
                    form.setValues(prev => ({
                      ...prev,
                      attendanceModalShow: true,
                    }))
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      <form
        autoComplete="off"
        className="kt-form kt-form--label-right"
        onSubmit={ev => {
          ev.preventDefault()
          form.handleSubmit(data => {
            submit({
              path: 'billing',
              callback: () => route.history.push(`${basename}/faturamento`),
              data,
              service,
              form,
            })
          })
        }}
      >
        <div className="kt-portlet__body">
          {!form.hasId && (
            <div className="row">
              <div className="col kt-align-right">
                <Field>
                  <Button
                    disabled={entity.attendanceId}
                    icon="fas fa-search"
                    customClassName="btn-info btn-icon-sm"
                    title="Selecionar Paciente"
                    onClick={() => {
                      if (!form.hasId && !entity.attendanceId)
                        form.setValues(prev => ({
                          ...prev,
                          patientModalShow: true,
                        }))
                    }}
                  />
                </Field>
              </div>
            </div>
          )}
          <div className="row">
            <div className="col-lg">
              <Field label="Conta Faturamento">
                <AsyncSelect
                  disabled={form.hasId || operator.employeeBankAccountId}
                  meta={{
                    error: errors.employeeBankAccountId,
                    touched: touched.employeeBankAccountId,
                  }}
                  // placement="top"
                  isClearable
                  getId={({ id: _id }) => _id}
                  getDisplay={({ description }) => description}
                  getItems={value =>
                    service
                      .getList('bankAccount', {
                        usePager: false,
                        filters: [
                          {
                            items: [
                              {
                                name: 'description',
                                comparer: 'iLike',
                                value: `%${value}%`,
                              },
                            ],
                          },
                        ],
                      })
                      .then(({ items }) => items)
                  }
                  selected={entity.employeeBankAccountId}
                  onChange={(bankAccount, type) =>
                    form.handleChange({
                      path: 'employeeBankAccountId',
                      type,
                      values: prev => ({
                        ...prev,
                        employeeBankAccountId: bankAccount ? bankAccount.id : 0,
                      }),
                    })
                  }
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Meio de Pagamento">
                <AsyncSelect
                  meta={{
                    error: errors.paymentMeanId,
                    touched: touched.paymentMeanId,
                  }}
                  getId={({ id }) => id}
                  getDisplay={({ description }) => description}
                  getItems={value =>
                    service
                      .getList('paymentMean', {
                        usePager: false,
                        filters: [
                          {
                            items: [
                              {
                                name: 'description',
                                comparer: 'iLike',
                                value: `%${value}%`,
                              },
                            ],
                          },
                        ],
                      })
                      .then(({ items }) => items)
                  }
                  selected={entity.paymentMeanId}
                  onChange={(paymentMean, type) =>
                    form.handleChange({
                      path: 'cnpj',
                      type,
                      values: { paymentMeanId: paymentMean ? paymentMean.id : '' },
                    })
                  }
                />
              </Field>
            </div>
            {(entity.paymentMeanId === 9 || entity.paymentMeanId === 10) && (
              <>
                <div className="col-lg-1">
                  <Field label="Qtde Parcelas">
                    <IntegerInput
                      min={1}
                      meta={{
                        error: errors.installments,
                        touched: touched.installments,
                      }}
                      value={entity.installments}
                      onChange={(installments, type) =>
                        form.handleChange({
                          path: 'installments',
                          type,
                          values: prev => ({
                            ...prev,
                            installments,
                          }),
                        })
                      }
                    />
                  </Field>
                </div>
              </>
            )}
            <div className="col-lg"> </div>
          </div>
          <div className="row">
            <div className="col-lg">
              <Field label="CPF/CNPJ">
                <ReadOnlyInput
                  customClassName="form-control-xl"
                  value={maskCpfCnpj(entity.patientCpfCnpj)}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Paciente">
                <ReadOnlyInput customClassName="form-control-xl" value={entity.patientName} />
              </Field>
            </div>
          </div>
          <div className="row">
            <div className="col-lg">
              <Field label="Profissional de Saúde">
                <AsyncSelect
                  disabled={form.hasId || entity.attendanceId}
                  meta={{
                    error: errors.healthProfessionalId,
                    touched: touched.healthProfessionalId,
                  }}
                  getId={({ id }) => id}
                  getDisplay={({ name }) => name}
                  getItems={value =>
                    service
                      .getList('healthProfessional', {
                        usePager: false,
                        filters: [
                          {
                            items: [
                              {
                                name: 'name',
                                comparer: 'iLike',
                                value: `%${value}%`,
                              },
                            ],
                          },
                        ],
                      })
                      .then(({ items }) => items)
                  }
                  selected={entity.healthProfessionalId}
                  onChange={professional =>
                    form.handleChange({
                      path: 'professionalId',
                      values: prev => ({
                        ...prev,
                        healthProfessionalId: professional ? professional.id : null,
                      }),
                    })
                  }
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Plano">
                <AsyncSelect
                  disabled={
                    form.hasId ||
                    entity.attendanceId ||
                    entity.patientId ||
                    entity.billingProcedures.length > 0
                  }
                  meta={{
                    error: errors.planId,
                    touched: touched.planId,
                  }}
                  getId={({ id }) => id}
                  getDisplay={({ title }) => title}
                  getItems={value =>
                    service
                      .getList('plan', {
                        fields: ['id', 'title', 'disabledAt', 'single'],
                        usePager: false,
                        filters: [
                          {
                            items: [
                              {
                                name: 'title',
                                comparer: 'Like',
                                value,
                              },
                              {
                                name: 'disabledAt',
                                comparer: 'Equals',
                                value: null,
                              },
                            ],
                          },
                        ],
                      })
                      .then(({ items }) => [{ id: null, title: 'Particular' }, ...items])
                  }
                  selected={entity.planId}
                  onChange={plan =>
                    form.handleChange({
                      path: 'planId',
                      values: prev => ({
                        ...prev,
                        planId: plan ? plan.id : null,
                      }),
                    })
                  }
                />
              </Field>
            </div>
          </div>
          {!form.hasId && (
            <div className="row">
              <div className="col-lg kt-align-right">
                <Field>
                  <Button
                    icon="fas fa-search"
                    customClassName="btn-info btn-icon-sm"
                    title="Selecionar Procedimentos"
                    onClick={() => {
                      form.setValues(prev => ({
                        ...prev,
                        procedureModalShow: true,
                      }))
                    }}
                  />
                </Field>
              </div>
              <div className="col-lg-3 kt-align-right">
                <Field>
                  <Button
                    icon="fas fa-search"
                    customClassName="btn-info btn-icon-sm"
                    title="Selecionar Exames"
                    onClick={() => {
                      form.setValues(prev => ({
                        ...prev,
                        examModalShow: true,
                      }))
                    }}
                  />
                </Field>
              </div>
            </div>
          )}
          <div className="row">
            <div className="col-lg">
              <p className="table-label">Procedimentos selecionados:</p>
            </div>
          </div>
          <div className="kt-portlet__body kt-portlet__body--fit">
            <div
              className={classNames(
                'report-irregular kt-datatable kt-datatable--default kt-datatable--brand kt-datatable--loaded',
              )}
            >
              <table className="kt-datatable__table">
                <thead className="kt-datatable__head">
                  <tr className="kt-datatable__row">
                    <th
                      className="kt-datatable__cell"
                      style={{
                        width: '600px',
                      }}
                    >
                      <span>Descrição</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span>Valor</span>
                    </th>
                    {!form.hasId && (
                      <th className="kt-datatable__cell">
                        <span />
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="kt-datatable__body">
                  {entity.billingProcedures.map((i, index) => (
                    <tr key={i.id} className="kt-datatable__row">
                      <td className="kt-datatable__cell">
                        <div>{i.medicalProcedureDescription}</div>
                      </td>
                      <td className="kt-datatable__cell">
                        <div>{tableMaskMoney(i.medicalProcedureValue)}</div>
                      </td>
                      {!form.hasId && (
                        <td className="kt-datatable__cell">
                          <Button
                            icon="fas fa-minus"
                            customClassName="btn-danger btn-icon-sm"
                            title=""
                            onClick={() => {
                              form.setValues(prev => ({
                                ...prev,
                                billingProcedures: [
                                  ...entity.billingProcedures.slice(0, index),
                                  ...entity.billingProcedures.slice(index + 1),
                                ],
                              }))
                            }}
                          />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {entity.billingProcedures.length === 0 && (
                <div className="kt-datatable--error">Nenhum procedimento foi selecionado.</div>
              )}
            </div>
          </div>
          <div className="row">
            <div className="col-lg">
              <p className="table-label">Exames selecionados:</p>
            </div>
          </div>
          <div className="kt-portlet__body kt-portlet__body--fit">
            <div
              className={classNames(
                'report-irregular kt-datatable kt-datatable--default kt-datatable--brand kt-datatable--loaded',
              )}
            >
              <table className="kt-datatable__table">
                <thead className="kt-datatable__head">
                  <tr className="kt-datatable__row">
                    <th
                      className="kt-datatable__cell"
                      style={{
                        width: '600px',
                      }}
                    >
                      <span>Descrição</span>
                    </th>
                    <th className="kt-datatable__cell">
                      <span>Valor</span>
                    </th>
                    {!form.hasId && (
                      <th className="kt-datatable__cell">
                        <span />
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="kt-datatable__body">
                  {entity.billingExams.map((i, index) => (
                    <tr key={i.examId} className="kt-datatable__row">
                      <td className="kt-datatable__cell">
                        <div>{i.examDescription}</div>
                      </td>
                      <td className="kt-datatable__cell">
                        <div>{tableMaskMoney(i.examValue)}</div>
                      </td>
                      {!form.hasId && (
                        <td className="kt-datatable__cell">
                          <Button
                            icon="fas fa-minus"
                            customClassName="btn-danger btn-icon-sm"
                            title=""
                            onClick={() => {
                              form.setValues(prev => ({
                                ...prev,
                                billingExams: [
                                  ...entity.billingExams.slice(0, index),
                                  ...entity.billingExams.slice(index + 1),
                                ],
                              }))
                            }}
                          />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {entity.billingExams.length === 0 && (
                <div className="kt-datatable--error">Nenhum exame foi selecionado.</div>
              )}
            </div>
          </div>
          <div className="row">
            <div className="col-lg-6" />
            <div className="col-lg-2">
              <Field label="Desconto">
                <DecimalInput
                  disabled={entity.forValue === true}
                  acceptEnter
                  customClassName="form-control-xl"
                  icon="fas fa-percentage"
                  onChange={(discount, type) =>
                    form.handleChange({
                      path: 'discount',
                      type,
                      values: prev => ({
                        ...prev,
                        discount,
                        forValue: discount > 0 ? false : 3,
                      }),
                    })
                  }
                  value={entity.discount}
                />
              </Field>
            </div>
            <div className="col-lg-2">
              <Field label="">
                <DecimalInput
                  disabled={entity.forValue === false}
                  meta={{
                    error: errors.discountValue,
                    touched: touched.discountValue,
                  }}
                  acceptEnter
                  customClassName="form-control-xl"
                  icon="fas fa-dollar-sign"
                  onChange={(discountValue, type) => {
                    form.handleChange({
                      path: 'discountValue',
                      type,
                      values: { discountValue, forValue: discountValue > 0 ? true : 3 },
                    })
                  }}
                  value={entity.discountValue}
                />
              </Field>
            </div>
            <div className="col-lg-2">
              <Field label="Total">
                <ReadOnlyInput
                  customClassName="form-control-xl"
                  value={maskDecimal(entity.value)}
                />
              </Field>
            </div>
          </div>
          {entity.discount > 0 && (
            <>
              <div className="row">
                <div className="col-lg-9" />
                <div className="col-lg">
                  <Field label="Senha Desconto">
                    <TextInput
                      type="password"
                      autoComplete="new-password"
                      meta={{
                        error: errors.password,
                        touched: touched.password,
                      }}
                      value={entity.password}
                      onChange={(password, type) =>
                        form.handleChange({
                          path: 'password',
                          type,
                          values: prev => ({
                            ...prev,
                            password,
                          }),
                        })
                      }
                    />
                  </Field>
                </div>
              </div>
            </>
          )}
          <br />
          <ErrorMessage error={errors.global} />
        </div>
        <div className="kt-portlet__foot">
          <div className="kt-form__actions">
            <div className="row">
              <div className="col-lg kt-align-right">
                <Button
                  type="button"
                  icon="fas fa-arrow-left"
                  customClassName="btn-secondary"
                  title="Voltar"
                  disabled={form.submitting}
                  onClick={() => route.history.goBack()}
                />
                {!form.hasId && (
                  <Button
                    icon="fas fa-save"
                    customClassName="btn-primary"
                    title="Salvar"
                    loading={form.submitting}
                    disabled={form.submitting}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </form>

      <AttendanceModal
        service={service}
        show={entity.attendanceModalShow}
        onClose={() => form.setValues(prev => ({ ...prev, attendanceModalShow: false }))}
        onSelect={attendance =>
          form.handleChange({
            path: 'attendance',
            values: prev => ({
              ...prev,
              attendanceId: attendance.id,
              patientId: attendance.patientId,
              patientCpfCnpj: attendance.patient.cpfCnpj,
              patientName: attendance.patient.name,
              healthProfessionalId: attendance.healthProfessionalId,
              planId: attendance.planId,
              billingProcedures:
                attendance.attendanceProcedures || attendance.attendanceExams
                  ? attendance.attendanceProcedures
                  : [
                      {
                        medicalProcedureId: medicalprocedure.id,
                        medicalProcedureDescription: medicalprocedure.description,
                        medicalProcedureValue: attendance.planId
                          ? medicalprocedure.valuePlan
                          : medicalprocedure.valueParticular,
                      },
                    ],

              billingExams: attendance.attendanceExams,
              attendanceModalShow: false,
            }),
          })
        }
      />
      <PatientsModal
        service={service}
        show={entity.patientModalShow}
        onClose={() => form.setValues(prev => ({ ...prev, patientModalShow: false }))}
        onSelect={patient =>
          form.handleChange({
            path: 'billingProcedures',
            values: prev => ({
              ...prev,
              patientId: patient.id,
              patientCpfCnpj: patient.cpfCnpj,
              patientName: patient.name,
              patientModalShow: false,
              planId: patient.planId,
            }),
          })
        }
      />

      <ProceduresModal
        service={service}
        show={entity.procedureModalShow}
        onClose={() => form.setValues(prev => ({ ...prev, procedureModalShow: false }))}
        onSelect={procedure =>
          form.handleChange({
            path: 'billingProcedures',
            values: prev => ({
              ...prev,
              billingProcedures: [
                ...prev.billingProcedures,
                {
                  medicalProcedureId: procedure.id,
                  medicalProcedureDescription: procedure.description,
                  medicalProcedureValue: entity.planId
                    ? procedure.valuePlan
                    : procedure.valueParticular,
                },
              ],
              procedureModalShow: false,
            }),
          })
        }
      />
      <ExamsModal
        service={service}
        show={entity.examModalShow}
        onClose={() => form.setValues(prev => ({ ...prev, examModalShow: false }))}
        onSelect={exam =>
          form.handleChange({
            path: 'billingExams',
            values: prev => ({
              ...prev,
              billingExams: [
                ...prev.billingExams,
                {
                  examId: exam.id,
                  examDescription: exam.description,
                  examValue: entity.planId ? exam.valuePlan : exam.valueParticular,
                },
              ],
              examModalShow: false,
            }),
          })
        }
      />
    </div>
  )
}
