import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'

import '../../../styling/headings.css'
import '../../../styling/colors.css'
import '../../../styling/buttons.css'
import '../../../styling/spacings.css'
import '../../../styling/App.css'

import {
	capitalize,
	uppercase,
	titleCase
} from '../../../utils/various'

class Invoices extends React.Component {
	constructor(props) {
		super(props)
		this.state = {}
	}

	render() {
		const { t, user } = this.props

		return (
			<div className='full-container flex-column flex-start'>
				<span className='maxi-title title'>
					{capitalize(t('invoices'))}
				</span>
				<div className='profile flex-center'>
					<span className='small-text citrusGrey'>{capitalize(t('featureSoonAvailable'))} ...</span>
				</div>
				<style jsx='true'>
					{`
						.profile {
							background-color: #FFFFFF;
							width: 690px;
							height: 321px;
							justify-content: center;
							align-items: center;
						}
						.title {
							margin-bottom: 30px;
						}
						@media only screen and (max-width: 640px) {
							.title {
								margin-bottom: 10px;
								margin-left: 1%;
							}
							.profile {
								width: 98%;
								margin: 0 1%;
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
	error: state.error
})

const mapDispatchToProps = dispatch => ({})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Invoices))
