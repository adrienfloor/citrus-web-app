import React from 'react'
import axios from 'axios'
import Dialog from '@material-ui/core/Dialog'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import Loader from 'react-loader-spinner'

import ImageCropper from './index'

import '../../../styling/headings.css'
import '../../../styling/colors.css'
import '../../../styling/buttons.css'
import '../../../styling/spacings.css'
import '../../../styling/App.css'
import '../../../styling/web-app.css'

import {
	capitalize,
	uppercase,
	titleCase
} from '../../../utils/various'

import { ReactComponent as ImageSquare } from '../../../assets/svg/image-square.svg'

const { REACT_APP_CLOUDINARY_UPLOAD_URL } = process.env

class ImageUploader extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			isImageLoading: false,
			imgSrc: this.props.pictureUri,
			croppedImage: null,
			isCropping: false,
			imgToCropSrc: ''
		}
		this.cloudinaryUpload = this.cloudinaryUpload.bind(this)
		this.handleUploadClick = this.handleUploadClick.bind(this)
	}

	componentWillUnmount() {
		this.setState({
			imgSrc: '',
			isImageLoading: false,
			imgToCropSrc: ''
		})
	}

	async cloudinaryUpload(file) {
		const data = new FormData()
		data.append('file', file)
		data.append('upload_preset', 'VonageApp')
		data.append('cloud_name', 'dho1rqbwk')

		try {
			const res = await axios.post(REACT_APP_CLOUDINARY_UPLOAD_URL, data)
			return res.data.secure_url
		} catch (e) {
			console.log('Something went wrong uploading the photo: ', e)
		}
	}

	async handleUploadClick(file) {
		const { onSetPictureUri } = this.props
		this.setState({
			isCropping: false,
			isImageLoading: true
		})

		this.cloudinaryUpload(file)
		.then(imgUri => {
			this.setState({
				croppedImage: null,
				imgSrc: imgUri,
				isImageLoading: false
			})
			onSetPictureUri(imgUri)
		})
	}


	render() {
		const {
			imgSrc,
			isImageLoading,
			isCropping,
			crop,
			croppedImageUrl,
			imgToCropSrc
		} = this.state

		const {
			onCancel,
			onSetPictureUri,
			t,
			disabled,
			isProfile
		} = this.props

		const isImagePresent = imgSrc && imgSrc.length > 0
		const isDefaultProfilePic = imgSrc === 'https://res.cloudinary.com/dho1rqbwk/image/upload/v1623317757/VonageApp/avatar/noun_avatar_2309777_jhlofy.png'

		return (
			<div
				style={
					isImagePresent &&
					{
						justifyContent: isImageLoading ? 'center' : 'flex-start',
						alignItems: isImageLoading ? 'center' : 'flex-end',
						backgroundPosition: 'center',
						backgroundRepeat: 'no-repeat',
						backgroundImage: !isImageLoading ? `url(${imgSrc})` : '',
						backgroundSize: isDefaultProfilePic ? 'contain' : 'cover',
						border: '0.5px solid #edebeb'
					}
				}
				className={isProfile ? 'uploader-container-profile' : 'uploader-container'}
			>
				{
					isImageLoading &&
					<>
						<Loader
							type='Oval'
							color='#C2C2C2'
							height={25}
							width={25}
						/>
						<div className='small-separator'></div>
						<span className='smaller-text-bold citrusGrey'>
							{capitalize(t('uploadingImage'))} ...
						</span>
					</>
				}
				{
					!isImagePresent && !isImageLoading &&
					<>
						<ImageSquare
							height={120}
							width={120}
							stroke={'#FFFFFF'}
							strokeWidth={2}
						/>
						{
							!disabled &&
							<label className="custom-file-upload">
								<input
									onChange={e => {
										const fReader = new FileReader()
										fReader.readAsDataURL(e.target.files[0])
										fReader.onloadend = e => {
											this.setState({
												imgToCropSrc: e.target.result,
												isCropping: true
											})
										}
									}}
									type='file'
									accept='image/png, image/jpeg'
								/>
								<div style={{ width: '100%', height: '30px' }}>
									<span className='smaller-text-bold citrusBlue'>
										{capitalize(t('selectFile'))}
									</span>
								</div>
							</label>
						}
					</>
				}
				{
					isImagePresent && !isImageLoading &&
					<>
						{
							!disabled &&
							<label className='custom-file-upload' style={{ position: 'relative' }}>
								<input
									onChange={e => {
										const fReader = new FileReader()
										fReader.readAsDataURL(e.target.files[0])
										fReader.onloadend = e => {
											this.setState({
												croppedImage: null,
												imgToCropSrc: e.target.result,
												isCropping: true
											})
										}
									}}
									type='file'
									accept='image/png, image/jpeg'
								/>
								<div className='edit-button'>
									<span className='smaller-text-bold citrusGrey'>
										{capitalize(t('edit'))}
									</span>
								</div>
							</label>
						}
					</>
				}
				{
					isCropping &&
					<Dialog
						className='crop-dialog'
						open={true}
						onClose={() => {
							this.setState({
								isCropping: false
							})
						}}
					>
						<div className='crop-container'>
							<ImageCropper
								imgToCrop={imgToCropSrc}
								t={t}
								onComplete={file => this.handleUploadClick(file)}
							/>
						</div>
					</Dialog>
				}
				<style jsx='true'>
					{`
							.crop-dialog {
								width: 50%;
								padding: 0px 25%;
								margin-bottom: 15px;
							}
							.crop-container {
								width: 800px;
							}
							.cropper {
								width: 50%;
								padding: 0px 25%;
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
							@media only screen and (max-width: 640px) {
								.crop-container {
									width: 100%;
								}
							}
						`}
				</style>
			</div>
		)
	}
}
export default ImageUploader
