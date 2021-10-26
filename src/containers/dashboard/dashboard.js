import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import { Checkbox } from '@material-ui/core'

import Profile from './sub-dashboard/profile'
import ManagePayments from './sub-dashboard/manage-payments'
import PaymentsMethods from './sub-dashboard/payments-methods'
import LegalUserCreation from './sub-dashboard/legal-user-creation'
import Invoices from './sub-dashboard/invoices'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'

import {
	capitalize
} from '../../utils/various'

import { loadUser } from '../../actions/auth-actions'
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
			MPUserId,
			MPLegalUserId
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
				component = <Invoices />
				break;
			case 'stats':
				component = null
				break;
			case 'paymentsReceipts':
				component = null
				break;
			case 'paymentsHistory':
				component = null
				break;
			case 'cashOut':
				component = MPLegalUserId ? <PaymentsMethods /> : <LegalUserCreation />
				break;
			default:
				component = null
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
				<div className='desktop menu-column'>
					<span className='small-title'>
						{capitalize(t('account'))}
					</span>
					<div className='medium-separator'></div>
					<div className={currentFocus === 'profile' ? 'active menu-item' : 'menu-item'}>
						<span
							onClick={() => this.setState({ currentFocus: 'profile' })}
							style={{ fontSize: '16px' }}
							className={currentFocus === 'profile' ? 'small-title hover' : 'small-text hover citrusGrey'}
						>
							{capitalize(t('profile'))}
						</span>
					</div>
					<div className={currentFocus === 'managePayments' ? 'active menu-item' : 'menu-item'}>
						<div className='small-separator'></div>
						<span
							onClick={() => this.setState({ currentFocus: 'managePayments' })}
							style={{ fontSize: '16px' }}
							className={currentFocus === 'managePayments' ? 'small-title hover' : 'small-text hover citrusGrey'}
						>
							{capitalize(t('payments'))}
						</span>
					</div>
					<div className={currentFocus === 'invoices' ? 'active menu-item' : 'menu-item'}>
						<div className='small-separator'></div>
						<span
							onClick={() => this.setState({ currentFocus: 'invoices' })}
							style={{ fontSize: '16px' }}
							className={currentFocus === 'invoices' ? 'small-title hover' : 'small-text hover citrusGrey'}
						>
							{capitalize(t('invoices'))}
						</span>
					</div>
					<div className='big-separator'></div>
					<span className='small-title'>
						{capitalize(t('videos'))}
					</span>
					<div className='medium-separator'></div>
					{/* <div className={currentFocus === 'stats' ? 'active menu-item' : 'menu-item'}>
						<span
							onClick={() => this.setState({ currentFocus: 'stats' })}
							style={{ fontSize: '16px' }}
							className={currentFocus === 'stats' ? 'small-title hover' : 'small-text hover citrusGrey'}
						>
							{capitalize(t('stats'))}
						</span>
					</div> */}
					{/* <div className={currentFocus === 'paymentsReceipts' ? 'active menu-item' : 'menu-item'}>
						<div className='small-separator'></div>
						<span
							onClick={() => this.setState({ currentFocus: 'paymentsReceipts' })}
							style={{ fontSize: '16px' }}
							className={currentFocus === 'paymentsReceipts' ? 'small-title hover' : 'small-text hover citrusGrey'}
						>
							{capitalize(t('paymentsReceipts'))}
						</span>
					</div> */}
					{/* <div className={currentFocus === 'paymentsHistory' ? 'active menu-item' : 'menu-item'}>
						<div className='small-separator'></div>
						<span
							onClick={() => this.setState({ currentFocus: 'paymentsHistory' })}
							style={{ fontSize: '16px' }}
							className={currentFocus === 'paymentsHistory' ? 'small-title hover' : 'small-text hover citrusGrey'}
						>
							{capitalize(t('paymentsHistory'))}
						</span>
					</div> */}
					<div className={currentFocus === 'cashOut' ? 'active menu-item' : 'menu-item'}>
						<div className='small-separator'></div>
						<span
							onClick={() => this.setState({ currentFocus: 'cashOut' })}
							style={{ fontSize: '16px' }}
							className={currentFocus === 'cashOut' ? 'small-title hover' : 'small-text hover citrusGrey'}
						>
							{capitalize(t('cashOut'))}
						</span>
					</div>
					<div className='medium-separator'></div>
				</div>
				<div className='main-content desktop'>
					{this.renderMainContent()}
				</div>
				<div
					className='padded mobile'
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
						width: 85%;
						padding-left: 15%;
					}
					.main-content {
						width: 60%;
						max-width: 690px;
						height: 90%;
						padding: 2% 10px 0 10px;
					}
					.menu-column {
						justify-content: flex-start;
						width: 15%;
						height: 90%;
						margin: 0 3%;
						padding: 4% 10px 0 10px;
					}
					.padded {
						padding: 0 10px;
					}
					.menu-item {
						margin: 10px 0;
					}
					.active {
						width: fit-content;
						color: #000000;
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
							width: 96%;
							height: 96%;
							margin: 2%;
							padding-left: 0;
							padding-top: 0;
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
	setIsDashboard: bool => dispatch(setIsDashboard(bool))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Dashboard))