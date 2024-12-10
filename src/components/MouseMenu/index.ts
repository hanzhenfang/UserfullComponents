import { ref, h, render, Component } from "vue"

type ExtractProps<ComponentType> = ComponentType extends new (...arg: any) => {
  $props: infer P
}
  ? P
  : never

type ClickType = 0 | 1 | 2

interface MemuPayload {
  x?: number
  y?: number
}

export function useContextMemu(clickType: ClickType = 1) {
  const isShow = ref<boolean>(false)
  const wrapper = document.createElement("div")
  wrapper.style.position = "absolute"
  wrapper.style.zIndex = "99999"

  function createMemu<T extends Component>(
    e: MouseEvent,
    C: T,
    props?: ExtractProps<T>,
    payload: MemuPayload = {},
  ) {
    if (clickType === 1) {
      e.preventDefault()
      e.stopPropagation()
      const el = e.target as HTMLDivElement
      const rect = el.getBoundingClientRect()
      const Y = rect.y
      const X = rect.x
      const { x = 0, y = 0 } = payload
      wrapper.style.top = Y + y + "px"
      wrapper.style.left = X + x + "px"
      const vm = h(C, props)
      render(vm, wrapper)
      document.body.appendChild(wrapper)
      isShow.value = true
    }
  }

  function closeMemu() {
    if (!wrapper) return
    wrapper.remove()
    isShow.value = false
  }

  return {
    isShow,
    createMemu,
    closeMemu,
  }
}
