import React, { useState } from 'react'
import startOfDay from 'date-fns/startOfDay'
import endOfDay from 'date-fns/endOfDay'
import { List } from 'core/components/list'
import { Link } from 'core/components/route'
import { useRefresh } from 'core/hooks/refresh'
import { Field } from 'core/components/form/field'
import { TextInput } from 'core/components/form/text-input'
import { useFilters } from 'core/hooks/filter'
import { AsyncSelect } from 'core/components/form/async-select'
import { iframeDownload } from 'core/helpers/misc'
import { LoadingCard } from 'core/components/loading-card'
import { DateInput } from 'core/components/form/date-input'
import { parseNumber } from 'core/helpers/parse'
import { onlyNumbers } from 'core/helpers/format'
import { Button } from 'core/components/button'
import { CpfMask } from 'core/constants'
import { Select } from 'core/components/form/select'
import { InstallmentModal } from './InstallmentModal'
import { CardIssuanceModal } from './CardIssuanceModal'

const columns = [
  { path: 'id', title: '#', textAlign: 'center', sort: 'createdAt' },
  { path: 'patientName', title: 'Aderente' },
  { path: 'patientCpfCnpj', title: 'CPF/CNPJ', format: 'cpfcnpj' },
  { path: 'patientPhone', title: 'Telefone', format: 'cellAndPhone' },
  { path: 'createdAt', title: 'Data do Contrato', format: 'date' },
  { path: 'sellerName', title: 'Vendedor' },
  { path: 'planTitle', title: 'Plano' },
  { path: 'paymentMethodDescription', title: 'Opção Pagamento' },
  {
    path: 'disabledAt',
    title: 'Status',
    format: ent => (ent.disabledAt ? 'Cancelado' : 'Ativo'),
  },
]

const contractTypes = [
  { id: 0, name: 'Todos' },
  { id: 1, name: 'Ativados' },
  { id: 2, name: 'Cancelados' },
]

const fields = columns.map(c => c.path)

export const disableContract = ({ modal, data: { id }, callback, service }) =>
  modal.confirm(
    `Deseja encerrar o contrato ${id}?`,
    confirmed =>
      confirmed &&
      service
        .remove('contract', id)
        .then(callback)
        .catch(err => modal.alert(err.message)),
  )

