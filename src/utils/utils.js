/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}


/**
 * @param {string} str
 * @returns {Boolean}
 */
export function isString(str) {
  if (typeof str === 'string' || str instanceof String) {
    return true
  }
  return false
}

/**
 * @param {Array} arg
 * @returns {Boolean}
 */
export function isArray(arg) {
  if (typeof Array.isArray === 'undefined') {
    return Object.prototype.toString.call(arg) === '[object Array]'
  }
  return Array.isArray(arg)
}

export function calcBitLength(str) {
  if(isString(str)){
    let i,byteSize = 0;
    for (i = 0; i < str.length; i++) {
      let charCode = str.charCodeAt(i);
      if (0 <= charCode && charCode <= 0x7f) {
        byteSize += 1;
      } else if (128 <= charCode && charCode <= 0x7ff) {
        byteSize += 2;
      } else if (2048 <= charCode && charCode <= 0xffff) {
        byteSize += 3;
      } else if (65536 < charCode && code <= 0x1FFFFF) {
        byteSize += 4;
      } else if (0x200000 < charCode && charCode <= 0x3FFFFFF) {
        byteSize += 5;
      } else if (0x4000000 < charCode && charCode <= 0x7FFFFFFF) {
        byteSize += 6;
      }
    }
    return byteSize
  }
  return null
}
