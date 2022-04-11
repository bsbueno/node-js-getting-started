import React, { useRef, useState } from 'react'
import { useOnClickOutside } from 'core/hooks/clickOutside'
import { classNames } from 'core/helpers/misc'
import { history } from 'core/helpers/history'
import { Button } from 'core/components/button'

export const ActionsList = ({ actions, entity, primaryKey, forceRefresh }) => {
  const ref = useRef(null)
  const [opened, setOpened] = useState(false)

  useOnClickOutside(ref, () => setOpened(false))

  return (
    <div
      ref={ref}
      className={classNames('dropdown table-drop', {
        show: opened,
      })}
    >
      <button
        type="button"
        data-toggle="dropdown"
        className="btn btn-sm btn-clean btn-icon btn-icon-sm"
        title="Ações"
        onClick={() => setOpened(true)}
      >
        <i className="fas fa-cog" />
      </button>
      <div
        className={classNames('dropdown-menu dropdown-menu-right', {
          show: opened,
        })}
      >
        {actions
          .filter(({ hideWhen = () => false }) => !hideWhen(entity))
          .map(a => (
            <Button
              key={`${a.icon}-${a.title}`}
              className="dropdown-item"
              title={a.title}
              icon={a.icon}
              onClick={() => {
                setOpened(false)
                if (typeof a.action === 'string') {
                  history.push(a.action.replace(':id', `${entity[primaryKey]}`))
                  return
                }

                a.action({ entity, forceRefresh })
              }}
            />
          ))}
      </div>
    </div>
  )
}
