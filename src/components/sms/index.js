/* eslint-disable no-undef */
import React, { useEffect, useState } from 'react'
import { Field } from 'core/components/form/field'
import { Button } from 'core/components/button'
import { API } from 'service'
import { useForm } from 'core/hooks/form'
import { CpfMask, CellPhoneMask } from 'core/constants'
import { useFilters } from 'core/hooks/filter'
import { useDebounce } from 'core/hooks/debounce'
import { TextInput } from 'core/components/form/text-input'
import { LoadingCard } from 'core/components/loading-card'
import { classNames } from 'core/helpers/misc'
import { maskCpfCnpj, applyMask } from 'core/helpers/mask'
import { onlyNumbers } from 'core/helpers/format'
import { TextAreaInput } from 'core/components/form/textarea-input'
import { Switch } from 'core/components/form/switch'
import { isCellPhone } from 'core/helpers/validate'

const messageError = 'Numero máximo de caracteres excedido!'

const CustomerList = ({ addSelectedCustomer, modal }) => {
  const [items, setItems] = useState([])
  const {
    values,
    setValues: patientSearch,
    filters,
  } = useFilters(
    {
      cpfCnpj: '',
      name: '',
    },
    query => [
      {
        items: [
          { name: 'cpfCnpj', value: onlyNumbers(query.cpfCnpj), comparer: 'Like' },
          { name: 'name', value: `%${query.name}%`, comparer: 'iLike' },
        ],
      },
    ],
  )

  const patientFilters = useDebounce(filters, 300)
  const [fetching, setFetching] = useState(false)

  return (
    <>
      <div className="row">
        <div className="col-lg">
          <Field label="CPF/CNPJ">
            <TextInput
              mask={CpfMask}
              ignoreBlur
              type="search"
              value={values.cpfCnpj}
              onChange={cpfCnpj => patientSearch(prev => ({ ...prev, cpfCnpj }))}
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Nome do Paciente">
            <TextInput
              ignoreBlur
              type="search"
              value={values.name}
              onChange={name => patientSearch(prev => ({ ...prev, name }))}
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
              setFetching(true)
              API.getList('customer', {
                filters: patientFilters,
                perPage: 10,
              })
                .then(resp => setItems(resp.items))
                .finally(() => setFetching(false))
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
                    <span>CPF Paciente/Responsável</span>
                  </th>
                  <th className="kt-datatable__cell">
                    <span>Nome do Paciente</span>
                  </th>
                  <th className="kt-datatable__cell">
                    <span> </span>
                  </th>
                </tr>
              </thead>
              <tbody className="kt-datatable__body">
                {items.map(item => (
                  <tr key={item.patientId} className="kt-datatable__row">
                    <td className="kt-datatable__cell">
                      <div>{maskCpfCnpj(item.patientAdherer.cpfCnpj)}</div>
                    </td>
                    <td className="kt-datatable__cell">
                      <div>{item.patientAdherer.name}</div>
                    </td>
                    <td className="kt-datatable__cell">
                      <Button
                        icon="fas fa-plus"
                        customClassName="btn-info btn-icon-sm"
                        title=""
                        onClick={() => {
                          // eslint-disable-next-line no-unused-expressions
                          isCellPhone(item.phone)
                            ? addSelectedCustomer(item)
                            : modal.alert(
                                `${applyMask(
                                  CellPhoneMask,
                                  item.phone,
                                )} Não é um Celular valido !!`,
                              )
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 && (
              <div className="kt-datatable--error">Nenhum item foi encontrado.</div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export const SmsForm = ({ global, route }) => {
  const { modal } = global

  const form = useForm(
    {
      initialEntity: {
        customers: [],
        sendAll: false,
        message: '',
      },
      validate: values => {
        const errors = {}
        const smsCount = values.message.length

        if (values.customers.length === 0 && !values.sendAll)
          errors.message = 'Selecione pelo menos um cliente para o envio de SMS'

        if (smsCount <= 5) errors.message = 'Mensagem de sms precisa ter pelo menos 5 caracteres!'

        if (smsCount > 160) errors.message = messageError
        return errors
      },
    },
    route,
  )

  const { entity, touched, errors } = form
  const smsCount = entity.message.length
  function addSelectedCustomer(customer) {
    if (entity.sendAll) return

    form.setValues(prev => {
      const duplicated = prev.customers.some(item => item.patientId === customer.patientId)
      if (duplicated) return prev

      return { ...prev, customers: [...prev.customers, customer] }
    })
  }

  function removeSelectedCustomer(customer) {
    form.setValues(prev => ({
      ...prev,
      customers: prev.customers.filter(item => item.patientId !== customer.patientId),
    }))
  }
  function Checkbox() {
    const checkBoxTitle = entity.sendAll ? 'Todos' : 'Selecionar'
    return (
      <Switch
        id="send-all"
        label={checkBoxTitle}
        checked={entity.sendAll}
        className="switch-layout"
        onChange={() => {
          form.setValues(prev => ({ ...prev, sendAll: !prev.sendAll }))
        }}
      />
    )
  }

  useEffect(() => {
    if (entity.sendAll)
      form.setValues({
        customers: [],
      })
    // eslint-disable-next-line
  }, [entity.sendAll])

  return form.fetching ? (
    'Carregando...'
  ) : (
    <div className="kt-portlet">
      <div className="kt-portlet__head">
        <div className="kt-portlet__head-label">
          <h3 className="kt-portlet__head-title">Envio de SMS</h3>
        </div>
      </div>
      <form
        autoComplete="off"
        className="kt-form kt-form--label-right"
        onSubmit={ev => {
          ev.preventDefault()
          form.handleSubmit(sms =>
            API.post('customer.sms', sms)
              .then(() => modal.alert('Enviado com sucesso!'))
              .catch(err => modal.alert(err.message))
              .finally(() => form.setSubmitting(false)),
          )
        }}
      >
        <div className="kt-portlet__body">
          <CustomerList addSelectedCustomer={addSelectedCustomer} modal={modal} />
          <div className="row">
            <div className="col-lg">
              <hr />
              <div className="kt-heading kt-heading--sm">
                Clientes selecionados{''}
                {entity.customers.length > 0 ? `: ${entity.customers.length}` : ''}
              </div>
              <div className="col-lg">
                <Checkbox />
              </div>

              <div className="sms-container">
                {entity.customers.map(customer => (
                  <div key={customer.patientId} className="sms-item">
                    {customer.patientAdherer.name}
                    <Button
                      icon="fas fa-trash"
                      customClassName="btn-danger btn-icon-sm"
                      title=""
                      onClick={() => removeSelectedCustomer(customer)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg">
              <Field label="Mensagem de SMS">
                <TextAreaInput
                  meta={{
                    touched: touched.message,
                    error: errors.message,
                  }}
                  rows={3}
                  value={entity.message}
                  onChange={(message, type) =>
                    form.handleChange({
                      type,
                      path: 'message',
                      values: { message },
                    })
                  }
                />
                <p>{smsCount}/160</p>
              </Field>
            </div>
          </div>
        </div>
        <div className="kt-portlet__foot">
          <div className="kt-form__actions">
            <div className="row">
              <div className="col-lg kt-align-right">
                <Button
                  icon="fas fa-paper-plane"
                  customClassName="btn-primary"
                  title="Enviar"
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
