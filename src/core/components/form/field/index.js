import React from 'react'
import { classNames } from 'core/helpers/misc'

export const Field = ({ label, className, children }) => (
  <div className={classNames('form-group', className)}>
    {label && <label className="label">{label}</label>}
    {label === '' && <label className="label">&nbsp;</label>}
    {children}
  </div>
)
