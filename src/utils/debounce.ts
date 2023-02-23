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
  return function (this: any, ...arg: any) {
    if (timerID < 0 && immediately) {
      fn.apply(this, arg)
      timerID = 1
      return
    }
    if (timerID > 0) {
      clearTimeout(timerID)
    }
    timerID = window.setTimeout(() => {
      console.log("arg", arg)
      fn.apply(this, arg)
    }, delay)
  }
}
