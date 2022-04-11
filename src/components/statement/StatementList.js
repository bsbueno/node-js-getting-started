import React, { useState } from 'react'
import startOfDay from 'date-fns/startOfDay'
import endOfDay from 'date-fns/endOfDay'
import { List } from 'core/components/list'
import { useRefresh } from 'core/hooks/refresh'
import { Field } from 'core/components/form/field'
import { useFilters } from 'core/hooks/filter'
import { DateInput } from 'core/components/form/date-input'
import { parseNumber } from 'core/helpers/parse'
import { Button } from 'core/components/button'
import { OperationTypes, StatementTypes } from 'core/constants'
import { Select } from 'core/components/form/select'
import { LoadingCard } from 'core/components/loading-card'
import { iframeDownload } from 'core/helpers/misc'
import { AsyncSelect } from 'core/components/form/async-select'
import { StatementDetailsModal } from './StatementDetailsModal'

const columns = [
  { path: 'id', title: '#', textAlign: 'center', sort: 'createdAt' },
  { path: 'createdAt', title: 'Data', format: 'datetime' },
  {
    path: 'type',
    title: 'Tipo',
    format: ent => StatementTypes.find(t => t.id === ent.type).name,
  },
  { path: 'description', title: 'Descrição' },
  { path: 'bankAccountDescription', title: 'Conta' },
  {
    path: 'operationType',
    title: 'Tipo Operação',
    format: ent => OperationTypes.find(t => t.id === ent.operationType).name,
  },
  { path: 'operationId', title: 'Id Operação' },
  { path: 'value', title: 'Valor', format: 'money' },
]

const fields = columns.map(c => c.path)

export const StatementList = ({ global, route, service, basename }) => {
  const { modal } = global

  const [dbFilters, setDbFilters] = useState({
    type: '',
    operationType: '',
    bankAccountId: '',
    minDate: null,
    maxDate: null,
  })

  const { setValues, filters } = useFilters(
    {
      type: '',
      operationType: '',
      bankAccountId: '',
      minDate: null,
      maxDate: null,
    },
    query => [
      {
        items: [
          query.type ? { name: 'type', value: query.type, comparer: 'Equals' } : {},
          query.operationType
            ? { name: 'operationType', value: query.operationType, comparer: 'Equals' }
            : {},
          query.bankAccountId
            ? { name: 'bankAccountId', value: query.bankAccountId, comparer: 'Equals' }
            : {},
          query.minDate
            ? {
                name: 'createdAt',
                value: query.minDate,
                comparer: 'GreaterThanOrEqual',
              }
            : {},
          query.maxDate
            ? { name: 'createdAt', value: query.maxDate, comparer: 'LessThanOrEqual' }
            : {},
        ],
      },
    ],
  )

  const fetching = useState(false)
  const refresh = useRefresh()
  const statementId = parseNumber(route.match.params.id)
  const showForm = route.location.pathname.includes('detalhes')
  const [printFetching, setPrintFetching] = useState(false)

  return (
    <>
      <div className="kt-portlet kt-portlet--mobile">
        <div className="kt-portlet__head kt-portlet__head--lg">
          <div className="kt-portlet__head-label">
            <span className="kt-portlet__head-icon">
              <i className="kt-font-brand fas fa-dollar-sign" />
            </span>
            <h3 className="kt-portlet__head-title">Extrato</h3>
          </div>
          <div className="kt-portlet__head-toolbar">
            <div className="kt-portlet__head-wrapper">
              <div className="dropdown dropdown-inline buttons-header-padding">
                <Button
                  icon="fas fa-file-pdf"
                  customClassName="btn-info btn-icon-sm"
                  title="Baixar em PDF"
                  onClick={() => {
                    setPrintFetching(true)
                    service
                      .post(
                        'statement.list',
                        {
                          filters,
                          isPdf: true,
                          usePager: false,
                          fields,
                          sort: [['createdAt', 'DESC']],
                        },
                        undefined,
                        resp => resp.blob(),
                      )
                      .then(blob => iframeDownload(blob, 'extrato.pdf'))
                      .catch(err => modal.alert(err.message))
                      .finally(() => setPrintFetching(false))
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        {printFetching && (
          <div className="kt-portlet__body kt-pb-0 position-relative">
            <div className="row">
              <LoadingCard text="Gerando PDF" />
            </div>
          </div>
        )}
        <div className="kt-portlet__body kt-pb-0 position-relative">
          <div className="row">
            <div className="col-lg">
              <Field label="Data Inicial">
                <DateInput
                  isClearable
                  customClassName="form-control-xl"
                  onChange={date =>
                    setDbFilters(prev => ({
                      ...prev,
                      minDate: date ? startOfDay(date) : date,
                    }))
                  }
                  value={dbFilters.minDate}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Data Final">
                <DateInput
                  isClearable
                  customClassName="form-control-xl"
                  onChange={date =>
                    setDbFilters(prev => ({
                      ...prev,
                      maxDate: date ? endOfDay(date) : date,
                    }))
                  }
                  value={dbFilters.maxDate}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Conta">
                <AsyncSelect
                  isClearable
                  getId={({ id }) => id}
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
                  selected={dbFilters.bankAccountId}
                  onChange={bankAccount =>
                    setDbFilters(prev => ({
                      ...prev,
                      bankAccountId: bankAccount ? bankAccount.id : '',
                    }))
                  }
                />
              </Field>
            </div>
          </div>
          <div className="row">
            <div className="col-lg">
              <Field label="Tipo">
                <Select
                  isClearable
                  getDisplay={s => s.name}
                  getId={s => s.id}
                  items={StatementTypes}
                  onChange={type =>
                    setDbFilters(prev => ({
                      ...prev,
                      type: type ? type.id : 0,
                    }))
                  }
                  placeholder="Selecione o tipo..."
                  selected={dbFilters.type}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Tipo de Operação">
                <Select
                  isClearable
                  getDisplay={s => s.name}
                  getId={s => s.id}
                  items={OperationTypes}
                  onChange={operationType =>
                    setDbFilters(prev => ({
                      ...prev,
                      operationType: operationType ? operationType.id : 0,
                    }))
                  }
                  placeholder="Selecione o tipo..."
                  selected={dbFilters.operationType}
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
                    setValues(prev => ({
                      ...prev,
                      ...dbFilters,
                    }))
                  }}
                  title="Consultar"
                />
              </Field>
            </div>
          </div>

          {fetching[0] && (
            <div className="blockui-overlay">
              <div className="blockui" />
            </div>
          )}
        </div>
        <div className="kt-portlet__body kt-portlet__body--fit">
          <div className="kt-separator kt-separator--space-sm" />

          <List
            primaryKey="id"
            modal={modal}
            route={route}
            refresh={refresh}
            fetching={fetching}
            filters={filters}
            initialQuery={{ fields, sort: [['createdAt', 'DESC']] }}
            getItems={(query, signal) => service.getList('statement', query, signal)}
            actions={[
              {
                icon: 'fas fa-money-check-alt',
                title: 'Detalhes',
                action: `${basename}/extrato/detalhes/:id`,
              },
            ]}
            columns={columns}
          />
        </div>
      </div>
      <StatementDetailsModal
        service={service}
        show={showForm}
        route={route}
        statementId={statementId}
        refresh={async () => {
          await global.refresh(true)
          refresh.force()
        }}
        global={global}
      />
    </>
  )
}
