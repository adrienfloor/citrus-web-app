import React from 'react'
import axios from 'axios'

import { generateRandomString } from '../../utils/image-upload'

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

import ImageSquare from '../../assets/icons/svg/image-square.svg'

import { CLOUDINARY_UPLOAD_URL } from '../../env.json'
const cloudinaryUploadUrl = 'https://api.cloudinary.com/v1_1/dho1rqbwk/image/upload'

const deviceWidth = Dimensions.get("window").width
const deviceHeight = Dimensions.get("window").height

class ImageUploader extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			picPreviewUri: '',
			picFinalUri: this.props.pictureUri,
			isImageLoading: false,
			isMenuOpen: false
		}

		if (this.props.pictureUri) {
			FastImage.preload([{ uri: this.props.pictureUri }])
		}

		this.uploadPic = this.uploadPic.bind(this)
		this.cloudinaryUpload = this.cloudinaryUpload.bind(this)

	}

	componentWillUnmount() {
		this.setState({
			picPreviewUri: '',
			picFinalUri: '',
			isImageLoading: false,
			isMenuOpen: false
		})
	}

	async cloudinaryUpload(photo) {
		const data = new FormData()
		data.append('file', photo)
		data.append('upload_preset', 'VonageApp')
		data.append('cloud_name', 'dho1rqbwk')

		try {
			const res = await axios.post(cloudinaryUploadUrl, data)
			return res.data.secure_url
		} catch (e) {
			console.log('Something went wrong uploading the photo: ', e)
		}
	}

	uploadPic(type) {

		const { onSetPictureUri } = this.props

		const options = {
			mediaType: 'photo',
			quality: 0.5,
			cameraType: 'front'
		}

		this.setState({
			isImageLoading: true,
			picPreviewUri: '',
			picFinalUri: ''
		})

		ImagePicker.clean().then(() => {
			console.log('removed all tmp images from tmp directory')
		}).catch(e => {
			console.log(e)
		})

		const handleResponse = response => {
			const uri = response.uri || ''
			const type = response.type || 'image/jpg'
			const name = response.fileName || generateRandomString()

			ImageResizer.createResizedImage(uri, 1024, 1024, 'JPEG', 50)
				.then(res => {
					// response.uri is the URI of the new image that can now be displayed, uploaded...
					// response.path is the path of the new image
					// response.name is the name of the new image with the extension
					// response.size is the size of the new image
					const source = {
						uri: res.uri,
						type,
						name
					}
					this.setState({
						picPreviewUri: uri
					})
					this.cloudinaryUpload(source)
						.then(imgUri => {
							this.setState({
								isImageLoading: false
							})
							onSetPictureUri(imgUri)
						})
				})
				.catch(err => {
					console.log(err)
					this.setState({ isImageLoading: false })
					// Oops, something went wrong. Check that the filename is correct and
					// inspect err to get more details.
				})
		}

		if (type === 'library') {
			ImagePicker.openPicker({
				cropping: true,
				freeStyleCropEnabled: true,
				width: 1024,
				height: 1024,
				loadingLabelText: capitalize(i18n.t('coach.goLive.processingPhoto'))
			}).then(image => {
				this.setState({ isMenuOpen: false })
				const response = {
					uri: image.sourceURL || image.path,
					fileName: image.filename,
					type: image.mime
				}
				return handleResponse(response)
			})
				.catch(err => {
					console.log('User canceled image picking : ', err)
					this.setState({ isMenuOpen: false })
				})
		} else {
			ImagePicker.openCamera({
				cropping: true,
				freeStyleCropEnabled: true,
				width: 1024,
				height: 1024,
				useFrontCamera: true
			}).then(image => {
				this.setState({ isMenuOpen: false })
				const response = {
					uri: image.path || image.sourceURL,
					fileName: image.filename,
					type: image.mime
				}
				return handleResponse(response)
			})
				.catch(err => {
					console.log('User canceled image picking : ', err)
					this.setState({ isMenuOpen: false })
				})
		}
	}

	render() {
		const {
			picPreviewUri,
			picFinalUri,
			isImageLoading,
			isMenuOpen
		} = this.state
		const {
			onCancel,
			onSetPictureUri
		} = this.props

		const isImagePresent = picPreviewUri.length > 0 || picFinalUri.length > 0

		if (isImagePresent) {
			return (
				<View style={styles.mainContainer}>
					<TouchableOpacity
						onPress={() => this.setState({ isMenuOpen: true })}
						style={styles.editButton}
					>
						<Text
							style={[
								headingStyles.bbigText,
								colorStyles.citrusGrey
							]}
						>
							{capitalize(i18n.t('coach.schedule.edit'))}
						</Text>
					</TouchableOpacity>
					<FastImage
						style={styles.image}
						source={{
							uri: picPreviewUri || picFinalUri,
							priority: FastImage.priority.high
						}}
						resizeMode={FastImage.resizeMode.cover}
					>
						{
							isImageLoading &&
							<View>
								<Spinner color="#FFFFFF" />
								<Text
									style={{
										...headingStyles.bbigText,
										...colorStyles.white,
										textAlign: 'center'
									}}
								>
									{capitalize(i18n.t('coach.schedule.uploadingImage'))} ...
								</Text>
							</View>
						}
					</FastImage>
					{
						isMenuOpen &&
						<OverlayBottomMenu
							firstItemText={i18n.t('common.takePicture')}
							secondItemText={i18n.t('common.chooseFromLibrary')}
							thirdItemText={i18n.t('common.cancel')}
							onFirstItemAction={this.uploadPic}
							onSecondItemAction={() => this.uploadPic('library')}
							onThirdItemAction={() => this.setState({ isMenuOpen: false })}
						/>
					}
				</View>
			)
		}

		return (
			<View style={styles.mainContainer}>
				<ImageSquare
					width={90}
					height={90}
					stroke={'#FFFFFF'}
					strokeWidth={2}
				/>
				<TouchableOpacity
					onPress={() => this.setState({ isMenuOpen: true })}
					style={[
						buttonStyles.lightButton,
						styles.uploadButton
					]}
				>
					<Text
						style={{
							...headingStyles.bbigText,
							...colorStyles.citrusBlue,
							fontWeight: '700',
							fontSize: Platform.OS === 'ios' ? 16 : 14,
						}}
					>
						{capitalize(i18n.t('coach.schedule.addAPhoto'))}
					</Text>
				</TouchableOpacity>
				{
					isMenuOpen &&
					<OverlayBottomMenu
						firstItemText={i18n.t('common.takePicture')}
						secondItemText={i18n.t('common.chooseFromLibrary')}
						thirdItemText={i18n.t('common.cancel')}
						onFirstItemAction={this.uploadPic}
						onSecondItemAction={() => this.uploadPic('library')}
						onThirdItemAction={() => this.setState({
							isMenuOpen: false,
							isImageLoading: false
						})}
					/>
				}
			</View>
		)
	}
}

const styles = StyleSheet.create({
	spinnerContainer: {
		flex: 1,
		height: '100%',
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center'
	},
	mainContainer: {
		flex: 0,
		justifyContent: 'center',
		alignItems: 'center',
		height: '100%',
		width: '100%',
		backgroundColor: '#F8F8F8'
	},
	uploadButton: {
		width: 124,
		height: 35
	},
	editButton: {
		position: 'absolute',
		backgroundColor: '#FFFFFF',
		right: 0,
		top: 0,
		zIndex: 1000,
		height: 35,
		width: 60,
		justifyContent: 'center',
		alignItems: 'center'
	},
	image: {
		height: 335,
		width: '100%',
		flex: 0,
		justifyContent: 'center',
		alignItems: 'center',
	},
})

export default ImageUploader
