import React from 'react'
import { connect } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { withTranslation } from 'react-i18next'
import Loader from 'react-loader-spinner'
import moment from 'moment'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'

import {
	updateUser,
	loadUser
} from '../../actions/auth-actions'
import { setNotification } from '../../actions/notifications-actions'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'
import '../../styling/web-app.css'

import {
	capitalize
} from '../../utils/various'

import * as frCommonTranslations from '../../fixtures/fr'
import * as enCommonTranslations from '../../fixtures/en'

const translations = moment.locale() == 'fr' ? frCommonTranslations : enCommonTranslations
const sportsItems = Object.keys(translations.default.sportsAvailable)
const languagesItems = Object.keys(translations.default.languagesAvailable)
const metricsItems = Object.keys(translations.default.metricsAvailable)
let yesNoItems = []


class Settings extends React.Component {
	constructor(props) {
		super(props)
		const { t, user } = this.props
		this.handleSelectChange = this.handleSelectChange.bind(this)
		yesNoItems = [capitalize(t('no')), capitalize(t('yes'))]
	}

	handleSelectChange(e, type) {
		const {
			updateUser,
			setNotification,
			loadUser,
			user
		} = this.props

		if (type === 'sports') {
			const updatedSports = e.target.value.map(sport => {
				return {
					type: sport,
					level: ''
				}
			})
			return updateUser({
				sports: updatedSports,
				id: user._id
			})
		}
		if(type === 'units') {
			return updateUser({
				distanceMetricPreference: e.target.value,
				weightMetricPreference: e.target.value,
				id: user._id
			})
		}
		if(type === 'baseOnLocationPreference') {
			return updateUser({
				basedOnLocationPreference: e.target.value == 'yes' ? true : false,
				id: user._id
			})
		}
		return updateUser({
			coachingLanguagePreference: e.target.value,
			id: user._id
		})
	}

	render() {
		const {
			t,
			user
		} = this.props
		const {
			coachingLanguagePreference,
			sports,
			distanceMetricPreference,
			weightMetricPreference,
			basedOnLocationPreference
		} = user

	 	return (
			<div className='main-container'>
				<span className='big-title citrusBlack' style={{ width: '100%' }}>
					{capitalize(t('settings'))}
				</span>
				<div
					id='upload-form'
					className='scroll-div-vertical card upload-form'
				>
					<span className='smaller-text-bold citrusGrey form-input'>
						{capitalize(t('coachingLanguages'))}
					</span>
					<Select
						className='form-input'
						multiple
						value={coachingLanguagePreference}
						onChange={e => this.handleSelectChange(e, 'coachingLanguagePreference')}
					>
						{
							languagesItems.map((lng, i) => (
								<MenuItem key={i} value={lng}>{capitalize(t(lng))}</MenuItem>
							))
						}
					</Select>
					<div className='medium-separator'></div>
					<span className='smaller-text-bold citrusGrey form-input'>
						{capitalize(t('myFavoriteSports'))}
					</span>
					<Select
						className='form-input'
						multiple
						value={sports.map(sport => sport.type)}
						onChange={e => this.handleSelectChange(e, 'sport')}
					>
						{
							sportsItems.map((sport, i) => (
								<MenuItem value={sport} key={i}>
									{capitalize(t(sport))}
								</MenuItem>
							))
						}
					</Select>
					<div className='medium-separator'></div>
					<span className='smaller-text-bold citrusGrey form-input'>
						{capitalize(t('metricUnits'))}
					</span>
					<Select
						className='form-input'
						value={weightMetricPreference}
						onChange={e => this.handleSelectChange(e, 'units')}
					>
						{
							metricsItems.map((metric, i) => (
								<MenuItem value={metric} key={i}>
									{capitalize(t(metric))}
								</MenuItem>
							))
						}
					</Select>
					<div className='medium-separator'></div>
					<span className='smaller-text-bold citrusGrey form-input'>
						{capitalize(t('basedOnLocation'))}
					</span>
					<Select
						className='form-input'
						value={basedOnLocationPreference === false ? capitalize(t('no')) : capitalize(t('yes'))}
						onChange={e => this.handleSelectChange(e, 'basedOnLocationPreference')}
					>
						{
							yesNoItems.map((item, i) => (
								<MenuItem value={item} key={i}>
									{capitalize(t(item))}
								</MenuItem>
							))
						}
					</Select>
				</div>
			</div>
		)
	}
}

const mapStateToProps = (state) => ({
	user: state.auth.user
})

const mapDispatchToProps = (dispatch) => ({
	updateUser: (userInfo) => dispatch(updateUser(userInfo)),
	setNotification: notification => dispatch(setNotification(notification)),
	loadUser: () => dispatch(loadUser())
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Settings))