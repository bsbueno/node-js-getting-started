import { deepMerge } from 'core/helpers/functional'

describe('deepMerge', () => {
  it('add keys in target that do not exist at the root', () => {
    const target = {}
    const src = { key1: 'value1', key2: 'value2' }

    expect(target).toEqual({})
    expect(deepMerge(target, src)).toEqual(src)
  })

  it('merge existing simple keys in target at the roots', () => {
    const src = { key1: 'changed', key2: 'value2' }
    const target = { key1: 'value1', key3: 'value3' }

    const expected = {
      key1: 'changed',
      key2: 'value2',
      key3: 'value3',
    }

    expect(target).toEqual({ key1: 'value1', key3: 'value3' })
    expect(deepMerge(target, src)).toEqual(expected)
  })

  it('merge nested objects into target', () => {
    const src = {
      key1: {
        subkey1: 'changed',
        subkey3: 'added',
      },
    }
    const target = {
      key1: {
        subkey1: 'value1',
        subkey2: 'value2',
      },
    }

    const expected = {
      key1: {
        subkey1: 'changed',
        subkey2: 'value2',
        subkey3: 'added',
      },
    }

    expect(target).toEqual({
      key1: {
        subkey1: 'value1',
        subkey2: 'value2',
      },
    })

    expect(deepMerge(target, src)).toEqual(expected)
  })

  it('replace simple key with nested object in target', () => {
    const src = {
      key1: {
        subkey1: 'subvalue1',
        subkey2: 'subvalue2',
      },
    }
    const target = {
      key1: 'value1',
      key2: 'value2',
    }

    const expected = {
      key1: {
        subkey1: 'subvalue1',
        subkey2: 'subvalue2',
      },
      key2: 'value2',
    }

    expect(target).toEqual({ key1: 'value1', key2: 'value2' })
    expect(deepMerge(target, src)).toEqual(expected)
  })
})
