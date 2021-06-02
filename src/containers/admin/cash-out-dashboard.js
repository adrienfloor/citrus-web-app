import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'

import Cashout from './cashout'

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
import { fetchAllCashouts } from '../../services/cashout'

class Dashboard extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			currentFocus: 'new',
			newCashouts: [],
			pendingCashouts: [],
			processedCashouts: []
		}
		this.renderMainContent = this.renderMainContent.bind(this)
		this.loadCashouts = this.loadCashouts.bind(this)
	}

	componentDidMount() {
		if (window.location.href.includes('cashout')) {
			this.props.setIsDashboard(true)
		}
	}

	componentWillUnmount() {
		this.props.setIsDashboard(false)
	}

	componentDidMount() {
		this.loadCashouts()
	}

	loadCashouts() {
		fetchAllCashouts()
			.then(cashouts => {
				console.log(cashouts)
				const newCashouts = cashouts.filter(cashout => cashout.status === 0)
				const pendingCashouts = cashouts.filter(cashout => cashout.status === 1)
				const processedCashouts = cashouts.filter(cashout => cashout.status === 2)
				this.setState({
					newCashouts,
					pendingCashouts,
					processedCashouts
				})
			})
			.catch(err => console.log(err))
	}

	renderMainContent() {
		const {
			t,
			user,
			loadUser,
		} = this.props
		const {
			currentFocus,
			newCashouts,
			pendingCashouts,
			processedCashouts
		} = this.state

		let component = null

		switch (currentFocus) {
			case 'processed':
				component = (
					<Cashout
						cashoutType='processed'
						cashouts={processedCashouts}
						onReload={() => this.loadCashouts()}
					/>
				)
				break;
			case 'pending':
				component = (
					<Cashout
						cashoutType='pending'
						cashouts={pendingCashouts}
						onReload={() => this.loadCashouts()}
					/>
				)
				break;
			case 'new':
				component = (
					<Cashout
						cashoutType='new'
						cashouts={newCashouts}
						onReload={() => this.loadCashouts()}
					/>
				)
				break;
			default:
				component = <Cashout cashoutType='new' />
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
						{capitalize(t('adminCashoutPanel'))}
					</span>
					<div className='medium-separator'></div>
					<div className={currentFocus === 'new' ? 'active menu-item' : 'menu-item'}>
						<span
							onClick={() => this.setState({ currentFocus: 'new' })}
							style={{ fontSize: '16px' }}
							className={currentFocus === 'new' ? 'small-title hover' : 'small-text hover citrusGrey'}
						>
							{capitalize(t('new'))}
						</span>
					</div>
					<div className={currentFocus === 'pending' ? 'active menu-item' : 'menu-item'}>
						<div className='small-separator'></div>
						<span
							onClick={() => this.setState({ currentFocus: 'pending' })}
							style={{ fontSize: '16px' }}
							className={currentFocus === 'pending' ? 'small-title hover' : 'small-text hover citrusGrey'}
						>
							{capitalize(t('pending'))}
						</span>
					</div>
					<div className={currentFocus === 'processed' ? 'active menu-item' : 'menu-item'}>
						<div className='small-separator'></div>
						<span
							onClick={() => this.setState({ currentFocus: 'processed' })}
							style={{ fontSize: '16px' }}
							className={currentFocus === 'processed' ? 'small-title hover' : 'small-text hover citrusGrey'}
						>
							{capitalize(t('processed'))}
						</span>
					</div>
				</div>
				<div className='main-content'>
					{this.renderMainContent()}
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
				`}
				</style>
			</div>
		)
	}
}

const mapStateToProps = state => ({
	user: state.auth.user,
	error: state.error,
})

const mapDispatchToProps = dispatch => ({
	loadUser: () => dispatch(loadUser()),
	updateUser: userInfo => dispatch(updateUser(userInfo)),
	setIsDashboard: bool => dispatch(setIsDashboard(bool))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Dashboard))