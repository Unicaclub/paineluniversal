import { toast as sonnerToast } from "sonner"

type ToastProps = {
  title?: string
  message?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

const toast = (props: ToastProps) => {
  if (props.action) {
    sonnerToast(props.title || props.message, {
      description: props.description || props.message,
      action: props.action,
    })
  } else {
    sonnerToast(props.title || props.message, {
      description: props.description || props.message,
    })
  }
}

const useToast = () => {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
  }
}

export { useToast, toast, type ToastProps }
