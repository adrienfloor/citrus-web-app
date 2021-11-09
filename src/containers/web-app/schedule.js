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

import CreateLegalUser from './create-legal-user'
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
import { ReactComponent as Check } from '../../assets/svg/check.svg'

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
			isLoading: false,
			isSelecting: '',
			// isShowingAllParams: false,
			isButtonDisabled: false,
			errorMessage: '',
			videoFile: '',
			isReadingFile: false,
			progress: null,
			isProcessingVideo: false,
			isCreatingLegalUser: false
		}
		this.returnPriceWording = this.returnPriceWording.bind(this)
		this.handleCreateCoaching = this.handleCreateCoaching.bind(this)
		this.upload = this.upload.bind(this)
		this.returnMultipleSelectItem = this.returnMultipleSelectItem.bind(this)
		this.returnSimpleSelectItem = this.returnSimpleSelectItem.bind(this)
	}

	componentDidMount() {
		this.socket = io(REACT_APP_SERVER_URL)
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

			const upload = UpChunk.createUpload({
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

		if (MPLegalUserId.length <= 0) {
			return this.setState({
				isCreatingLegalUser: true,
				isButtonDisabled: false,
				progress: null
			})
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

		return createCoaching(newCoaching)
			.then(res => {
				const coachingId = res.payload._id
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
		if (t(price)>1) {
			return `${t(price)} ${t('credits')}`
		}
		return `${t(price)} ${t('credit')}`
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


	render() {
		const {
			onCancel,
			coaching,
			isGoingLive,
			user,
			videoThumbnail,
			t,
			classes
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
			// isShowingAllParams,
			isButtonDisabled,
			errorMessage,
			progress,
			isProcessingVideo,
			price,
			isCreatingLegalUser,
			videoErrorMessage
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
			<div className='main-container'>
				<span className='big-title citrusBlack responsive-title'>
					{capitalize(t('post'))}
				</span>
				<form
					id='upload-form'
					onSubmit={e => this.handleCreateCoaching(e)}
					className='scroll-div-vertical card upload-form schedule'
				>
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
					/>
					<div className='medium-separator'></div>
					<span className='small-text-bold citrusGrey titles-form-input'>
						{capitalize(t('sport'))}
					</span>
					<div className='desktop-only-small-separator'></div>
					<Select
						variant='outlined'
						className='form-input'
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
					<span className='small-text-bold citrusGrey titles-form-input'>
						{capitalize(t('price'))}
					</span>
					<div className='desktop-only-small-separator'></div>
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
					{/* {
						progress || progress === 0 ?
						null :
						<div className='more-details-row'>
							<span className='small-text-bold citrusGrey'>
								{
									!isShowingAllParams ?
									t('moreInfo') :
									''
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
					} */}
					<span className='small-text-bold citrusGrey titles-form-input'>
						{capitalize(t('addAThumbnail'))}
					</span>
					<div className='desktop-only-small-separator'></div>
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
					<div className='desktop-only-small-separator'></div>
					<div className='media-row'>
						<VideoUploader
							disabled={progress || progress === 0 ? true : false}
							t={t}
							onVideoSelected={videoFile => this.setState({ videoFile })}
							onError={() =>this.setState({
								videoErrorMessage: capitalize(t('unreadableVideoFile')),
								videoFile: ''
							})}
						/>
						{
							videoErrorMessage &&
							<>
								<div className='small-separator'></div>
									<span className='small-text-bold citrusRed'>
										{errorMessage}
									</span>
								<div className='small-separator'></div>
							</>
						}
					</div>
					<div className='medium-separator'></div>
					{
						// isShowingAllParams && !progress &&
						!progress &&
						<>
							<span className='small-text-bold citrusGrey titles-form-input'>
								{`${capitalize(t('duration'))} ( ${t('optional')} )`}
							</span>
							<div className='desktop-only-small-separator'></div>
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
										<MenuItem key={i} value={duration}>
											{
												duration === this.state.duration ?
													this.returnSimpleSelectItem(duration) :
													capitalize(t(duration))
											}
										</MenuItem>
									))
								}
							</Select>
							<div className='medium-separator'></div>
							<span className='small-text-bold citrusGrey titles-form-input'>
								{`${capitalize(t('level'))} ( ${t('optional')} )`}
							</span>
							<div className='desktop-only-small-separator'></div>
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
							<span className='small-text-bold citrusGrey titles-form-input'>
								{`${capitalize(t('equipment'))} ( ${t('optional')} )`}
							</span>
							<div className='desktop-only-small-separator'></div>
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
										<MenuItem key={i} value={equipment}>
											{this.returnMultipleSelectItem(equipment, 'gear')}
										</MenuItem>
									))
								}
							</Select>
							<div className='medium-separator'></div>
							<span className='small-text-bold citrusGrey titles-form-input'>
								{`${capitalize(t('focus'))} ( ${t('optional')} )`}
							</span>
							<div className='desktop-only-small-separator'></div>
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
										<MenuItem key={i} value={fc}>
											{this.returnMultipleSelectItem(fc, 'focus')}
										</MenuItem>
									))
								}
							</Select>
							<div className='medium-separator'></div>
							<span className='small-text-bold citrusGrey titles-form-input'>
								{`${capitalize(t('language'))} ( ${t('optional')} )`}
							</span>
							<div className='desktop-only-small-separator'></div>
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
						</>
					}
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
					{
						!progress && progress != 0 && !isProcessingVideo &&
						<div className='flex-row schedule-button-container'>
							<button
								className={
									!isButtonDisabled ?
									'filled-button button schedule-submit-button' :
									'filled-button disabled-button button schedule-submit-button'
								}
								type='submit'
								form='upload-form'
								disabled={isButtonDisabled}
							>
								<span className='small-title citrusWhite'>
									{capitalize(t('createCoaching'))}
								</span>
							</button>
						</div>
					}
					{
						progress !== null && progress >= 0 && !isProcessingVideo ?
						<div className='flex-row' style={{ height: '50px', width: '80%' }}>
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
						<div className='flex-row' style={{ height: '50px', width: '80%' }}>
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
					{
						progress !== null && progress >= 0 && !isProcessingVideo ?
							<span
								className='small-text-bold citrusBlack'
								style={{ width: '80%', marginBottom: '10px' }}
							>
								{capitalize(t('dontClose'))}
							</span> : null
					}
				</form>
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
	deleteCoaching: coachingId => dispatch(deleteCoaching(coachingId))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Schedule))