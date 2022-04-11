import React from 'react'
import { Button } from 'core/components/button'
import { TextInput } from 'core/components/form/text-input'
import { useForm } from 'core/hooks/form'
import { requiredMessage } from 'core/constants'
import { loginAdmin } from 'service'
import { localStore } from 'core/helpers/store'
import { config } from 'config'
import { ErrorMessage } from 'core/components/form/error-message'
import { Logo } from '../logo'

function tryLogin(login, route, form, refresh) {
  loginAdmin(login)
    .then(resp => {
      localStore.set(config.OPERATOR_KEY, resp.user)
      localStore.set(config.SA_TOKEN_KEY, resp.accessToken)
      return refresh()
    })
    .then(() => route.history.push('/sa'))
    .catch(err => form.setErrors({ global: err.message }))
}

export const AdminLogin = ({ route, global }) => {
  const form = useForm(
    {
      initialEntity: {
        username: '',
        password: '',
      },
      validate: values => {
        const errors = {}

        if (!values.username) {
          errors.username = requiredMessage
        }

        if (!values.password) {
          errors.password = requiredMessage
        }

        return errors
      },
    },
    route,
  )

  const { entity, errors, touched } = form

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <div className="logo">
          <Logo isLogin route={route} />
        </div>

        <div className="login-title">
          <h3>Painel Super Admin</h3>
        </div>

        <form
          className="login-form"
          onSubmit={ev => {
            ev.preventDefault()
            form.handleSubmit(ent => tryLogin(ent, route, form, global.refresh))
          }}
        >
          <div className="form-group validated">
            <TextInput
              placeholder="Usuário"
              customClassName="form-control-lg"
              icon="fas fa-user"
              value={entity.username}
              autoComplete="username"
              meta={{
                error: errors.username,
                touched: touched.username,
              }}
              onChange={(username, type) =>
                form.handleChange({
                  path: 'username',
                  type,
                  values: { username },
                })
              }
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
                form.handleChange({
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
              loading={form.submitting}
              disabled={form.submitting}
            />
          </div>

          <ErrorMessage error={errors.global} />
        </form>
      </div>
    </div>
  )
}
