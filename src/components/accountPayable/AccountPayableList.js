import React, { useState } from 'react'
import { List } from 'core/components/list'
import { Link } from 'core/components/route'
import { useRefresh } from 'core/hooks/refresh'
import { Field } from 'core/components/form/field'
import { useFilters } from 'core/hooks/filter'
import { Button } from 'core/components/button'
import { iframeDownload } from 'core/helpers/misc'
import { LoadingCard } from 'core/components/loading-card'
import { tableMaskMoney } from 'core/helpers/mask'
import { DateInput } from 'core/components/form/date-input'
import { endOfDay, startOfDay } from 'date-fns'
import { AsyncSelect } from 'core/components/form/async-select'
import { TextInput } from 'core/components/form/text-input'
import { Select } from 'core/components/form/select'

const columns = [
  { path: 'id', title: '#', textAlign: 'center' },
  { path: 'createdAt', title: 'Data', format: 'date' },
  { path: 'description', title: 'Descrição' },
  { path: 'dueDate', title: 'Vencimento', format: 'date' },
  { path: 'providerName', title: 'Fornecedor' },
  { path: 'number', title: 'Nº Nota', format: ent => (ent.number !== 0 ? ent.number : '') },
  {
    path: 'classificationDescription',
    title: 'Classificação',
    format: ent =>
      ent.classificationDescription
        ? `${ent.classificationCode} - ${ent.classificationDescription}`
        : '',
  },
  {
    path: 'value',
    title: 'Valor',
    format: ent => tableMaskMoney(ent.value - ent.discount + ent.addition),
  },
  {
    path: 'accountPaymentId',
    title: 'Paga',
    format: ent => (ent.accountPaymentId ? 'Sim' : 'Não'),
  },
]

const fields = [
  ...columns.map(c => c.path),
  'disabledAt',
  'classificationCode',
  'discount',
  'addition',
]

export const disableAccountPayable = ({ modal, data: { id, description }, callback, service }) =>
  modal.confirm(
    `Deseja remover ${description}?`,
    confirmed =>
      confirmed &&
      service
        .remove('accountpayable', id)
        .then(callback)
        .catch(err => modal.alert(err.message)),
  )

