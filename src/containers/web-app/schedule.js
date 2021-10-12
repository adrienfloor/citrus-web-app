import React from 'react'
import { connect } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { withTranslation } from 'react-i18next'
import Loader from 'react-loader-spinner'
import moment from 'moment'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import * as UpChunk from '@mux/upchunk'
import axios from 'axios'
import io from 'socket.io-client'
import ProgressBar from '@ramonak/react-progress-bar'

import ImageUploader from '../../components/web-app/image-uploader'
import VideoUploader from '../../components/web-app/video-uploader'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'
import '../../styling/web-app.css'
import { ReactComponent as CaretDown } from '../../assets/svg/caret-down.svg'
import { ReactComponent as CaretUp } from '../../assets/svg/caret-up.svg'

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

import * as frCommonTranslations from '../../fixtures/fr'
import * as enCommonTranslations from '../../fixtures/en'

const translations = moment.locale() == 'fr' ? frCommonTranslations : enCommonTranslations
const sportsItems = Object.keys(translations.default.sportsAvailable)
const focusItems = Object.keys(translations.default.focus)
const levelsItems = Object.keys(translations.default.levels)
const durationsItems = Object.keys(translations.default.durationsByTen)
const equipmentsItems = Object.keys(translations.default.equipments)
const languagesItems = Object.keys(translations.default.languagesAvailable)
const pricesItems = Object.keys(translations.default.pricesAvailable)

const {
	REACT_APP_API_URL,
	REACT_APP_SERVER_URL
} = process.env

