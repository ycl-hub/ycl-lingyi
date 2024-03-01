
import { queryId, queryPath } from '@/utils'
import { sessionStorage } from '@/utils/storage'
export default {
  inserted(el, binding, vnode) {
    // console.log(binding.value)
    const settings = sessionStorage.get('TONE_ConfigUserInfo')
    const res = queryId(binding.value, settings?.FEATURE_SETTING) // 如果有配置项则返回对象 无则返回false
    const res2 = queryPath(binding.value, sessionStorage.get('moduleInfo'))
    if (!res2 && !res) return
    // 两个配置都没有 就默认展示
    if (res2 && !res2.DISPLAY) {
      // 有权限配置的情况下 如果权限分配是0 则不展示w
      el?.parentNode?.removeChild(el)
    }
    if (res && res2 && res2.DISPLAY && !res.isOpen && !res.show) {
      // 两个配置都有的情况下 权限菜单给了权限  配置管理不给看   则不展示
      el?.parentNode?.removeChild(el)
    }
  }
}
