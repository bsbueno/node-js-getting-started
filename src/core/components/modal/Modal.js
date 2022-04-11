import React from 'react'
import { Transition } from 'react-transition-group'
import { Button } from 'core/components/button'
import { Field } from 'core/components/form/field'
import { TextInput } from 'core/components/form/text-input'
import { classNames } from 'core/helpers/misc'
import { ModalPortal } from './ModalPortal'

const closeModal = (action, setModal) =>
  setModal(prev => {
    const { alert, prompt, confirm } = prev
    const { onClose } = alert
    const { onSend } = prompt
    const { onAct } = confirm

    if (alert.opened && onClose) {
      onClose()
    } else if (prompt.opened && action !== 'close' && onSend) {
      onSend(prompt.value)
    } else if (confirm.opened && onAct) {
      onAct(action === 'submit')
    }

    return {
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
    }
  })

const renderAlert = (message, setModal) => (
  <div className="modal-content">
    <div className="modal-header">
      <h5 className="modal-title">Alerta</h5>

      <Button
        type="button"
        className="close"
        aria-label="close"
        data-dismiss="modal"
        onClick={() => closeModal('close', setModal)}
      />
    </div>
    <div className="modal-body">
      <p>{message}</p>
    </div>
    <div className="modal-footer">
      <Button
        customClassName="btn-primary"
        title="Ok"
        onClick={() => closeModal('submit', setModal)}
      />
    </div>
  </div>
)

const renderConfirm = (message, setModal) => (
  <div className="modal-content">
    <div className="modal-header">
      <h5 className="modal-title">Atenção</h5>

      <Button
        type="button"
        className="close"
        aria-label="close"
        data-dismiss="modal"
        onClick={() => closeModal('close', setModal)}
      />
    </div>
    <div className="modal-body">
      <p>{message}</p>
    </div>
    <div className="modal-footer">
      <Button
        customClassName="btn-primary"
        title="Sim"
        icon="fas fa-check"
        onClick={() => closeModal('submit', setModal)}
      />

      <Button
        customClassName="btn-danger"
        title="Não"
        icon="fas fa-times"
        onClick={() => closeModal('cancel', setModal)}
      />
    </div>
  </div>
)

const renderPrompt = (prompt, setModal) => (
  <div className="modal-content">
    <div className="modal-header">
      <h5 className="modal-title">{prompt.title}</h5>

      <Button
        type="button"
        className="close"
        aria-label="close"
        data-dismiss="modal"
        onClick={() => closeModal('close', setModal)}
      />
    </div>
    <div className="modal-body">
      <Field label={prompt.message}>
        <TextInput
          placeholder="Digite..."
          type={prompt.type}
          value={prompt.value}
          onChange={value =>
            setModal(prev => ({
              ...prev,
              prompt: {
                ...prev.prompt,
                value,
              },
            }))
          }
        />
      </Field>
    </div>
    <div className="modal-footer">
      <Button
        type="button"
        customClassName="btn-secondary"
        icon="fas fa-arrow-left"
        title="Voltar"
        onClick={() => closeModal('close', setModal)}
      />

      <Button
        customClassName="btn-primary"
        icon="fas fa-check"
        title="Enviar"
        onClick={() => closeModal('submit', setModal)}
      />
    </div>
  </div>
)

export const Modal = React.memo(({ alert, prompt, confirm, setModal }) => {
  const show = alert.opened || prompt.opened || confirm.opened

  return (
    <ModalPortal>
      <Transition in={show} timeout={300}>
        {status => (
          <>
            <div
              className={classNames('modal fade', {
                show: status === 'entered',
              })}
              style={{
                display: status === 'exited' ? 'none' : 'block',
              }}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
            >
              <div className="modal-dialog modal-dialog-centered" role="document">
                {alert.opened && renderAlert(alert.message, setModal)}
                {confirm.opened && renderConfirm(confirm.message, setModal)}
                {prompt.opened && renderPrompt(prompt, setModal)}
              </div>
            </div>

            {status !== 'exited' && (
              <div
                className={classNames('modal-backdrop fade', {
                  show: status === 'entered',
                })}
              />
            )}
          </>
        )}
      </Transition>
    </ModalPortal>
  )
})
