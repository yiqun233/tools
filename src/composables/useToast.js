import { ref } from 'vue'

const toasts = ref([])
let nextId = 0

export const useToast = () => {
  const show = (message, type = 'success', duration = 3000) => {
    const id = nextId++
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }

  return {
    toasts,
    success: (msg) => show(msg, 'success', 3000),
    error: (msg) => show(msg, 'error', 4000),
    warning: (msg) => show(msg, 'warning', 3500),
    info: (msg) => show(msg, 'info', 3000),
  }
}
