import React, { useState, useEffect } from 'react'

import { classNames } from 'core/helpers/misc'
import TreeNode from './TreeNode'

function flattenNodes(nodes, disabled, parent = {}) {
  if (!Array.isArray(nodes) || nodes.length === 0) {
    return []
  }

  return nodes.reduce(
    (flatNodes, node) => [
      ...flatNodes,
      {
        ...node,
        isParent: Array.isArray(node.children) && node.children.length > 0,
        disabled: disabled || node.disabled || parent.disabled,
      },
      ...flattenNodes(node.children, disabled, node),
    ],
    [],
  )
}

function handleCheck({ item, flatNodes, checked, onCheck }) {
  const node = flatNodes.find(fn => fn.id === item.id)

  if (checked.includes(node.parentId)) {
    const subIds = flatNodes.filter(fn => fn.parentId === node.parentId).map(c => c.id)
    const newChecked = checked.filter(c => c !== node.parentId)
    const newItems = [...newChecked, ...subIds]

    onCheck(item.checked ? newItems : newItems.filter(c => c !== item.id))
  } else {
    const subIds = flatNodes.filter(fn => fn.parentId === item.id).map(c => c.id)
    const newChecked = checked.filter(c => !subIds.includes(c))
    const newItems = item.checked ? [...newChecked, item.id] : newChecked.filter(c => c !== item.id)

    onCheck(newItems)
  }
}

function renderTreeNodes(props) {
  const { nodes, onCheck, flatNodes, checked = [], setFlatNodes, parent = {} } = props

  const elements = nodes.map(node => {
    const flatNode = flatNodes.find(n => n.id === node.id)
    const parentNode = flatNodes.find(n => n.id === parent.id)
    const children = flatNode.isParent
      ? renderTreeNodes({ ...props, nodes: node.children, parent: node })
      : null

    const parentExpanded = parent.id ? parentNode.expanded : true

    let checkedNode = checked.includes(node.id) ? 1 : 0

    if (flatNode.isParent && !checkedNode && node.children.some(n => checked.includes(n.id))) {
      checkedNode = 2
    }

    if (
      parent.id &&
      !checkedNode &&
      (checked.includes(parent.id) || checked.includes(parent.parentId))
    ) {
      checkedNode = 1
    }

    if (!parentExpanded) {
      return null
    }

    return (
      <TreeNode
        key={node.id}
        id={node.id}
        checked={checkedNode}
        className={node.className}
        disabled={flatNode.disabled}
        expanded={flatNode.expanded}
        label={node.title}
        isParent={flatNode.isParent}
        title={node.title}
        treeId="tree"
        onCheck={item => handleCheck({ item, flatNodes, checked, onCheck })}
        onExpand={({ id, expanded }) =>
          setFlatNodes(prev => prev.map(p => (p.id === id ? { ...p, expanded } : p)))
        }
      >
        {children}
      </TreeNode>
    )
  })

  return <ol>{elements}</ol>
}

const CheckboxTree = ({ disabled, onCheck, checked, nodes }) => {
  const [flatNodes, setFlatNodes] = useState(flattenNodes(nodes, disabled))
  const treeNodes = renderTreeNodes({ nodes, onCheck, checked, flatNodes, setFlatNodes })

  useEffect(() => {
    setFlatNodes(flattenNodes(nodes, disabled))
  }, [nodes, disabled])

  useEffect(() => {
    nodes.forEach(node => {
      const { children, id } = node
      const item = { id, checked: true }

      if (children && children.every(c => checked.includes(c.id))) {
        handleCheck({ item, flatNodes, checked, onCheck })
      }

      if (children)
        children.forEach(subNode => {
          if (subNode.children && subNode.children.every(c => checked.includes(c.id))) {
            handleCheck({
              item: { id: subNode.id, checked: true },
              flatNodes,
              checked,
              onCheck,
            })
          }
        })
    })
    // eslint-disable-next-line
  }, [checked])

  return (
    <div
      className={classNames('react-checkbox-tree', {
        'rct-disabled': disabled,
      })}
    >
      {treeNodes}
    </div>
  )
}

export default CheckboxTree
