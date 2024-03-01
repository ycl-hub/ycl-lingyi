import { mapGetters } from 'vuex'
import { sessionStorage } from '@/utils/storage'
import Stomp from 'stompjs'
export default {
  name: 'mq',
  data() {
    return {
      // mixins数据不共享，放到vuex中
      client: null
    }
  },
  computed: {
    ...mapGetters([
      'mqIsConnected',
      'mqResponseData'
    ])
  },
  created() {
    this.$store.commit('mq/SET_MqIsConnected', true)
    this.connect()
  },
  beforeDestroy() {
    this.client.disconnect(() => {
      this.$store.commit('mq/SET_MqIsConnected', false)
      this.$store.commit('mq/SET_CLIENT', null)
    })
  },
  mounted() {
    window.addEventListener('beforeunload', this.beforeunloadHandler)
  },
  destroyed() {
    window.removeEventListener('beforeunload', this.beforeunloadHandler)
  },
  methods: {
    beforeunloadHandler() {
      this.client.disconnect(() => {
        this.$store.commit('mq/SET_MqIsConnected', false)
        this.$store.commit('mq/SET_CLIENT', null)
      })
    },
    onConnected(frame) {
      const TONE_voip = sessionStorage.get('TONE_voip')
      const userInfo = sessionStorage.get('TONE_sipUserInfo')
      // 单聊、警情
      if (TONE_voip.cmd.ROUTINGKEY && !TONE_voip.cmd.EXCHANGENAME_POWER) {
        const routingkeyArr = TONE_voip.cmd.ROUTINGKEY.split(',')
        routingkeyArr.forEach((item) => {
          const topic = `/exchange/${TONE_voip.cmd.EXCHANGENAME}/${item}`
          this.client.subscribe(topic, this.responseCallback, {
            'x-queue-name': userInfo.userName,
            'durable': false,
            'exclusive': false,
            'autoDelete': false
          })
        })
      }
      // 绑定IM
      if (TONE_voip.cmd.IMEXCHANGE_ROUTE) {
        const IMEXCHANGE_ROUTE = TONE_voip.cmd.IMEXCHANGE_ROUTE.split(',')
        IMEXCHANGE_ROUTE.forEach((item) => {
          const topic = `/exchange/${TONE_voip.cmd.IMEXCHANGE_NAME}/${item}`
          this.client.subscribe(topic, this.responseCallback, {
            'x-queue-name': userInfo.userName,
            'durable': false,
            'exclusive': false,
            'autoDelete': false
          })
        })
      }
      // 绑定对讲组
      if (TONE_voip.cmd.INTERCOM_EXCHANGE_ROUTE) {
        const INTERCOM_EXCHANGE_ROUTE = TONE_voip.cmd.INTERCOM_EXCHANGE_ROUTE.split(',')
        INTERCOM_EXCHANGE_ROUTE.forEach((item) => {
          const topic = `/exchange/${TONE_voip.cmd.IMEXCHANGE_NAME}/${item}`
          this.client.subscribe(topic, this.responseCallback, {
            'x-queue-name': userInfo.userName,
            'durable': false,
            'exclusive': false,
            'autoDelete': false
          })
        })
      }
      // 绑定定位
      if (TONE_voip.cmd.LOCATE_QUEUE_NAME && TONE_voip.cmd.LOCATE_QUEUE_ROUTE && !TONE_voip.cmd.EXCHANGENAME_POWER) {
        const topic = `/exchange/${TONE_voip.cmd.EXCHANGENAME}/${TONE_voip.cmd.LOCATE_QUEUE_ROUTE}`
        this.client.subscribe(topic, this.responseCallback, {
          'x-queue-name': TONE_voip.cmd.LOCATE_QUEUE_NAME,
          'durable': false,
          'exclusive': false,
          'autoDelete': false
        })
      }
      // EXCHANGENAME_POWER 多个单位权限，单聊、警情、定位
      if (TONE_voip.cmd.EXCHANGENAME_POWER) {
        const powerArr = TONE_voip.cmd.EXCHANGENAME_POWER.split(',')
        powerArr.forEach(item => {
          if (TONE_voip.cmd[item + '_LOCATE_QUEUE_ROUTE']) {
            const topic = `/exchange/${item}/${TONE_voip.cmd[item + '_LOCATE_QUEUE_ROUTE']}`
            this.client.subscribe(topic, this.responseCallback, {
              'x-queue-name': TONE_voip.cmd.LOCATE_QUEUE_NAME,
              'durable': false,
              'exclusive': false,
              'autoDelete': false
            })
          }
          if (TONE_voip.cmd[item + '_ROUTINGKEY']) {
            const routingkeyArr = TONE_voip.cmd[item + '_ROUTINGKEY'].split(',')
            routingkeyArr.forEach((obj) => {
              const topic = `/exchange/${item}/${obj}`
              this.client.subscribe(topic, this.responseCallback, {
                'x-queue-name': userInfo.userName,
                'durable': false,
                'exclusive': false,
                'autoDelete': false
              })
            })
          }
        })
      }
    },
    onFailed(frame) {
      const TONE_voip = sessionStorage.get('TONE_voip')
      // console.log('MQ Failed: ' + frame)
      // 断开让他去重新连接服务
      this.client = null
      // 如果目前是登录状态，则断开重连
      if (TONE_voip) {
        this.$store.commit('mq/SET_MqIsConnected', true)
        this.connect()
        // this.$message({
        //   showClose: true,
        //   message: frame,
        //   type: 'error',
        //   duration: 0
        // })
      }
    },
    // mq成功推送
    responseCallback(frame) {
      // 特殊情况，绑定创建的群聊组id
      if (!frame.body) return false
      const json = JSON.parse(frame.body)
      // 绑定IM
      if (json.MSG_KEY === 'CreatGroup' && !json.MEMBERLIST) {
        const TONE_voip = sessionStorage.get('TONE_voip')
        // 设置TONE_voip，避免刷新流失
        TONE_voip.cmd.IMEXCHANGE_ROUTE = `${TONE_voip.cmd.IMEXCHANGE_ROUTE},IM.${json.GROUP_ID}`
        sessionStorage.set('TONE_voip', TONE_voip)
        const userInfo = sessionStorage.get('TONE_sipUserInfo')
        const connectGroupId = () => {
          const topic = `/exchange/${TONE_voip.cmd.IMEXCHANGE_NAME}/IM.${json.GROUP_ID}`
          this.client.subscribe(topic, this.responseCallback, {
            'x-queue-name': userInfo.userName,
            'durable': false,
            'exclusive': false,
            'autoDelete': false
          })
        }
        connectGroupId()
      }
      // 绑定对讲组
      if (json.MSG_KEY === 'intercom') {
        const TONE_voip = sessionStorage.get('TONE_voip')
        // 设置TONE_voip，避免刷新流失
        TONE_voip.cmd.INTERCOM_EXCHANGE_ROUTE = `${TONE_voip.cmd.INTERCOM_EXCHANGE_ROUTE},INTERCOM.${json.intercomId}`
        sessionStorage.set('TONE_voip', TONE_voip)
        const userInfo = sessionStorage.get('TONE_sipUserInfo')
        const connectIntercom = () => {
          const topic = `/exchange/${TONE_voip.cmd.IMEXCHANGE_NAME}/INTERCOM.${json.intercomId}`
          this.client.subscribe(topic, this.responseCallback, {
            'x-queue-name': userInfo.userName,
            'durable': false,
            'exclusive': false,
            'autoDelete': false
          })
        }
        connectIntercom()
      }
      this.$store.commit('mq/SET_MqIsConnected', true)
      // console.log('MQ msg=>' + frame.body)
      this.$store.commit('mq/SET_MqResponseData', frame.body)
    },
    connect() {
      const TONE_voip = sessionStorage.get('TONE_voip')
      if (!this.client) {
        var ws = new WebSocket(`wss://${TONE_voip.cmd.HOST}:${TONE_voip.cmd.PORT}/ws`)
        this.client = Stomp.over(ws)
        this.$store.commit('mq/SET_CLIENT', this.client)
      }
      this.client.connect(`${TONE_voip.cmd.USERNAME}`, `${TONE_voip.cmd.PWS}`, this.onConnected, this.onFailed, `${TONE_voip.cmd.VHOST}`)
    }
  }
}
