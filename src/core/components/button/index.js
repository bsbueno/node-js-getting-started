/* eslint-disable react/button-has-type */
import React from 'react'
import { classNames } from 'core/helpers/misc'
import { Link } from 'core/components/route'

function handleClick(ev, onClick) {
  if (!!onClick && typeof onClick !== 'string') {
    ev.preventDefault()
    onClick(ev.target)
  }
}

function renderContent(loading, title, icon, children) {
  if (loading) {
    return (
      <>
        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
        <span className="sr-only">Carregando...</span>
      </>
    )
  }

  return (
    <>
      {!!icon && <i className={icon} aria-hidden="true" />}
      {!!title && <span>{title}</span>}
      {!!children && children}
    </>
  )
}

export const Button = ({
  type = 'submit',
  loading = false,
  onClick,
  customClassName,
  icon,
  title,
  className = 'btn',
  disabled,
  children,
}) => {
  const buttonClassName = classNames(className, customClassName)

  return typeof onClick === 'string' ? (
    <Link className={buttonClassName} to={onClick}>
      {renderContent(loading, title, icon)}
    </Link>
  ) : (
    <button
      type={type}
      disabled={disabled}
      className={buttonClassName}
      onClick={ev => handleClick(ev, onClick)}
    >
      {renderContent(loading, title, icon, children)}
    </button>
  )
}
