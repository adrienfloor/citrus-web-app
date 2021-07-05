import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import queryString from 'query-string'
import Loader from 'react-loader-spinner'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'

import { ReactComponent as EyeClosed } from '../../assets/svg/eye-closed.svg'
import { ReactComponent as EyeOpen } from '../../assets/svg/eye-open.svg'

import { isValidPassword } from '../../utils/validations'

import {
	capitalize,
	uppercase,
	titleCase
} from '../../utils/various'

import { resetPassword } from '../../actions/auth-actions'

class ResetPassword extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			password: '',
			passwordConfirmation: '',
			errorMessage: '',
			showPassword: false,
			isButtonDisabled: false,
			isLoading: false,
			isSuccess: false
		}
		this.onTextInputChange = this.onTextInputChange.bind(this)
		this.onSubmit = this.onSubmit.bind(this)
		this.checkErrors = this.checkErrors.bind(this)
	}

	checkErrors() {
		const { password, passwordConfirmation } = this.state
		const { t } = this.props

		if (passwordConfirmation.length < 1 || password.length < 1) {
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

		if (
			!isValidPassword(password).includes('length') ||
			!isValidPassword(password).includes('uppercase') ||
			!isValidPassword(password).includes('number')
		) {
			this.setState({
				errorMessage: capitalize(t('passordFormat'))
			})
			setTimeout(function () {
				this.setState({
					errorMessage: ''
				})
			}.bind(this), 3000)
			return true
		}

		if(password !== passwordConfirmation) {
			this.setState({
				errorMessage: capitalize(t('passwordsMustBeIdentical'))
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
		const { password } = this.state
		const {
			t,
			resetPassword,
			history
		} = this.props
		const { rpt } = queryString.parse((this.props.location || {}).search)

		this.setState({
			isbuttonDisabled: true,
			isLoading: true
		})

		if (this.checkErrors()) {
			this.setState({
				isButtonDisabled: false,
				isLoading: false
		})
			return
		}

		resetPassword(password, rpt)
		.then(res => {
			if(res && res.type == 'RESET_PASSWORD') {
				this.setState({
					isbuttonDisabled: false,
					isLoading: false,
					isSuccess: true
				})
				setTimeout(function () {
					window.location.href = 'https:thecitrusapp.com'
				}.bind(this), 3000)
			} else {
				this.setState({
					isbuttonDisabled: false,
					isLoading: false,
					isSuccess: false,
					errorMessage: capitalize(t('passwordChangeFailed'))
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
			passwordConfirmation,
			showPassword,
			errorMessage,
			isButtonDisabled,
			isLoading,
			isSuccess
		} = this.state
		const { t } = this.props
		const { userName, rpt } = queryString.parse((this.props.location || {}).search)

		if (isLoading) {
			return (
				<div className='full-container flex-column flex-center main'>
					<Loader
						type="Grid"
						color="#0075FF"
						height={150}
						width={150}
					/>
				</div>
			)
		}

		if (isSuccess) {
			return (
				<div className='full-container flex-column flex-center main'>
					<div className='full-container flex-column flex-center main'>
						<div style={{ padding: '0 20px' }} className='small-text'>
							{capitalize(t('passwordConfirmationMessage'))}
						</div>
					</div>
				</div>
			)
		}

		return (
			<div className='full-container flex-column flex-center main'>
				<div className='big-title title'>
					{
						userName ?
						`${capitalize(t('resetPassword'))} ${userName.replace('}', '')}` :
						capitalize(t('resetPassword'))
					}
				</div>
				<form
					id='login-form'
					onSubmit={e => this.onSubmit(e)}
					className='flex-column flex-start card auth-card form'
				>
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
					<div className='password-container'>
						<input
							placeholder={capitalize(t('confirmPassword'))}
							className='text-input small-text citrusGrey input password-input'
							type={showPassword ? 'text' : 'password'}
							onChange={e => this.onTextInputChange(e, 'passwordConfirmation')}
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
					{
						errorMessage.length > 0 &&
						<span
							className='small-text citrusRed'
							style={{ marginTop: 2 }}
						>
							{errorMessage}
							<div className='medium-separator'></div>
						</span>
					}
					<div className='button-container flex-column flex-center'>
						<button
							className={!isButtonDisabled ? 'filled-button button' : 'filled-button disabled-button button'}
							type='submit'
							form='login-form'
							disabled={isButtonDisabled}
						>
							<span className='small-title citrusWhite'>
								{capitalize(t('submit'))}
							</span>
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
							flex-direction: column;
							justify-content: center;
							align-items: center;
							padding-bottom: 2px;
						}
						.title {
							width: 690px;
						}
						@media only screen and (max-width: 640px) {
							.title {
								max-width: 95% !important;
								margin: 0 0 10px 2.5% !important;
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
	resetPassword: (password, token) => dispatch(resetPassword(password, token))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ResetPassword))
