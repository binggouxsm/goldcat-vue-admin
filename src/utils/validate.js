import {calcBitLength} from './utils'

const rules = {
  required: { required: true, message: '必输项!', trigger: 'blur' },
  date: {
    validator(rule, value, callback){
      if(value == null || value.length == 0)
        return callback();
      return !/Invalid|NaN/.test(new Date(value)) ? callback() : callback(new Error('请输入有效的日期!'));
    },
    trigger: 'blur'
  },
  dateISO: {
    validator(rule, value, callback){
      if(value == null || value.length == 0)
        return callback();
      return /^\d{4}[-]\d{1,2}[-]\d{1,2}$/.test(value) ? callback(): callback(new Error('请输入有效的日期,例如1987-11-19!'));
    },
    trigger: 'blur'
  },
  number: {
    validator(rule, value, callback){
      if(value == null || value.length == 0)
        return callback();
      return /^-?\d+(?:\.\d+)?$/.test(value) ? callback() : callback(new Error('请输入数值!'));
    },
    trigger: 'blur'
  },
  posinumber: {
    validator(rule, value, callback){
      if(value == null || value.length == 0)
        return callback();
      return /^\d+(?:\.\d+)?$/.test(value) ? callback() : callback(new Error('请输入非负数值!'));
    },
    trigger: 'blur'
  },
  checkLen: function(min,max) {
    return { min: min, max: max, message: `长度在 ${min} 到 ${max} 个字符`, trigger: 'blur' }
  },
  checkBitLen: function (min,max) {
    return {
      validator(rule, value, callback){
        if(value == null || value.length == 0)
          return callback();
        let len = calcBitLength(value)
        if(!len ||  len < min || len>max )
          return callback(new Error(`长度在 ${min} 到 ${max} 个字节`))
        return callback();
      },
      trigger: 'blur'
    }
  },

}

export default rules

