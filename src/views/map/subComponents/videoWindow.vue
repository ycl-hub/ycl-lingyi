<template>
  <div>
    <!--==视频窗口==-->
    <vue-drag-resize
      v-for="(item,i) in mapCallList"
      v-if="item.type!=='audio'&&!item.isQuanXuanVideo"
      :key="item.sessionId"
      :is-active="false"
      :x="350+i*10"
      :y="200+i*10"
      :w="750"
      :h="450"
      :z="2000"
      @resizing="resize"
      @dragging="resize"
    >
      <div class="tone_sip_dialog">
        <div class="tone_sip_dialog_tit">
          <span class="tit">视频窗口</span>
          <span class="el-icon-close close" @click="endCall(item.sessionId,item.session,true,i)" />
        </div>
        <div class="tone_sip_con">
          <div class="tone_sip_con_c">
            <video :id="item.sessionId" />
            <div class="vodeocontrol">
              <span class="control-btn el-icon-phone text-center end-btn" @click="endCall(item.sessionId,item.session,true,i)" />
              <!-- <span class="control-btn fenfa-btn" @click="issue(item,i)" /> -->
              <span v-show="!item.mState" class="control-btn el-icon-microphone text-center mute-btn" @click="muteOrUnmute(item)" />
              <span v-show="item.mState" class="control-btn el-icon-turn-off-microphone text-center unmute-btn" @click="muteOrUnmute(item)" />
            </div>
          </div>
        </div>
      </div>
    </vue-drag-resize>
  </div>
</template>

<script>
// import SliceBorder from '@/components/sliceBorder'
import sip from '@/components/mixins/sip.js'
export default {
  name: 'VideoWindow',
  components: {
    // SliceBorder
  },
  mixins: [sip],
  props: {
  },
  data() {
    return {
      videoWidth: 720,
      videoHeight: 450,
      videoLeft: 20,
      videoTop: 200
    }
  },
  computed: {
    mapCallList: function() {
      const temp = this.callList.filter((item) => {
        return item.belong === 'jwt'
      })
      return temp
    }
  },
  activated() {
    // console.log('activated')
    this.mapCallList.forEach((item) => {
      this.setupRemoteMedia(item.session, item.sessionId)
    })
  },
  deactivated() {
    // console.log('deactivated')
  },
  provide: function() {
    return {
    }
  },
  watch: {
  },
  created() {
  },
  mounted() {
    // 不论组件在那个父元素下引用，都将组将插入到body中
    this.$nextTick(() => {
      const body = document.querySelector('.yujing')
      if (body.append) {
        body.append(this.$el)
      } else {
        body.appendChild(this.$el)
      }
    })
  },
  methods: {
    // 视频窗口弹窗调整大小
    resize(newRect) {
      this.videoWidth = newRect.width
      this.videoHeight = newRect.height
      this.videoTop = newRect.top
      this.videoLeft = newRect.left
    }
  }
}
</script>
<style lang="scss" scoped>
  ::v-deep .tone_sip_dialog{
    width: 100%;
    color: #F1F1F1;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    background: radial-gradient(circle, #00273C, #004F78);
    border: 1px solid rgba(52, 193, 218, 0.6);
    box-shadow: inset 0px 0px 10px 2px #35879d;
    .tone_sip_dialog_tit{height: 31px; line-height: 31px; padding:0px 10px; overflow: hidden; cursor: move;}
    .tone_sip_dialog_tit span.tit{float: left;}
    .tone_sip_dialog_tit span.close{float: right; font-size: 16px; cursor: pointer; line-height: 31px;}
    .tone_sip_con{background:rgba(2,51,67,.7); position: absolute; top: 31px; height: calc(100% - 31px); width: 100%;overflow: hidden;}
    .tone_sip_con_c{width: 100%;height: 100%;}
    .tone_sip .vdr.active:before{display: none; position: unset; width: 0; height:0;}
    .tone_sip_con_c video{ width: 100%; height: 100%; background-color: #000;object-fit:fill}
    .tone_sip_con_c:hover .vodeocontrol{bottom: 0px;}
    .tone_sip_con_c .vodeocontrol{position: absolute; height: 40px; width: 100%; bottom: -40px; background:rgba(255,255,255,.2); transition: all .3s;}
    .btn{ display: inline-block; margin:  0 5px;  cursor: pointer;  text-align: center;}
    .btn-circle{ width: 30px; height: 30px; border-radius: 50%; font-size: 18px; background-color:#409EFF; color: #F1F1F1; }
    .btn-circle::before{line-height: 30px;}
  }
</style>
