import {errorMsg} from  '../utils/tipUtil'
const Sqlite3 = require('sqlite3')
const {
  existsSync,
  mkdirSync,
  writeFileSync
} = require('fs')
const { dirname } = require('path')
/**
 * 底层封装,操作数据库的类
 */
export default class AppDao {
  constructor(dbPath) {
    const dirName = dirname(dbPath)
    if (!existsSync(dirName)) {
      mkdirSync(dirName)
    }
    if (!existsSync(dbPath)) {
      writeFileSync(dbPath, '')
    }
    this.db = new Sqlite3.Database(dbPath, err => {
      if (err) {
        errorMsg(err)
      }
    })
  }
  // 增、删、改
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, (res, err) => {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
    })
  }
  // 查单行
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  }
  // 查多行数据
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }
}
