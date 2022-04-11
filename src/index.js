import 'react-perfect-scrollbar/dist/css/styles.css'
import 'react-toastify/dist/ReactToastify.css'
import 'assets/sass/datepicker.sass'
import 'assets/sass/main.scss'

import React from 'react'
import Panel from 'components/panel'
import { render } from 'react-dom'
import { Route, Router, Redirect, Switch } from 'react-router'
import { Login, AdminLogin } from 'components/login'
import { PrivateRoute } from 'core/components/route'
import { history } from 'core/helpers/history'
import * as serviceWorker from 'serviceWorker'
import { App } from 'App'
import { config } from 'config'
import { API, AdminAPI } from 'service'
import { SellerList } from 'components/seller'
import { SellerForm } from 'components/seller/SellerForm'
import { ContractList, ContractForm } from 'components/contract'
import { CardIssuance, Installment, Contract, MedicalProcedure, Exam } from 'components/reports'
import { KinshipList } from 'components/kinship'
import { EmployeeList } from 'components/employee'
import { PaymentMethodList } from 'components/payment-method'
import { PaymentList, PaymentForm } from 'components/payment'
import { ProfessionalForm, ProfessionalList } from 'components/health-professional'
import { AttendanceRoomList } from 'components/attendance-room'
import { SchedulingForm } from 'components/scheduling'
import { AttendanceForm, AttendanceList } from 'components/attendance'
import { PatientList, PatientForm } from 'components/patient'
import { ProfileList, ProfileForm } from 'components/profile'
import { MedicalSchedule } from 'components/medical-schedule'
import { MedicalProcedureList } from 'components/medical-procedure'
import { ContractRenewalList } from 'components/contract-renewal'
import { ExamList } from 'components/exam'
import { ReprocessExams } from 'components/reprocess-exams'
import { BudgetForm } from 'components/budget'
import { AbsenceList } from 'components/professional-absence'
import { ConfigurationForm } from 'components/configuration'
import { SmsForm } from 'components/sms'
import { BankAccountList } from 'components/bankAccount'
import { ClassificationList } from 'components/classification'
import { ProviderForm, ProviderList } from 'components/provider'
import { AccountPayableForm, AccountPayableList } from 'components/accountPayable'
import { AccountPaymentForm, AccountPaymentList } from 'components/accountPayment'
import { StatementList } from 'components/statement'
import { BillingForm, BillingList } from 'components/billing'
import { HolidaysList } from 'components/holidays'

const rootElement = document.getElementById('root')

const Home = ({ global }) => (
  <div className="kt-portlet">
    <div className="kt-portlet__head">
      <div className="kt-portlet__head-label">
        <span className="kt-portlet__head-icon">
          <i className="kt-font-brand fas fa-home" />
        </span>
        <h3 className="kt-portlet__head-title">Olá seja bem-vindo, {global.operator.name}.</h3>
      </div>
    </div>
  </div>
)

