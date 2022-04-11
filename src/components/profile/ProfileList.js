import React, { useState } from 'react'
import { List } from 'core/components/list'
import { Link } from 'core/components/route'
import { useRefresh } from 'core/hooks/refresh'

const columns = [
  { path: 'id', title: '#', textAlign: 'center' },
  { path: 'description', title: 'Descrição' },
]

const fields = [...columns.map(c => c.path)]

export const ProfileList = ({ global, route, service, basename }) => {
  const { modal } = global
  const fetching = useState(false)
  const refresh = useRefresh()

  return (
    <>
      <div className="kt-portlet kt-portlet--mobile">
        <div className="kt-portlet__head kt-portlet__head--lg">
          <div className="kt-portlet__head-label">
            <span className="kt-portlet__head-icon">
              <i className="kt-font-brand fas fa-user-tag" />
            </span>
            <h3 className="kt-portlet__head-title">Perfis</h3>
          </div>
          <div className="kt-portlet__head-toolbar">
            <div className="kt-portlet__head-wrapper">
              <div className="dropdown dropdown-inline">
                <Link className="btn btn-success btn-icon-sm" to={`${basename}/perfil/cadastro`}>
                  <i className="fas fa-plus" /> Novo Perfil
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="kt-portlet__body kt-portlet__body--fit">
          <List
            primaryKey="id"
            modal={modal}
            route={route}
            refresh={refresh}
            fetching={fetching}
            initialQuery={{ fields }}
            columns={columns}
            getItems={(query, signal) => service.getList('employeeprofile', query, signal)}
            actions={[
              {
                icon: 'fas fa-edit',
                title: 'Editar',
                action: `${basename}/perfil/:id`,
              },
              {
                icon: 'fas fa-times',
                title: 'Remover',
                action: ({ entity, forceRefresh }) =>
                  global.modal.confirm(
                    `Deseja remover esse perfil: ${entity.description}?`,
                    confirmed =>
                      confirmed &&
                      service
                        .remove('employeeprofile', entity.id)
                        .then(forceRefresh)
                        .catch(err => global.modal.alert(err.message)),
                  ),
              },
            ]}
          />
        </div>
      </div>
    </>
  )
}
