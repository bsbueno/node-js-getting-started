import React, { useEffect, useState } from 'react'
import { TextInput } from 'core/components/form/text-input'
import { useForm } from 'core/hooks/form'
import { requiredMessage } from 'core/constants'
import { Field } from 'core/components/form/field'
import { ErrorMessage } from 'core/components/form/error-message'
import { submit } from 'helpers'
import { groupBy } from 'core/helpers/functional'
import CheckboxTree from 'core/components/checkbox-tree'
import { Button } from 'core/components/button'

function getGrouped(items, groups) {
  if (!items) return items
  return items.map(p => ({
    ...p,
    children: getGrouped(groups.get(p.id), groups),
  }))
}

export const ProfileForm = ({ route, service, basename }) => {
  const [modules, setModules] = useState([])
  const form = useForm(
    {
      displayName: ent => ent.description,
      initialEntity: {
        id: 0,
        description: '',
        disabledAt: '',
        permissions: [],
      },
      validate: values => {
        const errors = {}

        if (!values.description) {
          errors.description = requiredMessage
        }

        return errors
      },
    },
    route,
  )

  const { entity, errors, touched } = form
  const fetching = form.fetching || (form.hasId && entity.id === 0)

  useEffect(() => {
    service
      .getList('modules', {
        usePager: false,
      })
      .then(items => {
        const groups = groupBy(items, 'parentId')
        const rootItems = groups.get(undefined)
        const grouped = getGrouped(rootItems, groups)
        setModules(grouped)
      })
      .catch(err => form.setErrors({ global: err.message }))

    if (form.hasId) {
      form.handleFetch({
        action: (key, ac) => service.getById('employeeprofile', key, ac.signal),
        errorFn: err => form.setErrors({ global: err.message }),
      })
    }
    // eslint-disable-next-line
	}, [])

  if (fetching) return 'Carregando ...'

  return modules.length === 0 ? null : (
    <div className="kt-portlet">
      <div className="kt-portlet__head">
        <div className="kt-portlet__head-label">
          <h3 className="kt-portlet__head-title">
            {form.displayName ? `Editar ${form.displayName}` : 'Novo Perfil'}
          </h3>
        </div>
      </div>
      <form
        autoComplete="off"
        className="kt-form kt-form--label-right"
        onSubmit={ev => {
          ev.preventDefault()
          form.handleSubmit(data =>
            submit({
              path: 'employeeprofile',
              callback: () => route.history.push(`${basename}/perfil`),
              data,
              service,
              form,
            }),
          )
        }}
      >
        <div className="kt-portlet__body">
          <div className="row">
            <div className="col-lg">
              <Field label="Descrição">
                <TextInput
                  value={entity.description}
                  meta={{
                    error: errors.description,
                    touched: touched.description,
                  }}
                  onChange={(description, type) =>
                    form.handleChange({
                      path: 'description',
                      type,
                      values: { description },
                    })
                  }
                />
              </Field>
            </div>
          </div>

          <div className="row">
            <div className="col-lg">
              <Field label="Permissões">
                <CheckboxTree
                  nodes={modules}
                  checked={entity.permissions}
                  onCheck={permissions => form.setValues({ permissions })}
                />
              </Field>
            </div>
          </div>

          <div className="kt-separator kt-separator--border-dashed kt-separator--space-lg" />

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
