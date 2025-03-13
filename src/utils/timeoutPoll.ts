import { ref } from "vue"
type option<F extends (...args: any) => Promise<any>> = {
  interval?: number
  immediate?: boolean
  fnParams?: Parameters<F>
}

export function useTimeoutPoll<F extends (...args: any) => Promise<any>>(
  fn: F,
  option = {} as option<F>,
) {
  const data = ref<Awaited<ReturnType<F>>>()
  const isActive = ref<boolean>(false)
  const hasInvoked = ref<boolean>(false)
  let stopTime = -1

  const { interval = 1000, immediate = false, fnParams } = option

  function sleep() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("")
      }, interval)
    })
  }

  async function pollFn() {
    if (!isActive.value) return
    if (immediate && !hasInvoked.value) {
      data.value = await fn(fnParams)
      hasInvoked.value = true
    }
    await sleep()
    const now = Date.now()
    if (stopTime > 0 && now > stopTime) {
      console.log("停止时间过了，不需要执行")
      return
    }
    data.value = await fn(fnParams)
    pollFn()
  }

  async function resume() {
    if (isActive.value) return
    isActive.value = true
    stopTime = -1
    await pollFn()
  }

  function pause() {
    if (!isActive.value) return
    stopTime = Date.now()
    isActive.value = false
  }

  return {
    data,
    resume,
    pause,
    isActive,
  }
}
