import React from 'react'
import { connect } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { withTranslation } from 'react-i18next'
import Loader from 'react-loader-spinner'
import moment from 'moment'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'
import * as UpChunk from '@mux/upchunk'
import axios from 'axios'
import io from 'socket.io-client'
import ProgressBar from '@ramonak/react-progress-bar'
import Dialog from '@material-ui/core/Dialog'
import qs from 'query-string'

import CreateLegalUser from './create-legal-user'
import ImageUploader from '../../components/web-app/image-uploader/image-uploader'
import VideoUploader from '../../components/web-app/video-uploader'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'
import '../../styling/web-app.css'
import { ReactComponent as CaretDown } from '../../assets/svg/caret-down.svg'
import { ReactComponent as CaretUp } from '../../assets/svg/caret-up.svg'
import { ReactComponent as Check } from '../../assets/svg/check.svg'
import { ReactComponent as Close } from '../../assets/svg/close.svg'

import {
	capitalize,
	countryCodeToLanguage,
	returnCurrency
} from '../../utils/various'

import {
	createCoaching,
	updateCoaching,
	deleteCoaching,
	fetchTrainerCoachings
} from '../../actions/coachings-actions'
import { setNotification } from '../../actions/notifications-actions'
import { loadWebviewUser } from '../../actions/auth-actions'

import * as frCommonTranslations from '../../fixtures/fr'
import * as enCommonTranslations from '../../fixtures/en'

let sportsItems = []
let focusItems = []
let levelsItems = []
let durationsItems = []
let equipmentsItems = []
let languagesItems = []
let pricesItems = []

const {
	REACT_APP_API_URL,
	REACT_APP_SERVER_URL
} = process.env

let upload = null

class Schedule extends React.Component {
	constructor(props) {
		super(props)
		const { coaching, location } = this.props
		const videoSrc = qs.parse(location.search, { ignoreQueryPrefix: true }).videoSrc
		const videoFile = qs.parse(location.search, { ignoreQueryPrefix: true }).videoFile
		const token = qs.parse(location.search, { ignoreQueryPrefix: true }).token
		this.state = {
			title: (coaching || {}).title || '',
			sport: (coaching || {}).sport || '',
			pictureUri: (coaching || {}).pictureUri || '',
			startingDate: (coaching || {}).startingDate || '',
			duration: (coaching || {}).duration || '',
			level: (coaching || {}).level || '',
			equipment: (coaching || {}).equipment || [],
			focus: (coaching || {}).focus || [],
			language: (coaching || {}).coachingLanguage || '',
			freeAccess: (coaching || {}).freeAccess || '',
			price: (coaching || {}).price || '',
			isLoading: false,
			isSelecting: '',
			isButtonDisabled: false,
			errorMessage: '',
			videoFile: videoFile || '',
			isReadingFile: false,
			progress: null,
			isProcessingVideo: false,
			isCreatingLegalUser: false,
			videoErrorMessage: '',
			coachingId: null,
			isConfirmingCancelUpload: false,
			isUploading: false,
			videoSrc: videoSrc || ''
		}

		if(token) {
			this.props.loadWebviewUser(token)
		}

		const translations = this.props.i18n.language == 'fr' ? frCommonTranslations : enCommonTranslations
		sportsItems = Object.keys(translations.default.sportsAvailable)
		focusItems = Object.keys(translations.default.focus)
		levelsItems = Object.keys(translations.default.levels)
		durationsItems = Object.keys(translations.default.durationsByTen)
		equipmentsItems = Object.keys(translations.default.equipments)
		languagesItems = Object.keys(translations.default.languagesAvailable)
		pricesItems = Object.keys(translations.default.pricesAvailable)

		this.returnPriceWording = this.returnPriceWording.bind(this)
		this.handleCreateCoaching = this.handleCreateCoaching.bind(this)
		this.upload = this.upload.bind(this)
		this.returnMultipleSelectItem = this.returnMultipleSelectItem.bind(this)
		this.returnSimpleSelectItem = this.returnSimpleSelectItem.bind(this)
		this.handleCancelUpload = this.handleCancelUpload.bind(this)
	}