export const AccountPayableList = ({ global, route, service, basename }) => {
  const { modal } = global

  const [dbFilters, setDbFilters] = useState({
    minCreatedAtDate: startOfDay(new Date()),
    maxCreatedAtDate: endOfDay(new Date()),
    minDueDate: null,
    maxDueDate: null,
    providerId: '',
    number: '',
    isPaid: null,
  })

  const { setValues, filters } = useFilters(
    {
      minCreatedAtDate: startOfDay(new Date()),
      maxCreatedAtDate: endOfDay(new Date()),
      minDueDate: null,
      maxDueDate: null,
      providerId: '',
      number: '',
    },
    query => [
      {
        items: [
          query.minCreatedAtDate
            ? {
                name: 'createdAt',
                value: query.minCreatedAtDate,
                comparer: 'GreaterThanOrEqual',
              }
            : {},
          query.maxCreatedAtDate
            ? { name: 'createdAt', value: query.maxCreatedAtDate, comparer: 'LessThanOrEqual' }
            : {},
          query.minDueDate
            ? {
                name: 'dueDate',
                value: query.minDueDate,
                comparer: 'GreaterThanOrEqual',
              }
            : {},
          query.maxDueDate
            ? { name: 'dueDate', value: query.maxDueDate, comparer: 'LessThanOrEqual' }
            : {},
          { name: 'providerId', value: query.providerId, comparer: 'Equals' },
          {
            name: 'number',
            value: query.number,
            comparer: 'Equals',
          },
          query.isPaid != null
            ? {
                name: 'accountPaymentId',
                value: null,
                comparer: query.isPaid ? 'NotEquals' : 'Equals',
              }
            : {},
        ],
      },
    ],
  )

  const fetching = useState(false)
  const refresh = useRefresh()
  const [printFetching, setPrintFetching] = useState(false)

  return (
    <>
      <div className="kt-portlet kt-portlet--mobile">
        <div className="kt-portlet__head kt-portlet__head--lg">
          <div className="kt-portlet__head-label">
            <span className="kt-portlet__head-icon">
              <i className="kt-font-brand fas fa-dollar-sign" />
            </span>
            <h3 className="kt-portlet__head-title">Contas a pagar</h3>
          </div>
          <div className="kt-portlet__head-toolbar">
            <div className="kt-portlet__head-wrapper">
              <div className="dropdown dropdown-inline">
                <Link
                  className="btn btn-success btn-icon-sm"
                  to={`${basename}/contas-pagar/cadastro`}
                >
                  <i className="fas fa-plus" /> Nova Conta a Pagar
                </Link>
              </div>
              <div className="dropdown dropdown-inline buttons-header-padding">
                <Button
                  icon="fas fa-file-pdf"
                  customClassName="btn-info btn-icon-sm"
                  title="Baixar em PDF"
                  onClick={() => {
                    setPrintFetching(true)
                    service
                      .post(
                        'accountpayable.list',
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
                      .then(blob => iframeDownload(blob, 'contas-pagar.pdf'))
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
              <Field label="Data Inicial do Cadastro">
                <DateInput
                  isClearable
                  customClassName="form-control-xl"
                  onChange={date =>
                    setDbFilters(prev => ({
                      ...prev,
                      minCreatedAtDate: date ? startOfDay(date) : null,
                    }))
                  }
                  value={dbFilters.minCreatedAtDate}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Data Final do Cadastro">
                <DateInput
                  isClearable
                  customClassName="form-control-xl"
                  onChange={date =>
                    setDbFilters(prev => ({
                      ...prev,
                      maxCreatedAtDate: date ? endOfDay(date) : null,
                    }))
                  }
                  value={dbFilters.maxCreatedAtDate}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Data Inicial do Vencimento">
                <DateInput
                  isClearable
                  customClassName="form-control-xl"
                  onChange={date =>
                    setDbFilters(prev => ({
                      ...prev,
                      minDueDate: date ? startOfDay(date) : null,
                    }))
                  }
                  value={dbFilters.minDueDate}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Data Final do Vencimento">
                <DateInput
                  isClearable
                  customClassName="form-control-xl"
                  onChange={date =>
                    setDbFilters(prev => ({
                      ...prev,
                      maxDueDate: date ? endOfDay(date) : null,
                    }))
                  }
                  value={dbFilters.maxDueDate}
                />
              </Field>
            </div>
          </div>
          <div className="row">
            <div className="col-lg">
              <Field label="Fornecedor">
                <AsyncSelect
                  isClearable
                  getId={({ id }) => id}
                  getDisplay={({ name }) => name}
                  getItems={value =>
                    service
                      .getList('provider', {
                        fields: ['id', 'name', 'disabledAt'],
                        usePager: false,
                        filters: [
                          {
                            items: [
                              {
                                name: 'name',
                                comparer: 'iLike',
                                value: `%${value}%`,
                              },
                              {
                                name: 'disabledAt',
                                comparer: 'Equals',
                                value: null,
                              },
                            ],
                          },
                        ],
                      })
                      .then(({ items }) => items)
                  }
                  selected={dbFilters.providerId}
                  onChange={provider =>
                    setDbFilters(prev => ({
                      ...prev,
                      providerId: provider ? provider.id : undefined,
                    }))
                  }
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Nº Nota">
                <TextInput
                  ignoreBlur
                  type="search"
                  value={dbFilters.number}
                  onChange={number => setDbFilters(prev => ({ ...prev, number }))}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Paga">
                <Select
                  items={[
                    { value: null, name: 'Todos' },
                    { value: true, name: 'Sim' },
                    { value: false, name: 'Não' },
                  ]}
                  selected={dbFilters.isPaid}
                  getId={({ value }) => value}
                  getDisplay={({ name }) => name}
                  onChange={item =>
                    setDbFilters(prev => ({
                      ...prev,
                      isPaid: item.value,
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
            initialQuery={{ fields }}
            getItems={(query, signal) => service.getList('accountPayable', query, signal)}
            actions={[
              {
                icon: 'fas fa-edit',
                title: 'Editar',
                action: `${basename}/contas-pagar/:id`,
              },
              {
                icon: 'fas fa-trash-alt',
                title: 'Remover',
                action: ({ entity, forceRefresh }) =>
                  disableAccountPayable({
                    callback: forceRefresh,
                    data: entity,
                    modal,
                    service,
                  }),
              },
            ]}
            columns={columns}
          />
        </div>
      </div>
    </>
  )
}
