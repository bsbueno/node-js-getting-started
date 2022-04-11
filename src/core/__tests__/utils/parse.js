import { parseMoney, parseNumber } from 'core/helpers/parse'
import parseQueryString from 'core/helpers/parseQueryString'

describe('Parse helpers', () => {
  test('QueryString Parse query string to object', () => {
    expect(parseQueryString('?testing=123')).toEqual({ testing: '123' })
    expect(parseQueryString('?filters[0].name=nome&filters[0].value=joana')).toEqual({
      filters: [{ name: 'nome', value: 'joana' }],
    })
  })

  test('Parse number', () => {
    expect(parseNumber('R$ 4,12')).toBe(412)
    expect(parseNumber('2.500,90')).toBe(250090)
    expect(parseNumber('175')).toBe(175)
    expect(parseNumber('25.50')).toBe(2550)
    expect(parseNumber()).toBe(0)
    expect(parseNumber('-120')).toBe(120)
    expect(parseNumber('-70,50')).toBe(7050)
  })

  test('Parse money', () => {
    expect(parseMoney('R$ 4,12')).toBe(4.12)
    expect(parseMoney('2.500,90')).toBe(2500.9)
    expect(parseMoney('175')).toBe(175)
    expect(parseMoney('25.50')).toBe(25.5)
    expect(parseMoney()).toBe(0)
    expect(parseMoney('-120')).toBe(120)
    expect(parseMoney('-70,50')).toBe(70.5)
  })
})
