import { createLocation } from 'history'
import React from 'react'
import { history } from 'core/helpers/history'

function handleClick(ev, onClick) {
  if (!!onClick && typeof onClick !== 'string') {
    ev.preventDefault()
    onClick(ev.target)
  }
}

const isModifiedEvent = event =>
  !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)

const drag = (ev, scheduling) => ev.dataTransfer.setData('text/plain', JSON.stringify(scheduling))
const drop = (ev, modal, draggable, onDrop) => {
  ev.preventDefault()
  const data = ev.dataTransfer.getData('text/plain')
  if (draggable) {
    modal.alert('Horário ocupado para este Profissional de Saúde!')
  } else {
    onDrop(data)
  }
}

export const SchedulingCard = ({
  to,
  children,
  target,
  className,
  onClick,
  draggable,
  scheduling,
  modal,
  onDrop,
}) => {
  const isExternal = to && to.match('https?://')
  const href = isExternal
    ? to
    : history.createHref(createLocation(to, null, undefined, history.location))

  return (
    <a
      className={className}
      target={target}
      onClick={async event => {
        if (
          !event.defaultPrevented && // onClick prevented default
          event.button === 0 && // ignore everything but left clicks
          !target && // let browser handle "target=_blank" etc.
          !isModifiedEvent(event) &&
          !isExternal
        ) {
          event.preventDefault()
          await handleClick(event, onClick)
        }
      }}
      href={href}
      draggable={draggable}
      onDragOver={event => event.preventDefault()}
      onDrop={event => drop(event, modal, draggable, onDrop)}
      onDragStart={event => drag(event, scheduling)}
    >
      {children}
    </a>
  )
}
