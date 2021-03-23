import request from '@/utils/request'

const state = {

}

const mutations = {
  SET_CODE(state, payload) {
    let {code, data} = payload
    if(data && data.length > 0){
      state[code] = data
    }
  }
}

const actions ={
  async getCode({ commit }, code){
    if(state[code])
      return state[code]
    let data = await request({
      url: '/dictItem/'+code,
    })
    commit('SET_CODE',{code,data})
    return data
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
