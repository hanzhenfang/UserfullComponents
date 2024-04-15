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

/**
 *
 * @param number
 * @returns "xx小时xx分钟xx秒"
 */
export function formatSeconds(value: number) {
  let theTime = value // 需要转换的时间秒
  let theTime1 = 0 // 分
  let theTime2 = 0 // 小时
  let theTime3 = 0 // 天
  if (theTime > 60) {
    theTime1 = parseInt(theTime / 60 + "")
    theTime = parseInt((theTime % 60) + "")
    if (theTime1 > 60) {
      theTime2 = parseInt(theTime1 / 60 + "")
      theTime1 = parseInt((theTime1 % 60) + "")
      if (theTime2 > 24) {
        //大于24小时
        theTime3 = parseInt(theTime2 / 24 + "")
        theTime2 = parseInt((theTime2 % 24) + "")
      }
    }
  }
  let result = ""
  if (theTime > 0) {
    result = "" + parseInt(theTime + "") + "秒"
  }
  if (theTime1 > 0) {
    result = "" + parseInt(theTime1 + "") + "分" + result
  }
  if (theTime2 > 0) {
    result = "" + parseInt(theTime2 + "") + "小时" + result
  }
  if (theTime3 > 0) {
    result = "" + parseInt(theTime3 + "") + "天" + result
  }
  return result
}
