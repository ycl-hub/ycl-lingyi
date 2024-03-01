export default {
  data() {
    return {
      isFullScreen: false
    }
  },
  mounted() {
    window.addEventListener('resize', this.eventHandler)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.eventHandler)
  },
  methods: {
    eventHandler() {
      this.isFullScreen = this.checkFull()
    },
    // 检测是否全屏
    checkFull() {
      return !!(document.webkitIsFullScreen || document.mozFullScreen ||
        document.msFullscreenElement || document.fullscreenElement
      )
    },
    // 退出全屏
    async exitFullScreen() {
      // document.exitFullscreen()为异步方法
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen()
      } else if (document.msExitFullscreen) {
        await document.msExiFullscreen()
      } else if (document.webkitCancelFullScreen) {
        await document.webkitCancelFullScreen()
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen()
      }
    },
    // 全屏
    async openFullscreen(element) {
      // document.requestFullscreen()为异步方法
      const div = document.getElementById(element)
      if (div.requestFullscreen) {
        await div.requestFullscreen()
      } else if (div.mozRequestFullScreen) {
        await div.mozRequestFullScreen()
      } else if (div.msRequestFullscreen) {
        await div.msRequestFullscreen()
      } else if (div.webkitRequestFullscreen) {
        await div.webkitRequestFullScreen()
      }
    },
    // 全屏
    async fullScreen(id) {
      await this.openFullscreen(id)
      this.isFullScreen = this.checkFull()
    },
    async exitFull() {
      await this.exitFullScreen()
      this.isFullScreen = this.checkFull()
    }
  }
}
