import AppDao from '../AppDao'
import { writeLog } from '@/utils/logUtil'
import { getNow } from '@/utils/toolUtil'

const tableName = `history_table`

export default class BaseHistoryTable {
  constructor(dbPath) {
    this.dao = new AppDao(dbPath)
  }
  // 创建表
  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      "id" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "des" TEXT,
      "param_list" TEXT,
      "result" REAL,
      "create_time" DATE,
      "delete_time" DATE,
      "is_active" INTEGER DEFAULT 1,
      PRIMARY KEY ("id")
    );
    `
    return this.dao.run(sql)
  }
  // 增加一条历史记录
  insert(obj) {
    return new Promise((resolve, reject) => {
      try {
        const { id, type, des, param_list, result } = obj
        this.dao.run('begin;')
          .then(_ => this.dao.run(`
            insert into ${tableName}(id,type,des,param_list,result,create_time)
            values(?,?,?,?,?,?)
          `, [id, type, des, JSON.stringify(param_list), result, getNow(true)])
          ).then(_ => this.dao.run('commit;'))
          .then(_ => resolve())
      } catch (err) {
        writeLog('insert', err, tableName)
        this.dao.run('rollback;')
          .then(_ => reject(err))
      }
    })
  }
  // 更新数据
  update(obj) {
    return new Promise((resolve, reject) => {
      try {
        const { id, type, des, param_list, result } = obj
        this.dao.run('begin;')
          .then(_ => this.dao.run(`
            update ${tableName}
            set
            'type' = ?,
            'des' = ?,
            'param_list' = ?,
            'result' = ?,
            'create_time' = ?
            where id = ?
          `, [type, des, JSON.stringify(param_list), result, getNow(true), id])
          ).then(_ => this.dao.run('commit;'))
          .then(_ => resolve())
      } catch (err) {
        writeLog('insert', err, tableName)
        this.dao.run('rollback;')
          .then(_ => reject(err))
      }
    })
  }
  // 逻辑删除
  deleteLogicByIds(ids = []) {
    return new Promise((resolve, reject) => {
      try {
        this.dao.run('begin;').then(_ => {
          return Promise.all(ids.map(id => {
            return this.dao.run(`
             update ${tableName} 
             set is_active = 0, 
                 delete_time = ?
             where id = ?
           `, [getNow(true), id])
          }))
        })
          .then(_ => this.dao.run('commit;'))
          .then(_ => resolve())
      } catch (err) {
        writeLog('deleteLogicByIds', err, tableName)
        this.dao.run('rollback;').then(_ => reject(err))
      }

    })
  }
  // 物理删除
  deleteByIds(ids = []) {
    return new Promise((resolve, reject) => {
      try {
        this.dao.run('begin;')
          .then(_ => {
            return Promise.all(ids.map(id => {
              return this.dao.run(`delete from ${tableName} where id = ?`, [id])
            }))
          })
          .then(_ => this.dao.run('commit;'))
          .then(_ => resolve())
      } catch (err) {
        writeLog('insert', err, tableName)
        this.dao.run('rollback;')
          .then(_ => reject(err))
      }
    })
  }
  // 获取符合条件的数据总量
  getTotalNum(active) {
    return new Promise((resolve, reject) => {
      this.dao.get(`select count(1) as 'total' from ${tableName} where is_active = ${active}`)
        .then(res => {
          resolve(res['total'])
        })
        .catch(err => {
          writeLog('getTotalNum', err, tableName)
          reject(err)
        })
    })
  }
  // 分页获取数据
  getRecords(active, page, size) {
    return new Promise((resolve, reject) => {
      // 计算偏移量
      let offset = (page - 1) * size
      this.dao.all(`select * from ${tableName} where is_active = ? limit ?, ?`, [active, offset, size])
        .then(res => {
          resolve(res)
        }).catch(err => {
          writeLog('getRecords', err, tableName)
          reject(err)
        })
    })
  }
  // 数据恢复
  recover(ids = []) {
    return new Promise((resolve, reject) => {
      try {
        this.dao.run(`begin;`).then(_ => {
          return Promise.all(ids.map(id => {
            return this.dao.run(`update ${tableName} set delete_time = '' , is_active = ? where id = ?`, [1, id])
          }))
        })
          .then(_ => this.dao.run('commit;'))
          .then(_ => resolve())
      } catch (err) {
        writeLog('recover', err, tableName)
        this.dao.run('rollback;')
          .then(_ => reject(err))
      }
    })
  }
}