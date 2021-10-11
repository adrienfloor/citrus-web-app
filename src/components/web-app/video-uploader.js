import React from 'react'
import axios from 'axios'
import Dialog from '@material-ui/core/Dialog'
import Loader from 'react-loader-spinner'
import { ReactComponent as Upload } from '../../assets/svg/upload.svg'
import * as UpChunk from '@mux/upchunk'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'
import '../../styling/web-app.css'

import {
	capitalize,
	uppercase,
	titleCase
} from '../../utils/various'


class VideoUploader extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			videoSrc: '',
			isLoading: false
		}
		this.handleVideoPicking = this.handleVideoPicking.bind(this)
	}

	handleVideoPicking(e) {
		const { onVideoSelected } = this.props
		const { videoSrc } = this.state
		this.setState({ videoSrc: URL.createObjectURL(e.target.files[0]) })
		onVideoSelected(e.target.files[0])
	}

	render() {
		const {
			t,
			onVideoSelected,
			disabled
		} = this.props
		const {
			isLoading,
			videoSrc
		} = this.state

		return (
			<div className='uploader-container'>
				{
					isLoading &&
					<>
						<Loader
							type='Oval'
							color='#C2C2C2'
							height={50}
							width={50}
						/>
						<div className='small-separator'></div>
						<span className='small-text citrusBlue'>
							{capitalize(t('creatingThumbnail'))} ...
						</span>
					</>
				}
				{
					!videoSrc &&
					<>
						<Upload
							height={120}
							width={120}
							stroke={'#FFFFFF'}
							strokeWidth={2}
						/>
						{
							!disabled &&
							<label className="custom-file-upload">
								<input
									onChange={this.handleVideoPicking}
									type='file'
									accept='video/mp4,video/x-m4v,video/*'
								/>
								<div className='light-button' style={{ width: '100%', height: '30px' }}>
									<span className='smaller-text-bold citrusBlue'>
										{capitalize(t('chooseVideo'))}
									</span>
								</div>
							</label>
						}
					</>
				}
				{
					videoSrc &&
					<div className='video-container'>
						<video
							key={videoSrc}
							controls
							style={{ width: '300px', height: '200px' }}
							className='video-preview'
						>
							<source
								type="video/mp4"
								src={videoSrc}
							/>
						</video>
						{
							!disabled &&
							<label className='custom-file-upload' style={{ position: 'absolute', top: 0, right: 0 }}>
								<input
									onChange={this.handleVideoPicking}
									type='file'
									accept='video/mp4,video/x-m4v,video/*'
								/>
								<div className='edit-button'>
									<span className='smaller-text-bold citrusGrey'>
										{capitalize(t('edit'))}
									</span>
								</div>
							</label>
						}
					</div>
				}
				<style jsx='true'>
					{`
						.info-row {
							width: 100%;
							display: flex;
							justify-content: center;
							align-items: flex-start;
						}
						.info-column {
							width: 50%;
							display: flex;
							flex-direction: column;
							justify-content: center;
							align-items: flex-start;
						}
						.video-container {
							position: relative;
							background-color: #000000;
						}
						.upload-row {
							justify-content: space-between;
							align-items: center;
							margin-top: 10px;
						}
						input[type="file"] {
							display: none;
						}
						.custom-empty-file-upload {
							display: inline-block;
							cursor: pointer;
							width: 454px;
							height: 50px;
							background-color: #FFFFFF;
							border: 2px solid #0075FF;
							display: flex;
							justify-content: center;
							align-items: center;
							color: #0075FF;
						}
						.custom-file-upload {
							display: inline-block;
							cursor: pointer;
							font-family: Raleway-Bold;
							font-style: normal;
							font-weight: bold !important;
							font-size: 20px;
						}
						.file-name {
							max-width: 300px;
							overflow: hidden;
							text-overflow: ellipsis;
						}
						.edit-button {
							position: absolute;
							padding: 0 10px;
							height: 25px;
							top: 0;
							right: 0;
							background-color: #FFFFFF;
						}
					`}
				</style>
			</div>
		)
	}
}

export default VideoUploader
