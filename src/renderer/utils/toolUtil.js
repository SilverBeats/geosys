/**
 * 获取当前时间
 * @param {Boolean} full 
 * @returns 
 */
export function getNow(full = false) {
  if (full)
    return dateFormat("YYYY-mm-dd HH:MM:SS", new Date())

  return dateFormat("YYYY-mm-dd", new Date())
}

function dateFormat(fmt, date) {
  let ret;
  const opt = {
    "Y+": date.getFullYear().toString(),        // 年
    "m+": (date.getMonth() + 1).toString(),     // 月
    "d+": date.getDate().toString(),            // 日
    "H+": date.getHours().toString(),           // 时
    "M+": date.getMinutes().toString(),         // 分
    "S+": date.getSeconds().toString()          // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  };
  for (let k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt);
    if (ret) {
      fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
    };
  };
  return fmt;
}

/**
 * 获取guid
 * @returns 
 */
export function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
/**
 * 保留的小数位数
 * @param {Integer} number
 * @param {Integer} bit 
 */
export function toFixed(number, bit) {
  const temp = Math.pow(10, bit)
  return Math.round(number * temp) / temp
}