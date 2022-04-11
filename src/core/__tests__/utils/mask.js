import {
  adjustCaretPosition,
  adjustDecimalCaret,
  applyMask,
  convertMaskToPlaceholder,
} from 'core/helpers/mask'
import { CnpjMask, CpfMask, CepMask } from 'core/constants'

describe('Mask helpers', () => {
  it('Convert mask to placeholder string', () => {
    expect(convertMaskToPlaceholder()).toBe('')
    expect(convertMaskToPlaceholder(CnpjMask)).toBe('__.___.___/____-__')
    expect(convertMaskToPlaceholder(CpfMask)).toBe('___.___.___-__')
    expect(convertMaskToPlaceholder(CepMask)).toBe('_____-___')
  })

  it('Apply mask', () => {
    expect(applyMask(CpfMask, '42935487850')).toBe('429.354.878-50')
    expect(applyMask(CnpjMask, '73187488000181')).toBe('73.187.488/0001-81')
    expect(applyMask(CepMask, '13454330')).toBe('13454-330')
    expect(applyMask(CepMask, '13454b330')).toBe('13454-330')
    expect(applyMask(CepMask, '13454-__3')).toBe('13454-3__')
    expect(applyMask(CepMask, '120')).toBe('120__-___')
  })
})

describe('adjustDecimalCaret', () => {
  it('continue in same pos when has more numbers', () => {
    expect(
      adjustDecimalCaret({
        caretPosition: 4,
        masked: '0,06',
        text: '0,060',
      }),
    ).toBe(3)

    expect(
      adjustDecimalCaret({
        caretPosition: 4,
        masked: '6,60',
        text: '0,660',
      }),
    ).toBe(3)

    expect(
      adjustDecimalCaret({
        caretPosition: 4,
        masked: '66,60',
        text: '6,660',
      }),
    ).toBe(4)
  })

  it('continue in same pos when delete numbers', () => {
    expect(
      adjustDecimalCaret({
        caretPosition: 3,
        masked: '0,66',
        text: '6,6',
      }),
    ).toBe(4)

    expect(
      adjustDecimalCaret({
        caretPosition: 0,
        masked: '0,50',
        text: ',50',
      }),
    ).toBe(1)
  })

  it('multichar selection edit', () => {
    expect(
      adjustDecimalCaret({
        caretPosition: 4,
        masked: '6,50',
        text: '6,50',
      }),
    ).toBe(4)

    expect(
      adjustDecimalCaret({
        caretPosition: 1,
        masked: '0,05',
        text: '5',
      }),
    ).toBe(4)

    expect(
      adjustDecimalCaret({
        caretPosition: 2,
        masked: '0,02',
        text: '02',
      }),
    ).toBe(4)

    expect(
      adjustDecimalCaret({
        caretPosition: 1,
        masked: '0,50',
        text: '50',
      }),
    ).toBe(3)
  })

  it('preciosion bigger than 2', () => {
    expect(
      adjustDecimalCaret({
        caretPosition: 1,
        masked: '0,050',
        text: '50',
      }),
    ).toBe(4)

    expect(
      adjustDecimalCaret({
        caretPosition: 1,
        masked: '0,500',
        text: '500',
      }),
    ).toBe(3)
  })
})

