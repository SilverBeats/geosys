const checkParamEn = (rule, value, callback) => {
  var Regx = /^[A-Za-z\d\s]*$/
  if (value == '') {
    callback(new Error('请输入参数英文名（param_en）'))
  } else if (!Regx.test(value)) {
    callback(new Error('英文单词中只能含有a-z、A-Z、数字、空格'))
  } else {
    callback()
  }
}
const checkNum = (rule, value, callback) => {
  if (value == '') {
    callback(new Error('请输入参数的权重（weight）'))
  } else if (isNaN(parseFloat(value)) || parseFloat(value) != value) {
    callback(new Error('输入的必须是数值'))
  } else {
    callback()
  }
}
const list1 = {
  'itemList': [
    {
      'label': '参数中文名（param_zh）',
      'prop': 'param_zh'
    },
    {
      'label': '参数英文名（param_en）',
      'prop': 'param_en'
    },
    {
      'label': '参数权重（weight）',
      'prop': 'weight'
    }
  ],
  'rules': {
    'param_zh': [
      {
        required: true,
        message: '请输入参数的中文名（param_zh）',
        trigger: 'blur',
      },
    ],
    'param_en': [
      { validator: checkParamEn, trigger: 'blur', required: true },
    ],
    'weight': [{ validator: checkNum, trigger: 'blur', required: true }
    ],
  }
}

const list2 = {
  'itemList': [
    { 'label': '标准（standard）', 'prop': 'standard' },
    { 'label': '取值（value）', 'prop': 'value' }
  ],
  'rules': {
    'standard': [
      {
        required: true,
        message: '请输入该选项的标准',
        trigger: 'blur',
      }
    ],
    'value': [
      {
        required: true,
        message: '请输入该选项的取值',
        trigger: 'blur',
      }
    ]
  }
}
const list3 = {
  'itemList': [
    {
      'label': '参数中文名（param_zh）',
      'prop': 'param_zh'
    },
    {
      'label': '参数英文名（param_en）',
      'prop': 'param_en'
    }
  ],
  'rules': {
    'param_zh': [
      {
        required: true,
        message: '请输入参数的中文名（param_zh）',
        trigger: 'blur',
      },
    ],
    'param_en': [
      { validator: checkParamEn, trigger: 'blur', required: true }
    ]
  }
}
export {
  list1, list2,list3
}