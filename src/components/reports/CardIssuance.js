import React, { useState } from 'react'

import { List } from 'core/components/list'
import { useRefresh } from 'core/hooks/refresh'
import { Field } from 'core/components/form/field'
import { TextInput } from 'core/components/form/text-input'
import { AsyncSelect } from 'core/components/form/async-select'
import { forceDownload } from 'core/helpers/misc'
import { LoadingCard } from 'core/components/loading-card'
import { Button } from 'core/components/button'
import { useFilters } from 'core/hooks/filter'

const columns = [
  { path: 'id', title: '#', textAlign: 'center' },
  { path: 'name', title: 'Nome', textAlign: 'center' },
  { path: 'cpfCnpj', title: 'CPF/CNPJ', textAlign: 'center', format: 'cpfcnpj' },
  { path: 'kinshipTitle', title: 'Parentesco', textAlign: 'center' },
]

const fields = []

export const CardIssuance = ({ global, route, service }) => {
  const { modal } = global

  const [filters, setFilters] = useState({
    cpfCnpj: '',
    name: '',
    kinshipId: '',
  })

  const { setValues: setDbFilters, filters: dbFilters } = useFilters(
    {
      cpfCnpj: '',
      name: '',
      kinshipId: '',
    },
    query => [
      {
        items: [
          { name: 'cpfCnpj', value: query.cpfCnpj, comparer: 'Like' },
          { name: 'name', value: `%${query.name}%`, comparer: 'iLike' },
          { name: 'kinshipId', value: query.kinshipId, comparer: 'Equals' },
          { name: 'particular', value: false, comparer: 'Equals' },
        ],
      },
    ],
  )

  const refresh = useRefresh()
  const fetching = useState(false)
  const [printFetching, setPrintFetching] = useState(false)

  return (
    <>
      <div className="kt-portlet kt-portlet--mobile">
        <div className="kt-portlet__head kt-portlet__head--lg">
          <div className="kt-portlet__head-label">
            <span className="kt-portlet__head-icon">
              <i className="kt-font-brand fas fa-id-card" />
            </span>
            <h3 className="kt-portlet__head-title">Emissão de Carteirinhas</h3>
          </div>
        </div>
        <div className="kt-portlet__body kt-pb-0 position-relative">
          <div className="row">
            <div className="col-lg">
              <Field label="CPF/CNPJ">
                <TextInput
                  ignoreBlur
                  type="search"
                  value={filters.cpfCnpj}
                  onChange={cpfCnpj => setFilters(prev => ({ ...prev, cpfCnpj }))}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Nome">
                <TextInput
                  ignoreBlur
                  type="search"
                  value={filters.name}
                  onChange={name => setFilters(prev => ({ ...prev, name }))}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Parentesco">
                <AsyncSelect
                  isClearable
                  getId={({ id }) => id}
                  getDisplay={({ title }) => title}
                  getItems={value =>
                    service
                      .getList('kinship', {
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
                  selected={filters.sellerId}
                  onChange={kinship =>
                    setFilters(prev => ({
                      ...prev,
                      kinshipId: kinship ? kinship.id : '',
                    }))
                  }
                />
              </Field>
            </div>
          </div>

          <div className="row">
            <div className="col-lg kt-align-right">
              <Field>
                <Button
                  customClassName="btn-info btn-icon-sm"
                  icon="fas fa-search"
                  onClick={() => {
                    setDbFilters(prev => ({
                      ...prev,
                      ...filters,
                    }))
                  }}
                  title="Consultar"
                />
              </Field>
            </div>
          </div>

          {(fetching[0] || printFetching) && (
            <div className="blockui-overlay">
              <div className="blockui" />
            </div>
          )}
        </div>
        {printFetching && (
          <div className="kt-portlet__body kt-pb-0 position-relative">
            <div className="row">
              <LoadingCard text="Gerando PDF" />
            </div>
          </div>
        )}
        <div className="kt-portlet__body kt-portlet__body--fit">
          <div className="kt-separator kt-separator--space-sm" />
          <List
            primaryKey="id"
            modal={modal}
            route={route}
            refresh={refresh}
            fetching={fetching}
            filters={dbFilters}
            initialQuery={{ fields }}
            getItems={(query, signal) =>
              service.getList('patient', { ...query, usePager: false }, signal)
            }
            actions={[
              {
                icon: `fas fa-print`,
                title: 'Imprimir',
                action: async ent => {
                  setPrintFetching(true)
                  await service
                    .post('report.card', { items: [ent.entity.id] }, undefined, resp => resp.blob())
                    .then(blob => forceDownload(blob, 'carteirinhas_contrato.csv'))
                    .catch(err => global.modal.alert(err.message))
                    .finally(() => setPrintFetching(false))
                },
              },
            ]}
            columns={columns}
          />
        </div>
      </div>
    </>
  )
}
