import React, { useEffect } from 'react'
import { Transition } from 'react-transition-group'
import { classNames } from 'core/helpers/misc'
import { Button } from 'core/components/button'
import { ModalPortal } from './ModalPortal'

export const ModalForm = ({
  children,
  show,
  title,
  fetching,
  submitting,
  submitText = 'Salvar',
  submitIcon = 'fas fa-save',
  isLarge,
  isXLarge,
  onSubmit,
  closeAction,
  hideButton = false,
  resetForm = () => {},
}) => {
  useEffect(() => {
    if (!show) setTimeout(resetForm, 300)
    // eslint-disable-next-line
	}, [show])

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
              <div
                role="document"
                className={classNames('modal-dialog modal-dialog-centered', {
                  'modal-lg': isLarge,
                  'modal-xl': isXLarge,
                })}
              >
                <div className="modal-content">
                  <form
                    onSubmit={ev => {
                      ev.preventDefault()
                      if (onSubmit) onSubmit(ev)
                    }}
                  >
                    <div className="modal-header">
                      <h5 className="modal-title">{title}</h5>

                      <Button
                        type="button"
                        className="close"
                        aria-label="close"
                        data-dismiss="modal"
                        onClick={closeAction}
                      />
                    </div>
                    <div className="modal-body">
                      {fetching ? (
                        <div className="spinner">
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          />
                          <span>Carregando...</span>
                        </div>
                      ) : (
                        children
                      )}
                    </div>

                    <div className="modal-footer">
                      <Button
                        type="button"
                        customClassName="btn-secondary"
                        icon="fas fa-arrow-left"
                        title="Voltar"
                        onClick={closeAction}
                      />

                      {!hideButton && !fetching && (
                        <Button
                          customClassName="btn-primary"
                          title={submitText}
                          icon={submitIcon}
                          disabled={submitting}
                          loading={submitting}
                        />
                      )}
                    </div>
                  </form>
                </div>
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
}
