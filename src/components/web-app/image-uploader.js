import React from 'react'
import axios from 'axios'
import Dialog from '@material-ui/core/Dialog'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import Loader from 'react-loader-spinner'

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

import { ReactComponent as ImageSquare } from '../../assets/svg/image-square.svg'

const { REACT_APP_CLOUDINARY_UPLOAD_URL } = process.env

class ImageUploader extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			isImageLoading: false,
			imgSrc: this.props.pictureUri,
			crop: {
				unit: '%',
				width: 50,
				aspect: this.props.aspect || 3/2
			},
			croppedImage: null,
			isCropping: false,
			imgToCropSrc: ''
		}
		this.cloudinaryUpload = this.cloudinaryUpload.bind(this)
		this.handleOnCropChange = this.handleOnCropChange.bind(this)
		this.handleOnImageLoaded = this.handleOnImageLoaded.bind(this)
		this.handleOnCropComplete = this.handleOnCropComplete.bind(this)
		this.handleUploadClick = this.handleUploadClick.bind(this)
	}

	componentWillUnmount() {
		this.setState({
			imgSrc: '',
			isImageLoading: false,
			imgToCropSrc: ''
		})
	}

	async cloudinaryUpload(photo) {
		const data = new FormData()
		data.append('file', photo)
		data.append('upload_preset', 'VonageApp')
		data.append('cloud_name', 'dho1rqbwk')

		try {
			const res = await axios.post(REACT_APP_CLOUDINARY_UPLOAD_URL, data)
			return res.data.secure_url
		} catch (e) {
			console.log('Something went wrong uploading the photo: ', e)
		}
	}

	handleOnImageLoaded(image) {
		this.imageRef = image
	}

	handleOnCropComplete(crop, pixelCrop) {
		this.makeClientCrop(crop)
	}

	handleOnCropChange(crop) {
		this.setState({ crop })
	}

	async makeClientCrop(crop) {
		if (this.imageRef && crop.width && crop.height) {
			const croppedImageBlob = await this.getCroppedImg(
				this.imageRef,
				crop,
				'newFile.jpeg'
			)
			this.setState({ croppedImage: croppedImageBlob })
		}
	}

	getCroppedImg(image, crop, fileName) {
		const canvas = document.createElement('canvas')
		const pixelRatio = window.devicePixelRatio
		const scaleX = image.naturalWidth / image.width
		const scaleY = image.naturalHeight / image.height
		const ctx = canvas.getContext('2d')

		canvas.width = crop.width * pixelRatio * scaleX
		canvas.height = crop.height * pixelRatio * scaleY

		ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
		ctx.imageSmoothingQuality = 'high'

		ctx.drawImage(
			image,
			crop.x * scaleX,
			crop.y * scaleY,
			crop.width * scaleX,
			crop.height * scaleY,
			0,
			0,
			crop.width * scaleX,
			crop.height * scaleY
		)

		return new Promise((resolve, reject) => {
			canvas.toBlob(
				(blob) => {
					if (!blob) {
						//reject(new Error('Canvas is empty'))
						console.error('Canvas is empty')
						return
					}
					blob.name = fileName
					window.URL.revokeObjectURL(this.fileUrl)
					this.fileUrl = window.URL.createObjectURL(blob)
					// resolve(this.fileUrl)
					resolve(blob)
				},
				'image/jpeg',
				1
			)
		})
	}

	async handleUploadClick(e) {
		e.preventDefault()
		this.setState({
			isCropping: false,
			isImageLoading: true
		})
		const { croppedImage } = this.state
		const { onSetPictureUri } = this.props
		const source = {
			uri: croppedImage,
			type: 'image/jpg',
			name: 'newFile.jpeg'
		}
		this.cloudinaryUpload(croppedImage)
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
							backgroundSize: 'cover'
						}
					}
					className={ isProfile ? 'uploader-container-profile' : 'uploader-container'}
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
													// imgSrc: e.target.result,
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
													// imgSrc: e.target.result,
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
								<div className='cropper'>
									<ReactCrop
										src={imgToCropSrc}
										crop={crop}
										onChange={this.handleOnCropChange}
										onImageLoaded={this.handleOnImageLoaded}
										onComplete={this.handleOnCropComplete}
									/>
								</div>
									<div
										className='filled-button'
										style={{
											width: '150px',
											margin: '5px 0 10px 0',
										}}
										onClick={this.handleUploadClick}
									>
									<span className='smaller-text-bold citrusWhite'>
										{capitalize(t('submit'))}
									</span>
								</div>
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
								display: flex;
								flex-direction: column;
								justify-content: center;
								align-items: center;
								width: 100%;
								margin-top: 15px;
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
						`}
					</style>
				</div>
			)
		}
	}
export default ImageUploader
