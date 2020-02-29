import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    stations: []
  },
  mutations: {
    addStations(state, stList) {
      state.stations = stList
    }
  },
  actions: {
  },
  modules: {
  },
  getters: {
    stations: state => state.stations
  }
})
