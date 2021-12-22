import { Notification, Loading, MessageBox } from "element-ui"

const loadingOption = {
  lock: true,
  text: '',
  spinner: 'el-icon-loading',
  background: 'rgba(255, 255, 255, 0.7)'
}

let loading = null

/**
 * 打开loading
 * @param {String} text
 */
export function openLoading(text = '正在处理,请稍后') {
  loadingOption['text'] = text
  loading = Loading.service(loadingOption)
}

/**
 * 根据loading的id关闭loading
 * @param {String} loading 
 */
export function closeLoading() {
  loading.close()
}


const notificationConfig = {
  message: '',
  type: '',
  position: 'top-right',
  duration: 2000
}

/**
 * 打印成功信息Notification
 * @param {String} text 
 */
export function successMsg(text) {
  notificationConfig.message = text
  notificationConfig.type = 'success'
  Notification(notificationConfig)
}

/**
 * alert错误提示框
 * @param {String} text 
 */
export function errorMsg(text) {
  MessageBox.alert(text, '错误', {
    confirmButtonText: '确定',
    dangerouslyUseHTMLString: true,
    type: 'error',
    showClose: false,
    callback: () => { },
  })
}