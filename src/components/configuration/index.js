import React, { useEffect } from 'react'
import { useForm } from 'core/hooks/form'
import { Field } from 'core/components/form/field'
import { Button } from 'core/components/button'
import { TextAreaInput } from 'core/components/form/textarea-input'
import { API } from 'service'
import { TextInput } from 'core/components/form/text-input'
import { formatDate } from 'core/helpers/date'
import { IntegerInput } from 'core/components/form/integer-input'
import { AsyncSelect } from 'core/components/form/async-select'

const smsMessageError = 'Numero máximo de caracteres excedido!'

function countSmsLength(text) {
  return text
    .replaceAll('{nome}', '_'.repeat(10))
    .replaceAll('{medico}', '_'.repeat(10))
    .replaceAll('{dia}', '_'.repeat(8))
    .replaceAll('{horario}', '_'.repeat(5))
    .replaceAll('{parcela}', '_'.repeat(2))
    .replaceAll('{valor}', '_'.repeat(5))
    .replaceAll('{vencimento}', '_'.repeat(10)).length
}

export const ConfigurationForm = ({ global, route, service }) => {
  const { modal } = global
  const form = useForm(
    {
      initialEntity: {
        id: 0,
        attendanceSmsMessage: '',
        debtSmsMessage: '',
        debtSmsHour: '',
        debtSchedule: '',
        maxLinesManipulationAttendance: 5,
        paymentBankAccountId: 0,
        paymentClassificationId: 0,
        password: '',
        passwordCheck: '',
      },
      validate: values => {
        const errors = {}
        const attendanceCount = countSmsLength(values.attendanceSmsMessage)
        const debtCount = countSmsLength(values.debtSmsMessage)

        if (attendanceCount > 160) errors.attendanceSmsMessage = smsMessageError
        if (debtCount > 160) errors.debtSmsMessage = smsMessageError
        if (!values.password && values.id === 0) errors.password = smsMessageError
        if (!values.passwordCheck && values.id === 0) errors.passwordCheck = smsMessageError
        else if (values.password !== values.passwordCheck)
          errors.passwordCheck = 'Senhas não coincidem'
        return errors
      },
    },
    route,
  )

  const { entity, touched, errors } = form
  const attendanceCount = countSmsLength(entity.attendanceSmsMessage)
  const debtCount = countSmsLength(entity.debtSmsMessage)

  useEffect(() => {
    form.handleFetch({
      action: () => API.get('configuration.get'),
      errorFn: err => modal.alert(err.message),
      mapper: config => ({
        ...config,
        debtSmsHour: config.debtSmsHour
          ? formatDate(config.debtSmsHour, 'HH:mm', true)
          : entity.debtSmsHour,
      }),
    })
    // eslint-disable-next-line
  }, [])

  return form.fetching ? (
    'Carregando...'
  ) : (
    <div className="kt-portlet">
      <div className="kt-portlet__head">
        <div className="kt-portlet__head-label">
          <h3 className="kt-portlet__head-title">Configurações</h3>
        </div>
      </div>
      <form
        autoComplete="off"
        className="kt-form kt-form--label-right"
        onSubmit={ev => {
          ev.preventDefault()
          form.handleSubmit(config =>
            API.post('configuration.change', config)
              .then(() => modal.alert('Atualizado com sucesso.'))
              .catch(err => modal.alert(err.message))
              .finally(() => form.setSubmitting(false)),
          )
        }}
      >
        <div className="kt-portlet__body">
          <div className="row">
            <div className="col-lg">
              <Field label="Mensagem de SMS pro atendimento">
                <TextAreaInput
                  meta={{
                    touched: touched.attendanceSmsMessage,
                    error: errors.attendanceSmsMessage,
                  }}
                  rows={3}
                  value={entity.attendanceSmsMessage}
                  onChange={(attendanceSmsMessage, type) =>
                    form.handleChange({
                      type,
                      path: 'attendanceSmsMessage',
                      values: { attendanceSmsMessage },
                    })
                  }
                />
                <p>{attendanceCount}/160</p>
                <p style={{ fontSize: '0.9rem' }}>
                  {`Variáveis disponíveis: {nome}, {medico}, {dia}, {horario}`}
                </p>
              </Field>
            </div>
          </div>

          <hr />
          <div className="kt-heading kt-heading--sm">SMS de Cobrança</div>

          <div className="row">
            <div className="col-lg-4">
              <Field label="Cronograma das mensagens de cobrança em dias">
                <TextInput
                  placeholder="-15, -1, 0, 15, 30"
                  value={entity.debtSchedule}
                  onChange={(debtSchedule, type) =>
                    form.handleChange({
                      type,
                      path: 'debtSchedule',
                      values: { debtSchedule },
                    })
                  }
                />
              </Field>
            </div>

            <div className="col-lg-4">
              <Field label="Hora do envio da mensagem de cobrança">
                <TextInput
                  value={entity.debtSmsHour}
                  onChange={(debtSmsHour, type) =>
                    form.handleChange({
                      type,
                      path: 'debtSmsHour',
                      values: { debtSmsHour },
                    })
                  }
                />
              </Field>
            </div>
          </div>

          <div className="row">
            <div className="col-lg">
              <Field label="Mensagem de SMS pra cobrança">
                <TextAreaInput
                  meta={{
                    touched: touched.debtSmsMessage,
                    error: errors.debtSmsMessage,
                  }}
                  rows={3}
                  value={entity.debtSmsMessage}
                  onChange={(debtSmsMessage, type) =>
                    form.handleChange({
                      type,
                      path: 'debtSmsMessage',
                      values: { debtSmsMessage },
                    })
                  }
                />

                <p>{debtCount}/160</p>
                <p style={{ fontSize: '0.9rem' }}>
                  {`Variáveis disponíveis: {nome}, {parcela}, {valor}, {vencimento}`}
                </p>
              </Field>
            </div>
          </div>

          <div className="kt-heading kt-heading--sm">Receita</div>

          <div className="row">
            <div className="col-lg-4">
              <Field label="Quantidade máxima de linhas campo manipulação">
                <IntegerInput
                  placeholder="1, 2, 3, 4, 5"
                  value={entity.maxLinesManipulationAttendance}
                  onChange={(maxLinesManipulationAttendance, type) =>
                    form.handleChange({
                      type,
                      path: 'maxLinesManipulationAttendance',
                      values: { maxLinesManipulationAttendance },
                    })
                  }
                />
              </Field>
            </div>
          </div>
          <div className="kt-heading kt-heading--sm">Pagamento</div>
          <div className="row">
            <div className="col-lg">
              <Field label="Classificação Pagamento">
                <AsyncSelect
                  meta={{
                    error: errors.paymentClassificationId,
                    touched: touched.paymentClassificationId,
                  }}
                  getId={({ id }) => id}
                  getDisplay={({ description }) => description}
                  getItems={value =>
                    service
                      .getList('classification', {
                        usePager: false,
                        filters: [
                          {
                            items: [
                              {
                                name: 'description',
                                comparer: 'Like',
                                value,
                              },
                            ],
                          },
                        ],
                      })
                      .then(({ items }) => items)
                  }
                  selected={entity.paymentClassificationId}
                  onChange={(classification, type) =>
                    form.handleChange({
                      path: 'cnpj',
                      type,
                      values: { paymentClassificationId: classification ? classification.id : '' },
                    })
                  }
                />
              </Field>
            </div>
            <div className="col-lg"> </div>
          </div>
          <div className="row">
            <div className="col-lg-2">
              <Field label="Senha">
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
            <div className="col-lg-2">
              <Field label="Repetir Senha">
                <TextInput
                  acceptEnter
                  type="password"
                  autoComplete="new-password"
                  value={entity.passwordCheck}
                  meta={{
                    error: errors.passwordCheck,
                    touched: touched.passwordCheck,
                  }}
                  onChange={(passwordCheck, type) =>
                    form.handleChange({
                      path: 'passwordCheck',
                      type,
                      values: prev => ({
                        ...prev,
                        passwordCheck,
                      }),
                    })
                  }
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="kt-portlet__foot">
          <div className="kt-form__actions">
            <div className="row">
              <div className="col-lg kt-align-right">
                <Button
                  icon="fas fa-save"
                  customClassName="btn-primary"
                  title="Salvar"
                  loading={form.submitting}
                  disabled={form.submitting}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
