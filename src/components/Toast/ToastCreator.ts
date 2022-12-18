//toast 使用方法
//1.在别的vue组件内 import ToastCreator from "@/component/toast/toast.ts"
//2.const toast = new ToastCreator([,options]),
//3.必须添加一个配置对象 {message:"string",duration?:number,position?:string}
//4.然后调用toast.present()方法即可
//5.一般必填 message 选项,如果不填写duration和position,则采用默认值1500ms,和底部

import { h, render } from "vue"
import Toast from "./Toast.vue"

interface ToastOptions {
  message?: string
  position?: "top" | "middle" | "bottom"
  duration?: number
}

//默认的选项
const DEFAULT_TOAST_OPTIONS: ToastOptions = {
  message: "你好像还没输入哦",
  position: "middle",
  duration: 1500,
}

export class ToastCreator {
  options: ToastOptions
  container: HTMLElement
  constructor(options: ToastOptions) {
    this.options = options
    this.container = document.createElement("div")
  }

  present() {
    const toast = h(h(Toast), { ...DEFAULT_TOAST_OPTIONS, ...this.options })
    render(toast, this.container)
    document.body.insertBefore(this.container, document.body.firstChild)
    const durationTime = this.options.duration || DEFAULT_TOAST_OPTIONS.duration
    setTimeout(() => {
      this.dismiss()
    }, durationTime)
  }

  dismiss() {
    if (this.container) {
      const toastWrapperDOM = this.container.querySelector("#toastWrapper")
      toastWrapperDOM?.classList.add("animate-toastAnimation")
      setTimeout(() => {
        render(null, this.container)
        document.body.removeChild(this.container)
      }, 500)
    }
  }
}
