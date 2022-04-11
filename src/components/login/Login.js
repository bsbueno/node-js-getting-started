import React, { useState, useLayoutEffect } from 'react'
import { Button } from 'core/components/button'
import { TextInput } from 'core/components/form/text-input'
import { useForm } from 'core/hooks/form'
import { requiredMessage } from 'core/constants'
import { localStore } from 'core/helpers/store'
import { config } from 'config'
import { loginRequest, API } from 'service'
import { ErrorMessage } from 'core/components/form/error-message'
import { UnitySelect } from 'components/unity/UnitySelect'
import { Logo } from '../logo'

const permissions = []

function tryLogin(login, route, form, global) {
  loginRequest({
    cpf: login.cpf,
    password: login.password,
    unityId: login.unity.id,
  })
    .then(resp => {
      const { user } = resp

      if (permissions.length && !permissions.some(p => user.permissions.includes(p))) {
        throw new Error('Você não tem permissão para acessar esse painel.')
      }

      localStore.set(config.OPERATOR_KEY, user)
      localStore.set(config.TOKEN_KEY, resp.accessToken)

      return global.refresh()
    })
    .then(() => route.history.push(`/${login.unity.url}`))
    .catch(err => form.setErrors({ global: err.message }))
}

function changePassword(token, login, route, form, global) {
  API.post('password.change', {
    token,
    password: login.password,
  })
    .then(() => {
      global.modal.alert(`Senha atualizada com sucesso.`)
      form.resetForm()
      route.history.push(`/`)
    })
    .catch(err => form.setErrors({ global: err.message }))
}

function recoverPassword(login, route, form, global) {
  API.post('password.seller', {
    cpf: login.cpf,
  })
    .then(resp => {
      const { email } = resp

      global.modal.alert(
        `Um e-mail foi enviado para ${email}.\nVerifique seu e-mail e siga as instruções.`,
      )
      route.history.push(`/`)
    })
    .catch(err => form.setErrors({ global: err.message }))
}

const LoginForm = ({ form: { entity, errors, touched, handleChange, submitting } }) => (
  <>
    <div className="form-group validated">
      <TextInput
        autoComplete="cpf"
        customClassName="form-control-lg"
        icon="fas fa-user"
        meta={{
          error: errors.cpf,
          touched: touched.cpf,
        }}
        onChange={(cpf, type) =>
          handleChange({
            path: 'cpf',
            type,
            values: { cpf },
          })
        }
        placeholder="CPF/CNPJ"
        value={entity.cpf}
      />
    </div>
    <div className="form-group validated">
      <TextInput
        acceptEnter
        type="password"
        placeholder="Senha"
        customClassName="form-control-lg"
        icon="fas fa-lock"
        value={entity.password}
        autoComplete="current-password"
        meta={{
          error: errors.password,
          touched: touched.password,
        }}
        onChange={(password, type) =>
          handleChange({
            path: 'password',
            type,
            values: { password },
          })
        }
      />
    </div>
    <div className="login-actions">
      <Button
        customClassName="btn-primary btn-lg btn-block"
        icon="fas fa-sign-in-alt"
        title="Entrar"
        loading={submitting}
      />
    </div>

    <ErrorMessage error={errors.global} />
  </>
)

const LoginForgot = ({ form: { entity, errors, touched, handleChange, submitting } }) => (
  <>
    <div className="form-group validated">
      <TextInput
        autoComplete="email"
        customClassName="form-control-lg"
        icon="fas fa-user"
        meta={{
          error: errors.email,
          touched: touched.email,
        }}
        onChange={(email, type) =>
          handleChange({
            path: 'email',
            type,
            values: { email },
          })
        }
        placeholder="Email"
        value={entity.email}
      />
    </div>
    <div className="login-actions">
      <Button
        customClassName="btn-primary btn-lg btn-block"
        icon="fas fa-paper-plane"
        title="Enviar"
        loading={submitting}
      />
    </div>

    <ErrorMessage error={errors.global} />
  </>
)

