import React, { useRef, useEffect } from 'react'
import { classNames } from 'core/helpers/misc'

const getCheckboxIcon = checked => {
  switch (checked) {
    case 1:
      return <i className="far fa-check-square" />
    case 2:
      return <i className="fas fa-square" />
    default:
      return <i className="far fa-square" />
  }
}

const TreeNode = ({
  id,
  className,
  disabled,
  isParent,
  expanded = false,
  checked = 0,
  title,
  children,
  onCheck,
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
      <span className="rct-text">
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

        <label htmlFor={inputId} title={title}>
          <input
            id={inputId}
            type="checkbox"
            checked={checked === 1}
            disabled={disabled}
            onChange={({ target }) => onCheck({ id, checked: target.checked })}
          />

          <span className="rct-checkbox">{getCheckboxIcon(checked)}</span>
          <span className="rct-title">{title}</span>
        </label>
      </span>

      {expanded && children}
    </li>
  )
}

export default TreeNode
