// 日志输出工具
import { getNow } from './toolUtil'
const {
  writeFileSync,
  existsSync,
  mkdirSync
} = require('fs')

/**
 * 日志的文件名是当前时间
 * 将内容写入到文件
 * @param {String} content 内容
 * @param {String} table 哪个表
 */
export function writeLog(fun, error, table) {
  // 检查是否存在该目录
  if (!existsSync('logs')) {
    mkdirSync('logs')
  }
  let fileName = getNow()
  // 同一天发生的error会写入同一个日志文件中
  writeFileSync(`logs/${table}-Error@${fileName}.txt`, `函数${fun}:${error}\n`, { flag: 'a' })
}

