import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import { Checkbox } from '@material-ui/core'

import Profile from './sub-dashboard/profile'
import ManagePayments from './sub-dashboard/manage-payments'
import PaymentsMethods from './sub-dashboard/payments-methods'
import LegalUserCreation from './sub-dashboard/legal-user-creation'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'

import {
	capitalize
} from '../../utils/various'

import { loadUser, updateUser } from '../../actions/auth-actions'
import { setIsDashboard } from '../../actions/navigation-actions'

class Dashboard extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			currentFocus: 'profile',
			automaticTopUp: false,
			topUpValue: 10
		}
		this.renderMainContent = this.renderMainContent.bind(this)
	}

	componentDidMount() {
		if (window.location.href.includes('dashboard')) {
			this.props.setIsDashboard(true)
		}
	}

	componentWillUnmount() {
		this.props.setIsDashboard(false)
	}

	renderMainContent(mobile) {
		const {
			t,
			user,
			loadUser,
			focus
		} = this.props
		const {
			email,
			mangoPayUserId,
			mangoPayLegalUserId
		} = user
		const {
			automaticTopUp,
			topUpValue,
			currentFocus
		} = this.state

		let component = null
		const propOrStateFocus = mobile ? focus : currentFocus

		switch (propOrStateFocus) {
			case 'profile':
				component = <Profile />
				break;
			case 'managePayments':
				component = <ManagePayments history={this.props.history} />
				break;
			case 'invoices':
				component = (
					<div>Invoices</div>
				)
				break;
			case 'stats':
				component =(
					<div>Stats</div>
				)
				break;
			case 'paymentsReceipts':
				component = (
					<div>Payments receipts</div>
				)
				break;
			case 'paymentsHistory':
				component = (
					<div>Payments history</div>
				)
				break;
			case 'cashOut':
				component = mangoPayLegalUserId ? <PaymentsMethods /> : <LegalUserCreation />
				break;
			default:
				component = (
					<div>Profile</div>
				)
				break;
		}
		return component
	}

	render() {
		const { currentFocus } = this.state
		const {
			t,
			user,
			focus
		} = this.props
		return (
			<div className='full-container flex-row main'>
				{/* Desktop fixed menu */}
				<div
					className='padded desktop'
					style={{
						justifyContent: 'flex-start',
						alignItems: 'space-between',
						width: '15%',
						height: '90%',
						margin: '0 3%'
					}}
				>
					<h2 className='small-title'>
						{capitalize(t('myAccount'))}
					</h2>
					<div className={currentFocus === 'profile' ? 'active' : ''}>
						<span
							onClick={() => this.setState({ currentFocus: 'profile' })}
							className='small-text hover'
						>
							{capitalize(t('profile'))}
						</span>
					</div>
					<div className='small-separator'></div>
					<div className={currentFocus === 'managePayments' ? 'active' : ''}>
						<span
							onClick={() => this.setState({ currentFocus: 'managePayments' })}
							className='small-text hover'
						>
							{capitalize(t('managePayments'))}
						</span>
					</div>
					<div className='small-separator'></div>
					<div className={currentFocus === 'invoices' ? 'active' : ''}>
						<span
							onClick={() => this.setState({ currentFocus: 'invoices' })}
							className='small-text hover'
						>
							{capitalize(t('invoices'))}
						</span>
					</div>
					<div className='small-separator'></div>
					<h2 className='small-title'>
						{capitalize(t('myVideos'))}
					</h2>
					<div className={currentFocus === 'stats' ? 'active' : ''}>
						<span
							onClick={() => this.setState({ currentFocus: 'stats' })}
							className='small-text hover'
						>
							{capitalize(t('stats'))}
						</span>
					</div>
					<div className='small-separator'></div>
					<div className={currentFocus === 'paymentsReceipts' ? 'active' : ''}>
						<span
							onClick={() => this.setState({ currentFocus: 'paymentsReceipts' })}
							className='small-text hover'
						>
							{capitalize(t('paymentsReceipts'))}
						</span>
					</div>
					<div className='small-separator'></div>
					<div className={currentFocus === 'paymentsHistory' ? 'active' : ''}>
						<span
							onClick={() => this.setState({ currentFocus: 'paymentsHistory' })}
							className='small-text hover'
						>
							{capitalize(t('paymentsHistory'))}
						</span>
					</div>
					<div className='small-separator'></div>
					<div className={currentFocus === 'cashOut' ? 'active' : ''}>
						<span
							onClick={() => this.setState({ currentFocus: 'cashOut' })}
							className='small-text hover'
						>
							{capitalize(t('cashOut'))}
						</span>
					</div>
					<div className='medium-separator'></div>
				</div>
				<div
					className='card padded desktop'
					style={{
						width: '60%',
						height: '90%'
					}}
				>
					{this.renderMainContent()}
				</div>
				<div
					className='card padded mobile'
					style={{
						width: '100%',
						height: '90%'
					}}
				>
					{this.renderMainContent(true)}
				</div>
				<style jsx='true'>
					{`
					.main {
						align-items: center;
					}
					.padded {
						padding: 0 10px;
					}
					.active {
						width: fit-content;
						border-bottom: 2.5px solid black;
					}
					@media only screen and (min-width: 640px) {
						.mobile {
							display: none;
						}
					}
					@media only screen and (max-width: 640px) {
						.padded {
							padding: 0;
						}
						.desktop {
							display: none;
						}
						.card {
							border: none;
							box-shadow: none;
						}
						.main {
							align-items: flex-start;
						}
					}
				`}
				</style>
			</div>
		)
	}
}

const mapStateToProps = state => ({
	user: state.auth.user,
	error: state.error,
	focus: state.navigation.focus
})

const mapDispatchToProps = dispatch => ({
	loadUser: () => dispatch(loadUser()),
	updateUser: userInfo => dispatch(updateUser(userInfo)),
	setIsDashboard: bool => dispatch(setIsDashboard(bool))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Dashboard))