export const BrazilStates = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'PA', name: 'Pará' },
  { uf: 'PB', name: 'Paraíba' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piauí' },
  { uf: 'PR', name: 'Paraná' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'TO', name: 'Tocantins' },
]

export const getStateFullName = uf => BrazilStates.find(st => st.uf === uf).name

export const CnpjMask = [
  /\d/,
  /\d/,
  '.',
  /\d/,
  /\d/,
  /\d/,
  '.',
  /\d/,
  /\d/,
  /\d/,
  '/',
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  '-',
  /\d/,
  /\d/,
]

export const CpfMask = [
  /\d/,
  /\d/,
  /\d/,
  '.',
  /\d/,
  /\d/,
  /\d/,
  '.',
  /\d/,
  /\d/,
  /\d/,
  '-',
  /\d/,
  /\d/,
]
export const CepMask = [/\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/]
export const CellPhoneMask = [
  '(',
  /\d/,
  /\d/,
  ')',
  ' ',
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  '-',
  /\d/,
  /\d/,
  /\d/,
  /\d/,
]
export const PhoneMask = [
  '(',
  /\d/,
  /\d/,
  ')',
  ' ',
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  '-',
  /\d/,
  /\d/,
  /\d/,
  /\d/,
]
export const requiredMessage = 'Esse campo é obrigatório.'
export const DateMask = [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]

export const StatusType = [
  { id: 0, name: 'Vivo', value: 'alive' },
  { id: 1, name: 'Morto', value: 'dead' },
  { id: 3, name: 'Vendido', value: 'sold' },
]

export const Councils = [
  { name: 'CRM - Conselho Regional de Medicina', value: 'CRM' },
  { name: 'COREN - Conselho Regional de Enfermagem', value: 'COREN' },
  { name: 'CRAS - Conselho Regional de Assistência Social', value: 'CRAS' },
  { name: 'CREFITO - Conselho Regional de Fisioterapia e Terapia Ocupacional', value: 'CREFITO' },
  { name: 'CRF - Conselho Regional de Farmácia', value: 'CRF' },
  { name: 'CRFA - Conselho Regional de Fonoaudiologia', value: 'CRFA' },
  { name: 'CRN - Conselho Regional de Nutrição', value: 'CRN' },
  { name: 'CRO - Conselho Regional de Odontologia', value: 'CRO' },
  { name: 'CRP - Conselho Regional de Psicologia', value: 'CRP' },
  { name: 'OUT - Outros Conselhos', value: 'OUT' },
]

export const TypeScheduling = {
  ATTENDANCE: 1,
  RETURN: 2,
  PROCEDURE: 3,
  ORTHODONTICS: 4,
  DENTALEVALUATION: 5,
}

export const TypeSchedulingDescription = [
  { id: TypeScheduling.ATTENDANCE, name: 'Consulta' },
  { id: TypeScheduling.RETURN, name: 'Retorno' },
  { id: TypeScheduling.PROCEDURE, name: 'Procedimento' },
  { id: TypeScheduling.ORTHODONTICS, name: 'Manutenção - Ortodontia' },
  { id: TypeScheduling.DENTALEVALUATION, name: 'Avaliação Odontológica' },
]

export const SchedulingStatus = {
  SCHEDULED: 1,
  CONFIRMED: 2,
  INSERVICE: 3,
  ATTENDED: 4,
  WAITINGROOM: 5,
}

export const SchedulingStatusDescription = [
  { id: SchedulingStatus.SCHEDULED, name: 'Agendado', class: 'notice-warning' },
  { id: SchedulingStatus.CONFIRMED, name: 'Confirmado', class: 'notice-success' },
  { id: SchedulingStatus.WAITINGROOM, name: 'Sala de Espera', class: 'notice-waiting' },
  { id: SchedulingStatus.INSERVICE, name: 'Em Atendimento', class: 'notice-info' },
  { id: SchedulingStatus.ATTENDED, name: 'Atendido', class: 'notice-primary' },
]

export const InstallmentStatus = {
  INDUE: 1,
  OVERDUE: 2,
  PAID: 3,
}

export const InstallmentStatusDescription = [
  { id: InstallmentStatus.INDUE, description: 'Á Vencer' },
  { id: InstallmentStatus.OVERDUE, description: 'Vencida' },
  { id: InstallmentStatus.PAID, description: 'Paga' },
]

export const ClearanceType = {
  ATTENDANCETIME: 1,
  TODAY: 2,
  DAYS: 3,
  MORNINGPERIOD: 4,
  AFTERNOONPERIOD: 5,
}

export const ClearanceTypeDescription = [
  { id: ClearanceType.ATTENDANCETIME, description: 'Horário da Consulta' },
  { id: ClearanceType.TODAY, description: 'Dia de Hoje' },
  { id: ClearanceType.DAYS, description: 'Por dias' },
  { id: ClearanceType.MORNINGPERIOD, description: 'Período da Manhã' },
  { id: ClearanceType.AFTERNOONPERIOD, description: 'Período da Tarde' },
]

export const AttendanceStatus = {
  INSERVICE: 1,
  ATTENDED: 2,
}
export const AttendanceStatusDescription = [
  { id: AttendanceStatus.INSERVICE, name: 'Em Atendimento' },
  { id: AttendanceStatus.ATTENDED, name: 'Atendido' },
]

export const TypeAdministration = {
  INTERNAL: 1,
  EXTERNAL: 2,
  RECTAL: 3,
  NASAL: 4,
  ORAL: 5,
  INTRAVENOUS: 6,
  OPHTHALMIC: 7,
  VAGINAL: 8,
  OTHER: 9,
}

export const TypeAdministrationDescription = [
  { id: TypeAdministration.INTERNAL, name: 'Interno' },
  { id: TypeAdministration.EXTERNAL, name: 'Externo' },
  { id: TypeAdministration.RECTAL, name: 'Retal' },
  { id: TypeAdministration.NASAL, name: 'Nasal' },
  { id: TypeAdministration.INTRAVENOUS, name: 'Endovenoso' },
  { id: TypeAdministration.OPHTHALMIC, name: 'Oftálmico' },
  { id: TypeAdministration.VAGINAL, name: 'Vaginal' },
  { id: TypeAdministration.OTHER, name: 'Outro' },
]

export const getTypeAdministrationDescription = type => {
  const typeDescription = TypeAdministrationDescription.find(t => t.id === type)
  return typeDescription.name
}

export const StatementTypes = [
  { id: 1, name: 'Entrada' },
  { id: 2, name: 'Saída' },
]

export const OperationTypes = [
  { id: 1, name: 'Pagamento' },
  { id: 2, name: 'Recebimento' },
  { id: 3, name: 'Movimentação' },
  { id: 4, name: 'Faturamento' },
]
