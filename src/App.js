import React, { useState, useEffect } from 'react'
import { localStore } from 'core/helpers/store'
import { config } from 'config'
import { getUnities } from 'service'
import { Modal } from 'core/components/modal'

export const App = ({ children }) => {
  const [unities, setUnities] = useState([])
  const [loading, setLoading] = useState(true)
  const [operator, setOperator] = useState({})
  const [modal, setModal] = useState({
    alert: {
      message: '',
      opened: false,
    },
    confirm: {
      message: '',
      opened: false,
    },
    prompt: {
      message: '',
      opened: false,
      title: '',
      value: '',
    },
  })

  const childrenFn = Array.isArray(children) ? children[0] : children
  const modalActions = {
    alert: (message, onClose) => {
      setModal(prev => ({
        ...prev,
        alert: { opened: true, message, onClose },
      }))
    },
    confirm: (message, onAct) => {
      setModal(prev => ({
        ...prev,
        confirm: { opened: true, message, onAct },
      }))
    },
    prompt: (title, message, onSend, type = 'text') => {
      setModal(prev => ({
        ...prev,
        prompt: {
          ...prev.prompt,
          message,
          onSend,
          opened: true,
          title,
          type,
        },
      }))
    },
  }

  async function refresh(refreshUnities) {
    setLoading(true)

    getUnities(refreshUnities)
      .then(setUnities)
      .catch(err => modalActions.alert(err.message))
      .finally(() => {
        setOperator(localStore.get(config.OPERATOR_KEY) || {})
        setLoading(false)
      })
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line
	}, [])

  return (
    <>
      {childrenFn({ unities, loading, operator, modal: modalActions, refresh })}
      <Modal
        alert={modal.alert}
        prompt={modal.prompt}
        confirm={modal.confirm}
        setModal={setModal}
      />
    </>
  )
}
