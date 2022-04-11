import { range } from 'core/helpers/functional'
import { isCNPJ, isCPF, isEmail } from 'core/helpers/validate'

const randomString = 'sa5gdg.as9bc]][/]`213!@#$#&%^(*)'
const emails = [
  'marcos_souza_@hotmail.com',
  'sidneylivre@hotmail.com',
  'SIL.MARAJ@HOTMAIL.COM',
  'gledson_florida@hotmail.com',
  'barbara_amanda2008@hotmail.com',
  'gomes_riberio@yahoo.com.br',
  'linscalcadosltda@bol.com.br',
  'loja@acruzeirense.com.br',
  'nfe@vlg.com.br',
]

const cpfs = [
  '429.354.878-50',
  '177.843.658-70',
  '401.298.264-80',
  '47222224440',
  '70089571819',
  '38378727343',
  '384.612.222-02',
  '658.293.681-61',
  '548.058.616-57',
]

const cnpjs = [
  '77.661.866/0001-78',
  '75.467.386/0001-45',
  '33.412.137/0001-02',
  '26099743000154',
  '19087618000169',
  '20593450000142',
  '01.748.552/0001-45',
  '99.569.266/0001-17',
  '75.321.118/0001-10',
]

const filled = len => range(1, 9).map(n => new Array(len).fill(n).join(''))

describe('Validation helpers', () => {
  it('Validating email', () => {
    emails.map(email => expect(isEmail(email)).toBeTruthy())
    expect(isEmail(randomString)).toBeFalsy()
  })

  it('Validating CPF', () => {
    cpfs.map(cpf => expect(isCPF(cpf)).toBeTruthy())
    cnpjs.map(cnpj => expect(isCPF(cnpj)).toBeFalsy())
    filled(11).map(cpf => expect(isCPF(cpf)).toBeFalsy())
  })

  it('Validating CNPJ', () => {
    cnpjs.map(cnpj => expect(isCNPJ(cnpj)).toBeTruthy())
    cpfs.map(cpf => expect(isCNPJ(cpf)).toBeFalsy())
    filled(14).map(cnpj => expect(isCNPJ(cnpj)).toBeFalsy())
  })
})
