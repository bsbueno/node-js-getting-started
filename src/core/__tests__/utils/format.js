import { onlyNumbers } from 'core/helpers/format'
import stringify from 'core/helpers/stringify'
import { maskDecimal, maskMoney } from 'core/helpers/mask'
import { toLocaleDateTime } from 'core/helpers/date'

describe('Format helpers', () => {
  it('Getting only numbers', () => {
    expect(onlyNumbers('42935487850')).toBe('42935487850')
    expect(onlyNumbers('aaaaaaaa8')).toBe('8')
    expect(onlyNumbers('0bbbbbbbb0')).toBe('00')
    expect(onlyNumbers('aa56ss8g1s5s86')).toBe('5681586')
    expect(onlyNumbers('there`s no number')).toBe('')
    expect(onlyNumbers('sa5gdg.as9bc]][/]`213!@#$#&%^(*)')).toBe('59213')
    expect(onlyNumbers('only letters')).toBe('')
  })

  it('Masking money', () => {
    expect(maskMoney(4.123125412512)).toBe('R$ 4,12')
    expect(maskMoney(25.3)).toBe('R$ 25,30')
    expect(maskMoney(175)).toBe('R$ 175,00')
    expect(maskMoney(5615.5)).toBe('R$ 5.615,50')
    expect(maskMoney(8151565.45)).toBe('R$ 8.151.565,45')
    expect(maskDecimal(65.87995)).toBe('65,88')
    expect(maskDecimal(561.7)).toBe('561,70')
    expect(maskDecimal(65165156.4, { precision: 0 })).toBe('65.165.156')
    expect(maskDecimal(1500.6, { precision: 0 })).toBe('1.501')
  })

  it('Formatting date', () => {
    expect(toLocaleDateTime('2017-11-23T01:07:32.000Z')).toBe('22/11/2017 23:07:32')
    expect(toLocaleDateTime('2017-11-23T01:07:32')).toBe('22/11/2017 23:07:32')
    expect(toLocaleDateTime(new Date(2014, 1, 11))).toBe('11/02/2014 00:00:00')
    expect(toLocaleDateTime(512969520900)).toBe('04/04/1986 00:32:00')
  })

  it('QueryString Stringify object to query string', () => {
    expect(stringify({ testing: 123 })).toBe('?testing=123')
    expect(stringify({ testing: 123 }, false)).toBe('testing=123')
    expect(
      stringify({
        testing: [
          { name: 'joana', age: 23 },
          { name: 'marcos', age: 12 },
        ],
      }),
    ).toBe('?testing[0].name=joana&testing[0].age=23&testing[1].name=marcos&testing[1].age=12')
  })
})
