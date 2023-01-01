/**
 *
 * @param fn
 * @param interval 时间间隔
 * @param immediately 是否第一次马上执行，默认为 true
 */
export function throttle(
  fn: Function,
  interval: number = 1000,
  immediately = true,
) {
  let CD: boolean = false
  return function () {
    if (immediately) {
      fn()
      immediately = false
      return
    }
    if (CD) {
      return
    }
    CD = true
    setTimeout(() => {
      fn()
      CD = false
    }, interval)
  }
}
