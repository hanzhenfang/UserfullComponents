export function formatBytes(bytes: any, decimals: number) {
  if (bytes <= 0 || bytes === undefined) return "0 B"
  const flag = Object.prototype.toString.call(bytes) === "[object String]"
  if (flag) bytes = bytes.toString()
  let k = 1024,
    dm = decimals || 2,
    sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}
