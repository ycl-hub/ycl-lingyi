const getDefaultState = () => {
  return {
    meetDialog: false,
    createMeetingName: '',
    addMeetingMemberList: []
  }
}
const state = getDefaultState()
const mutations = {
  SET_meetDialog: (state, val) => {
    state.meetDialog = val
  },
  SET_createMeetingName: (state, val) => {
    state.createMeetingName = val
  },
  SET_addMeetingMemberList: (state, val) => {
    state.addMeetingMemberList = val
  },
  SET_addMeetingMemberList_PUSH: (state, val) => {
    state.addMeetingMemberList.push(val)
  }
}
const actions = {
}
export default {
  namespaced: true,
  state,
  mutations,
  actions
}
