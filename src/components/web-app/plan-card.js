import React from 'react'
import moment from 'moment'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'
import '../../styling/web-app.css'

import {
	capitalize,
	returnCurrency
} from '../../utils/various'

const PlanCard = ({ onClick, planType, t, isCurrent }) => {

	let title = ''
	let text = ''
	let subtext = ''

	if(planType === 20) {
		title = `20${returnCurrency(moment.locale())} / ${t('month')}`
		text = capitalize(t('youGet20CreditsAmonth'))
		subtext = capitalize(t('rollOverUpTo5Credits'))
	} else if(planType === 30) {
		title = `30${returnCurrency(moment.locale())} / ${t('month')}`
		text = capitalize(t('youGet30CreditsAmonth'))
		subtext = capitalize(t('rollOverUpTo10Credits'))
	} else if (planType === 10) {
		title = `10${returnCurrency(moment.locale())} / ${t('month')}`
		text = capitalize(t('youGet10CreditsAmonth'))
		subtext = capitalize(t('noRollOverOnCredits'))
	} else {
		title = capitalize(t('aLaCarte'))
		text = `${capitalize(t('youPayTheClassCost'))}${returnCurrency(moment.locale())})`
		subtext = `${capitalize(t('+1'))}${returnCurrency(moment.locale())} ${t('feePerClass')}`
	}


	return (
		<div
			className={
				isCurrent ?
				'full-container flex-column card-container' :
				'full-container flex-column hover card-container'
			}
			onClick={onClick}
		>
			<span className='big-title citrusBlack'>
				{title}
			</span>
			<div className='flex-column'>
				<span className='small-text citrusBlack'>
					{text}
				</span>
				<div className='small-separator'></div>
				<span className='small-text citrusBlack'>
					{subtext}
				</span>
			</div>
			{
				!isCurrent &&
				<div
					className='button filled-button '
					style={{ width: '100%' }}
				>
					<span className='small-title citrusWhite'>
						{capitalize(t('chooseThisPlan'))}
					</span>
				</div>
			}
			{
				isCurrent && planType &&
				<div
					className='button warning-button hover'
					style={{ width: '100%' }}
				>
					<span className='small-title citrusRed'>
						{capitalize(t('terminatePlan'))}
					</span>
				</div>
			}
			<style jsx='true'>
				{`
					.card-container {
						height: 180px;
						width: 280px;
						border: 2px solid black;
						padding: 10px;
						justify-content: space-between;
					}
					@media only screen and (max-width: 640px) {
						.card-container {
							width: calc(97.5% - 20px);
							margin: 0 1.25%;
						}
					}
				`}
			</style>
		</div>
	)
}

export default PlanCard
