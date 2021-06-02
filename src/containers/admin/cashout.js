import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import moment from 'moment'
import 'moment/locale/fr'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'
import { ReactComponent as CaretBack } from '../../assets/svg/caret-left.svg'

import {
	updateUser
} from '../../actions/auth-actions'
import { updateCashOut } from '../../services/cashout'

import {
	capitalize,
	uppercase,
	titleCase,
	returnCurrency
} from '../../utils/various'

class Cashout extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			selectedCashOut: null
		}
		this.handleCashoutStatusChange = this.handleCashoutStatusChange.bind(this)
		this.returnButtonWording = this.returnButtonWording.bind(this)
	}

	handleCashoutStatusChange(cashout) {
		const { onReload } = this.props
		updateCashOut(cashout)
		.then(res => {
			console.log(res)
			onReload()
		})
	}

	returnButtonWording(status){
		const { t } = this.props
		if(status === 0){
			return capitalize(t('changeStatusForPending'))
		}
		if (status === 1) {
			return capitalize(t('changeStatusForProcessed'))
		}
		if (status === 2) {
			return capitalize(t('changeStatusForPending'))
		}
	}

	render() {
		const {
			t,
			user,
			cashoutType,
			cashouts,
			onReload
		} = this.props
		const {
			firstName,
			lastName,
			companyName
		} = user
		const { selectedCashOut } = this.state

		let title = capitalize(t('new'))
		let color = 'red'
		if(cashoutType === 'processed') {
			title = capitalize(t('processed'))
			color = 'green'
		}
		if(cashoutType === 'pending') {
			title = capitalize(t('pending'))
			color = 'orange'
		}

		return (
			<div className='full-container flex-column flex-start'>
				<span className='maxi-title title'>
					{
						!selectedCashOut ?
						title :
						`${capitalize(t('cashoutOf'))} ${moment(selectedCashOut.date).format('LL')}`
					}
				</span>
				{
					!selectedCashOut && !cashouts || cashouts.length === 0 &&
					<div className='flex-row row-dashboard'>
						<span className='small-text row-item citrusGrey'>{capitalize(t('noCashoutsYet'))}</span>
					</div>
				}
				{
					!selectedCashOut && cashouts && cashouts.length>0 &&
					<div className='overflow'>
						{
							cashouts.map(cashout => (
								<div
									key={cashout._id}
									className='flex-row row-dashboard hover'
									onClick={() => this.setState({ selectedCashOut: cashout })}
								>
									<span className='small-text row-item citrusGrey'>
										{
											`${capitalize(cashout.user.firstName)} ${capitalize(cashout.user.lastName)} ${capitalize(cashout.user.companyName)}`
										}
									</span>
									<span
										className='small-text-bold row-item row-item-right'
										style={{ color: color }}
									>
										{capitalize(t('show'))}
									</span>
								</div>
							))
						}
					</div>
				}
				{
					selectedCashOut &&
					<div className='cashout'>
						<div
							style={{
								width: '100%',
								height: '50px',
								display: 'flex',
								justifyContent: 'flex-start',
								alignItems: 'center'
							}}
							onClick={() => this.setState({ selectedCashOut: null })}
							className='hover'
						>
							<CaretBack
								width={25}
								height={25}
								stroke={'#C2C2C2'}
								strokeWidth={2}
							/>
							<span className='small-text citrusGrey'>
								{capitalize(t('back'))}
							</span>
						</div>
						<div className='flex-row row-dashboard'>
							<span className='small-text citrusGrey row-item'>
								{`${capitalize(t('firstName'))} ${capitalize(t('lastName'))}`}
							</span>
							<span className='small-text-bold row-item row-item-right'>
								{`${capitalize(selectedCashOut.user.firstName)} ${capitalize(selectedCashOut.user.lastName)}`}
							</span>
						</div>
						<div className='flex-row row-dashboard'>
							<span className='small-text citrusGrey row-item'>
								{capitalize(t('companyName'))}
							</span>
							<span className='small-text-bold row-item row-item-right'>
								{capitalize(selectedCashOut.user.companyName)}
							</span>
						</div>
						<div className='flex-row row-dashboard'>
							<span className='small-text citrusGrey row-item'>
								{capitalize(t('companyAddress'))}
							</span>
							<span className='small-text-bold row-item row-item-right'>
								{`${capitalize(selectedCashOut.user.companyAddress.addressLine)} ${capitalize(selectedCashOut.user.companyAddress.zipCode)} ${capitalize(selectedCashOut.user.companyAddress.city)} ${capitalize(selectedCashOut.user.companyAddress.country)}`}
							</span>
						</div>
						<div className='flex-row row-dashboard'>
							<span className='small-text citrusGrey row-item'>
								{capitalize(t('companyNumber'))}
							</span>
							<span className='small-text-bold row-item row-item-right'>
								{capitalize(selectedCashOut.user.companyNumber)}
							</span>
						</div>
						<div className='flex-row row-dashboard'>
							<span className='small-text citrusGrey row-item'>
								{capitalize(t('companyLegalStatus'))}
							</span>
							<span className='small-text-bold row-item row-item-right'>
								{capitalize(selectedCashOut.user.companyLegalStatus)}
							</span>
						</div>
						<div className='flex-row row-dashboard'>
							<span className='small-text citrusGrey row-item'>
								{capitalize(t('companyType'))}
							</span>
							<span className='small-text-bold row-item row-item-right'>
								{capitalize(selectedCashOut.user.companyType)}
							</span>
						</div>
						<div className='flex-row row-dashboard'>
							<span className='small-text citrusGrey row-item'>
								{capitalize(t('subjectToTaxes'))}
							</span>
							<span className='small-text-bold row-item row-item-right'>
								{selectedCashOut.user.isCompanySubjectToTax ? capitalize(t('yes')) : capitalize(t('no'))}
							</span>
						</div>
						<div className='flex-row row-dashboard'>
							<span className='small-text citrusGrey row-item'>
								{capitalize(t('companyIban'))}
							</span>
							<span className='small-text-bold row-item row-item-right'>
								{capitalize(selectedCashOut.user.companyIban)}
							</span>
						</div>
						<div className='flex-row row-dashboard'>
							<span className='small-text citrusGrey row-item'>
								{capitalize(t('cashoutValue'))}
							</span>
							<span className='small-text-bold row-item row-item-right'>
								{`${capitalize(selectedCashOut.user.currentGains.toString())} ${returnCurrency(moment.locale())}`}
							</span>
						</div>
						<div className='medium-separator'></div>
						<div className='button-container'>
							<button
								className='filled-button'
								onClick={() => this.handleCashoutStatusChange(selectedCashout)}
							>
								<span className='small-title citrusWhite'>
									{this.returnButtonWording(selectedCashOut.status)}
								</span>
							</button>
						</div>
					</div>
				}
				<style jsx='true'>
					{`
						.overflow {
							overflow-y: auto;
							height: 600px;
							padding-right: 15px;
						}
						.cashout {
							background-color: #FFFFFF;
							width: 690px;
							padding: 10px;
						}
						.row-item {
							width: 50%;
							margin: 0 5px;
						}
						.row-item-right {
							display: flex;
							justify-content: flex-end;
						}
						.title {
							margin-bottom: 30px;
						}
						.button-container {
							padding: 10px;
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
	error: state.error
})

const mapDispatchToProps = dispatch => ({
	updateUser: (userInfo) => dispatch(updateUser(userInfo))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Cashout))