describe('adjustCaretPosition', () => {
  it('places the caret after the last change when operation is addition', () => {
    expect(
      adjustCaretPosition({
        caretPosition: 4,
        placeholder: convertMaskToPlaceholder([/\d/, /\d/, /\d/, /\d/]),
        previousValue: '3333',
        rawValue: '2938',
        value: '2938',
      }),
    ).toBe(4)
  })

  it(`sets the caret back in order to prevent it from moving when the change
        has not actually modified the output and the operation is not deletion`, () => {
    expect(
      adjustCaretPosition({
        caretPosition: 11,
        placeholder: convertMaskToPlaceholder([
          '(',
          /\d/,
          /\d/,
          /\d/,
          ')',
          ' ',
          /\d/,
          /\d/,
          /\d/,
          '-',
          /\d/,
          /\d/,
          /\d/,
          /\d/,
        ]),
        previousValue: '(123) ___-____',
        rawValue: '(123) ___-f____',
        value: '(123) ___-____',
      }),
    ).toBe(10)

    expect(
      adjustCaretPosition({
        caretPosition: 12,
        placeholder: convertMaskToPlaceholder(CpfMask),
        previousValue: '429.354.878-__',
        rawValue: '429.354.878-__',
        value: '429.354.878-__',
      }),
    ).toBe(12)
  })

  it(
    'moves the caret to the nearest placeholder character if the previous input and new ' +
      'conformed output are the same but the reverted position is not a ' +
      'placeholder character',
    () => {
      expect(
        adjustCaretPosition({
          caretPosition: 5,
          placeholder: convertMaskToPlaceholder([
            '(',
            /\d/,
            /\d/,
            /\d/,
            ')',
            ' ',
            ' ',
            ' ',
            ' ',
            ' ',
            ' ',
            /\d/,
            /\d/,
            /\d/,
            '-',
            /\d/,
            /\d/,
            /\d/,
            /\d/,
          ]),
          previousValue: '(___)      ___-____',
          rawValue: '(___))      ___-____',
          value: '(___)      ___-____',
        }),
      ).toBe(11)
    },
  )

  it(
    'knows to move the caret back when the previousInput and conformToMaskResults output ' +
      'are identical but the operation is deletion',
    () => {
      expect(
        adjustCaretPosition({
          caretPosition: 4,
          placeholder: convertMaskToPlaceholder([
            '(',
            /\d/,
            /\d/,
            /\d/,
            ')',
            ' ',
            /\d/,
            /\d/,
            /\d/,
            '-',
            /\d/,
            /\d/,
            /\d/,
            /\d/,
          ]),
          previousValue: '(123) ___-____',
          rawValue: '(123 ___-____',
          value: '(123) ___-____',
        }),
      ).toBe(4)

      expect(
        adjustCaretPosition({
          caretPosition: 12,
          placeholder: convertMaskToPlaceholder(CpfMask),
          previousValue: '429.354.878-8_',
          rawValue: '429.354.878-_',
          value: '429.354.878-__',
        }),
      ).toBe(11)
    },
  )

  it(
    'knows to move caret to the next mask area when the last character of the current part ' +
      'has just been filled and the caret is at the end of the mask part',
    () => {
      expect(
        adjustCaretPosition({
          caretPosition: 4,
          placeholder: convertMaskToPlaceholder(['(', /\d/, /\d/, /\d/, ')', ' ', /\d/]),
          previousValue: '(12_) _',
          rawValue: '(123_) _',
          value: '(123) _',
        }),
      ).toBe(6)

      expect(
        adjustCaretPosition({
          caretPosition: 3,
          placeholder: convertMaskToPlaceholder(['(', /\d/, /\d/, /\d/, ')', ' ', /\d/]),
          previousValue: '(12_) 7',
          rawValue: '(132_) 7',
          value: '(132) _',
        }),
      ).toBe(6)
    },
  )

  it(
    'knows to move caret to previous mask part when the first character of current part ' +
      'has just been deleted and the caret is at the beginning of the mask part',
    () => {
      expect(
        adjustCaretPosition({
          caretPosition: 6,
          placeholder: convertMaskToPlaceholder(['(', /\d/, /\d/, /\d/, ')', ' ', /\d/]),
          previousValue: '(124) 3',
          rawValue: '(124) ',
          value: '(124) _',
        }),
      ).toBe(4)

      expect(
        adjustCaretPosition({
          caretPosition: 6,
          placeholder: convertMaskToPlaceholder(['(', /\d/, /\d/, /\d/, ')', ' ', /\d/]),
          previousValue: '(12_) 3',
          rawValue: '(12_) ',
          value: '(12_) _',
        }),
      ).toBe(3)
    },
  )
})