class Schedule extends React.Component {
	constructor(props) {
		super(props)
		const { coaching } = this.props
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
			isDatePickerOpen: false,
			isLoading: false,
			isSelecting: '',
			isShowingAllParams: false,
			isButtonDisabled: false,
			errorMessage: '',
			videoFile: '',
			isReadingFile: false,
			progress: null,
			isProcessingVideo: false
		}
		this.handleDateSelection = this.handleDateSelection.bind(this)
		this.returnPriceWording = this.returnPriceWording.bind(this)
		this.handleCreateCoaching = this.handleCreateCoaching.bind(this)
		this.upload = this.upload.bind(this)
	}

	componentDidMount() {
		this.socket = io(REACT_APP_SERVER_URL)
	}

	async upload(coachingId) {
		const { videoFile } = this.state
		const {
			updateCoaching,
			fetchTrainerCoachings,
			user,
			setNotification,
			t,
			history
		} = this.props
		// this.setState({ isReadingFile: true })
		// const file = await fetch(videoFile).then(res => res.blob()).then(blobFile => new File([blobFile], "new_video", { type: 'video/mp4,video/x-m4v,video/*' }))
		// if (file) { this.setState({ isReadingFile: false }) }
		try {
			const config = {
				headers: {
					'Content-Type': 'application/json'
				}
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

			const upload = UpChunk.createUpload({
				endpoint: muxUploadUrl,
				file: videoFile,
				chunkSize: 5120
			})

			// subscribe to events
			upload.on('error', err => {
				console.error('💥 🙀', err.detail)
			})

			upload.on('progress', progress => {
				console.log(`So far we've uploaded ${progress.detail}% of this file.`)
				this.setState({ progress: Math.round(progress.detail * 100) / 100 })
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
			price
		} = this.state
		const {
			createCoaching,
			coaching,
			updateCoaching,
			onCoachingCreated,
			t
		} = this.props
		const {
			firstName,
			lastName,
			userName,
			_id,
			coachRating,
		} = this.props.user

		e.preventDefault()

		this.setState({
			isButtonDisabled: true,
			progress: 0
		})

		if (this.hasMissingParams()) {
			this.setState({
				isButtonDisabled: false,
				progress: null,
				errorMessage: `${t('pleaseFillIn')} : ${this.hasMissingParams().join(', ')}`
			})
			setTimeout(function () {
				this.setState({
					errorMessage: ''
				})
			}.bind(this), 3000)
			return
		}

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
			pictureUri,
			coachRating,
		}

		if (coaching && coaching._id) {
			newCoaching._id = coaching._id;
			return updateCoaching(newCoaching)
				.then(res => {
					const coachingId = res.payload._id
					this.upload(coachingId)
				})
		}

		return createCoaching(newCoaching)
			.then(res => {
				const coachingId = res.payload._id
				this.upload(coachingId)
			})
	}

	handleDateSelection(date) {
		this.setState({
			startingDate: date,
			isDatePickerOpen: false,
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
		if (t(price)>1) {
			return `${t(price)} ${t('credits')}`
		}
		return `${t(price)} ${t('credit')}`
	}


	render() {
		const {
			onCancel,
			coaching,
			isGoingLive,
			user,
			videoThumbnail,
			t
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
			isDatePickerOpen,
			isLoading,
			isSelecting,
			isShowingAllParams,
			isButtonDisabled,
			errorMessage,
			progress,
			isProcessingVideo,
			price
		} = this.state

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
					/>
				</div>
			)
		}

		return (
			// <div className='schedule-container'>
			<div className='main-container'>
				<span className='big-title citrusBlack responsive-title'>
					{capitalize(t('post'))}
				</span>
				<form
					id='upload-form'
					onSubmit={this.handleCreateCoaching}
					className='scroll-div-vertical card upload-form'
				>
					<div className='medium-separator'></div>
					<input
						className='text-input small-text-bold citrusGrey input form-input'
						placeholder={capitalize(t('addTitle'))}
						onChange={(e) => this.setState({ title: e.target.value })}
						style={{ color: '#000000', border: 'none', height: 'unset' }}
						disabled={progress || progress === 0 ? true : false}
					/>
					<div className='medium-separator'></div>
					<Select
						className='form-input'
						id='simple-select'
						value={sport}
						onChange={e => this.setState({ sport: e.target.value })}
						disabled={progress || progress === 0 ? true : false}
						displayEmpty
						renderValue={(selected) => {
							if (selected.length === 0) {
								return <em className='small-text-bold citrusGrey'>{t('sportPlaceholder')}</em>
							}
							return t(selected)
						}}
					>
						<MenuItem disabled value="">
							<em className='small-text-bold citrusGrey'>{t('sportPlaceholder')}</em>
						</MenuItem>
						{
							sportsItems.map((sport, i) => (
								<MenuItem key={i} value={sport}>{capitalize(t(sport))}</MenuItem>
							))
						}
					</Select>
					<div className='medium-separator'></div>
					<Select
						className='form-input'
						id='simple-select'
						value={price}
						onChange={e => this.setState({ price: e.target.value })}
						disabled={progress || progress === 0 ? true : false}
						displayEmpty
						renderValue={(selected) => {
							if (selected.length === 0) {
								return (
									<em className='small-text-bold citrusGrey'>
										{`${t('pricePlaceholder')} ${returnCurrency(moment.locale())})`}
									</em>
								)
							}
							return this.returnPriceWording(selected)
						}}
					>
						<MenuItem disabled value="">
							<em className='small-text-bold citrusGrey'>{t('pricePlaceholder')}</em>
						</MenuItem>
						{
							pricesItems.map((price, i) => (
								<MenuItem value={price} key={i}>
									{this.returnPriceWording(price)}
								</MenuItem>
							))
						}
					</Select>
					{/* <input
						type='number'
						pattern='/^[0-9]+([.][0-9]+)?$/'
						value={price}
						className='text-input small-text-bold citrusGrey input form-input'
						placeholder={capitalize(t('addPrice'))}
						onChange={(e) => this.setState({ price: e.target.value })}
						style={{ color: '#000000', border: 'none', height: 'unset' }}
						disabled={progress || progress === 0 ? true : false}
					/> */}
					<div className='medium-separator'></div>
					{
						progress || progress === 0 ?
						null :
						<div className='more-details-row'>
							<span className='small-text-bold citrusGrey'>
								{
									!isShowingAllParams ?
									t('moreInfo') :
									t('showLess')
								}
							</span>
							<div
								onClick={() => this.setState({ isShowingAllParams: !isShowingAllParams })}
								className='hover'
							>
								{
									isShowingAllParams ?
										<CaretUp
											width={25}
											height={25}
											strokeWidth={2}
										/> :
										<CaretDown
											width={25}
											height={25}
											strokeWidth={2}
										/>
								}
							</div>
						</div>
					}
					{
						isShowingAllParams && !progress &&
						<>
							<Select
								className='form-input'
								id='simple-select'
								value={duration}
								onChange={e => this.setState({ duration: e.target.value })}
								displayEmpty
								renderValue={(selected) => {
									if (selected.length === 0) {
										return (
											<em className='small-text-bold citrusGrey'>
												{t('durationPlaceholder')}
											</em>
										)
									}
									return t(selected)
								}}
							>
								<MenuItem disabled value="">
									<em className='small-text-bold citrusGrey'>{t('durationPlaceholder')}</em>
								</MenuItem>
								{
									durationsItems.map((duration, i) => (
										<MenuItem key={i} value={duration}>{capitalize(t(duration))}</MenuItem>
									))
								}
							</Select>
							<div className='medium-separator'></div>
							<Select
								className='form-input'
								id='simple-select'
								value={level}
								onChange={e => this.setState({ level: e.target.value })}
								displayEmpty
								renderValue={(selected) => {
									if (selected.length === 0) {
										return (
											<em className='small-text-bold citrusGrey'>
												{t('levelPlaceholder')}
											</em>
										)
									}
									return t(selected)
								}}
							>
								<MenuItem disabled value="">
									<em className='small-text-bold citrusGrey'>{t('levelPlaceholder')}</em>
								</MenuItem>
								{
									levelsItems.map((level, i) => (
										<MenuItem key={i} value={level}>{capitalize(t(level))}</MenuItem>
									))
								}
							</Select>
							<div className='medium-separator'></div>
							<Select
								multiple
								className='form-input'
								id='simple-select'
								value={equipment}
								onChange={e => this.setState({ equipment: e.target.value })}
								displayEmpty
								renderValue={(selected) => {
									if (selected.length === 0) {
										return (
											<em className='small-text-bold citrusGrey'>
												{t('equipmentPlaceholder')}
											</em>
										)
									}
									return selected.map(el => t(el)).join(', ')
								}}
							>
								<MenuItem disabled value="">
									<em className='small-text-bold citrusGrey'>{t('equipmentPlaceholder')}</em>
								</MenuItem>
								{
									equipmentsItems.map((equipment, i) => (
										<MenuItem key={i} value={equipment}>{capitalize(t(equipment))}</MenuItem>
									))
								}
							</Select>
							<div className='medium-separator'></div>
							<Select
								multiple
								className='form-input'
								id='simple-select'
								value={focus}
								onChange={e => this.setState({ focus: e.target.value })}
								displayEmpty
								renderValue={(selected) => {
									if (selected.length === 0) {
										return (
											<em className='small-text-bold citrusGrey'>
												{t('focusPlaceholder')}
											</em>
										)
									}
									return selected.map(el => t(el)).join(', ')
								}}
							>
								<MenuItem disabled value="">
									<em className='small-text-bold citrusGrey'>{t('focusPlaceholder')}</em>
								</MenuItem>
								{
									focusItems.map((fc, i) => (
										<MenuItem key={i} value={fc}>{capitalize(t(fc))}</MenuItem>
									))
								}
							</Select>
							<div className='medium-separator'></div>
							<Select
								className='form-input'
								id='simple-select'
								value={language}
								onChange={e => this.setState({ language: e.target.value })}
								displayEmpty
								renderValue={(selected) => {
									if (selected.length === 0) {
										return (
											<em className='small-text-bold citrusGrey'>
												{t('languagePlaceholder')}
											</em>
										)
									}
									return t(selected)
								}}
							>
								<MenuItem disabled value="">
									<em className='small-text-bold citrusGrey'>{t('languagePlaceholder')}</em>
								</MenuItem>
								{
									languagesItems.map((language, i) => (
										<MenuItem key={i} value={language}>{capitalize(t(language))}</MenuItem>
									))
								}
							</Select>
						</>
					}
					<div className='medium-separator'></div>
					<div className='media-row'>
						<ImageUploader
							disabled={progress || progress === 0 ? true : false}
							t={t}
							onSetPictureUri={pictureUri => {
								this.setState({ pictureUri })
							}}
							pictureUri={pictureUri ? pictureUri : null}
						/>
						<VideoUploader
							disabled={progress || progress === 0 ? true : false}
							t={t}
							onVideoSelected={videoFile => this.setState({ videoFile })}
						/>
					</div>
					<div className='small-separator'></div>
					<div className='medium-separator'></div>
					<div className='flex-row' style={{ width: '100%', justifyContent: 'center' }}>
						{
							!progress && progress != 0 && !isProcessingVideo &&
							<button
								className={!isButtonDisabled ? 'filled-button button' : 'filled-button disabled-button button'}
								type='submit'
								form='upload-form'
								disabled={isButtonDisabled}
							>
								<span className='small-title citrusWhite'>
									{capitalize(t('createCoaching'))}
								</span>
							</button>
						}
						{
							progress !== null && progress >= 0 && !isProcessingVideo ?
							<div style={{ height: '50px', width: '100%' }}>
								<div className='flex-row' style={{ alignItems: 'center'}}>
									<span className='small-text-bold citrusBlack' style={{ height: '25px', marginRight: '5px'}}>
										{`${capitalize(t('uploadingVideo'))} : ${progress}%`}
									</span>
									<Loader
										type="Oval"
										color="#C2C2C2"
										height={20}
										width={20}
									/>
								</div>
								<ProgressBar
									completed={progress}
									height='10px'
									baseBgColor='#DFDFDF'
									bgColor='#C2C2C2'
									isLabelVisible={false}
								/>
							</div> : null
						}
						{
							isProcessingVideo &&
							<div style={{ height: '50px', width: '100%' }}>
								<div className='flex-row' style={{ alignItems: 'center' }}>
									<span className='small-text-bold citrusBlack' style={{ height: '25px', marginRight: '5px' }}>
										{capitalize(t('processingVideo'))}
									</span>
									<Loader
										type="Oval"
										color="#C2C2C2"
										height={20}
										width={20}
									/>
								</div>
							</div>
						}
					</div>
					{
						progress !== null && progress >= 0 && !isProcessingVideo ?
							<span className='small-text-bold citrusBlack' style={{ width: '80%' }}>
								{capitalize(t('dontClose'))}
							</span> : null
					}
					{
						errorMessage.length > 0 &&
						<span
							className='small-text-bold citrusRed'
							style={{ marginTop: 10 }}
						>
							{errorMessage}
						</span>
					}
				</form>
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
	setNotification: notification => dispatch(setNotification(notification))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Schedule))