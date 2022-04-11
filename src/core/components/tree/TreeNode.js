import React, { useRef, useEffect } from 'react'
import { classNames } from 'core/helpers/misc'

const TreeNode = ({
  id,
  className,
  disabled,
  isParent,
  expanded = false,
  checked = 0,
  description,
  children,
  onAdd,
  onEdit,
  onDisable,
  onExpand,
}) => {
  const checkboxRef = useRef(null)
  const nodeClass = classNames(
    'rct-node',
    {
      'rct-node-leaf': !isParent,
      'rct-node-parent': isParent,
      'rct-node-expanded': isParent && expanded,
      'rct-node-collapsed': isParent && !expanded,
      'rct-disabled': disabled,
    },
    className,
  )

  const inputId = `tree-${id}`

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = checked === 2
    }
  })

  return (
    <li className={nodeClass}>
      <div className="row rct-group">
        <div>
          {isParent ? (
            <button
              type="button"
              className="rct-collapse rct-collapse-btn"
              onClick={() => onExpand({ id, expanded: !expanded })}
              title="Alternar"
            >
              <i className={`fas fa-chevron-${expanded ? 'down' : 'right'}`} />
            </button>
          ) : (
            <span className="rct-collapse">
              <span className="rct-icon" />
            </span>
          )}
        </div>
        <div className="col-lg">
          <label htmlFor={inputId} title={description}>
            <span className="rct-title" onClick={() => onEdit()}>
              {description}
            </span>
          </label>
        </div>
        {isParent && (
          <div>
            <span className="kt-portlet__head-icon">
              <i className="kt-font-brand fas fa-plus pd10" onClick={() => onAdd()} />
            </span>
          </div>
        )}
        <div>
          <span className="kt-portlet__head-icon">
            <i
              className={classNames('pd10', {
                'fas fa-lock': !disabled,
                'kt-font-danger': !disabled,
                'fas fa-unlock': disabled,
                'kt-font-success': disabled,
              })}
              onClick={() => onDisable()}
            />
          </span>
        </div>
      </div>

      {expanded && children}
    </li>
  )
}

export default TreeNode
