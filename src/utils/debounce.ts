/**
 *
 * @param fn 要被防抖的函数
 * @param delay  防抖的延迟时间
 * @param immediately 第一次的时候是否立即执行,默认为 true
 */

export function debounce(
  fn: Function,
  delay: number = 1000,
  immediately: boolean = true,
) {
  let timerID: number = -1
  return function () {
    if (immediately) {
      fn()
      immediately = false
      return
    }
    if (timerID > 0) {
      clearTimeout(timerID)
    }
    timerID = window.setTimeout(() => {
      fn()
    }, delay)
  }
}
