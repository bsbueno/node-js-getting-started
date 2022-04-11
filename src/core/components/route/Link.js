import { createLocation } from 'history'
import React from 'react'
import { history } from 'core/helpers/history'

const isModifiedEvent = event =>
  !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)

export const Link = ({ to, children, target, className, routeParams = {} }) => {
  const isExternal = to && to.match('https?://')
  const href = isExternal
    ? to
    : history.createHref(createLocation(to, null, undefined, history.location))

  return (
    <a
      className={className}
      target={target}
      onClick={event => {
        if (
          !event.defaultPrevented && // onClick prevented default
          event.button === 0 && // ignore everything but left clicks
          !target && // let browser handle "target=_blank" etc.
          !isModifiedEvent(event) &&
          !isExternal
        ) {
          event.preventDefault()
          history.push(to, routeParams)
        }
      }}
      href={href}
    >
      {children}
    </a>
  )
}
