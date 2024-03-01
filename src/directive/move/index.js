import move from './move'

const install = function(Vue) {
  Vue.directive('move', move)
}

if (window.Vue) {
  window['move'] = move
  Vue.use(install); // eslint-disable-line
}

move.install = install
export default move
