import React, { useMemo } from 'react'
import Select from 'react-select'
import { classNames } from 'core/helpers/misc'

export const UnitySelect = ({
  global: { unities, loading },
  clearable,
  unity,
  styles,
  meta = {},
  onChange,
}) => {
  const optionsUnities = useMemo(
    () =>
      unities.map(item => ({
        label: item.description,
        value: item.id,
      })),
    [unities],
  )

  const hasError = meta.touched && !!meta.error

  return (
    <div
      className={classNames({
        'is-invalid': hasError,
      })}
    >
      <Select
        styles={styles}
        isClearable={clearable}
        classNamePrefix="react-select"
        value={unity ? { label: unity.description, value: unity.id } : null}
        onChange={ent => onChange(ent ? unities.find(c => c.id === ent.value) : null)}
        options={optionsUnities}
        isLoading={loading}
        isDisabled={loading}
        placeholder="Selecione uma unidade..."
        loadingMessage={() => 'Carregando...'}
        noOptionsMessage={e => `Nenhuma unidade encontrada por '${e.inputValue}'.`}
      />

      {hasError && <div className="form-text text-danger">{meta.error}</div>}
    </div>
  )
}
