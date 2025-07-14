import { useToast } from "vue-toastification";


export const toastSuccess = (message: string, config?: object) => {
    return useToast().success(message, config)
}

export const toastInfo = (message: string, config?: object) => {
    return useToast().info(message, config)
}

export const toastWarning = (message: string, config?: object) => {
    return useToast().warning(message, config)
}

export const toastError = (message: string, config?: object) => {
    return useToast().error(message, config)
}