import React from 'react'
import { connect } from 'react-redux'
import {withTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'

import {
	signin,
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

class Signin extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			email: '',
			password: '',
			message: ''
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
			email,
			password,
		} = this.state
		this.props.signin(
			email.toLowerCase(),
			password
		).then(res => {
			if(res.type === 'LOGIN_SUCCESS') {
				this.props.history.push('/dashboard')
			}
		})
	}

	render() {
		const {
			email,
			password,
		} = this.state
		const {
			t,
			history,
			isAuthenticated
		} = this.props
		if(isAuthenticated) {
			history.push('/dashboard')
			return null
		}
		return (
			<div
				className='full-container flex-column flex-center'
			>
				<form
					id='login-form'
					onSubmit={e => this.onSubmit(e)}
					className='flex-column card auth-card'
					style={{ alignItems: 'center', justifyContent: 'space-around' }}
				>
					<div className='inputs-container flex-column'>
						<h2
							className='small-title'
							style={{ width: 270 }}
						>
							{capitalize(t('logIn'))}
						</h2>
						<span className='big-text auth-label'>
							{capitalize(t('email'))}
						</span>
						<input
							className='text-input medium-text'
							style={{ color: '#1D1D1D'}}
							// style={
							// 	isValidEmailInput(email) ?
							// 		{ color: '#1D1D1D'} :
							// 		{ color: '#cf352e' }
							// }
							label='Email'
							type='email'
							autoComplete='email'
							onChange={e => this.onTextInputChange(e, 'email')}
							name='email'
						/>
						<div className='medium-separator'></div>
						<span className='big-text auth-label'>
							{capitalize(t('password'))}
						</span>
						{/* {this.state.password ? (
							<div className='container'>
								<span className={isValidPassword(password).includes('length') ? 'green' : 'red'}>At least 8 characters long</span>
								<span className={isValidPassword(password).includes('uppercase') ? 'green' : 'red'}>with one uppercase</span>
								<span className={isValidPassword(password).includes('number') ? 'green' : 'red'}>and one number</span>
							</div>
						) : null} */}
						<input
							className='text-input medium-text'
							style={{ color: '#1D1D1D' }}
							type='password'
							autoComplete='password'
							onChange={e => this.onTextInputChange(e, 'password')}
							name='password'
						/>
						<div className='small-separator'></div>
					</div>
					<div
						className='buttons-container flex-column'
					>
						<button
							className={this.isValidSignUp() ? 'action-button' : 'action-button disabled-button'}
							type='submit'
							form='login-form'
							disabled={this.isValidSignUp() ? false : true}
						>
							<span
								className='big-text button-white-text'
							>
								{capitalize(t('logIn'))}
							</span>
						</button>
						<span
							className='medium-text simple-link signup-link'
						>
							<Link to="/signup">{capitalize(t('iDontHaveAnAccountYet'))}</Link>
						</span>
					</div>
				</form>
				<style jsx='true'>
					{`
						.inputs-container {
							padding-top: 20px;
							height: 60%;
							width: 100%;
							align-items: center;
							justify-content: flex-start;
						}
						.buttons-container {
							padding-bottom: 20px;
							height: 40%;
							width: 100%;
							align-items: center;
							justify-content: space-around;
						}
						.signup-link {
							max-width: 225px;
							text-align: center;
						}
						.signup-link:hover {
							color: #303030;
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
	signin: (email, password) =>
		dispatch(signin(email, password)),
	loadUser: () => dispatch(loadUser())
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Signin))
