import { h, render } from "vue"
import type { CSSProperties, Component } from "vue"

interface Config {
  context: string
}

type ExtractProps<C> = C extends new (...arg: any) => {
  $props: infer P
}
  ? P
  : never

export function useModal(config = {} as Config) {
  const { context = "body" } = config
  const targetContextEl = document.querySelector(context)
  const mask = document.createElement("div")
  let subContainer: HTMLDivElement | null = null
  const maskStyle: CSSProperties = {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.3)",
    position: "absolute",
    zIndex: 100,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }
  Object.assign(mask.style, maskStyle)

  function showModal<T extends Component>(C: T, props = {} as ExtractProps<T>) {
    if (!C) return
    subContainer = document.createElement("div")
    subContainer.id = "#厕所"
    const vm = h(C, { ...(props as object), onCancel: closeModal })
    render(vm, subContainer)
    console.dir("subContainer", subContainer)
    mask.appendChild(subContainer)
    mask.addEventListener("click", closeModal)
    document.addEventListener("keydown", bindKeyboard)
    targetContextEl.insertBefore(mask, targetContextEl.firstChild)
  }

  function closeModal() {
    if (!mask || !subContainer) return
    document.removeEventListener("keydown", bindKeyboard)
    render(null, subContainer)
    mask.remove()
    mask.innerHTML = ""
  }

  function bindKeyboard(e: KeyboardEvent) {
    console.log("exx", e)
    if (e.key === "Escape") {
      closeModal()
    }
  }

  return { showModal, closeModal }
}
