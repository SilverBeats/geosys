import MyError from '../pojo/MyError'
/**
 * 获取参数
 * @returns 
 */
export function initParamData(gid, param) {
  return new Promise((resolve, reject) => {
    param.getByGid(gid)
      .then(data => {
        let obj = {}
        // 首次遍历,将parent=-1的值添加进obj中
        for (let row of data) {
          if (row['parent'] == -1) {
            row.children = []
            obj[row['id']] = row
          }
        }
        // 第二次遍历,将其子参数添加进其对应的父参数中
        for (let row of data) {
          if (row['parent'] != -1) {
            obj[row['parent']].children.push(row)
          }
        }
        resolve(Object.values(obj))
      })
      .catch(err => {
        reject(new MyError(err, '获取参数失败，请刷新重试'))
      })
  })
}

/**
 * 获取select选项
 * @returns
 */
export function initSelectOption(paramData, select) {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await Promise.all(
        paramData.map((parent) => {
          return Promise.all(
            parent.children.map((child) => select.getByPid(child.id))
          )
        })
      )
      const obj = {}
      res.map((item) => {
        item.map(data => {
          data.map((option) => {
            const pid = option['param_id']
            if (obj[pid] === undefined) {
              obj[pid] = []
            }
            obj[pid].push(option)
          })
        })
      })
      resolve(obj)
    } catch (err) {
      reject(new MyError(err, '获取选项失败,请刷新重试'))
    }
  })
}