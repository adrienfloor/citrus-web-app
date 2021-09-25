import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'

import {
	capitalize
} from '../../utils/various'

class AdminDashboard extends React.Component {

	render() {
		const {
			t,
			user,
			history
		} = this.props
		return (
			<div className='full-container flex-column main'>
				<div
					onClick={() => history.push('/admin/store_transfer')}
					className='filled-button cta'
				>
					<span className='small-title citrusWhite'>
						{capitalize(t('storeMonthlyTransfer'))}
					</span>
				</div>
				<div
					onClick={() => history.push('/admin/cashout')}
					className='filled-button cta'
				>
					<span className='small-title citrusWhite'>
						{capitalize(t('cashoutsDashboard'))}
					</span>
				</div>
				<div
					onClick={() => history.push('/admin/accounts_ledger')}
					className='filled-button cta'
				>
					<span className='small-title citrusWhite'>
						{capitalize(t('accountsLedger'))}
					</span>
				</div>
				<style jsx='true'>
					{`
					.main {
						align-items: center;
						justify-content: center;
						width: 100%;
					}
					.cta {
						margin-bottom: 20px;
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

export default connect(mapStateToProps, null)(withTranslation()(AdminDashboard))