render(
  <Router history={history}>
    <App>
      {global => (
        <Switch>
          <Route exact path="/sa/login" render={r => <AdminLogin route={r} global={global} />} />

          <PrivateRoute
            path="/sa"
            tokenKey={config.SA_TOKEN_KEY}
            render={route => (
              <Panel
                base="/sa"
                home={Home}
                service={AdminAPI}
                tokenKey={config.SA_TOKEN_KEY}
                route={route}
                global={global}
                pages={[
                  {
                    title: 'Reprocessar Exames',
                    href: '/reprocessar-exames',
                    icon: 'fas fa-microscope',
                    component: ReprocessExams,
                  },
                ]}
                routes={[]}
              />
            )}
          />

          <Route
            exact
            path="/:unity?/login/:token?"
            render={route => <Login route={route} global={global} />}
          />

          <PrivateRoute
            path="/:unity"
            render={route => (
              <Panel
                base="/:unity"
                home={Home}
                service={API}
                tokenKey={config.TOKEN_KEY}
                route={route}
                global={global}
                pages={[
                  {
                    title: 'Perfis',
                    href: '/perfil',
                    icon: 'fas fa-user-tag',
                    component: ProfileList,
                    hideWhen: operator =>
                      !['MedicalClinic', 'EmployeeProfiles'].some(p =>
                        operator.permissions.includes(p),
                      ),
                  },
                  {
                    title: 'Colaboradores',
                    href: ['/colaboradores', '/colaboradores/cadastro', '/colaboradores/:id'],
                    icon: 'fas fa-user-tie',
                    component: EmployeeList,
                    hideWhen: operator =>
                      !['MedicalClinic', 'Employees'].some(p => operator.permissions.includes(p)),
                  },
                  {
                    title: 'Vendedores',
                    href: '/vendedores',
                    icon: 'fas fa-user',
                    component: SellerList,
                    hideWhen: operator =>
                      !['MedicalClinic', 'Sellers'].some(p => operator.permissions.includes(p)),
                  },
                  {
                    title: 'Profissionais de Saúde',
                    href: '/profissionais',
                    icon: 'fas fa-user-md',
                    component: ProfessionalList,
                    hideWhen: operator =>
                      !['MedicalClinic', 'HealthProfessionals'].some(p =>
                        operator.permissions.includes(p),
                      ),
                  },
                  {
                    title: 'Ausências',
                    href: ['/ausencias', '/ausencias/cadastro', '/ausencias/:id'],
                    icon: 'fas fa-user-md',
                    component: AbsenceList,
                    hideWhen: operator =>
                      !['MedicalClinic', 'ProfessionalAbsence'].some(p =>
                        operator.permissions.includes(p),
                      ),
                  },
                  {
                    title: 'Clientes',
                    href: '/clientes',
                    icon: 'fas fa-user-injured',
                    component: PatientList,
                    hideWhen: operator =>
                      !['MedicalClinic', 'Patients'].some(p => operator.permissions.includes(p)),
                  },
                  {
                    title: 'Fornecedores',
                    href: '/fornecedores',
                    icon: 'fas fa-user-tag',
                    component: ProviderList,
                    hideWhen: operator =>
                      !['MedicalClinic', 'Provider'].some(p => operator.permissions.includes(p)),
                  },
                  {
                    title: 'Parentesco',
                    href: ['/parentesco', '/parentesco/cadastro', '/parentesco/:id'],
                    icon: 'fas fa-users',
                    component: KinshipList,
                    hideWhen: operator =>
                      !['MedicalClinic', 'Kinships'].some(p => operator.permissions.includes(p)),
                  },
                  {
                    title: 'Opções de Pagamento',
                    href: [
                      '/opcoes-pagamentos',
                      '/opcoes-pagamentos/cadastro',
                      '/opcoes-pagamentos/:id',
                    ],
                    icon: 'fas fa-dollar-sign',
                    component: PaymentMethodList,
                    hideWhen: operator =>
                      !['MedicalClinic', 'PaymentMethods'].some(p =>
                        operator.permissions.includes(p),
                      ),
                  },
                  {
                    title: 'Salas de Atendimento',
                    href: [
                      '/salas-atendimento',
                      '/salas-atendimento/cadastro',
                      '/salas-atendimento/:id',
                    ],
                    icon: 'fas fa-door-open',
                    component: AttendanceRoomList,
                    hideWhen: operator =>
                      !['MedicalClinic', 'AttendanceRoom'].some(p =>
                        operator.permissions.includes(p),
                      ),
                  },
                  {
                    title: 'Procedimentos',
                    href: [
                      '/procedimentos-medicos',
                      '/procedimentos-medicos/cadastro',
                      '/procedimentos-medicos/:id',
                    ],
                    icon: 'fas fa-hand-holding-medical',
                    component: MedicalProcedureList,
                    hideWhen: operator =>
                      !['MedicalClinic', 'MedicalProcedure'].some(p =>
                        operator.permissions.includes(p),
                      ),
                  },
                  {
                    title: 'Exames',
                    href: ['/exames', '/exames/cadastro', '/exames/:id'],
                    icon: 'fas fa-microscope',
                    component: ExamList,
                    hideWhen: operator =>
                      !['MedicalClinic', 'Exam'].some(p => operator.permissions.includes(p)),
                  },
                  {
                    title: 'Contratos',
                    href: ['/contratos', '/contratos/parcelas/:id', '/contratos/carteirinhas/:id'],
                    icon: 'fas fa-file-contract',
                    component: ContractList,
                    hideWhen: operator =>
                      !['MedicalClinic', 'Contracts'].some(p => operator.permissions.includes(p)),
                  },
                  {
                    title: 'Renovação de Contratos',
                    href: ['/renovacao-contratos', '/renovacao-contratos/:id'],
                    icon: 'fas fa-file-signature',
                    component: ContractRenewalList,
                    hideWhen: operator =>
                      !['MedicalClinic', 'ContractRenewal'].some(p =>
                        operator.permissions.includes(p),
                      ),
                  },
                  {
                    title: 'Recebimentos',
                    href: ['/pagamentos', '/pagamentos/detalhes/:id'],
                    icon: 'fas fa-hand-holding-usd',
                    component: PaymentList,
                    hideWhen: operator =>
                      !['MedicalClinic', 'Payments'].some(p => operator.permissions.includes(p)),
                  },
                  {
                    title: 'Agendamento',
                    href: ['/agendamento', '/agendamento/cadastro', '/agendamento/:id'],
                    icon: 'fas fa-calendar-alt',
                    component: SchedulingForm,
                    hideWhen: operator =>
                      !['MedicalClinic', 'Scheduling'].some(p => operator.permissions.includes(p)),
                  },
                  {
                    title: 'Atendimentos',
                    href: '/atendimentos',
                    icon: 'fas fa-notes-medical',
                    component: AttendanceList,
                    hideWhen: operator =>
                      !['MedicalClinic', 'Attendance'].some(p => operator.permissions.includes(p)),
                  },
                  {
                    title: 'Agenda Médica',
                    href: '/agenda-medica',
                    icon: 'fas fa-stethoscope',
                    component: MedicalSchedule,
                    hideWhen: operator =>
                      !['MedicalClinic', 'MedicalSchedule'].some(p =>
                        operator.permissions.includes(p),
                      ),
                  },
                  {
                    title: 'Orçamento',
                    href: '/orcamento',
                    icon: 'fas fa-wallet',
                    component: BudgetForm,
                    hideWhen: operator =>
                      !['MedicalClinic', 'Budget'].some(p => operator.permissions.includes(p)),
                  },
                  {
                    title: 'Sms',
                    href: '/sms',
                    icon: 'fas fa-sms',
                    component: SmsForm,
                    hideWhen: operator =>
                      !['MedicalClinic', 'Sms'].some(p => operator.permissions.includes(p)),
                  },
                  {
                    title: 'Relatórios',
                    icon: 'fas fa-scroll',
                    pages: [
                      {
                        title: 'Emissão de Carteirinhas',
                        href: '/relatorio/carterinha',
                        component: CardIssuance,
                        hideWhen: operator =>
                          !['MedicalClinic', 'Reports', 'ReportCardIssuance'].some(p =>
                            operator.permissions.includes(p),
                          ),
                      },
                      {
                        title: 'Parcelas',
                        href: '/relatorio/parcelas',
                        component: Installment,
                        hideWhen: operator =>
                          !['MedicalClinic', 'Reports', 'ReportInstallment'].some(p =>
                            operator.permissions.includes(p),
                          ),
                      },
                      {
                        title: 'Contratos',
                        href: '/relatorio/contratos',
                        component: Contract,
                        hideWhen: operator =>
                          !['MedicalClinic', 'Reports', 'ReportContract'].some(p =>
                            operator.permissions.includes(p),
                          ),
                      },
                      {
                        title: 'Procedimentos',
                        href: '/relatorio/procedimentos',
                        component: MedicalProcedure,
                        hideWhen: operator =>
                          !['MedicalClinic', 'Reports', 'ReportProcedure'].some(p =>
                            operator.permissions.includes(p),
                          ),
                      },
                      {
                        title: 'Exames',
                        href: '/relatorio/exames',
                        component: Exam,
                        hideWhen: operator =>
                          !['MedicalClinic', 'Reports', 'ReportExam'].some(p =>
                            operator.permissions.includes(p),
                          ),
                      },
                    ],
                    hideWhen: operator =>
                      ![
                        'MedicalClinic',
                        'Reports',
                        'ReportCardIssuance',
                        'ReportInstallment',
                        'ReportContract',
                        'ReportProcedure',
                        'ReportExam',
                      ].some(p => operator.permissions.includes(p)),
                  },
                  {
                    title: 'Financeiro',
                    icon: 'fas fa-dollar-sign',
                    pages: [
                      {
                        title: 'Contas',
                        href: ['/contas', '/contas/cadastro', '/contas/:id'],
                        icon: 'fas fa-dollar-sign',
                        component: BankAccountList,
                        hideWhen: operator =>
                          !['MedicalClinic', 'Financial', 'BankAccount'].some(p =>
                            operator.permissions.includes(p),
                          ),
                      },
                      {
                        title: 'Classificações',
                        href: [
                          '/classificacoes',
                          '/classificacoes/cadastro',
                          '/classificacoes/:id',
                        ],
                        icon: 'fas fa-dollar-sign',
                        component: ClassificationList,
                        hideWhen: operator =>
                          !['MedicalClinic', 'Financial', 'Classification'].some(p =>
                            operator.permissions.includes(p),
                          ),
                      },
                      {
                        title: 'Contas a Pagar',
                        href: '/contas-pagar',
                        icon: 'fas fa-dollar-sign',
                        component: AccountPayableList,
                        hideWhen: operator =>
                          !['MedicalClinic', 'Financial', 'AccountPayable'].some(p =>
                            operator.permissions.includes(p),
                          ),
                      },
                      {
                        title: 'Pagamento de contas',
                        href: ['/pagamento-contas', '/pagamento-contas/detalhes/:id'],
                        icon: 'fas fa-hand-holding-usd',
                        component: AccountPaymentList,
                        hideWhen: operator =>
                          !['MedicalClinic', 'Financial', 'AccountPayment'].some(p =>
                            operator.permissions.includes(p),
                          ),
                      },
                      {
                        title: 'Extrato',
                        href: ['/extrato', '/extrato/detalhes/:id'],
                        icon: 'fas fa-hand-holding-usd',
                        component: StatementList,
                        hideWhen: operator =>
                          !['MedicalClinic', 'Financial', 'Statement'].some(p =>
                            operator.permissions.includes(p),
                          ),
                      },
                      {
                        title: 'Faturamento',
                        href: '/faturamento',
                        icon: 'fas fa-hand-holding-usd',
                        component: BillingList,
                        hideWhen: operator =>
                          !['MedicalClinic', 'Financial', 'Billing'].some(p =>
                            operator.permissions.includes(p),
                          ),
                      },
                    ],
                    hideWhen: operator =>
                      ![
                        'MedicalClinic',
                        'Financial',
                        'BankAccount',
                        'Classification',
                        'AccountPayable',
                        'AccountPayment',
                        'Statement',
                        'Billing',
                      ].some(p => operator.permissions.includes(p)),
                  },
                  {
                    title: 'Feriados',
                    href: ['/feriados', '/feriados/cadastro', '/feriados/:id'],
                    icon: 'fas fa-calendar-week',
                    component: HolidaysList,
                    hideWhen: operator =>
                      !['MedicalClinic', 'Holiday'].some(p => operator.permissions.includes(p)),
                  },
                  {
                    title: 'Configuração',
                    href: '/configuracao',
                    icon: 'fas fa-cog',
                    component: ConfigurationForm,
                    hideWhen: operator =>
                      !['MedicalClinic', 'Configuration'].some(p =>
                        operator.permissions.includes(p),
                      ),
                  },
                ]}
                routes={[
                  {
                    path: ['/perfil/cadastro', '/perfil/:id'],
                    component: ProfileForm,
                  },
                  {
                    path: ['/vendedores/cadastro', '/vendedores/:id'],
                    component: SellerForm,
                  },
                  {
                    path: ['/profissionais/cadastro', '/profissionais/:id'],
                    component: ProfessionalForm,
                  },
                  {
                    path: ['/clientes/cadastro', '/clientes/:id', '/clientes/:id/mostrar'],
                    component: PatientForm,
                  },
                  {
                    path: ['/fornecedores/cadastro', '/fornecedores/:id'],
                    component: ProviderForm,
                  },
                  {
                    path: ['/contratos/cadastro', '/contratos/:id', '/contratos/:id/mostrar'],
                    component: ContractForm,
                  },
                  {
                    path: ['/pagamentos/cadastro', '/pagamentos/:id'],
                    component: PaymentForm,
                  },
                  {
                    path: [
                      '/atendimentos/cadastro',
                      '/atendimentos/:id',
                      '/atendimentos/:id/mostrar',
                      '/receitas/cadastro',
                      '/receitas/:id',
                      '/solicitacoes-exames/cadastro',
                      '/solicitacoes-exames/:id',
                    ],
                    component: AttendanceForm,
                  },
                  {
                    path: ['/contas-pagar/cadastro', '/contas-pagar/:id'],
                    component: AccountPayableForm,
                  },
                  {
                    path: ['/pagamento-contas/cadastro', '/pagamento-contas/:id'],
                    component: AccountPaymentForm,
                  },
                  {
                    path: ['/faturamento/cadastro', '/faturamento/:id'],
                    component: BillingForm,
                  },
                ]}
              />
            )}
          />
          <Route render={() => <Redirect to="login" />} />
        </Switch>
      )}
    </App>
  </Router>,
  rootElement,
)

serviceWorker.register()
