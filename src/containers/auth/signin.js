import React from 'react'
import { connect } from 'react-redux'
import {withTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Loader from 'react-loader-spinner'

import ForgetPassword from './forget-password'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'

import { ReactComponent as EyeClosed } from '../../assets/svg/eye-closed.svg'
import { ReactComponent as EyeOpen } from '../../assets/svg/eye-open.svg'

import {
	signin,
	loadUser,
	fetchUserReplays
} from '../../actions/auth-actions'
import { 	fetchTrainerCoachings } from '../../actions/coachings-actions'
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

class Signin extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			email: '',
			password: '',
			errorMessage: '',
			showPassword: false,
			signinDisabled: false,
			isLoading: false,
			hasForgotPassword: false
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
		return false
	}

	onTextInputChange(e, name) {
		this.setState({ [name]: e.target.value })
	}

	onSubmit(e) {
		e.preventDefault()
		const {
			email,
			password
		} = this.state

		const {
			fetchNotifications,
			t,
			user,
			selectScreen,
			signin,
			executeExploreSearch,
			fetchTrainerCoachings,
			fetchUserReplays,
			setIsRedirectingHome
		} = this.props

		this.setState({
			isSigninDisabled: true,
			isLoading: true
		})
		if (this.checkErrors()) {
			this.setState({
				signinDisabled: false,
				isLoading: false
			})
			return
		}

		signin(
			email.toLowerCase(),
			password
		).then(async (res) => {
			setIsRedirectingHome(false)
			if(res && res.payload && res.payload.user && res.payload.user._id) {
				const { user } = res.payload
				const search = await executeExploreSearch('all', user._id, 0, 5, user.sports)
				const replays = await fetchUserReplays(user._id)
				// fetchNotifications(userId)
				const trainings = await fetchTrainerCoachings(user._id, true)
				if(search && replays && trainings) {
					this.setState({ isLoading: false })
					return this.props.history.push('/home')
				}
			} else if (res && res.type === 'LOGIN_FAIL') {
				this.setState({
					errorMessage: capitalize(t('wrongEmailOrPassword')),
					signinDisabled: false,
					isLoading: false
				})
				setTimeout(function () {
					this.setState({
						errorMessage: ''
					})
				}.bind(this), 3000)
				return
			} else {
				this.setState({
					errorMessage: capitalize(t('somethingWentWrong')),
					signinDisabled: false,
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
			errorMessage,
			signinDisabled,
			isLoading,
			hasForgotPassword
		} = this.state
		const {
			t,
			history,
			isAuthenticated,
			user
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

		if(isAuthenticated && user) {
			history.push('/home')
			return null
		}

		if (hasForgotPassword) {
			return (
				<ForgetPassword
					onDone={() => {
						this.setState({
							hasForgotPassword: false
						})
					}}
				/>
			)
		}

		return (
			<div className='full-container flex-column flex-center main'>
				<div className='maxi-title title'>
					{capitalize(t('logInTitle'))}
				</div>
				<form
					id='login-form'
					onSubmit={e => this.onSubmit(e)}
					className='flex-column flex-start card auth-card form'
				>
					<input
						className='text-input small-text citrusGrey input'
						placeholder={capitalize(t('email'))}
						type='email'
						autoComplete='email'
						onChange={e => this.onTextInputChange(e, 'email')}
						name='email'
					/>
					<div className='password-container'>
						<input
							placeholder={capitalize(t('password'))}
							className='text-input small-text citrusGrey input password-input'
							type={showPassword ? 'text' : 'password'}
							onChange={e => this.onTextInputChange(e, 'password')}
							style={showPassword ? { height: '50px'} : { height: '52px' } }
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
					<div className='button-container flex-column flex-center'>
						<button
							className={!signinDisabled ? 'filled-button button' : 'filled-button disabled-button button'}
							type='submit'
							form='login-form'
							disabled={signinDisabled}
						>
							<span className='small-title citrusWhite'>
								{capitalize(t('logIn'))}
							</span>
						</button>
						<div className='light-button button'>
							<Link className='small-title citrusBlue' to="/signup">{capitalize(t('createAnAccount'))}</Link>
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
					<div className='medium-separator'></div>
					<div
						className='hover'
						style={{
							borderBottom: '1px solid #C2C2C2',
							marginBottom: 5,
							paddingBottom: 3
						}}
						onClick={() => {
							this.setState({
								hasForgotPassword: true
							})
						}}
					>
						<span className='smaller-text-bold citrusGrey'>
							{capitalize(t('iForgotMyPassword'))}
						</span>
					</div>
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
						.button-container {
							width: 100%;
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
							margin-bottom: 40px;
						}
						@media only screen and (max-width: 640px) {
							.title {
								max-width: 95% !important;
								margin: 0 0 10px 2.5% !important;
								font-size: 36px !important;
							}
							.main {
								justify-content: flex-start !important;
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
	signin: (email, password) => dispatch(signin(email, password)),
	loadUser: () => dispatch(loadUser()),
	fetchUserReplays: id => dispatch(fetchUserReplays(id)),
	fetchTrainerCoachings: (id, isMe) => dispatch(fetchTrainerCoachings(id, isMe)),
	executeExploreSearch: (sport, userId, skipValue, limit, userFavoriteSports) =>
		dispatch(executeExploreSearch(sport, userId, skipValue, limit, userFavoriteSports)),
	setIsRedirectingHome: bool => dispatch(setIsRedirectingHome(bool))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Signin))
