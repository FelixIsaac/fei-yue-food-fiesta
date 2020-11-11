<template>
  <div>
    <qrcode-drop-zone @decode="onDecode" @init="logErrors">
      <qrcode-stream @decode="onDecode" @init="onInit"> </qrcode-stream>
    </qrcode-drop-zone>

    <div class="field file is-primary has-name">
      <label class="upload control file-label">
        <span class="file-cta">
          <span class="icon file-icon">
            <i class="mdi mdi-upload mdi-24px" />
          </span>
          <span class="file-label">
            Select picture from device
          </span>
        </span>
        <qrcode-capture @decode="onDecode" />
      </label>
    </div>
  </div>
</template>

<script>
import { Vue, Component } from "vue-property-decorator";
import { QrcodeStream, QrcodeDropZone, QrcodeCapture } from 'vue-qrcode-reader'

@Component({
  components: {
    QrcodeStream,
    QrcodeDropZone,
    QrcodeCapture
  }
})
export default class QRCodeReader extends Vue {
  camera = "auto";

  onDecode(result) {
    console.log(result);
  }

  turnCameraOn() {
    this.camera = "auto";
  }

  turnCameraOff() {
    this.camera = "off";
  }

  logErrors(promise) {
    promise.catch(console.error);
  }

  async onInit (promise) {
    try {
      await promise
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        this.error = "ERROR: you need to grant camera access permisson"
      } else if (error.name === 'NotFoundError') {
        this.error = "ERROR: no camera on this device"
      } else if (error.name === 'NotSupportedError') {
        this.error = "ERROR: secure context required (HTTPS, localhost)"
      } else if (error.name === 'NotReadableError') {
        this.error = "ERROR: is the camera already in use?"
      } else if (error.name === 'OverconstrainedError') {
        this.error = "ERROR: installed cameras are not suitable"
      } else if (error.name === 'StreamApiNotSupportedError') {
        this.error = "ERROR: Stream API is not supported in this browser"
      }
    }
  }
}
</script>

<style scoped>

</style>
