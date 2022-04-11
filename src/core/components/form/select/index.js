import React, { useMemo } from 'react'
import ReactSelect from 'react-select'
import { classNames } from 'core/helpers/misc'

export const Select = ({
  getDisplay,
  getId,
  meta = {},
  selected,
  items,
  onChange,
  placeholder = 'Selecione...',
  noItemMessage = 'Nenhum resultado foi encontrado.',
  loadingMessage = () => 'Carregando...',
  disabled,
  isMulti,
  isLoading,
  isClearable,
  maxMenuHeight,
  styles,
  placement = 'auto',
}) => {
  const selectedById = useMemo(
    () => items.find(i => getId(i) === selected),
    // eslint-disable-next-line
		[items, selected],
  )

  const hasError = meta.touched && !!meta.error

  return (
    <div
      className={classNames({
        'is-invalid': hasError,
      })}
    >
      <ReactSelect
        styles={styles}
        isClearable={isClearable}
        isLoading={isLoading}
        isMulti={isMulti}
        closeMenuOnSelect={isMulti}
        classNamePrefix="react-select"
        maxMenuHeight={maxMenuHeight}
        loadingMessage={loadingMessage}
        noOptionsMessage={() => noItemMessage}
        placeholder={placeholder}
        isDisabled={disabled}
        options={items}
        getOptionLabel={getDisplay}
        getOptionValue={getId}
        menuPlacement={placement}
        value={selectedById || selected}
        onChange={v => {
          if (onChange) {
            onChange(isMulti && !v ? [] : v)
          }
        }}
      />

      {hasError && <div className="form-text text-danger">{meta.error}</div>}
    </div>
  )
}
