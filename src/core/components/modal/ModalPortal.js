import { createPortal } from 'react-dom'
import { usePortal } from 'core/hooks/portal'

export const ModalPortal = ({ children }) => {
  const target = usePortal('modal')
  return createPortal(children, target)
}