const PasswordRecover = ({ form: { entity, errors, touched, handleChange, submitting } }) => (
  <>
    <div className="form-group validated">
      <TextInput
        acceptEnter
        type="password"
        placeholder="Nova Senha"
        customClassName="form-control-lg"
        icon="fas fa-lock"
        value={entity.password}
        autoComplete="current-password"
        meta={{
          error: errors.password,
          touched: touched.password,
        }}
        onChange={(password, type) =>
          handleChange({
            path: 'password',
            type,
            values: { password },
          })
        }
      />
    </div>
    <div className="form-group validated">
      <TextInput
        acceptEnter
        type="password"
        placeholder="Confirme a Nova Senha"
        customClassName="form-control-lg"
        icon="fas fa-lock"
        value={entity.confirmPassword}
        autoComplete="current-password"
        meta={{
          error: errors.confirmPassword,
          touched: touched.confirmPassword,
        }}
        onChange={(confirmPassword, type) =>
          handleChange({
            path: 'confirmPassword',
            type,
            values: { confirmPassword },
          })
        }
      />
    </div>
    <div className="login-actions">
      <Button
        customClassName="btn-primary btn-lg btn-block"
        icon="fas fa-paper-plane"
        title="Enviar"
        loading={submitting}
      />
    </div>

    <ErrorMessage error={errors.global} />
  </>
)

const LoginSelect = ({ form: { entity, setValues }, global }) => (
  <>
    <div className="form-group">
      <UnitySelect
        styles={{
          control: base => ({ ...base, minHeight: '55px' }),
        }}
        unity={entity.unity}
        global={global}
        onChange={unity => setValues({ unity })}
      />
    </div>
    <div className="login-actions">
      <Button
        customClassName="btn-primary btn-lg btn-block"
        icon="fas fa-arrow-right"
        title="Continuar"
      />
    </div>
  </>
)

function getTitle(page) {
  if (page === 'forgot') return 'Esqueci minha senha'
  if (page === 'recover') return 'Recuperação de Senha'
  return 'Clínica Médica - Atendimento'
}

export const Login = ({ route, global }) => {
  const [page, setPage] = useState(null)
  const form = useForm(
    {
      initialEntity: {
        cpf: '',
        password: '',
        email: '',
        confirmPassword: '',
        unity: null,
      },
      validate: values => {
        const errors = {}

        if (!values.cpf && (page === 'login' || page === 'forgot')) {
          errors.cpf = requiredMessage
        }

        if (!values.email && page === 'forgot') {
          errors.email = requiredMessage
        }

        if (!values.password && (page === 'login' || page === 'recover')) {
          errors.password = requiredMessage
        }

        if (!values.confirmPassword && page === 'recover') {
          errors.confirmPassword = requiredMessage
        }

        if (values.password !== values.confirmPassword && page === 'recover') {
          errors.confirmPassword = 'Senhas devem ser iguais.'
        }

        return errors
      },
    },
    route,
  )

  const { unities, loading, modal } = global
  const { history, match } = route
  const { unity: unityName, token } = match.params
  const { unity } = form.entity

  useLayoutEffect(() => {
    if (token) {
      setPage('recover')
      return
    }

    if (unities.length > 0 && !!unityName) {
      const selected = unities.find(c => c.url === unityName.toLowerCase())
      if (selected) {
        form.setValues({ unity: selected })
        setPage('login')
        return
      }

      modal.alert('Unidade inválida ou não encontrada!')
      history.replace('/login')
    }

    form.setValues({ unity: null })

    if (!loading && unities.length === 0) {
      setPage('retry')
      return
    }

    setPage('unity')
    // eslint-disable-next-line
	}, [unities, loading, unityName])

  return (
    <div className="login-wrapper">
      <div className="login-box">
        {page === 'forgot' && (
          <button
            type="button"
            className="back"
            tabIndex={0}
            onClick={ev => {
              ev.preventDefault()
              setPage('login')
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
              <path
                fill="#555"
                fillRule="nonzero"
                d="M7.284 24H46v2H7.284l14.074 18.392-1.588 1.216L4 25 19.77 4.392l1.588 1.216L7.284 24z"
              />
            </svg>
          </button>
        )}

        <div className="logo">
          <Logo isLogin route={route} />
        </div>

        <div className="login-title">
          <h3>{getTitle(page)}</h3>
        </div>

        <form
          className="login-form"
          onSubmit={ev => {
            ev.preventDefault()

            if (page === 'recover' && token) {
              form.handleSubmit(ent => {
                changePassword(token, ent, route, form, global)
              })
              return
            }

            if (page === 'unity') {
              if (!unity) {
                return
              }

              history.replace(`/${unity.url}/login`)
              setPage('login')
              return
            }

            if (page === 'forgot') {
              form.handleSubmit(ent => recoverPassword(ent, route, form, global))
              return
            }

            form.handleSubmit(ent => tryLogin(ent, route, form, global))
          }}
        >
          {page === 'unity' && <LoginSelect form={form} global={global} />}

          {page === 'login' && <LoginForm form={form} setPage={setPage} />}
          {page === 'forgot' && <LoginForgot form={form} />}
          {page === 'recover' && <PasswordRecover form={form} />}
        </form>
      </div>
    </div>
  )
}
