import React from 'react'
import { connect } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { withTranslation } from 'react-i18next'
import Loader from 'react-loader-spinner'
import moment from 'moment'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'

import ImageUploader from '../../components/web-app/image-uploader/image-uploader'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'
import '../../styling/web-app.css'
import { ReactComponent as CaretDown } from '../../assets/svg/caret-down.svg'
import { ReactComponent as CaretUp } from '../../assets/svg/caret-up.svg'
import { ReactComponent as CaretBack } from '../../assets/svg/caret-left.svg'
import { ReactComponent as Check } from '../../assets/svg/check.svg'

import {
	capitalize,
	countryCodeToLanguage,
	returnCurrency
} from '../../utils/various'

import {
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
			title: coaching.title || '',
			sport: coaching.sport || '',
			pictureUri: coaching.pictureUri || '',
			startingDate: coaching.startingDate || '',
			duration: coaching.duration || '',
			level: coaching.level || '',
			equipment: coaching.equipment || [],
			focus: coaching.focus || [],
			language: coaching.coachingLanguage || '',
			freeAccess: coaching.freeAccess || '',
			price: coaching.price || '',
			isLoading: false,
			isShowingAllParams: false,
			isButtonDisabled: false,
			errorMessage: '',
			isDeletingCoaching: false
		}
		this.returnPriceWording = this.returnPriceWording.bind(this)
		this.handleUpdateCoaching = this.handleUpdateCoaching.bind(this)
		this.handleDeleteCoaching = this.handleDeleteCoaching.bind(this)
		this.returnMultipleSelectItem = this.returnMultipleSelectItem.bind(this)
		this.returnSimpleSelectItem = this.returnSimpleSelectItem.bind(this)
	}

	returnPriceWording(price) {
		const { t } = this.props
		if (t(price) === 0) {
			return capitalize(t('freeAccess'))
		}
		if (t(price) > 1) {
			return `${t(price)} ${t('credits')}`
		}
		return `${t(price)} ${t('credit')}`
	}

	handleUpdateCoaching(e) {
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
			coaching,
			updateCoaching,
			onCoachingUpdated,
			t,
			user,
			fetchTrainerCoachings
		} = this.props
		const {
			firstName,
			lastName,
			userName,
			_id,
			coachRating,
			MPLegalUserId
		} = user

		if (e) { e.preventDefault() }

		this.setState({
			isButtonDisabled: true,
			isLoading: true
		})

		if (this.hasMissingParams()) {
			this.setState({
				isButtonDisabled: false,
				isLoading: false,
				errorMessage: `${t('pleaseFillIn')} : ${this.hasMissingParams().join(', ')}`
			})
			setTimeout(function () {
				this.setState({
					errorMessage: ''
				})
			}.bind(this), 3000)
			return
		}

		const updatedCoaching = {
			_id: coaching._id,
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
			coachRating
		}

		return updateCoaching(updatedCoaching)
			.then(res => {
				fetchTrainerCoachings(user._id, true)
				onCoachingUpdated(res.payload)
			})
	}

	handleDeleteCoaching() {
		const {
			coaching,
			deleteCoaching,
			onCoachingDeleted
		} = this.props

		this.setState({ isLoading: true })

		return deleteCoaching(coaching._id)
			.then(res => {
				onCoachingDeleted()
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
		if (!price) {
			missingParams.push(t('price'))
		}
		if (missingParams.length > 0) {
			return missingParams
		}
		return false
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
			user,
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
			isLoading,
			isShowingAllParams,
			isButtonDisabled,
			errorMessage,
			price,
			isDeletingCoaching
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

		if(isDeletingCoaching) {
			return (
				<div
					className='full-container flex-column flex-center delete-coaching-container'
					style={{ justifyContent: 'center' }}
				>
					<span className='small-title citrusBlack'>
						{capitalize(t('areYouSureYouWantToDeleteCoaching'))}
					</span>
					<div className='small-separator'></div>
					<div className='medium-separator'></div>
					<div
						className='flex-row'
						style={{
							width: '200px',
							justifyContent: 'space-between'
						}}
					>
						<div
							className='filled-button hover small-no-color-button'
							onClick={() => this.setState({ isDeletingCoaching: false })}
						>
							<span className='small-title citrusWhite'>
								{capitalize(t('no'))}
							</span>
						</div>
						<div
							className='light-button hover small-no-color-light-button'
							onClick={this.handleDeleteCoaching}
						>
							<span className='small-title citrusBlue'>
								{capitalize(t('yes'))}
							</span>
						</div>
					</div>
				</div>
			)
		}

		return (
			<div className='main-container'>
				<div
					style={{
						width: '98.5%',
						height: '50px',
						display: 'flex',
						justifyContent: 'flex-start',
						alignItems: 'center'
					}}
					onClick={onCancel}
					className='hover'
				>
					<CaretBack
						width={25}
						height={25}
						stroke={'#C2C2C2'}
						strokeWidth={2}
					/>
					<span className='small-text citrusGrey'>
						{capitalize(t('back'))}
					</span>
				</div>
				<span className='small-title citrusBlack form-title'>
					{capitalize(t('coachingEdition'))}
				</span>
				<form
					id='upload-form'
					onSubmit={this.handleUpdateCoaching}
					className='scroll-div-vertical card upload-form'
					style={{ maxHeight: '700px', alignItems: 'flex-start' }}
				>
					<span className='small-text-bold citrusGrey title-coaching-edition'>
						{capitalize(t('title'))}
					</span>
					<TextField
						placeholder={capitalize(t('addTitle'))}
						variant='outlined'
						className='small-text-bold citrusGrey form-input-coaching-edition'
						onChange={(e) => this.setState({ title: e.target.value })}
						value={title}
						style={{ margin: '0 5% 0 2.5% !important'}}
					/>
					<div className='medium-separator'></div>
					<span className='small-text-bold citrusGrey title-coaching-edition'>
						{capitalize(t('sport'))}
					</span>
					<div className='desktop-only-small-separator'></div>
					<Select
						variant='outlined'
						className='form-input-coaching-edition'
						value={sport}
						onChange={e => this.setState({ sport: e.target.value })}
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
					<span className='small-text-bold citrusGrey title-coaching-edition'>
						{capitalize(t('price'))}
					</span>
					<div className='desktop-only-small-separator'></div>
					<Select
						variant='outlined'
						className='form-input-coaching-edition'
						value={price}
						onChange={e => this.setState({ price: e.target.value })}
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
							<em className='small-text-bold citrusGrey'>
								{`${capitalize(t('pricePlaceholder'))} ${returnCurrency(moment.locale())})`}
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
					<div
						className='more-details-row'
						style={{
							margin: '0 0 0 2.5%',
							width: '92.5%'
						}}
					>
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
					{
						isShowingAllParams &&
						<>
							<span className='small-text-bold citrusGrey title-coaching-edition'>
								{capitalize(t('duration'))}
							</span>
							<div className='desktop-only-small-separator'></div>
							<Select
								variant='outlined'
								className='form-input-coaching-edition'
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
							<span className='small-text-bold citrusGrey title-coaching-edition'>
								{capitalize(t('level'))}
							</span>
							<div className='desktop-only-small-separator'></div>
							<Select
								variant='outlined'
								className='form-input-coaching-edition'
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
							<span className='small-text-bold citrusGrey title-coaching-edition'>
								{capitalize(t('equipment'))}
							</span>
							<div className='desktop-only-small-separator'></div>
							<Select
								multiple
								variant='outlined'
								className='form-input-coaching-edition'
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
							<span className='small-text-bold citrusGrey title-coaching-edition'>
								{capitalize(t('focus'))}
							</span>
							<div className='desktop-only-small-separator'></div>
							<Select
								multiple
								variant='outlined'
								className='form-input-coaching-edition'
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
							<span className='small-text-bold citrusGrey title-coaching-edition'>
								{capitalize(t('language'))}
							</span>
							<div className='desktop-only-small-separator'></div>
							<Select
								variant='outlined'
								className='form-input-coaching-edition'
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
					<div
						style={{
							margin: '0 0 0 2.5%',
							width: '95%'
						}}
					>
						<ImageUploader
							t={t}
							onSetPictureUri={pictureUri => {
								this.setState({ pictureUri })
							}}
							pictureUri={pictureUri ? pictureUri : null}
						/>
					</div>
					<div className='small-separator'></div>
					<div className='medium-separator'></div>
					<span
						className='small-text-bold citrusGrey hover'
						onClick={() => this.setState({ isDeletingCoaching: true })}
						style={{ width: '100%', textAlign: 'center' }}
					>
						{t('deleteCoaching')}
					</span>
					<div className='small-separator'></div>
					<div className='flex-row' style={{ width: '100%', justifyContent: 'center' }}>
						<button
							className={!isButtonDisabled ? 'filled-button button' : 'filled-button disabled-button button'}
							type='submit'
							form='upload-form'
							disabled={isButtonDisabled}
							style={{ height: '60px'}}
						>
							<span className='small-title citrusWhite'>
								{capitalize(t('updateCoaching'))}
							</span>
						</button>
					</div>
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
	updateCoaching: coachingInfo => dispatch(updateCoaching(coachingInfo)),
	deleteCoaching: coachingId => dispatch(deleteCoaching(coachingId)),
	fetchTrainerCoachings: (id, isMe) => dispatch(fetchTrainerCoachings(id, isMe)),
	setNotification: notification => dispatch(setNotification(notification))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Schedule))