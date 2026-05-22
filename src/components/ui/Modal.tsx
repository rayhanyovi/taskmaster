import type { PropsWithChildren } from 'react'
import { Dialog, DialogContent, DialogTitle } from './Dialog'

interface ModalProps extends PropsWithChildren {
  open: boolean
  title: string
  onClose: () => void
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle className="sr-only">{title}</DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  )
}
