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
			<div className='full-container flex-center flex-column choose-plan'>
				<div className="flex-center">
					<div
						style={{ textAlign: 'center' }}
						className='medium-text'
					>
						{capitalize(t('moneySpentGoesDirectlyToTheTrainer'))}
					</div>
				</div>
				<div className='small-separator'></div>
				<div className="flex-center">
					<div
						className='medium-text cta'
						onClick={() => history.push('/dashboard')}
					>
						{uppercase(t('tryForFree'))}
					</div>
					<div className='big-separator'></div>
				</div>
				<div className='small-separator'></div>
				<div className='payments-plans'>
					<div
						onClick={() => history.push('/initial-payment')}
						className='card choose-plan-card flex flex-column'
						style={{ alignItems: 'center', justifyContent: 'space-around' }}
					>
						<div className="flex-column flex-center">
							<div className='medium-text'>{uppercase(t('basic'))}</div>
							<div className='medium-title'>{capitalize(t('aLaCarte'))}</div>
						</div>
						<div className="flex-column flex-center">
							<div className='medium-text price'>€10</div>
							<div className='big-separator'></div>
							<div className='medium-text'>{uppercase(t('perMonth'))}</div>
						</div>
						<div className="flex-column flex-center">
							<div className='medium-text cta'>{uppercase(t('startNow'))}</div>
						</div>
					</div>
					<div
						onClick={() => history.push('/initial-payment?sub=2')}
						className='card choose-plan-card flex flex-column'
						style={{ alignItems: 'center', justifyContent: 'space-around' }}
					>
						<div className="flex-column flex-center">
							<div className='medium-text'>{uppercase(t('pro'))}</div>
							<div className='medium-title'>{capitalize(t('unlimited'))}</div>
						</div>
						<div className="flex-column flex-center">
							<div className='medium-text price'>€20</div>
							<div className='big-separator'></div>
							<div className='medium-text'>{uppercase(t('perMonth'))}</div>
						</div>
						<div className="flex-column flex-center">
							<div className='medium-text cta'>{uppercase(t('iChooseFullAccess'))}</div>
						</div>
					</div>
				</div>
				<style jsx='true'>
					{`
					.padded {
						padding: 0 10px;
					}
					.price {
						font-size: 100px;
					}
					.cta {
						padding: 5px;
						border: 1px solid black;
						border-radius: 3px;
					}
					.cta:hover {
						cursor: pointer;
					}
				`}
				</style>
			</div>
		)
	}
}

export default withTranslation()(ChoosePlan)