import React from 'react'
import { connect } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { withTranslation } from 'react-i18next'
import Dialog from '@material-ui/core/Dialog'
import Loader from 'react-loader-spinner'
import moment from 'moment'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'
import '../../styling/web-app.css'
import { ReactComponent as CaretDown } from '../../assets/svg/caret-down.svg'
import { ReactComponent as CaretUp } from '../../assets/svg/caret-up.svg'

import { capitalize } from '../../utils/various'

import {
	createCoaching,
	updateCoaching,
	deleteCoaching,
} from '../../actions/coachings-actions'

import * as frCommonTranslations from '../../fixtures/fr'
import * as enCommonTranslations from '../../fixtures/en'

const translations = moment.locale() == 'fr' ? frCommonTranslations : enCommonTranslations
const sportsItems = Object.keys(translations.default.sportsAvailable)
const focusItems = Object.keys(translations.default.focus)
const levelsItems = Object.keys(translations.default.levels)
const durationsItems = Object.keys(translations.default.durationsByTen)
const equipmentsItems = Object.keys(translations.default.equipments)
const languagesItems = Object.keys(translations.default.languagesAvailable)


class Schedule extends React.Component {
	constructor(props) {
		super(props)
		const {
			title,
			sport,
			pictureUri,
			duration,
			level,
			equipment,
			focus,
			coachingLanguage,
			freeAccess,
			startingDate,
		} = this.props.coaching

		this.state = {
			title: title || '',
			sport: sport || '',
			pictureUri: pictureUri || '',
			startingDate: startingDate || '',
			duration: duration || '',
			level: level || '',
			equipment: equipment || [],
			focus: focus || [],
			language: coachingLanguage || '',
			freeAccess: freeAccess || null,
			isDatePickerOpen: false,
			isLoading: false,
			isSelecting: '',
			isShowingAllParams: false,
			stateButtonDisabled: false,
			errorMessage: ''
		}
		this.handleDateSelection = this.handleDateSelection.bind(this)
		// this.hasMissingParams = this.hasMissingParams.bind(this)
		// this.createMissingAlert = this.createMissingAlert.bind(this)
		this.onTextInputChange = this.onTextInputChange.bind(this)
		// this.renderSelectors = this.renderSelectors.bind(this)
		// this.handleToggleShowParams = this.handleToggleShowParams.bind(this)
		// this.handleSubmit = this.handleSubmit.bind(this)
		this.returnFreeAccessWording = this.returnFreeAccessWording.bind(this)
		this.handleDeleteCoaching = this.handleDeleteCoaching.bind(this)
		// this.createDeletingAlert = this.createDeletingAlert.bind(this)
	}

