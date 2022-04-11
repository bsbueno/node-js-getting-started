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
        isParent: node.isGroup,
        disabled: disabled || node.disabled || parent.disabled,
      },
      ...flattenNodes(node.children, disabled, node),
    ],
    [],
  )
}

function renderTreeNodes(props) {
  const { nodes, flatNodes, setFlatNodes, parent = {}, onAdd, onEdit, onDisable } = props

  const elements = nodes
    ? nodes.map(node => {
        const flatNode = flatNodes.find(n => n.id === node.id)
        if (flatNode) {
          const parentNode = flatNodes.find(n => n.id === parent.id)
          const children = flatNode.isParent
            ? renderTreeNodes({
                ...props,
                nodes: node.children,
                parent: node,
                onAdd,
                onEdit,
                onDisable,
              })
            : null

          const parentExpanded = parent.id ? parentNode.expanded : true

          if (!parentExpanded) {
            return null
          }

          return (
            <TreeNode
              key={node.id}
              id={node.id}
              className={node.className}
              disabled={node.disabledAt}
              expanded={flatNode.expanded}
              label={node.description}
              isParent={flatNode.isParent}
              description={`${node.code} - ${node.description}`}
              treeId="tree"
              onAdd={() => onAdd(node)}
              onEdit={() => onEdit(node.id)}
              onDisable={() => onDisable(node)}
              onExpand={({ id, expanded }) =>
                setFlatNodes(prev => prev.map(p => (p.id === id ? { ...p, expanded } : p)))
              }
            >
              {children}
            </TreeNode>
          )
        }
        return <h1>Teste</h1>
      })
    : []

  return <ol>{elements}</ol>
}

const Tree = ({ disabled, nodes, onAdd, onEdit, onDisable }) => {
  const [flatNodes, setFlatNodes] = useState(flattenNodes(nodes, disabled))
  const treeNodes = renderTreeNodes({ nodes, flatNodes, setFlatNodes, onAdd, onEdit, onDisable })

  useEffect(() => {
    setFlatNodes(flattenNodes(nodes, disabled))
  }, [nodes, disabled])

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

export default Tree
