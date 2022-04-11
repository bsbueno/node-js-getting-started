import React, { useEffect } from 'react'
import { useForm } from 'core/hooks/form'
import { isCPF } from 'core/helpers/validate'
import { CpfMask, requiredMessage } from 'core/constants'
import { Field } from 'core/components/form/field'
import { TextInput } from 'core/components/form/text-input'
import { ErrorMessage } from 'core/components/form/error-message'
import { ModalForm } from 'core/components/modal'
import { modalSubmit } from 'helpers'
import { applyMask } from 'core/helpers/mask'
import { AsyncSelect } from 'core/components/form/async-select'
import { Switch } from 'core/components/form/switch'

export const EmployeeForm = ({ route, service, id, show, refresh }) => {
  const form = useForm(
    {
      displayName: ent => ent.name,
      initialEntity: {
        id: 0,
        cpf: '',
        name: '',
        password: '',
        passwordCheck: '',
        employeeProfileId: 0,
        isHealthProfessional: false,
        employeeBankAccountId: null,
      },
      validate: values => {
        const errors = {}

        if (!values.name) errors.name = requiredMessage
        if (values.name.length > 100) errors.name = 'O nome deve ter no máximo 100 caracteres.'

        if (!values.cpf) errors.cpf = requiredMessage
        else if (!isCPF(values.cpf)) errors.cpf = 'Digite um CPF válido.'

        if (!values.password && values.id === 0) errors.password = requiredMessage
        if (!values.passwordCheck && values.id === 0) errors.passwordCheck = requiredMessage
        else if (values.password !== values.passwordCheck)
          errors.passwordCheck = 'Senhas não coincidem'
        if (values.employeeProfileId === 0) errors.employeeProfileId = requiredMessage

        return errors
      },
    },
    route,
  )

  const { entity, errors, touched } = form

  useEffect(() => {
    if (form.hasId) {
      form.handleFetch({
        action: (key, ac) => service.getById('employee', id, ac.signal),
        errorFn: err => form.setErrors({ global: err.message }),
        mapper: e => ({
          ...e,
          isHealthProfessional: e.healthProfessionalId !== null,
        }),
      })
    }
    // eslint-disable-next-line
	}, [id])

  return (
    <ModalForm
      isLarge
      title={form.displayName || 'Novo Colaborador'}
      show={show}
      fetching={form.fetching}
      submitting={form.submitting}
      resetForm={form.resetForm}
      closeAction={() => route.history.goBack()}
      onSubmit={() => {
        form.handleSubmit(data =>
          modalSubmit({ path: 'employee', service, form, refresh, route, data }),
        )
      }}
    >
      <div className="row">
        <div className="col-lg">
          <Field label="Nome">
            <TextInput
              meta={{
                error: errors.name,
                touched: touched.name,
              }}
              value={entity.name}
              onChange={(name, type) =>
                form.handleChange({
                  path: 'name',
                  type,
                  values: prev => ({
                    ...prev,
                    name,
                  }),
                })
              }
            />
          </Field>
        </div>
        <div className="col-lg">
          <Field label="Cpf">
            <TextInput
              meta={{
                error: errors.cpf,
                touched: touched.cpf,
              }}
              mask={CpfMask}
              value={applyMask(CpfMask, entity.cpf)}
              onChange={(cpf, type) =>
                form.handleChange({
                  path: 'cpf',
                  type,
                  values: { cpf },
                })
              }
              disabled={form.hasId}
            />
          </Field>
        </div>
      </div>
      <div className="row">
        <div className="col-lg">
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
        <div className="col-lg">
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
      <div className="row">
        <div className="col-lg">
          <Field label="Perfil">
            <AsyncSelect
              meta={{
                error: errors.employeeProfileId,
                touched: touched.employeeProfileId,
              }}
              placement="top"
              isClearable
              getId={item => item.id}
              getDisplay={({ description }) => description}
              getItems={() =>
                service
                  .getList('employeeprofile', {
                    usePager: false,
                  })
                  .then(({ items }) => items)
              }
              selected={entity.employeeProfileId}
              onChange={employeeProfileId => {
                form.handleChange({
                  path: 'employeeProfile',
                  values: prev => ({
                    ...prev,
                    employeeProfileId: employeeProfileId ? employeeProfileId.id : 0,
                  }),
                })
              }}
            />
          </Field>
        </div>
        <div className="col-lg">
          <Switch
            id="healthProfessional"
            label="Profissional de Saúde"
            checked={entity.isHealthProfessional}
            className="button-add"
            onChange={isHealthProfessional => {
              form.handleChange({
                path: 'isHealthProfessional',
                values: prev => ({
                  ...prev,
                  isHealthProfessional,
                }),
              })
            }}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-lg">
          <Field label="Conta Recebimento">
            <AsyncSelect
              meta={{
                error: errors.employeeBankAccountId,
                touched: touched.employeeBankAccountId,
              }}
              placement="top"
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
                            comparer: 'Like',
                            value,
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
        <div className="col-lg"> </div>
      </div>
      <ErrorMessage error={errors.global} />
    </ModalForm>
  )
}
