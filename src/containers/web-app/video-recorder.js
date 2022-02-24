import { ReactMediaRecorder } from 'react-media-recorder'
import React from 'react'
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
  }
  render() {
    const {
      isRecording
    } = this.state
    const { onCancel } = this.props
    return (
      <div className='main-container'>
          <div className='medium-separator'></div>
          <div
						style={{
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
                  mediaBlobUrl
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