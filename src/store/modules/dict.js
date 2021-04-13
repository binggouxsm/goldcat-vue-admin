import request from '@/utils/request'
import store from '../index'

const state = {

}

const mutations = {
  SET_CODE(state, payload) {
    this._vm.$set(state, payload.code, payload.data)
  }
}

const getters = {
  code: (state) =>(code) =>{
    if(!state[code])
      store.dispatch('dict/getCode',code)
    return state[code]
  }
}

const actions ={
  async getCode({ commit, state }, code){
    let data = await request({
      url: '/dictItem/'+code,
    })
    let map  = new Map();
    data.forEach(item => map.set(item.code, item.name))

    commit('SET_CODE',{code,data:map})
    return map
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
