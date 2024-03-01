/* eslint-disable no-mixed-spaces-and-tabs */

import { tools_uri } from '../tools'

class Storage {
  constructor(type) {
    if (type === 'local') {
      this.store = window.localStorage
    } else if (type === 'session') {
      this.store = window.sessionStorage
    }
    this.prefix = 'T01_'
  }

  set(key, value) {
    try {
      var cache = []
      // 防止 循环引用 无法被序列化    余成林：2022/4/11
			 value = JSON.stringify(value, (key, va) => {
			    if (typeof va === 'object' && va !== null) {
			        if (cache.indexOf(va) !== -1) {
			            return
			        }
			        cache.push(va)
			    }
			    return va
      })
      cache = null
    } catch (e) {
      console.log(e)
    }
    // console.log(tools_uri.encode(this.prefix + key), tools_uri.encode(value))
    this.store.setItem(tools_uri.encode(this.prefix + key), tools_uri.encode(value))

    return this
  }

  get(key) {
    if (!key) {
      throw new Error('没有找到key。')
    }
    if (typeof key === 'object') {
      throw new Error('key不能是一个对象。')
    }
    let value = this.store.getItem(tools_uri.encode(this.prefix + key))

    if (value === null) {
      return null
    }

    try {
      value = JSON.parse(tools_uri.decode(value))
    } catch (e) {
      value = null
    }
    return value
  }

  remove(key) {
    this.store.removeItem(tools_uri.encode(this.prefix + key))
    return this
  }
}

export const localStorage = new Storage('local')
export const sessionStorage = new Storage('session')
