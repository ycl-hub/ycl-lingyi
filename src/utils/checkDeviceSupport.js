export async function checkDeviceSupport(callback) {
  // 检测电脑设备是否已经安装了摄像头
  if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
  // Firefox 38+ seems having support of enumerateDevicesx
    navigator.enumerateDevices = function(callback) {
      navigator.mediaDevices.enumerateDevices().then(callback)
    }
  }
  var MediaDevices = []
  var isHTTPs = location.protocol === 'https:'
  var canEnumerate = false

  if (typeof MediaStreamTrack !== 'undefined' && 'getSources' in MediaStreamTrack) {
    canEnumerate = true
  } else if (navigator.mediaDevices && !!navigator.mediaDevices.enumerateDevices) {
    canEnumerate = true
  }
  var temp = {
    hasMicrophone: false,
    hasSpeakers: false,
    hasWebcam: false,
    isMicrophoneAlreadyCaptured: false,
    isWebcamAlreadyCaptured: false
  }
  if (!canEnumerate) {
    return
  }

  if (!navigator.enumerateDevices && window.MediaStreamTrack && window.MediaStreamTrack.getSources) {
    navigator.enumerateDevices = window.MediaStreamTrack.getSources.bind(window.MediaStreamTrack)
  }

  if (!navigator.enumerateDevices && navigator.enumerateDevices) {
    navigator.enumerateDevices = navigator.enumerateDevices.bind(navigator)
  }

  if (!navigator.enumerateDevices) {
    if (callback) {
      callback()
    }
    return
  }

  MediaDevices = []
  const devices = await navigator.mediaDevices.enumerateDevices()
  devices.forEach(function(_device) {
    var device = {}
    for (var d in _device) {
      device[d] = _device[d]
    }

    if (device.kind === 'audio') {
      device.kind = 'audioinput'
    }

    if (device.kind === 'video') {
      device.kind = 'videoinput'
    }

    var skip
    MediaDevices.forEach(function(d) {
      if (d.id === device.id && d.kind === device.kind) {
        skip = true
      }
    })

    if (skip) {
      return
    }

    if (!device.deviceId) {
      device.deviceId = device.id
    }

    if (!device.id) {
      device.id = device.deviceId
    }

    if (!device.label) {
      device.label = 'Please invoke getUserMedia once.'
      if (!isHTTPs) {
        device.label = 'HTTPs is required to get label of this ' + device.kind + ' device.'
      }
    } else {
      if (device.kind === 'videoinput' && !temp.isWebcamAlreadyCaptured) {
        temp.isWebcamAlreadyCaptured = true
      }

      if (device.kind === 'audioinput' && !temp.isMicrophoneAlreadyCaptured) {
        temp.isMicrophoneAlreadyCaptured = true
      }
    }

    if (device.kind === 'audioinput') {
      temp.hasMicrophone = true
    }

    if (device.kind === 'audiooutput') {
      temp.hasSpeakers = true
    }

    if (device.kind === 'videoinput') {
      temp.hasWebcam = true
    }

    // there is no 'videoouput' in the spec.

    MediaDevices.push(device)
  })
  return temp
}
