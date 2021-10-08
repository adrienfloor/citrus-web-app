import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import Loader from 'react-loader-spinner'

import Cashout from './cashout'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'

import {
	capitalize
} from '../../utils/various'
import { ReactComponent as CaretBack } from '../../assets/svg/caret-left.svg'

import { loadUser, updateUser } from '../../actions/auth-actions'
import { setIsDashboard } from '../../actions/navigation-actions'
import { fetchAllCashouts } from '../../services/cashout'

class Dashboard extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			currentFocus: 'pending',
			pendingCashouts: [],
			processedCashouts: [],
			isLoading: true
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
		this.setState({ isLoading: true })
		fetchAllCashouts()
			.then(cashouts => {
				const pendingCashouts = cashouts.filter(cashout => cashout.status === 0)
				const processedCashouts = cashouts.filter(cashout => cashout.status === 1)
				this.setState({
					pendingCashouts,
					processedCashouts,
					isLoading: false
				})
			})
			.catch(err => {
				this.setState({ isLoading: false })
				console.log(err)
			})
	}

	renderMainContent() {
		const {
			t,
			user,
			loadUser,
		} = this.props
		const {
			currentFocus,
			pendingCashouts,
			processedCashouts,
			isLoading
		} = this.state

		if(isLoading) {
			return (
				<div className='flex-column flex-center'>
					<div className='big-separator'></div>
					<div className='big-separator'></div>
					<Loader
						type='Oval'
						color='#C2C2C2'
						height={100}
						width={100}
					/>
				</div>
			)
		}

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
			default:
				component = <Cashout cashoutType='pending' />
				break;
		}
		return component
	}

	render() {
		const { currentFocus } = this.state
		const {
			t,
			user,
			focus,
			history
		} = this.props
		return (
			<div className='full-container flex-row main'>
				<div
					onClick={() => history.push('/admin/dashboard')}
					className='back hover'
				>
					<CaretBack
						width={25}
						height={25}
						stroke={'#000000'}
						strokeWidth={2}
					/>
					<span className='small-text citrusGrey'>
						{capitalize(t('back'))}
					</span>
				</div>
				{/* Desktop fixed menu */}
				<div className='desktop menu-column'>
					<span className='small-title'>
						{capitalize(t('adminCashoutPanel'))}
					</span>
					<div className='medium-separator'></div>
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
					.back {
						position: absolute;
						top: 140px;
						left: 100px;
						display: flex;
						justify-content: center;
						align-items: center;
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