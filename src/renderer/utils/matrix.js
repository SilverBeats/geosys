import { toFixed } from './toolUtil'
const Bit = 2

/**
 * 和积法
 * 方阵
 * @param {Araay[][]} matrix 原矩阵
 */
export function calcEigne(matrix) {
  const dim = matrix.length
  // 1、将矩阵的每一列进行归一化得到判断矩阵w
  // 2、将判断矩阵w的所有列进行相加,变为nx1的矩阵_w
  // 3、将_w进行归一化得到_w_ 这就是最大特征根的特向
  const _w_ = unitCol(mergeCol(unitCol(matrix)))

  // 4、计算最大特征根
  // 4.1 matrix * _w_
  const Ax = matrixMult(matrix, _w_)
  // 4.2 Ax和_w_都是列矩阵,对应位置相除形成新的矩阵
  for (let i = 0; i < dim; ++i) {
    Ax[i][0] /= _w_[i][0]
  }

  // 4.3 将Ax中所有列进行相加 / 维度dim
  let maxEigenvalue = toFixed(Ax.reduce((prev, curr) => prev + curr[0], 0.0) / dim, Bit)

  // 5、将最大特征值的特向进行处理
  // 5.1 二维数组变一维数组,进行四舍五入处理
  const maxEigenVector = _w_.map(row => toFixed(row[0], Bit))
  // 5.2 处理误差(四舍五入后会出现权值和不为1的情况)
  correction(maxEigenVector)
  return {
    maxEigenvalue,
    maxEigenVector
  }
}

/**
 * 创建指令大小的0矩阵
 * @param {Integer} rows 
 * @param {Integer} cols 
 * @returns 
 */
function init2Dim(rows, cols) {
  let arr = new Array(rows)
  for (let i = 0; i < rows; ++i) {
    arr[i] = new Array(cols).fill(0.0)
  }
  return arr
}

/**
 * 将矩阵的列进行合并
 * @param {Array[][]} matrix 
 * @returns
 */
function mergeCol(matrix) {
  let rows = matrix.length
  let cols = matrix[0].length
  let res = init2Dim(rows, 1)
  for (let row = 0; row < rows; ++row) {
    let sum = 0.0
    for (let col = 0; col < cols; ++col) {
      sum += matrix[row][col]
    }
    res[row][0] = sum
  }
  return res
}

/**
 * 将矩阵的列进行单位化(某元素占其所在列的比例)
 * @param {Array[][]} matrix 
 * @returns
 */
function unitCol(matrix) {
  const rows = matrix.length
  const cols = matrix[0].length
  // 这是矩阵每一列的和
  const colSumArr = []
  for (let col = 0; col < cols; ++col) {
    let sum = 0
    for (let row = 0; row < rows; ++row) {
      sum += matrix[row][col]
    }
    colSumArr[col] = sum
  }
  // 进行单位化,w用来保存单位化之后的矩阵
  const w = init2Dim(rows, cols)
  for (let col = 0; col < cols; ++col) {
    for (let row = 0; row < rows; ++row) {
      w[row][col] = matrix[row][col] / colSumArr[col]
    }
  }
  return w
}

/**
 * 对列矩阵进行数据修正,保证四舍五入后,数据之和为1
 * @param {Array} arr 
 */
function correction(arr) {
  const rows = arr.length
  const bei = Math.pow(10, Bit)
  let sum = arr.reduce((prev, curr) => prev + curr * bei, 0.0)
  // 四舍五入后没问题
  if (sum == bei) return
  let err = sum - bei
  // 定位该列最小值的位置
  let minRow = 0
  for (let row = 1; row < rows; ++row) {
    if (arr[row] < arr[minRow]) {
      minRow = row
    }
  }
  arr[minRow] -= err / bei
}

/**
 * a b两个矩阵相乘
 * @param {Array[][]} a 
 * @param {Array[][]} b
 * @returns
 */
function matrixMult(a, b) {
  const arows = a.length
  const acols = a[0].length
  const brows = b.length
  const bcols = b[0].length

  if (acols != brows) {
    throw new Error('当前两个矩阵无法相乘')
  }
  const res = init2Dim(arows, bcols)
  for (let k = 0; k < bcols; ++k) {
    for (let i = 0; i < arows; ++i) {
      let sum = 0
      for (let j = 0; j < acols; ++j) {
        sum += a[i][j] * b[j][k]
      }
      res[i][k] = sum
    }
  }
  return res
}