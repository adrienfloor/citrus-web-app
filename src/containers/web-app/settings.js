import React from 'react'
import { connect } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { withTranslation } from 'react-i18next'
import Loader from 'react-loader-spinner'
import moment from 'moment'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import Dialog from '@material-ui/core/Dialog'
import TextField from '@material-ui/core/TextField'
import { Link } from 'react-router-dom'

import PremiumPlan from './payments/my-premium-plan'
import PaymentMethod from './payments/payment-method'
import BillingFailure from './payments/billing-failure'
import VerifyCoachAccount from './verify-coach-account'

import {
	updateUser,
	loadUser,
	deleteUser,
	logout,
	updateUserCredentials
} from '../../actions/auth-actions'
import { setNotification } from '../../actions/notifications-actions'
import { setIsRedirectingHome } from '../../actions/navigation-actions'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'
import '../../styling/web-app.css'
import { ReactComponent as Check } from '../../assets/svg/check.svg'

import { capitalize } from '../../utils/various'
import {
	isValidPassword,
	isSameString
} from '../../utils/validations'

import * as frCommonTranslations from '../../fixtures/fr'
import * as enCommonTranslations from '../../fixtures/en'

let sportsItems = []
let languagesItems = []
let metricsItems = []
let yesNoItems = []


class Settings extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			isChangingPassword: false,
			isDeletingAccount: false,
			isChoosingPlan: false,
			isCreditCardOpen: false,
			isPlanBillingFailure: false,
			password: '',
			newPassword: '',
			newMatchingPassword: '',
			warning: '',
			isLoading: false,
			isVerifyingCoachAccount: false
		}

		yesNoItems = [capitalize(this.props.t('no')), capitalize(this.props.t('yes'))]
		const translations = this.props.i18n.language == 'fr' ? frCommonTranslations : enCommonTranslations
		sportsItems = Object.keys(translations.default.sportsAvailable)
		languagesItems = Object.keys(translations.default.languagesAvailable)
		metricsItems = Object.keys(translations.default.metricsAvailable)

		this.handleSelectChange = this.handleSelectChange.bind(this)
		this.handleDeleteAccount = this.handleDeleteAccount.bind(this)
		this.handleWarning = this.handleWarning.bind(this)
		this.handleChangePassword = this.handleChangePassword.bind(this)
		this.returnMultipleSelectItem = this.returnMultipleSelectItem.bind(this)
		this.returnSimpleSelectItem = this.returnSimpleSelectItem.bind(this)
	}

	returnMultipleSelectItem(item, type) {
		const { t, user } = this.props
		let isSelected = user.coachingLanguagePreference.includes(item)
		if(type === 'sport') {
			isSelected = user.sports.map(spr => spr.type).includes(item)
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

	returnSimpleSelectItem(item, type) {
		const { t, user } = this.props
		if(type && type === 'location') {
			if(
				user.basedOnLocationPreference === false && item.toLowerCase() == t('yes') ||
				user.basedOnLocationPreference === true && item.toLowerCase() == t('no')
			) {
				return capitalize(t(item))
			}
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
				<Check
					width={20}
					height={20}
					strokeWidth={2}
				/>
			</div>
		)
	}

	handleSelectChange(e, type) {
		const {
			updateUser,
			loadUser,
			user,
			t
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
			}, true)
		}
		if(type === 'units') {
			return updateUser({
				distanceMetricPreference: e.target.value,
				weightMetricPreference: e.target.value,
				id: user._id
			}, true)
		}
		if(type === 'basedOnLocationPreference') {
			const str = (e.target.value).toLowerCase()
			return updateUser({
				basedOnLocationPreference: str == t('yes') ? true : false,
				id: user._id
			}, true)
		}
		return updateUser({
			coachingLanguagePreference: e.target.value,
			id: user._id
		}, true)
	}

	handleDeleteAccount() {
		const {
			user,
			deleteUser,
			logout,
			history,
			setIsRedirectingHome
		} = this.props

		deleteUser(user._id)
		.then(() => {
			logout()
			setIsRedirectingHome(true)
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
			user,
			history
		} = this.props
		const {
			coachingLanguagePreference,
			sports,
			distanceMetricPreference,
			weightMetricPreference,
			basedOnLocationPreference,
			hasCreditCardFailed,
			subscription,
			isVerifiedCoach
		} = user
		const {
			isChangingPassword,
			isDeletingAccount,
			warning,
			password,
			newPassword,
			newMatchingPassword,
			isLoading,
			isChoosingPlan,
			isCreditCardOpen,
			isPlanBillingFailure,
			isVerifyingCoachAccount
		} = this.state

	 	return (
			<div className='settings-container'>
				<span className='big-title citrusBlack responsive-title'>
					{capitalize(t('settings'))}
				</span>
				<div
					id='upload-form'
					className='scroll-div-vertical card upload-form settings'
				>
					<div className='medium-separator'></div>
					<div className='small-separator'></div>
					<span className='small-title citrusBlack small-responsive-title-settings'>
						{capitalize(t('trainings'))}
					</span>
					<div className='medium-separator'></div>
					<span className='small-text-bold citrusGrey titles-form-input'>
						{capitalize(t('coachingLanguages'))}
					</span>
					<Select
						variant='outlined'
						className='form-input'
						multiple
						value={coachingLanguagePreference}
						onChange={e => this.handleSelectChange(e, 'coachingLanguagePreference')}
						renderValue={selected => selected.map(el => capitalize(t(el))).join(', ')}
					>
						{
							languagesItems.map((lng, i) => (
								<MenuItem key={i} value={lng}>
									{this.returnMultipleSelectItem(lng, 'lng')}
								</MenuItem>
							))
						}
					</Select>
					<div className='medium-separator'></div>
					<div className='small-separator'></div>
					<span className='small-text-bold citrusGrey titles-form-input'>
						{capitalize(t('myFavoriteSports'))}
					</span>
					<Select
						variant='outlined'
						className='form-input'
						multiple
						value={sports.map(sport => sport.type)}
						onChange={e => this.handleSelectChange(e, 'sports')}
						renderValue={selected => selected.map(el => capitalize(t(el))).join(', ')}
					>
						{
							sportsItems.map((sport, i) => (
								<MenuItem value={sport} key={i}>
									{this.returnMultipleSelectItem(sport, 'sport')}
								</MenuItem>

							))
						}
					</Select>
					<div className='medium-separator'></div>
					<div className='small-separator'></div>
					<span className='small-text-bold citrusGrey titles-form-input'>
						{capitalize(t('metricUnits'))}
					</span>
					<Select
						variant='outlined'
						className='form-input'
						value={weightMetricPreference}
						onChange={e => this.handleSelectChange(e, 'units')}
						renderValue={(selected) => capitalize(t(selected))}
					>
						{
							metricsItems.map((metric, i) => (
								<MenuItem value={metric} key={i}>
									{
										metric === distanceMetricPreference ?
											this.returnSimpleSelectItem(metric) :
											capitalize(t(metric))
									}
								</MenuItem>
							))
						}
					</Select>
					<div className='medium-separator'></div>
					<div className='small-separator'></div>
					<span className='small-text-bold citrusGrey titles-form-input'>
						{capitalize(t('basedOnLocation'))}
					</span>
					<Select
						variant='outlined'
						className='form-input'
						value={basedOnLocationPreference === false ? capitalize(t('no')) : capitalize(t('yes'))}
						onChange={e => this.handleSelectChange(e, 'basedOnLocationPreference')}
						renderValue={(selected) => capitalize(t(selected))}
					>
						{
							yesNoItems.map((item, i) => (
								<MenuItem value={item} key={i}>
									{this.returnSimpleSelectItem(item, 'location')}
								</MenuItem>
							))
						}
					</Select>
					<div className='medium-separator'></div>
					<div className='medium-separator'></div>
					{/* {
						!isVerifiedCoach &&
						<>
							<span className='small-title citrusBlack small-responsive-title-settings'>
								{capitalize(t('verifiedAccount'))}
							</span>
							<div className='medium-separator'></div>
							<span
								className='small-text-bold citrusGrey titles-form-input hover'
								onClick={() => this.setState({ isVerifyingCoachAccount: true })}
							>
								{capitalize(t('verifyMyAccount'))}
							</span>
							<div className='medium-separator'></div>
						</>
					} */}
					<span className='small-title citrusBlack small-responsive-title-settings'>
						{capitalize(t('membership'))}
					</span>
					<div className='medium-separator'></div>
					<span
						className='small-text-bold citrusGrey titles-form-input hover'
						onClick={() => this.setState({ isChoosingPlan: true })}
					>
						{capitalize(t('plan'))}
					</span>
					<span
						className='small-text-bold citrusGrey titles-form-input hover'
						onClick={() => this.setState({ isCreditCardOpen: true })}
					>
						{capitalize(t('paymentMethod'))}
					</span>
					{
						hasCreditCardFailed && subscription &&
						<span
							className='small-text-bold citrusRed titles-form-input hover'
							onClick={() => this.setState({ isPlanBillingFailure: true })}
						>
							{capitalize(t('planBillingFailure'))}
						</span>
					}
					<div className='medium-separator'></div>
					<span className='small-title citrusBlack small-responsive-title-settings'>
						{capitalize(t('personal'))}
					</span>
					<div className='medium-separator'></div>
					<span
						className='small-text-bold citrusGrey titles-form-input hover'
						onClick={() => this.setState({ isChangingPassword: true })}
					>
						{capitalize(t('changeMyPassword'))}
					</span>
					<span
						className='small-text-bold citrusGrey titles-form-input hover'
						onClick={() => this.setState({ isDeletingAccount: true })}
					>
						{capitalize(t('deleteMyAccount'))}
					</span>
					<div className='medium-separator'></div>
					<div className='small-separator'></div>
					<span className='citrusBlack mobile-only small-title small-responsive-title-settings'>
						{capitalize(t('help'))}
					</span>
					<div className='medium-separator mobile-only'></div>
						<Link
							to={{ pathname: 'https://thecitrusapp.com' }}
							target='_blank'
							className='small-text-bold citrusGrey titles-form-input hover mobile-only tablet-only'
						>
							{capitalize(t('howItWorks'))}
						</Link>
						<div className='small-separator mobile-only'></div>
						<Link
							to={{ pathname: 'https://thecitrusapp.com/privacy-policy' }}
							target='_blank'
							className='small-text-bold citrusGrey titles-form-input hover mobile-only tablet-only'
						>
							{capitalize(t('privacy'))}
						</Link>
						<div className='small-separator mobile-only'></div>
						<Link
							to={{ pathname: 'https://thecitrusapp.com/cgu-cgv/' }}
							target='_blank'
							className='small-text-bold citrusGrey titles-form-input hover mobile-only tablet-only'
						>
							{capitalize(t('terms'))}
						</Link>
						<div className='small-separator mobile-only'></div>
						<Link
							className='small-text-bold citrusGrey titles-form-input hover mobile-only tablet-only'
							to='#'
							onClick={e => {
								e.preventDefault()
								window.location = "mailto:contact@thecitrusapp.com"
							}}
						>
							{capitalize(t('contact'))}
						</Link>
						<div className='small-separator mobile-only'></div>
						<span className='small-text citrusGrey titles-form-input mobile-only'>
							© 2021 All rights Reserved. Design by The Citrus Company
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
						<div className='delete-account-container'>
							<div className='medium-separator'></div>
							<span
								className='small-text-bold citrusGrey'
								style={{
									width: '95%',
									padding: '0 2.5%',
									textAlign: 'justify'
								}}
							>
								{capitalize(t('deleteAccountText'))}
							</span>
							<div
								className='flex-row desktop-only'
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
									className='light-button button'
									style={{ width: '40%', margin: '0 10% 0 2.5%' }}
									onClick={this.handleDeleteAccount}
								>
									<a href='https://thecitrusapp.com'>
										<span className='small-title citrusBlue'>
											{capitalize(t('deleteMyAccount'))}
										</span>
									</a>
								</button>
							</div>
								<div
									className='flex-column mobile-only'
									style={{
										width: '100%',
										padding: '2.5% 0',
										alignItems: 'center'
									}}
								>
									<button
										className='light-button button'
										style={{ width: '90%', margin: '0 10%' }}
										onClick={this.handleDeleteAccount}
									>
										<a href='https://thecitrusapp.com'>
											<span className='small-title citrusBlue'>
												{capitalize(t('deleteMyAccount'))}
											</span>
										</a>
									</button>
									<div className='small-separator'></div>
									<span
										onClick={() => this.setState({ isDeletingAccount: false })}
										className='small-title citrusGrey hover'
									>
										{capitalize(t('cancel'))}
									</span>
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
						<div className='change-password-container'>
							<div className='medium-separator'></div>
								<TextField
									variant='outlined'
									className='text-input small-text-bold citrusGrey input'
									placeholder={capitalize(t('currentPassword'))}
									onChange={(e) => this.setState({ password: e.target.value })}
									style={{ color: '#000000', border: 'none', height: 'unset' }}
								/>
								<div className='medium-separator'></div>
								<TextField
									variant='outlined'
									className='text-input small-text-bold citrusGrey input'
									placeholder={capitalize(t('newPassword'))}
									onChange={(e) => this.setState({ newPassword: e.target.value })}
									style={{ color: '#000000', border: 'none', height: 'unset' }}
								/>
								<div className='medium-separator'></div>
								<TextField
									variant='outlined'
									className='text-input small-text-bold citrusGrey input'
									placeholder={capitalize(t('confirmNewPassword'))}
									onChange={(e) => this.setState({ newMatchingPassword: e.target.value })}
									style={{ color: '#000000', border: 'none', height: 'unset' }}
								/>
								{
									newPassword.length > 0 && isValidPassword(newPassword).length < 3 &&
									<>
										<span className='small-text citrusRed' style={{ width: '80%' }}>
											{capitalize(t('passwordMustBe'))}
										</span>
									</>
								}
								{
									newMatchingPassword.length > 0 && !isSameString(newPassword, newMatchingPassword) &&
									<>
										<span className='small-text citrusRed' style={{ width: '80%' }}>
											{capitalize(t('passwordsDontMatch'))}
										</span>
									</>
								}
								{
									warning &&
									<>
										<span className='small-text citrusRed' style={{ width: '80%' }}>
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
				{
					isVerifyingCoachAccount &&
					<Dialog
						open={true}
						onClose={() => this.setState({ isVerifyingCoachAccount: false })}
					>
						<div
							className='payment-method-credit-card-container'
							style={{ width: '99%' }}
						>
							<VerifyCoachAccount
								onCancel={() => this.setState({ isVerifyingCoachAccount: false })}
							/>
						</div>
					</Dialog>
				}
				{
					isChoosingPlan &&
					<Dialog
						open={true}
						onClose={() => this.setState({ isChoosingPlan: false })}
					>
						<div className='full-width-and-height-dialog'>
							{/* <MyPlan
								onCancel={() => {
									this.setState({ isChoosingPlan: false })
								}}
								history={history}
							/> */}
							<PremiumPlan
								onCancel={() => {
									this.setState({ isChoosingPlan: false })
								}}
								history={history}
							/>
						</div>
					</Dialog>
				}
				{
					isCreditCardOpen &&
					<Dialog
						open={true}
						onClose={() => this.setState({ isCreditCardOpen: false })}
					>
						<div className='payment-method-credit-card-container'>
							<PaymentMethod
								onCancel={() => this.setState({ isCreditCardOpen: false })}
							/>
						</div>
					</Dialog>
				}
					{
						isPlanBillingFailure &&
						<Dialog
							open={true}
							onClose={() => this.setState({ isPlanBillingFailure: false })}
						>
							<div className='full-width-and-height-dialog'>
								<BillingFailure
									onCancel={() => {
										this.setState({ isPlanBillingFailure: false })
									}}
									history={history}
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
	updateUser: (userInfo, isMe) => dispatch(updateUser(userInfo, isMe)),
	setNotification: notification => dispatch(setNotification(notification)),
	loadUser: () => dispatch(loadUser()),
	deleteUser: userId => dispatch(deleteUser(userId)),
	logout: () => dispatch(logout()),
	updateUserCredentials: credentials => dispatch(updateUserCredentials(credentials)),
	setIsRedirectingHome: bool => dispatch(setIsRedirectingHome(bool))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Settings))