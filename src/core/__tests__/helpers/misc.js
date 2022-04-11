import { classNames, cleanObject } from 'core/helpers/misc'

describe('cleanObject', () => {
  it('clear empty values', () => {
    expect(cleanObject({ s: undefined, a: null, name: '', list: [], config: {} })).toEqual({})
    expect(cleanObject({ x: undefined, y: undefined, a: 2, z: undefined })).toEqual({ a: 2 })
    expect(cleanObject({ a: null, b: null, d: 'test', c: null })).toEqual({ d: 'test' })
    expect(cleanObject({ x: 'x', y: 'y', z: 'z', w: '' })).toEqual({ x: 'x', y: 'y', z: 'z' })
    expect(
      cleanObject({
        fruits: ['apple', 'banana'],
        ages: [24, 22, 18],
        rest: [],
      }),
    ).toEqual({
      fruits: ['apple', 'banana'],
      ages: [24, 22, 18],
    })
  })

  it('clear default values', () => {
    expect(cleanObject({ count: 0, rest: 'stay' })).toEqual({ rest: 'stay' })
    expect(cleanObject({ a: 0, b: 1, c: 2, d: 3 })).toEqual({ b: 1, c: 2, d: 3 })
  })

  it('clear processed objects', () => {
    expect(
      cleanObject({
        id: 0,
        person: {
          name: '',
          age: 0,
          childrens: [],
        },
      }),
    ).toEqual({})
  })
})

describe('classNames', () => {
  it('keeps object keys with truthy values', () => {
    expect(
      classNames({
        a: true,
        b: false,
        d: null,
        e: undefined,
      }),
    ).toBe('a')
  })

  it('joins arrays of class names and ignore falsy values', () => {
    expect(classNames('a', null, undefined, 'b')).toBe('a b')
  })

  it('supports heterogenous arguments', () => {
    expect(classNames({ a: true }, 'b')).toBe('a b')
  })

  it('should be trimmed', () => {
    expect(classNames('', 'b', {}, '')).toBe('b')
  })

  it('returns an empty string for an empty configuration', () => {
    expect(classNames({})).toBe('')
  })

  it('supports an array of class names', () => {
    expect(classNames(['a', 'b'])).toBe('a b')
  })

  it('joins array arguments with string arguments', () => {
    expect(classNames(['a', 'b'], 'c')).toBe('a b c')
    expect(classNames('c', ['a', 'b'])).toBe('c a b')
  })

  it('handles multiple array arguments', () => {
    expect(classNames(['a', 'b'], ['c', 'd'])).toBe('a b c d')
  })

  it('handles arrays that include falsy and true values', () => {
    expect(classNames(['a', null, undefined, 'b'])).toBe('a b')
  })

  it('handles arrays that are empty', () => {
    expect(classNames('a', [])).toBe('a')
  })
})
