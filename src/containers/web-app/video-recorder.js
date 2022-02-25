import { ReactMediaRecorder } from 'react-media-recorder'
import React, { useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import { ReactComponent as Close } from '../../assets/svg/close.svg'


import {
	capitalize,
	countryCodeToLanguage,
	returnCurrency
} from '../../utils/various'

class VideoRecorder extends React.Component {
	constructor(props) {
		super(props)
    this.state = {
      isRecording: false,
      countdown: 5
    }
    this.streamCamVideo= this.streamCamVideo.bind(this)
  }

  componentDidMount(){
    this.streamCamVideo()
  }

  streamCamVideo() {
    const constraints = { audio: true, video: true };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function(mediaStream) {
        const video = document.querySelector('video')

        video.srcObject = mediaStream
        video.onloadedmetadata = function(e) {
          video.play()
        }
      })
      .catch(function(err) {
        console.log(err.name + ': ' + err.message)
      })
  }

  render() {
    const {
      isRecording
    } = this.state
    const { onCancel } = this.props
    return (
      <div className='main-container'>
        <video
          className='main-container'
          autoPlay={true}
        />
        <div className='medium-separator'></div>
        <div
					style={{
            position: 'absolute',
						width: '99%',
						height: '70px',
						display: 'flex',
						justifyContent: 'flex-end',
						alignItems: 'flex-end'
					}}
					onClick={onCancel}
					className='hover'
				>
          <Close
            width={35}
            height={35}
            stroke={'#FFFFFF'}
            strokeWidth={2}
            style={{ paddingRight: '12px' }}
          />
        </div>
        <ReactMediaRecorder
          askPermissionOnMount
          video
          render={({
              status,
              startRecording,
              stopRecording,
              pauseRecording,
              resumeRecording,
              mediaBlobUrl,
              previewStream
          }) => (
            <div className='video-recorder'>
              <p>{status}</p>
              <div className='video-recorder-bottom-container'>
                <button
                  onClick={() => {
                      isRecording ?
                      stopRecording() :
                      startRecording()
                    }
                  }>
                  Start Recording
                </button>
              </div>
            </div>
          )}
        />
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
	user: state.auth.user
})

const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(VideoRecorder))