import out from './out'

const install = function(Vue) {
  Vue.directive('out', out)
}

if (window.Vue) {
  window['out'] = out
  Vue.use(install); // eslint-disable-line
}

out.install = install
export default out