	componentDidMount() {
		this.socket = io(REACT_APP_SERVER_URL)
	}

	componentWillUnmount() {
		if(upload) {
			upload.abort()
		}
	}

	async upload(coachingId) {
		const { videoFile } = this.state
		const {
			updateCoaching,
			deleteCoaching,
			fetchTrainerCoachings,
			user,
			setNotification,
			t,
			history
		} = this.props
		try {
			const config = {
				headers: {
					'Content-Type': 'application/json'
				}
			}

			if(!videoFile) {
				this.setState({
					progress: null,
					isProcessingVideo: false,
					errorMessage: capitalize(t('unreadableVideoFile'))
				})
				deleteCoaching(coachingId)
				setTimeout(function () {
					this.setState({
						errorMessage: ''
					})
				}.bind(this), 5000)
				return
			}
			const muxResponse = await axios.get(`${REACT_APP_API_URL}/stream/create_mux_upload_url`, {}, config)
			const muxUploadUrl = muxResponse.data.data.url
			const passthrough = muxResponse.data.data.new_asset_settings.passthrough

			const updatedCoaching = {
				_id: coachingId,
				passthrough
			}

			updateCoaching(updatedCoaching)
			.then(res => console.log('updated coaching : ', res))

			upload = UpChunk.createUpload({
				endpoint: muxUploadUrl,
				file: videoFile,
				chunkSize: 5120
			})

			// subscribe to events
			upload.on('error', err => {
				console.error('💥 🙀', err.detail)
				this.setState({
					progress: null,
					isProcessingVideo: false,
					errorMessage: capitalize(err.detail)
				})
				deleteCoaching(coachingId)
				return
			})

			upload.on('progress', progress => {
				if(progress && progress.detail && progress.detail > 0) {
					this.setState({
						isLoading: false,
						isUploading: true
					})
				}
				console.log(`So far we've uploaded ${progress.detail}% of this file.`)
				this.setState({ progress: Math.round(progress.detail) })
			})

			upload.on('success', () => {
				console.log("Wrap it up, we're done here. 👋")
				this.setState({
					isProcessingVideo: true
				})
				this.socket.on(`coaching_ready_${passthrough}`, coaching => {
					console.log('socket on coaching ready')
					fetchTrainerCoachings(user._id, true)
						.then(res => {
							setNotification({ message: capitalize(t('successFullyUploadedCoaching')) })
							history.push('/home?tab=coaching')
						})
					console.log('coaching ready : ', coaching)
				})
			})
		} catch (err) {
			console.log(err)
		}
	}

	handleCreateCoaching(e) {
		const {
			title,
			sport,
			pictureUri,
			startingDate,
			duration,
			level,
			equipment,
			focus,
			language,
			freeAccess,
			price,
			isCreatingLegalUser
		} = this.state
		const {
			createCoaching,
			coaching,
			updateCoaching,
			onCoachingCreated,
			t,
			user
		} = this.props
		const {
			firstName,
			lastName,
			userName,
			_id,
			coachRating,
			MPLegalUserId
		} = user

		if(e) { e.preventDefault()}

		this.setState({
			isCreatingLegalUser: false,
			isButtonDisabled: true,
			progress: null
		})

		// if (this.hasMissingParams()) {
		// 	this.setState({
		// 		isButtonDisabled: false,
		// 		progress: null,
		// 		errorMessage: `${t('pleaseFillIn')} : ${this.hasMissingParams().join(', ')}`
		// 	})
		// 	setTimeout(function () {
		// 		this.setState({
		// 			errorMessage: ''
		// 		})
		// 	}.bind(this), 3000)
		// 	return
		// }

		// if (MPLegalUserId.length <= 0) {
		// 	return this.setState({
		// 		isCreatingLegalUser: true,
		// 		isButtonDisabled: false,
		// 		progress: null
		// 	})
		// }

		this.setState({ isLoading: true })

		const newCoaching = {
			title: title.toLowerCase(),
			sport,
			duration,
			level: level && level.length > 0 ? level : 'allLevel',
			equipment: equipment && equipment.length > 0 ? equipment : [],
			startingDate: startingDate || Date.now(),
			startingTime: startingDate ? moment(startingDate).format('h') : moment(Date.now()).format('h'),
			focus: focus && focus.length > 0 ? focus : [],
			coachingLanguage: language.length > 0 ? language : countryCodeToLanguage(moment.locale()),
			freeAccess: price === 0 ? true : false,
			price: t(price),
			coachFirstName: firstName.toLowerCase(),
			coachLastName: lastName.toLowerCase(),
			coachUserName: userName.toLowerCase(),
			coachId: _id,
			// pictureUri,
			pictureUri: 'https://res.cloudinary.com/dho1rqbwk/image/upload/v1644222312/VonageApp/rh2wraz2kgp6gfieydwy.jpg',
			coachRating,
		}

		return createCoaching(newCoaching)
			.then(res => {
				const coachingId = res.payload._id
				this.setState({ coachingId })
				this.upload(coachingId)
			})
	}

