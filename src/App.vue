<template>
  <div id="app">
    <router-view />
    <!-- <transition name="fade" mode="in-out">
      <router-view />
    </transition> -->
  </div>
</template>

<script>
import { changeIco } from '@/utils'
import { sessionStorage } from '@/utils/storage'
import { api } from '@/api/env'
export default {
  name: 'App',
  created() {
    window.thisVueRoot = this.$root
    const url = sessionStorage.get('TONE_ConfigUserInfo')
    if (url && url.LOGO_URL) {
      changeIco(api + url.LOGO_URL)
    }
  },
  mounted() {
    // 使用了路由重置后 浏览器左上角返回有时不起作用  在此调用监听即可
    window.addEventListener('hashchange', () => {
      const currentPath = window.location.hash.slice(1)
      if (this.$route.path !== currentPath) {
        this.$router.push(currentPath)
      }
    }, false)
  }
}
</script>
