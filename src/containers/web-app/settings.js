import React from 'react'
import { connect } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { withTranslation } from 'react-i18next'
import Loader from 'react-loader-spinner'
import moment from 'moment'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import Dialog from '@material-ui/core/Dialog'

import {
	updateUser,
	loadUser,
	deleteUser,
	logout,
	updateUserCredentials
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
import {
	isValidPassword,
	isSameString
} from '../../utils/validations'

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
		this.state = {
			isChangingPassword: false,
			isDeletingAccount: false,
			password: '',
			newPassword: '',
			newMatchingPassword: '',
			warning: '',
			isLoading: false
		}

		yesNoItems = [capitalize(this.props.t('no')), capitalize(this.props.t('yes'))]

		this.handleSelectChange = this.handleSelectChange.bind(this)
		this.handleDeleteAccount = this.handleDeleteAccount.bind(this)
		this.handleWarning = this.handleWarning.bind(this)
		this.handleChangePassword = this.handleChangePassword.bind(this)
	}

	handleSelectChange(e, type) {
		const {
			updateUser,
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

	handleDeleteAccount() {
		const {
			user,
			deleteUser,
			logout
		} = this.props

		deleteUser(user._id)
		.then(() => {
			logout()
		})
	}

	handleWarning(value) {
		this.setState({ warning: value })
		setTimeout(function () {
			this.setState({ warning: null })
		}.bind(this), 3000)
	}

	handleChangePassword() {
		const {
			password,
			newPassword,
			newMatchingPassword
		} = this.state
		const {
			t,
			updateUserCredentials,
			user,
			setNotification,
			loadUser
		} = this.props

		if (
			password && newPassword && newMatchingPassword &&
			isSameString(newPassword, newMatchingPassword) &&
			isValidPassword(newPassword).length >= 3
		) {
			this.setState({
				isLoading: true
			})
			updateUserCredentials({
				id: user._id,
				password,
				newPassword
			})
				.then(res => {
					this.setState({ isLoading: false })
					console.log(res)
					if (res.payload.status >= 400) {
						console.log('error : ', res.payload.msg.response.data.msg)
						this.handleWarning(res.payload.msg.response.data.msg)
					} else {
						this.setState({ isChangingPassword: false })
						setNotification({ message: capitalize(t('successFullyChangedPassword')) })
						loadUser()
					}
				})
		} else {
			return this.handleWarning(capitalize(t('pleaseEnterAllFields')))
		}
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
		const {
			isChangingPassword,
			isDeletingAccount,
			warning,
			password,
			newPassword,
			newMatchingPassword,
			isLoading
		} = this.state

	 	return (
			<div className='main-container'>
				<span className='big-title citrusBlack' style={{ width: '100%' }}>
					{capitalize(t('settings'))}
				</span>
				<div
					id='upload-form'
					className='scroll-div-vertical card upload-form'
				>
					<span className='small-title citrusBlack form-input'>
						{capitalize(t('trainings'))}
					</span>
					<div className='medium-separator'></div>
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
					<div className='medium-separator'></div>
					<div className='small-separator'></div>
					<span className='small-title citrusBlack form-input'>
						{capitalize(t('personal'))}
					</span>
					<div className='medium-separator'></div>
					<span
						className='smaller-text-bold citrusGrey form-input hover'
						onClick={() => this.setState({ isChangingPassword: true })}
					>
						{capitalize(t('changeMyPassword'))}
					</span>
					<div className='medium-separator'></div>
					<span
						className='smaller-text-bold citrusGrey form-input hover'
						onClick={() => this.setState({ isDeletingAccount: true })}
					>
						{capitalize(t('deleteMyAccount'))}
					</span>
				</div>
				{
					isDeletingAccount &&
					<Dialog
						open={true}
						onClose={() => {
							this.setState({
								isDeletingAccount: false
							})
						}}
					>
						<div
							style={{
								width: '500px',
								height: '300px',
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'space-between',
								alignItems: 'center'
							}}
						>
							<div className='medium-separator'></div>
							<span
								className='smaller-text-bold citrusGrey'
								style={{
									width: '95%',
									padding: '0 2.5%',
									textAlign: 'justify'
								}}
							>
								{capitalize(t('deleteAccountText'))}
							</span>
							<div
								className='flex-row'
								style={{
									width: '100%',
									padding: '2.5% 0',
									alignItems: 'center'
								}}
							>
								<span
									onClick={() => this.setState({ isDeletingAccount: false })}
									className='small-title citrusGrey hover'
									style={{ width: '25%', margin: '0 2.5% 0 20%' }}
								>
									{capitalize(t('cancel'))}
								</span>
								<button
									className='filled-button button'
									style={{ width: '35%', margin: '0 15% 0 2.5%' }}
									onClick={this.handleDeleteAccount}
								>
									<span className='small-title citrusWhite'>
										{capitalize(t('deleteMyAccount'))}
									</span>
								</button>
							</div>
						</div>
					</Dialog>
				}
				{
					isChangingPassword &&
					<Dialog
						open={true}
						onClose={() => {
							this.setState({
								isChangingPassword: false
							})
						}}
					>
						<div
							style={{
								width: '500px',
								height: '350px',
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'space-between',
								alignItems: 'center'
							}}
						>
							<div className='medium-separator'></div>
								<input
									type='password'
									className='text-input smaller-text-bold citrusGrey input form-input'
									placeholder={capitalize(t('currentPassword'))}
									onChange={(e) => this.setState({ password: e.target.value })}
									style={{ color: '#000000', border: 'none', height: 'unset' }}
								/>
								<div className='medium-separator'></div>
								<input
									className='text-input smaller-text-bold citrusGrey input form-input'
									placeholder={capitalize(t('newPassword'))}
									onChange={(e) => this.setState({ newPassword: e.target.value })}
									style={{ color: '#000000', border: 'none', height: 'unset' }}
								/>
								<div className='medium-separator'></div>
								<input
									className='text-input smaller-text-bold citrusGrey input form-input'
									placeholder={capitalize(t('confirmNewPassword'))}
									onChange={(e) => this.setState({ newMatchingPassword: e.target.value })}
									style={{ color: '#000000', border: 'none', height: 'unset' }}
								/>
								{
									newPassword.length > 0 && isValidPassword(newPassword).length < 3 &&
									<>
										<span className='smaller-text citrusRed' style={{ width: '80%' }}>
											{capitalize(t('passwordMustBe'))}
										</span>
									</>
								}
								{
									newMatchingPassword.length > 0 && !isSameString(newPassword, newMatchingPassword) &&
									<>
										<span className='smaller-text citrusRed' style={{ width: '80%' }}>
											{capitalize(t('passwordsDontMatch'))}
										</span>
									</>
								}
								{
									warning &&
									<>
										<span className='smaller-text citrusRed' style={{ width: '80%' }}>
											{capitalize(warning)}
										</span>
									</>
								}
								<div className='medium-separator'></div>
							<div
								className='flex-row'
								style={{
									width: '100%',
									padding: '2.5% 0',
									alignItems: 'center',
									justifyContent: 'center'
								}}
							>
							{
								!isLoading ?
								<>
									<span
										onClick={() => this.setState({ isChangingPassword: false })}
										className='small-title citrusGrey hover'
										style={{ width: '25%', margin: '0 2.5% 0 20%' }}
									>
										{capitalize(t('cancel'))}
									</span>
									<button
										className='filled-button button'
										style={{ width: '35%', margin: '0 15% 0 2.5%' }}
										onClick={this.handleChangePassword}
									>
										<span className='small-title citrusWhite'>
											{capitalize(t('save'))}
										</span>
									</button>
								</> :
								<Loader
									type="Oval"
									color="#C2C2C2"
									height={20}
									width={20}
								/>
							}
							</div>
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
	updateUser: (userInfo) => dispatch(updateUser(userInfo)),
	setNotification: notification => dispatch(setNotification(notification)),
	loadUser: () => dispatch(loadUser()),
	deleteUser: userId => dispatch(deleteUser(userId)),
	logout: () => dispatch(logout()),
	updateUserCredentials: credentials => dispatch(updateUserCredentials(credentials))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Settings))