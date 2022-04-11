import React from 'react'
import { classNames } from 'core/helpers/misc'

export const ReadOnlyInput = ({ value, icon }) => (
  <div className={classNames({ 'kt-input-icon kt-input-icon--left': !!icon })}>
    <input readOnly className="form-control" value={value} />

    {icon && (
      <span className="icon is-small is-left">
        <i className={icon} />
      </span>
    )}
  </div>
)
