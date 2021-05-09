import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'

import { ReactComponent as EyeClosed } from '../../assets/svg/eye-closed.svg'
import { ReactComponent as EyeOpen } from '../../assets/svg/eye-open.svg'

import {
	signup,
	loadUser
} from '../../actions/auth-actions'

import {
	isValidEmailInput,
	isValidPassword
} from '../../utils/validations'

import {
	capitalize,
	uppercase,
	titleCase
} from '../../utils/various'

class Signup extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			userName: '',
			email: '',
			password: '',
			message: '',
			showPassword: false
		}
		this.onTextInputChange = this.onTextInputChange.bind(this)
		this.onToggleCheck = this.onToggleCheck.bind(this)
		this.onSubmit = this.onSubmit.bind(this)
	}

	isValidSignUp() {
		if (
			isValidEmailInput(this.state.email) &&
			isValidPassword(this.state.password).includes('length') &&
			isValidPassword(this.state.password).includes('uppercase') &&
			isValidPassword(this.state.password).includes('number')
		) {
			return true
		}
	}

	onTextInputChange(e, name) {
		this.setState({ [name]: e.target.value })
	}

	onToggleCheck() {
		this.setState({ agreedTermsAndConditions: !this.state.agreedTermsAndConditions })
	}

	onSubmit(e) {
		e.preventDefault()
		const {
			userName,
			email,
			password
		} = this.state
		const {
			i18n,
			signup
		} = this.props
		const lng = i18n.language || 'en'
		signup(
			userName,
			email.toLowerCase(),
			password,
			lng
		).then(res => {
			if (res.type === 'REGISTER_SUCCESS') {
				this.props.history.push('/download-app')
			}
		})
	}

	render() {
		const {
			email,
			password,
			showPassword
		} = this.state
		const {
			t,
			history,
			isAuthenticated
		} = this.props
		if (isAuthenticated) {
			history.push('/dashboard')
			return null
		}
		return (
			<div className='full-container flex-column flex-center main'>
				<div className='maxi-title title'>
					{capitalize(t('signUpTitle'))}
				</div>
				<form
					id='login-form'
					onSubmit={e => this.onSubmit(e)}
					className='flex-column flex-start card auth-card form'
				>
					<input
						className='text-input small-text citrusGrey input'
						placeholder={capitalize(t('userName'))}
						type='username'
						autoComplete='username'
						onChange={e => this.onTextInputChange(e, 'userName')}
					/>
					<input
						className='text-input small-text citrusGrey input'
						placeholder={capitalize(t('email'))}
						type='email'
						autoComplete='email'
						onChange={e => this.onTextInputChange(e, 'email')}
						name='email'
					/>
						{/* {this.state.password ? (
							<div className='container'>
								<span className={isValidPassword(password).includes('length') ? 'green' : 'red'}>At least 8 characters long</span>
								<span className={isValidPassword(password).includes('uppercase') ? 'green' : 'red'}>with one uppercase</span>
								<span className={isValidPassword(password).includes('number') ? 'green' : 'red'}>and one number</span>
							</div>
						) : null} */}
					<div className='password-container'>
						<input
							placeholder={capitalize(t('password'))}
							className='text-input small-text citrusGrey input password-input'
							type={showPassword ? 'text' : 'password'}
							onChange={e => this.onTextInputChange(e, 'password')}
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
							className={this.isValidSignUp() ? 'filled-button button' : 'filled-button disabled-button button'}
							type='submit'
							form='login-form'
							disabled={this.isValidSignUp() ? false : true}
						>
							<span className='small-title citrusWhite'>
								{capitalize(t('createAnAccount'))}
							</span>
						</button>
						<button
							className={this.isValidSignUp() ? 'light-button button' : 'light-button disabled-button button'}
							type='submit'
							form='login-form'
							disabled={this.isValidSignUp() ? false : true}
						>
							<Link className='small-title citrusBlue' to="/signin">{capitalize(t('logIn'))}</Link>
						</button>
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
							.disclaimer {
								margin: 0 0 0 2.5% !important;
							}
							.main {
								justify-content: flex-start !important;
							}
							.form {
								height: 450px;
								overflow-y: auto;
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
	signup: (userName, email, password, language) =>
		dispatch(signup(userName, email, password, language)),
	loadUser: () => dispatch(loadUser())
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Signup))