	hasMissingParams() {
		const missingParams = []
		const {
			title,
			sport,
			pictureUri,
			videoFile,
			price
		} = this.state
		const { t } = this.props
		if (!title) {
			missingParams.push(t('title'))
		}
		if (!sport) {
			missingParams.push(t('sport'))
		}
		if (!pictureUri) {
			missingParams.push(t('picture'))
		}
		if (!videoFile) {
			missingParams.push(t('video'))
		}
		if (!price) {
			missingParams.push(t('price'))
		}
		if (missingParams.length > 0) {
			return missingParams
		}
		return false
	}

	returnPriceWording(price) {
		const { t } = this.props
		if (t(price) === 0) {
			return capitalize(t('freeAccess'))
		}
		// if (t(price)>1) {
		// 	return `${t(price)} ${t('credits')}`
		// }
		// return `${t(price)} ${t('credit')}`
		return `${t(price)} ${returnCurrency(moment.locale())}`
	}

	returnMultipleSelectItem(item, type) {
		const { t, user } = this.props
		const { equipment, focus } = this.state
		let isSelected = focus.includes(item)
		if (type === 'gear') {
			isSelected = equipment.includes(item)
		}
		return (
			<div
				className='flex-row'
				style={{
					alignItems: 'center',
					justifyContent: 'space-between',
					width: '100%'
				}}
			>
				<div>{capitalize(t(item))}</div>
				{
					isSelected &&
					<Check
						width={20}
						height={20}
						strokeWidth={2}
					/>
				}
			</div>
		)
	}

	returnSimpleSelectItem(item) {
		const { t } = this.props
		return (
			<div
				className='flex-row'
				style={{
					alignItems: 'center',
					justifyContent: 'space-between',
					width: '100%'
				}}
			>
				<div>{capitalize(t(item))}</div>
				<Check
					width={20}
					height={20}
					strokeWidth={2}
				/>
			</div>
		)
	}

	handleCancelUpload() {
		const { coachingId } = this.state
		const {
			deleteCoaching,
			user,
			t,
			history
		} = this.props

		this.setState({
			progress: null,
			isProcessingVideo: false,
			errorMessage: capitalize(t('videoUploadCanceled')),
			isUploading: false,
			isButtonDisabled: false,
			isProcessingVideo: false,
			isCreatingLegalUser: false,
			coachingId: null,
			isConfirmingCancelUpload: false
		})

		upload.abort()

		deleteCoaching(coachingId)
		setTimeout(function () {
			this.setState({
				errorMessage: ''
			})
		}.bind(this), 3000)
	}


