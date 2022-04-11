import React, { useState, useEffect } from 'react'
import { Field } from 'core/components/form/field'
import { parseNumber } from 'core/helpers/parse'
import { useRefresh } from 'core/hooks/refresh'
import { groupBy } from 'core/helpers/functional'
import { ErrorMessage } from 'core/components/form/error-message'
import Tree from 'core/components/tree'
import { ClassificationForm } from './ClassificationForm'

function getGrouped(items, groups) {
  if (!items) return items
  return items.map(p => ({
    ...p,
    children: getGrouped(groups.get(p.id), groups),
  }))
}

export const ClassificationList = ({ global, route, service, basename }) => {
  const { modal } = global

  const [classifications, setClassifications] = useState([])
  const [errors, setErrors] = useState('')

  const refresh = useRefresh()
  const id = parseNumber(route.match.params.id)
  const showForm = route.location.pathname.includes('cadastro') || id > 0
  const parent = route.location.state?.parent || { id: null, code: '' }

  useEffect(() => {
    service
      .getList('classification', {
        usePager: false,
      })
      .then(resp => {
        const groups = groupBy(resp.items, 'parentId')
        const rootItems = groups.get(null)
        const grouped = getGrouped(rootItems, groups)
        setClassifications(grouped)
      })
      .catch(err => setErrors({ global: err.message }))
  }, [])

  return (
    <>
      <div className="kt-portlet kt-portlet--mobile">
        <div className="kt-portlet__head kt-portlet__head--lg">
          <div className="kt-portlet__head-label">
            <span className="kt-portlet__head-icon">
              <i className="kt-font-brand fas fa-dollar-sign" />
            </span>
            <h3 className="kt-portlet__head-title">Classificações</h3>
          </div>
        </div>
        <div className="kt-portlet__body kt-portlet__body--fit">
          <div className="row">
            <div className="col-lg">
              <Field label="">
                <Tree
                  nodes={classifications}
                  onAdd={item => {
                    route.history.push({
                      pathname: `${basename}/classificacoes/cadastro`,
                      state: { parent: item },
                    })
                  }}
                  onEdit={itemId => route.history.push(`${basename}/classificacoes/{${itemId}}`)}
                  onDisable={item => {
                    modal.confirm(
                      `Deseja ${!item.disabledAt ? 'desativar' : 'ativar'} ${item.description}?`,
                      confirmed =>
                        confirmed &&
                        service
                          .remove('classification', item.id)
                          .then(async () => {
                            await global.refresh(true)
                            refresh.force()
                          })
                          .catch(err => modal.alert(err.message)),
                    )
                  }}
                />
              </Field>
            </div>
          </div>

          <ErrorMessage error={errors} />
        </div>
      </div>

      <ClassificationForm
        service={service}
        show={showForm}
        route={route}
        id={id}
        parent={parent}
        refresh={async () => {
          await global.refresh(true)
          refresh.force()
        }}
      />
    </>
  )
}