	onTextInputChange(value, name) {
		return (value) => {
			this.setState({ [name]: value })
		}
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
		} = this.state
		const { t } = this.props
		if (!title) {
			missingParams.push(capitalize(t('title')))
		}
		if (!sport) {
			missingParams.push(capitalize(t('sport')))
		}
		if (!pictureUri) {
			missingParams.push(capitalize(t('picture')))
		}
		if (missingParams.length > 0) {
			return missingParams
		}
		return false
	}

	// createMissingAlert(missingElements) {
	// 	missingElements.map(el => capitalize(el))

	// 	Alert.alert(
	// 		capitalize(t('coach.schedule.missingProperties')),
	// 		missingElements.join(', '),
	// 		[
	// 			{
	// 				text: "OK",
	// 				onPress: () => console.log("Cancel Pressed"),
	// 			},
	// 		],
	// 		{ cancelable: false }
	// 	)
	// }

	// createDeletingAlert() {
	// 	const { coaching } = this.props

	// 	Alert.alert(
	// 		capitalize(coaching.title),
	// 		capitalize(t('coach.schedule.areYouSUreYouWantToDeleteCoaching')),
	// 		[
	// 			{
	// 				text: capitalize(t('common.no')),
	// 				onPress: () => console.log("Cancel deleting coaching"),
	// 				style: "cancel",
	// 			},
	// 			{
	// 				text: capitalize(t('common.yes')),
	// 				onPress: () => this.handleDeleteCoaching(),
	// 			},
	// 		]
	// 	)
	// }

	handleDeleteCoaching() {
		const {
			deleteCoaching,
			coaching,
			onCoachingCreated,
			onCoachingDeleted,
		} = this.props

		this.setState({
			isLoading: true,
			stateButtonDisabled: true,
		})

		return deleteCoaching(coaching._id)
			.then(res => {
				this.setState({
					isLoading: false,
					stateButtonDisabled: false,
				})
				onCoachingDeleted()
			})
	}

	returnFreeAccessWording(freeAccess) {
		const { t } = this.props
		if (freeAccess === capitalize(t('no')) || freeAccess === false) {
			return `${capitalize(t('freeAccess'))} : ${capitalize(t('no'))}`
		}
		return `${capitalize(t('freeAccess'))} : ${capitalize(t('yes'))}`
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
			stateButtonDisabled,
			errorMessage
		} = this.state

		const isButtonDisabled = (title.length === 0 || sport.length === 0 || pictureUri.length === 0) && !stateButtonDisabled

		if (isLoading) {
			return (
				<div className='flex-column flex-center'>
					<div className='big-separator'></div>
					<div className='big-separator'></div>
					<Loader
						type="Grid"
						color="#0075FF"
						height={100}
						width={100}
					/>
				</div>
			)
		}

		return (
			<div className='main-container'>
				<span className='big-title citrusBlack' style={{ width: '100%' }}>
					{capitalize(t('post'))}
				</span>
				<form
					id='upload-form'
					onSubmit={e => this.onSubmit(e)}
					className='scroll-div-vertical card upload-form'
				>
					<input
						className='text-input smaller-text-bold citrusGrey input form-input'
						placeholder={capitalize(t('title'))}
						onChange={e => this.onTextInputChange(e.target.value, 'title')}
					/>
					<div className='medium-separator'></div>
					<span className='smaller-text-bold citrusGrey form-input'>
						{capitalize(t('sport'))}
					</span>
					<Select
						className='form-input'
						id='simple-select'
						value={sport}
						onChange={e => this.setState({ sport: e.target.value })}
					>
						{
							sportsItems.map((sport, i) => (
								<MenuItem key={i} value={sport}>{capitalize(t(sport))}</MenuItem>
							))
						}
					</Select>
					<div className='medium-separator'></div>
					<span className='smaller-text-bold citrusGrey form-input'>
						{capitalize(t('freeAccess'))}
					</span>
					<Select
						className='form-input'
						id='simple-select'
						value={freeAccess}
						onChange={e => this.setState({ freeAccess: e.target.value })}
					>
						<MenuItem value={true}>{capitalize(t('yes'))}</MenuItem>
						<MenuItem value={false}>{capitalize(t('no'))}</MenuItem>
					</Select>
					<div className='medium-separator'></div>
					<div className='media-row'>
						<input type='image' />
					</div>
					<div className='medium-separator'></div>
					<div className='more-details-row'>
						<span className='smaller-text-bold citrusGrey'>
							{
								!isShowingAllParams &&
								capitalize(t('showMore'))
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
							<span className='smaller-text-bold citrusGrey form-input'>
								{capitalize(t('duration'))}
							</span>
							<Select
								className='form-input'
								id='simple-select'
								value={duration}
								onChange={e => this.setState({ duration: e.target.value })}
							>
								{
									durationsItems.map((duration, i) => (
										<MenuItem key={i} value={duration}>{capitalize(t(duration))}</MenuItem>
									))
								}
							</Select>
							<div className='medium-separator'></div>
							<span className='smaller-text-bold citrusGrey form-input'>
								{capitalize(t('level'))}
							</span>
							<Select
								className='form-input'
								id='simple-select'
								value={level}
								onChange={e => this.setState({ level: e.target.value })}
							>
								{
									levelsItems.map((level, i) => (
										<MenuItem key={i} value={level}>{capitalize(t(level))}</MenuItem>
									))
								}
							</Select>
							<div className='medium-separator'></div>
							<span className='smaller-text-bold citrusGrey form-input'>
								{capitalize(t('equipment'))}
							</span>
							<Select
								multiple
								className='form-input'
								id='simple-select'
								value={equipment}
								onChange={e => this.setState({ equipment: e.target.value })}
							>
								{
									equipmentsItems.map((equipment, i) => (
										<MenuItem key={i} value={equipment}>{capitalize(t(equipment))}</MenuItem>
									))
								}
							</Select>
							<div className='medium-separator'></div>
							<span className='smaller-text-bold citrusGrey form-input'>
								{capitalize(t('focus'))}
							</span>
							<Select
								multiple
								className='form-input'
								id='simple-select'
								value={focus}
								onChange={e => this.setState({ focus: e.target.value })}
							>
								{
									focusItems.map((fc, i) => (
										<MenuItem key={i} value={fc}>{capitalize(t(fc))}</MenuItem>
									))
								}
							</Select>
							<div className='medium-separator'></div>
							<span className='smaller-text-bold citrusGrey form-input'>
								{capitalize(t('language'))}
							</span>
							<Select
								className='form-input'
								id='simple-select'
								value={language}
								onChange={e => this.setState({ language: e.target.value })}
							>
								{
									languagesItems.map((language, i) => (
										<MenuItem key={i} value={language}>{capitalize(t(language))}</MenuItem>
									))
								}
							</Select>
						</>
					}
					<div className='medium-separator'></div>
					<div className='button-container flex-column flex-center'>
						<button
							className={!stateButtonDisabled ? 'filled-button button' : 'filled-button disabled-button button'}
							type='submit'
							form='upload-form'
							disabled={stateButtonDisabled}
						>
							<span className='small-title citrusWhite'>
								{capitalize(t('createCoaching'))}
							</span>
						</button>
					</div>
					{
						errorMessage.length > 0 &&
						<span
							className='small-text citrusRed'
							style={{ marginTop: 2 }}
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

const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Schedule))