	render() {
		const {
			onCancel,
			coaching,
			isGoingLive,
			user,
			videoThumbnail,
			t,
			classes,
			location
		} = this.props
		const {
			title,
			sport,
			pictureUri,
			startingDate,
			duration,
			level,
			equipment,
			focus,
			language,
			freeAccess,
			isLoading,
			isSelecting,
			isButtonDisabled,
			errorMessage,
			progress,
			isProcessingVideo,
			price,
			isCreatingLegalUser,
			videoErrorMessage,
			isConfirmingCancelUpload,
			isUploading,
			videoSrc
		} = this.state

		const isWebview = location && location.pathname === '/schedule-webview'

		if (isLoading) {
			return (
				<div
					className='flex-column flex-center'
					style={{ height: '100%' }}
				>
					<Loader
						type='Oval'
						color='#C2C2C2'
						height={100}
						width={100}
						style={{ marginTop: isWebview ? '300px' : 0 }}
					/>
				</div>
			)
		}

		return (
			<div className='main-container'>
				{
					!isWebview &&
					<span className='big-title citrusBlack responsive-title'>
						{capitalize(t('post'))}
					</span>
				}
				{  isWebview && <div className='medium-separator'></div> }
				<div
					onSubmit={e => this.handleCreateCoaching(e)}
					className='scroll-div-vertical card upload-form schedule'
				>
					<div className='medium-separator'></div>
					<div className='small-separator'></div>
					<span className='small-title citrusBlack small-responsive-title-settings'>
						{capitalize(t('newTraining'))}
					</span>
					<div className='medium-separator'></div>
					<span className='small-text-bold citrusGrey titles-form-input'>
						{capitalize(t('title'))}
					</span>
					<TextField
						placeholder={capitalize(t('addTitle'))}
						variant='outlined'
						className='small-text-bold citrusGrey form-input'
						onChange={(e) => this.setState({ title: e.target.value })}
						disabled={progress || progress === 0 ? true : false}
						value={title}
					/>
					<div className='medium-separator'></div>
					<div className='small-separator'></div>
					<span className='small-text-bold citrusGrey titles-form-input'>
						{capitalize(t('sport'))}
					</span>
					<Select
						variant='outlined'
						className='form-input'
						value={sport}
						onChange={e => this.setState({ sport: e.target.value })}
						disabled={progress || progress === 0 ? true : false}
						displayEmpty
						renderValue={(selected) => {
							if (selected.length === 0) {
								return <em className='small-text-bold citrusGrey'>{capitalize(t('sportPlaceholder'))}</em>
							}
							return capitalize(t(selected))
						}}
					>
						<MenuItem disabled value="">
							<em className='small-text-bold citrusGrey'>{t('sportPlaceholder')}</em>
						</MenuItem>
						{
							sportsItems.map((sport, i) => (
								<MenuItem key={i} value={sport}>
								{
									sport === this.state.sport ?
									this.returnSimpleSelectItem(sport) :
									capitalize(t(sport))
								}
							</MenuItem>
							))
						}
					</Select>
					<div className='medium-separator'></div>
					<div className='small-separator'></div>
					<span className='small-text-bold citrusGrey titles-form-input'>
						{capitalize(t('price'))}
					</span>
					<Select
						variant='outlined'
						className='form-input'
						value={price}
						onChange={e => this.setState({ price: e.target.value })}
						disabled={progress || progress === 0 ? true : false}
						displayEmpty
						renderValue={(selected) => {
							if (selected.length === 0) {
								return (
									<em className='small-text-bold citrusGrey'>
										{t('pricePlaceholder')}
									</em>
								)
							}
							return this.returnPriceWording(selected)
						}}
					>
						<MenuItem disabled value="">
							<em className='small-text-bold citrusGrey'>
								{t('pricePlaceholder')}
							</em>
						</MenuItem>
						{
							pricesItems.map((price, i) => (
								<MenuItem value={price} key={i}>
									{
										price === this.state.price ?
											this.returnSimpleSelectItem(this.returnPriceWording(price)) :
											this.returnPriceWording(price)
									}
								</MenuItem>
							))
						}
					</Select>
					<div className='medium-separator'></div>
					<div className='small-separator'></div>
					<span className='small-text-bold citrusGrey titles-form-input'>
						{capitalize(t('addAThumbnail'))}
					</span>
					<div className='media-row'>
						<ImageUploader
							disabled={progress || progress === 0 ? true : false}
							t={t}
							onSetPictureUri={pictureUri => {
								this.setState({ pictureUri })
							}}
							pictureUri={pictureUri ? pictureUri : null}
						/>
					</div>
					<div className='medium-separator'></div>
					<div className='small-separator'></div>
					<span className='small-text-bold citrusGrey titles-form-input'>
						{capitalize(t('addAVideo'))}
					</span>
					<div className='media-row'>
						<VideoUploader
							disabled={progress || progress === 0 ? true : false}
							t={t}
							onVideoSelected={(videoFile, videoSrc) => {
								console.log('video file', videoFile)
								console.log('videoSrc', videoSrc)
								this.setState({ videoFile, videoSrc })
							}}
							onError={() =>this.setState({
								videoErrorMessage: capitalize(t('unreadableVideoFile')),
								videoFile: ''
							})}
							videoSrc={videoSrc}
						/>
						{
							videoErrorMessage &&
							<>
								<div className='small-separator'></div>
								<div className='small-separator'></div>
									<span className='small-text-bold citrusRed'>
										{videoErrorMessage}
									</span>
							</>
						}
					</div>
					{/* <div className='medium-separator'></div>
					<div className='small-separator'></div>
					<span className='small-text-bold citrusGrey titles-form-input'>
						{`${capitalize(t('duration'))} ( ${t('optional')} )`}
					</span>
					<Select
						variant='outlined'
						className='form-input'
						value={duration}
						onChange={e => this.setState({ duration: e.target.value })}
						displayEmpty
						renderValue={(selected) => {
							if (selected.length === 0) {
								return (
									<em className='small-text-bold citrusGrey'>
										{capitalize(t('durationPlaceholder'))}
									</em>
								)
							}
							return capitalize(t(selected))
						}}
					>
						<MenuItem disabled value="">
							<em className='small-text-bold citrusGrey'>{t('durationPlaceholder')}</em>
						</MenuItem>
						{
							durationsItems.map((duration, i) => (
								<MenuItem key={i} value={duration}>
									{
										duration === this.state.duration ?
											this.returnSimpleSelectItem(duration) :
											capitalize(t(duration))
									}
								</MenuItem>
							))
						}
					</Select> */}
					<div className='medium-separator'></div>
					<div className='small-separator'></div>
					<span className='small-text-bold citrusGrey titles-form-input'>
						{`${capitalize(t('level'))} ( ${t('optional')} )`}
					</span>
					<Select
						variant='outlined'
						className='form-input'
						value={level}
						onChange={e => this.setState({ level: e.target.value })}
						displayEmpty
						renderValue={(selected) => {
							if (selected.length === 0) {
								return (
									<em className='small-text-bold citrusGrey'>
										{capitalize(t('levelPlaceholder'))}
									</em>
								)
							}
							return capitalize(t(selected))
						}}
					>
						<MenuItem disabled value="">
							<em className='small-text-bold citrusGrey'>{t('levelPlaceholder')}</em>
						</MenuItem>
						{
							levelsItems.map((level, i) => (
								<MenuItem key={i} value={level}>
									{
										level === this.state.level ?
											this.returnSimpleSelectItem(level) :
											capitalize(t(level))
									}
								</MenuItem>
							))
						}
					</Select>
					<div className='medium-separator'></div>
					<div className='small-separator'></div>
					<span className='small-text-bold citrusGrey titles-form-input'>
						{`${capitalize(t('equipment'))} ( ${t('optional')} )`}
					</span>
					<Select
						multiple
						variant='outlined'
						className='form-input'
						value={equipment}
						onChange={e => this.setState({ equipment: e.target.value })}
						displayEmpty
						renderValue={(selected) => {
							if (selected.length === 0) {
								return (
									<em className='small-text-bold citrusGrey'>
										{capitalize(t('equipmentPlaceholder'))}
									</em>
								)
							}
							return selected.map(el => capitalize(t(el))).join(', ')
						}}
					>
						<MenuItem disabled value="">
							<em className='small-text-bold citrusGrey'>{t('equipmentPlaceholder')}</em>
						</MenuItem>
						{
							equipmentsItems.map((equipment, i) => (
								<MenuItem key={i} value={equipment}>
									{this.returnMultipleSelectItem(equipment, 'gear')}
								</MenuItem>
							))
						}
					</Select>
					<div className='medium-separator'></div>
					<div className='small-separator'></div>
					<span className='small-text-bold citrusGrey titles-form-input'>
						{`${capitalize(t('focus'))} ( ${t('optional')} )`}
					</span>
					<Select
						multiple
						variant='outlined'
						className='form-input'
						value={focus}
						onChange={e => this.setState({ focus: e.target.value })}
						displayEmpty
						renderValue={(selected) => {
							if (selected.length === 0) {
								return (
									<em className='small-text-bold citrusGrey'>
										{capitalize(t('focusPlaceholder'))}
									</em>
								)
							}
							return selected.map(el => capitalize(t(el))).join(', ')
						}}
					>
						<MenuItem disabled value="">
							<em className='small-text-bold citrusGrey'>{t('focusPlaceholder')}</em>
						</MenuItem>
						{
							focusItems.map((fc, i) => (
								<MenuItem key={i} value={fc}>
									{this.returnMultipleSelectItem(fc, 'focus')}
								</MenuItem>
							))
						}
					</Select>
					<div className='medium-separator'></div>
					<div className='small-separator'></div>
					<span className='small-text-bold citrusGrey titles-form-input'>
						{`${capitalize(t('language'))} ( ${t('optional')} )`}
					</span>
					<Select
						variant='outlined'
						className='form-input'
						value={language}
						onChange={e => this.setState({ language: e.target.value })}
						displayEmpty
						renderValue={(selected) => {
							if (selected.length === 0) {
								return (
									<em className='small-text-bold citrusGrey'>
										{capitalize(t('languagePlaceholder'))}
									</em>
								)
							}
							return capitalize(t(selected))
						}}
					>
						<MenuItem disabled value="">
							<em className='small-text-bold citrusGrey'>{t('languagePlaceholder')}</em>
						</MenuItem>
						{
							languagesItems.map((language, i) => (
								<MenuItem key={i} value={language}>
									{
										language === this.state.language ?
											this.returnSimpleSelectItem(language) :
											capitalize(t(language))
									}
								</MenuItem>
							))
						}
					</Select>
					<div className='medium-separator'></div>
					{
						errorMessage.length > 0 &&
						<>
							<div className='medium-separator'></div>
							<span className='small-text-bold citrusRed'>
								{errorMessage}
							</span>
						</>
					}
					<div className='medium-separator'></div>
					<div className='small-separator'></div>
					{
						!progress && progress != 0 && !isProcessingVideo &&
						<div className='flex-row schedule-button-container'>
							<button
								onClick={e => this.handleCreateCoaching(e)}
								className={
									!isButtonDisabled ?
									'filled-button button schedule-submit-button' :
									'filled-button disabled-button button schedule-submit-button'
								}
								type='submit'
								disabled={isButtonDisabled}
							>
								<span className='small-title citrusWhite'>
									{capitalize(t('createCoaching'))}
								</span>
							</button>
							{  isWebview && <div className='medium-separator'></div> }
						</div>
					}
				</div>
				{
					isUploading ?
					<Dialog
						open={true}
						onClose={() => this.setState({
							progress: 0,
							isProcessingVideo: false
						})}
					>
						{
							!isConfirmingCancelUpload &&
							<div
								style={{
									width: '99%',
									height: isWebview ? '90px' : '50px',
									display: 'flex',
									justifyContent: 'flex-end',
									alignItems: isWebview ? 'flex-end' : 'center'
								}}
								onClick={() => this.setState({ isConfirmingCancelUpload: true })}
								className='hover'
							>
								<Close
									width={25}
									height={25}
									stroke={'#C2C2C2'}
									strokeWidth={2}
									style={{ paddingRight: isWebview ? '12px' : '0' }}
								/>
							</div>
						}
						<div
							className='flex-center flex-column full-width-and-height-dialog upload-dialog'
							style={{ minHeight: '700px' }}
						>
							{
								isConfirmingCancelUpload &&
								<>
									<div className='small-separator'></div>
									<span className='small-title'>
										{capitalize(t('areYouSureYouWantToCancelTheUpload'))}
									</span>
									<div className='small-separator'></div>
									<div className='medium-separator'></div>
									<div
										className='flex-column flex-center'
										style={{ width: '98%' }}
									>
										<div
											className='filled-button'
											onClick={this.handleCancelUpload}
										>
											<span className='small-title citrusWhite'>
												{capitalize(t('yes'))}
											</span>
										</div>
										<div className='small-separator'></div>
										<div
											className='light-button'
											onClick={() => this.setState({
												isConfirmingCancelUpload: false
											})}
										>
											<span className='small-title citrusBlue'>
												{capitalize(t('no'))}
											</span>
										</div>
									</div>
								</>
							}
							{
								progress !== null && progress >= 0 && !isProcessingVideo && !isConfirmingCancelUpload ?
									<div className='flex-column'>
										<div
											className='flex-row'
											style={{ alignItems: 'center', justifyContent: 'center' }}
										>
											<span className='big-title-upload-video citrusBlack' style={{ height: '25px', marginRight: '5px' }}>
												{`${capitalize(t('uploadingVideo'))} : ${progress}%`}
											</span>
										</div>
										<div className='medium-separator'></div>
										<div className='medium-separator'></div>
										<div className='flex-center' style={{ width: '100%'}}>
											<ProgressBar
												completed={progress}
												height='10px'
												width='310px'
												baseBgColor='#DFDFDF'
												bgColor='#0075FF'
												isLabelVisible={false}
											/>
										</div>
									</div> : null
							}
							<div className='medium-separator'></div>
							<div className='small-separator'></div>
							{
								isProcessingVideo && !isConfirmingCancelUpload &&
									<div className='flex-row' style={{ width: '100%' }}>
									<div
										className='flex-column'
										style={{
											alignItems: 'center',
											width: '100%'
										}}
									>
										<Loader
											type="Oval"
											color="#C2C2C2"
											height={60}
											width={60}
										/>
										<div className='medium-separator'></div>
										<span
											style={{ maxWidth: '96%', marginLeft: '2%' }}
											className='tablet-only small-title citrusGrey'
										>
											{capitalize(t('processingVideoDontQuit'))}
										</span>
										<span
											style={{ maxWidth: '96%', marginLeft: '2%' }}
											className='not-on-tablet small-title citrusGrey'
										>
											{capitalize(t('processingVideoDontClose'))}
										</span>
									</div>
								</div>
							}
							{
								progress !== null && progress >= 0 && !isProcessingVideo && !isConfirmingCancelUpload ?
									<>
									<span
										className='not-on-tablet small-title citrusBlack'
										style={{
											width: '100%',
											marginBottom: '10px',
											textAlign: 'center',
											maxWidth: '320px'
										}}
									>
										{capitalize(t('dontClose'))}
									</span>
									<span
										className='tablet-only small-title citrusBlack'
										style={{
											width: '100%',
											marginBottom: '10px',
											textAlign: 'center',
											maxWidth: '320px'
										}}
										// style={{ maxWidth: '96%', marginLeft: '2%' }}
									>
										{capitalize(t('dontQuit'))}
									</span>
									</> : null
							}
							{
								errorMessage.length > 0 && !isConfirmingCancelUpload &&
								<>
									<div className='medium-separator'></div>
									<span className='small-text-bold citrusRed'>
										{errorMessage}
									</span>
								</>
							}
						</div>
					</Dialog> : null
				}
				{
					isCreatingLegalUser &&
					<Dialog
						open={true}
						onClose={() => this.setState({ isCreatingLegalUser: null })}
					>
						<div className='full-width-and-height-dialog'>
							<CreateLegalUser
								onUserCreated={e => this.handleCreateCoaching(e)}
								onCancel={() => {
									this.setState({ isCreatingLegalUser: false })
								}}
							/>
						</div>
					</Dialog>
				}
			</div>
		)
	}
}

const mapStateToProps = (state) => ({
	user: state.auth.user
})

const mapDispatchToProps = (dispatch) => ({
	createCoaching: coachingInfo => dispatch(createCoaching(coachingInfo)),
	updateCoaching: coachingInfo => dispatch(updateCoaching(coachingInfo)),
	fetchTrainerCoachings: (id, isMe) => dispatch(fetchTrainerCoachings(id, isMe)),
	setNotification: notification => dispatch(setNotification(notification)),
	deleteCoaching: coachingId => dispatch(deleteCoaching(coachingId)),
	loadWebviewUser: token => dispatch(loadWebviewUser(token))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Schedule))