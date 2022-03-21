import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Loader from 'react-loader-spinner'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'

import { ReactComponent as EyeClosed } from '../../assets/svg/eye-closed.svg'
import { ReactComponent as EyeOpen } from '../../assets/svg/eye-open.svg'

import {
	signup,
	loadUser,
	fetchUserReplays
} from '../../actions/auth-actions'
import { fetchTrainerCoachings } from '../../actions/coachings-actions'
import { executeExploreSearch } from '../../actions/search-actions'
import { setIsRedirectingHome } from '../../actions/navigation-actions'

import {
	isValidEmailInput,
	isValidPassword
} from '../../utils/validations'

import {
	capitalize,
	uppercase,
	titleCase
} from '../../utils/various'

class SignupFromRedirect extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			userName: '',
			email: '',
			password: '',
			message: '',
			showPassword: false,
			errorMessage: '',
			signupDisabled: false,
			isLoading: false
		}
		this.onTextInputChange = this.onTextInputChange.bind(this)
		this.onSubmit = this.onSubmit.bind(this)
		this.checkErrors = this.checkErrors.bind(this)
	}

	checkErrors() {
		const { email, password } = this.state
		const { t } = this.props

		if (!email.length > 0 || !password.length > 0) {
			this.setState({
				errorMessage: capitalize(t('pleaseEnterAllFields'))
			})
			setTimeout(function () {
				this.setState({
					errorMessage: ''
				})
			}.bind(this), 3000)
			return true
		}

		if (!isValidEmailInput(email)) {
			this.setState({
				errorMessage: capitalize(t('wrongEmailFormat'))
			})
			setTimeout(function () {
				this.setState({
					errorMessage: ''
				})
			}.bind(this), 3000)
			return true
		}

		if (
			!isValidPassword(this.state.password).includes('length') ||
			!isValidPassword(this.state.password).includes('uppercase') ||
			!isValidPassword(this.state.password).includes('number')
		) {
			this.setState({
				errorMessage: capitalize(t('passwordFormat'))
			})
			setTimeout(function () {
				this.setState({
					errorMessage: ''
				})
			}.bind(this), 3000)
			return true
		}

		return false
	}

	onTextInputChange(e, name) {
		this.setState({ [name]: e.target.value })
	}

	onSubmit(e) {
		e.preventDefault()
		const {
			userName,
			email,
			password
		} = this.state
		const {
			t,
			i18n,
			signup,
			executeExploreSearch,
			fetchTrainerCoachings,
			fetchUserReplays,
			setIsRedirectingHome,
			onSignupSuccess
		} = this.props
		const lng = i18n.language || 'en'

		this.setState({
			isSignupDisabled: true,
			isLoading: true
		})
		if (this.checkErrors()) {
			this.setState({
				signupDisabled: false,
				isLoading: false
			})
			return
		}

		signup(
			userName,
			email.toLowerCase(),
			password,
			lng,
			null
		).then(async (res) => {
			setIsRedirectingHome(false)
			if (res && res.type === 'REGISTER_SUCCESS') {
				const { user } = res.payload
				const search = await executeExploreSearch('all', user._id, 5, 5, user.sports)
				const replays = await fetchUserReplays(user._id)
				const trainings = await fetchTrainerCoachings(user._id, true)
				if (search && replays && trainings) {
					this.setState({ isLoading: false })
					return onSignupSuccess()
				}
			} else if (res && res.type === 'REGISTER_FAIL') {
				this.setState({
					errorMessage: capitalize(res?.payload?.response?.data?.msg),
					signupDisabled: false,
					isLoading: false
				})
				setTimeout(function () {
					this.setState({
						errorMessage: ''
					})
				}.bind(this), 3000)
			} else {
				this.setState({
					errorMessage: capitalize(t('somethingWentWrong')),
					signupDisabled: false,
					isLoading: false
				})
				setTimeout(function () {
					this.setState({
						errorMessage: ''
					})
				}.bind(this), 3000)
			}
		})
	}

	render() {
		const {
			email,
			password,
			showPassword,
			signupDisabled,
			errorMessage,
			isLoading
		} = this.state
		const {
			t,
			history,
			isAuthenticated,
			title,
			onGoToSignIn
		} = this.props

		if (isLoading) {
			return (
				<div className='full-container flex-column flex-center main'>
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
			<div className='full-container flex-column flex-center main'>
				<div className='big-title title'>
					{title}
				</div>
				<form
					id='login-form'
					onSubmit={e => this.onSubmit(e)}
					className='flex-column flex-start card auth-card form'
				>
					<input
						className='text-input small-text citrusBlack input'
						placeholder={capitalize(t('userName'))}
						type='username'
						autoComplete='username'
						onChange={e => this.onTextInputChange(e, 'userName')}
					/>
					<input
						className='text-input small-text citrusBlack input'
						placeholder={capitalize(t('email'))}
						type='email'
						autoComplete='email'
						onChange={e => this.onTextInputChange(e, 'email')}
						name='email'
					/>
					<div className='password-container'>
						<input
							placeholder={capitalize(t('password'))}
							className='text-input small-text citrusBlack input password-input'
							type={showPassword ? 'text' : 'password'}
							onChange={e => this.onTextInputChange(e, 'password')}
							style={showPassword ? { height: '50px' } : { height: '52px' }}
						/>
						<div
							className='password-eye hover'
							onClick={() => this.setState({ showPassword: !showPassword })}
						>
							{
								showPassword ?
									<EyeOpen
										width={25}
										height={25}
										stroke={'#C2C2C2'}
										strokeWidth={2}
									/> :
									<EyeClosed
										width={25}
										height={25}
										stroke={'#C2C2C2'}
										strokeWidth={2}
									/>
							}
						</div>
					</div>
					<div className='medium-separator'></div>
					<span className='small-text citrusGrey disclaimer'>
						{capitalize(t('bySubmittingYouAgreeToTerms'))} <a target='_blank' className='smallText citrusGrey' href="https://thecitrusapp.com/cgu-cgv/">{capitalize(t('termsOfUse'))}</a>
					</span>
					<div className='small-separator'></div>
					<div className='button-container flex-column flex-center'>
						<button
							className={!signupDisabled ? 'filled-button button' : 'filled-button disabled-button button'}
							type='submit'
							form='login-form'
							disabled={signupDisabled}
						>
							<span className='small-title citrusWhite'>
								{capitalize(t('createAnAccount'))}
							</span>
						</button>
						<div className='light-button button'>
							<div
								className='small-title citrusBlue'
								onClick={onGoToSignIn}
							>
								{capitalize(t('logIn'))}
							</div>
						</div>
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
				<style jsx='true'>
					{`
						.form {
							align-items: center;
							justify-content: center;
						}
						.input {
							margin-bottom: 20px;
						}
						.button {
							margin-bottom: 10px;
						}
						.password-container {
							height: 52px;
							width: 453px;
							display: flex;
							flex-direction: row !important;
							margin-bottom: 20px;
						}
						.password-input {
							width: 80%;
						}
						.password-eye {
							width: 20%;
							border-bottom: 1px solid #C2C2C2;
							height: 52px !important;
							display: flex;
							justify-content: center;
							align-items: center;
						}
						.title {
							width: 690px;
							margin-bottom: 20px;
							text-align: center;
						}
						@media only screen and (max-width: 640px) {
							.title {
								max-width: 95% !important;
								margin: 0 0 10px 2.5% !important;
								font-size: 36px !important;
							}
							.disclaimer {
								margin: 0 0 0 2.5% !important;
							}
							.main {
								justify-content: flex-start !important;
							}
							.form {
								height: 450px;
								margin-bottom: 60px;
							}
							.password-container {
								width: 98%;
								margin: 0 1%;
								margin-bottom: 20px;
							}
							.password-input {
								margin: 0;
							}
							.button-container {
								width: 98%;
								padding: 0 1%;
							}
							.button {
								width: 100%;
							}
						}
        `}
				</style>
			</div>
		)
	}
}

const mapStateToProps = state => ({
	isAuthenticated: state.auth.isAuthenticated,
	user: state.auth.user,
	error: state.error
})

const mapDispatchToProps = dispatch => ({
	signup: (userName, email, password, language, isCoach) =>
		dispatch(signup(userName, email, password, language, isCoach)),
	loadUser: () => dispatch(loadUser()),
	fetchUserReplays: id => dispatch(fetchUserReplays(id)),
	fetchTrainerCoachings: (id, isMe) => dispatch(fetchTrainerCoachings(id, isMe)),
	executeExploreSearch: (sport, userId, skipValue, limit, userFavoriteSports) =>
		dispatch(executeExploreSearch(sport, userId, skipValue, limit, userFavoriteSports)),
	setIsRedirectingHome: bool => dispatch(setIsRedirectingHome(bool))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SignupFromRedirect))