export const ContractList = ({ global, route, service, basename }) => {
  const { modal } = global
  const [dbFilters, setDbFilters] = useState({
    id: '',
    institution: '',
    cpfCnpj: '',
    name: '',
    sellerId: '',
    paymentMethodId: '',
    planId: '',
    type: 0,
    minDate: null,
    maxDate: null,
  })

  const { setValues, filters } = useFilters(
    {
      id: '',
      institution: '',
      cpfCnpj: '',
      name: '',
      sellerId: '',
      paymentMethodId: '',
      planId: '',
      type: 0,
      minDate: null,
      maxDate: null,
    },
    query => [
      {
        items: [
          { name: 'Contract.id', value: query.id, comparer: 'Equals' },
          { name: 'institution', value: query.institution, comparer: 'Like' },
          {
            name: 'patient.cpfCnpj',
            value: onlyNumbers(query.cpfCnpj),
            comparer: 'Like',
          },
          {
            name: 'patient.name',
            value: `%${query.name}%`,
            comparer: 'iLike',
          },
          { name: 'sellerId', value: query.sellerId, comparer: 'Equals' },
          { name: 'paymentMethodId', value: query.paymentMethodId, comparer: 'Equals' },
          { name: 'planId', value: query.planId, comparer: 'Equals' },
          query.type === 1
            ? {
                name: 'Contract.disabledAt',
                value: null,
              }
            : {},
          query.type === 2
            ? {
                name: 'Contract.disabledAt',
                value: null,
                comparer: 'NotEquals',
              }
            : {},
          query.minDate
            ? {
                name: query.type === 2 ? 'Contract.disabledAt' : 'createdAt',
                value: query.minDate,
                comparer: 'GreaterThanOrEqual',
              }
            : {},
          query.maxDate
            ? {
                name: query.type === 2 ? 'Contract.disabledAt' : 'createdAt',
                value: query.maxDate,
                comparer: 'LessThanOrEqual',
              }
            : {},
        ],
      },
    ],
  )

  const fetching = useState(false)
  const refresh = useRefresh()
  const [printFetching, setPrintFetching] = useState(false)

  const contractId = parseNumber(route.match.params.id)
  const showForm = route.location.pathname.includes('parcelas')
  const showModal = route.location.pathname.includes('carteirinhas')

  return (
    <>
      <div className="kt-portlet kt-portlet--mobile">
        <div className="kt-portlet__head kt-portlet__head--lg">
          <div className="kt-portlet__head-label">
            <span className="kt-portlet__head-icon">
              <i className="kt-font-brand fas fa-file-contract" />
            </span>
            <h3 className="kt-portlet__head-title">Contratos</h3>
          </div>
          <div className="kt-portlet__head-toolbar">
            <div className="kt-portlet__head-wrapper">
              <div className="dropdown dropdown-inline buttons-header-padding">
                <Link className="btn btn-success btn-icon-sm" to={`${basename}/contratos/cadastro`}>
                  <i className="fas fa-plus" /> Novo Contrato
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
                        'contract.list',
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
                      .then(blob => iframeDownload(blob, 'contratos.pdf'))
                      .catch(err => modal.alert(err.message))
                      .finally(() => setPrintFetching(false))
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="kt-portlet__body kt-pb-0 position-relative">
          <div className="row">
            <div className="col-lg">
              <Field label="Nº do Contrato">
                <TextInput
                  isClearable
                  ignoreBlur
                  type="search"
                  value={dbFilters.id}
                  onChange={id => setDbFilters(prev => ({ ...prev, id }))}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="CPF/CNPJ">
                <TextInput
                  mask={CpfMask}
                  isClearable
                  ignoreBlur
                  type="search"
                  value={dbFilters.cpfCnpj}
                  onChange={cpfCnpj => setDbFilters(prev => ({ ...prev, cpfCnpj }))}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Nome do Aderente">
                <TextInput
                  isClearable
                  ignoreBlur
                  type="search"
                  value={dbFilters.name}
                  onChange={name => setDbFilters(prev => ({ ...prev, name }))}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field
                label={
                  dbFilters.type === 2 ? 'Data Inicial do Cancelamento' : 'Data Inicial do Contrato'
                }
              >
                <DateInput
                  isClearable
                  customClassName="form-control-xl"
                  onChange={date =>
                    setDbFilters(prev => ({
                      ...prev,
                      minDate: date ? startOfDay(date) : null,
                    }))
                  }
                  value={dbFilters.minDate}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field
                label={
                  dbFilters.type === 2 ? 'Data Final do Cancelamento' : 'Data Final do Contrato'
                }
              >
                <DateInput
                  isClearable
                  customClassName="form-control-xl"
                  onChange={date =>
                    setDbFilters(prev => ({
                      ...prev,
                      maxDate: date ? endOfDay(date) : null,
                    }))
                  }
                  value={dbFilters.maxDate}
                />
              </Field>
            </div>
          </div>
          <div className="row">
            <div className="col-lg">
              <Field label="Vendedor">
                <AsyncSelect
                  isClearable
                  getId={({ id }) => id}
                  getDisplay={({ name }) => name}
                  getItems={value =>
                    service
                      .getList('seller', {
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
                  selected={dbFilters.sellerId}
                  onChange={seller =>
                    setDbFilters(prev => ({
                      ...prev,
                      sellerId: seller ? seller.id : '',
                      seller,
                    }))
                  }
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Opção de Pagamento">
                <AsyncSelect
                  isClearable
                  getId={({ id }) => id}
                  getDisplay={({ description }) => description}
                  getItems={value =>
                    service
                      .getList('paymentmethod', {
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
                  selected={dbFilters.paymentMethodId}
                  onChange={paymentMethod => {
                    setDbFilters(prev => ({
                      ...prev,
                      paymentMethodId: paymentMethod ? paymentMethod.id : '',
                    }))
                  }}
                />
              </Field>
            </div>
            <div className="col-lg">
              <Field label="Plano">
                <AsyncSelect
                  isClearable
                  getId={({ id }) => id}
                  getDisplay={({ title }) => title}
                  getItems={value =>
                    service
                      .getList('plan', {
                        fields: ['id', 'title', 'disabledAt', 'single'],
                        usePager: false,
                        filters: [
                          {
                            items: [
                              {
                                name: 'title',
                                comparer: 'Like',
                                value,
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
                  selected={dbFilters.planId}
                  onChange={plan => {
                    setDbFilters(prev => ({
                      ...prev,
                      planId: plan ? plan.id : '',
                    }))
                  }}
                />
              </Field>
            </div>
            <div className="col-lg-3">
              <Field label="Tipo">
                <Select
                  items={contractTypes}
                  selected={dbFilters.type}
                  getId={({ id }) => id}
                  getDisplay={({ name }) => name}
                  onChange={({ id }) =>
                    setDbFilters(prev => ({
                      ...prev,
                      type: id,
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
            showItem
            onShowItem={entity => route.history.push(`${basename}/contratos/${entity.id}/mostrar`)}
            customRowClassName={entity => ({ disabled: entity.disabledAt })}
            modal={modal}
            route={route}
            refresh={refresh}
            fetching={fetching}
            filters={filters}
            initialQuery={{
              fields,
              sort: [['createdAt', 'DESC']],
            }}
            getItems={(query, signal) => service.getList('contract', query, signal)}
            actions={[
              {
                icon: 'fas fa-edit',
                title: 'Editar',
                action: `${basename}/contratos/:id`,
              },
              {
                icon: `fas fa-print`,
                title: 'Imprimir Formulário',
                action: async ent => {
                  setPrintFetching(true)
                  await service
                    .post('report.form', { id: ent.entity.id }, undefined, resp => resp.blob())
                    .then(blob => iframeDownload(blob, 'formulario.pdf'))
                    .catch(err => global.modal.alert(err.message))
                    .finally(() => setPrintFetching(false))
                },
              },
              {
                icon: `fas fa-print`,
                title: 'Imprimir Contrato',
                action: async ent => {
                  setPrintFetching(true)
                  await service
                    .post('report.contract', { id: ent.entity.id }, undefined, resp => resp.blob())
                    .then(blob => iframeDownload(blob, 'contrato.pdf'))
                    .catch(err => global.modal.alert(err.message))
                    .finally(() => setPrintFetching(false))
                },
              },
              {
                icon: `fas fa-id-card`,
                title: 'Emissão de Carteirinhas',
                action: `${basename}/contratos/carteirinhas/:id`,
              },
              {
                icon: 'fas fa-money-check-alt',
                title: 'Parcelas',
                action: `${basename}/contratos/parcelas/:id`,
              },
              {
                icon: 'fas fa-file-contract',
                title: 'Encerrar Contrato',
                hideWhen: ent => !!ent.disabledAt,
                action: ({ entity, forceRefresh }) =>
                  disableContract({
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
      <CardIssuanceModal
        basename={basename}
        refresh={refresh.force}
        contractId={contractId}
        route={route}
        service={service}
        show={showModal}
      />
      <InstallmentModal
        service={service}
        show={showForm}
        route={route}
        contractId={contractId}
        refresh={async () => {
          await global.refresh(true)
          refresh.force()
        }}
      />
    </>
  )
}
