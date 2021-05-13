import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'

import '../styling/headings.css'
import '../styling/colors.css'
import '../styling/buttons.css'
import '../styling/spacings.css'
import '../styling/App.css'

import {
	capitalize,
	uppercase
} from '../utils/various'


class ChoosePlan extends React.Component {
	render() {
		const {
			t,
			history
		} = this.props
		return (
			<div className='full-container flex-column choose-plan'>
				<div className='small-separator'></div>
				<div className='payments-plans'>
					<div
						onClick={() => history.push('/initial-payment')}
						className='card choose-plan-card flex flex-column'
						style={{ alignItems: 'center', justifyContent: 'space-around' }}
					>
						<div className="flex-column flex-center">
							<div className='small-text'>{uppercase(t('basic'))}</div>
							<div className='small-title'>{capitalize(t('aLaCarte'))}</div>
						</div>
						<div className="flex-column flex-center">
							<div className='small-text price'>€10</div>
							<div className='big-separator'></div>
							<div className='small-text'>{uppercase(t('perMonth'))}</div>
						</div>
						<div className='flex-center button-container'>
							<button className='filled-button'>
								<span className='small-title citrusWhite'>
									{uppercase(t('startNow'))}
								</span>
							</button>
						</div>
					</div>
					<div
						onClick={() => history.push('/initial-payment?sub=2')}
						className='card choose-plan-card flex flex-column'
						style={{ alignItems: 'center', justifyContent: 'space-around' }}
					>
						<div className="flex-column flex-center">
							<div className='small-text'>{uppercase(t('pro'))}</div>
							<div className='small-title'>{capitalize(t('unlimited'))}</div>
						</div>
						<div className="flex-column flex-center">
							<div className='small-text price'>€20</div>
							<div className='big-separator'></div>
							<div className='small-text'>{uppercase(t('perMonth'))}</div>
						</div>
						<div className='flex-center button-container'>
							<button className='filled-button'>
								<span className='small-title citrusWhite'>
									{uppercase(t('startNow'))}
								</span>
							</button>
						</div>
					</div>
				</div>
				<div className='big-separator'></div>
				<div className='flex-center flex-column bottom-container'>
					<div className="flex-center">
						<div
							style={{ textAlign: 'center' }}
							className='small-title'
						>
							{capitalize(t('moneySpentGoesDirectlyToTheTrainer'))}
						</div>
					</div>
					<div className='medium-separator'></div>
					<button className='filled-button' onClick={() => history.push('/dashboard')}>
						<span className='small-title citrusWhite'>
							{uppercase(t('tryForFree'))}
						</span>
					</button>
				</div>
				<style jsx='true'>
					{`
					.padded {
						padding: 0 10px;
					}
					.price {
						font-size: 100px;
					}
					.button-container,
					.bottom-container {
						width: 100%;
					}
					@media only screen and (max-width: 640px) {
						.bottom-container {
							width: 90% !important;
							margin: 0 5% 100px 5%;
						}
						.filled-button {
							width: 100%;
						}
					}
				`}
				</style>
			</div>
		)
	}
}

export default withTranslation()(ChoosePlan)