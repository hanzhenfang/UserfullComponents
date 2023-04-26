// tips: 接收一个秒为单位的数字
// => 返回一个 00:00:00 格式的时间戳
export function formattingTime(count: number) {
  let time = "00:00:00"
  let second = Math.trunc(count % 60)
  let minute = Math.trunc(Math.trunc(count) / 60) % 60
  let _second = second > 9 ? second : `0${second}`
  let _minute = minute > 9 ? minute : `0${minute}`
  time = `00:${_second}`
  if (minute >= 1) {
    time = `${_minute}:${_second}`
  }
  const hour = Math.trunc(Math.trunc(count / 60) / 60) % 24
  if (hour >= 1) {
    const _hour = hour > 9 ? hour : `0${hour}`
    time = `${_hour}:${_minute}:${_second}`
  }
  return time
}
