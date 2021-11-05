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
	returnCurrency,
	returnNextBillingDate
} from '../../utils/various'

const PlanCard = ({
	onClick,
	planType,
	t,
	isCurrent,
	isAvailablePlan,
	credits,
	billingDate
}) => {

	let title = ''
	let text = ''
	let subtext = ''

	if(planType === 20) {
		title = `20${returnCurrency(moment.locale())} / ${t('month')}`
		// text = capitalize(t('youGet20CreditsAmonth'))
		text = capitalize(t('noAdditionnalFeePerTraining'))
		subtext = capitalize(t('rollOverUpTo5Credits'))
	} else if(planType === 30) {
		title = `30${returnCurrency(moment.locale())} / ${t('month')}`
		// text = capitalize(t('youGet30CreditsAmonth'))
		text = capitalize(t('noAdditionnalFeePerTraining'))
		subtext = capitalize(t('rollOverUpTo10Credits'))
	} else if (planType === 10) {
		title = `10${returnCurrency(moment.locale())} / ${t('month')}`
		// text = capitalize(t('youGet10CreditsAmonth'))
		text = capitalize(t('noAdditionnalFeePerTraining'))
		subtext = capitalize(t('noRollOverOnCredits'))
	} else {
		title = capitalize(t('aLaCarte'))
		text = `${capitalize(t('youPayTheClassCost'))}${returnCurrency(moment.locale())})`
		subtext = `${capitalize(t('+1'))}${returnCurrency(moment.locale())} ${t('feePerClass')}`
	}


	return (
		<div
			className={
				isAvailablePlan ?
				'full-container flex-column plan-card-container plan-card-available-mobile' :
				'full-container flex-column plan-card-container'
			}
		>
			<span className='small-text-bold citrusBlack'>
				{title}
			</span>
			<div className='flex-column'>
				<div
					style={{
						display: 'flex',
						justifyContent: 'flex-start',
						alignItems: 'center',
						marginBottom: '5px'
					}}
				>
					<span style={{ marginRight: '5px' }}>&#8226;</span>
					<span className='smaller-text citrusBlack'>
						{text}
					</span>
				</div>
				<div
					style={{
						display: 'flex',
						justifyContent: 'flex-start',
						alignItems: 'center'
					}}
				>
					<span style={{ marginRight: '5px' }}>&#8226;</span>
					<span className='smaller-text citrusBlack'>
						{subtext}
					</span>
				</div>
			</div>
			{
				!isCurrent && isAvailablePlan &&
				<div className='flex-center'>
					<div
						onClick={onClick}
						className='button filled-button '
						style={{ width: '60%', height: '40px' }}
					>
						<span className='small-text-bold citrusWhite'>
							{capitalize(t('chooseThisPlan'))}
						</span>
					</div>
				</div>
			}
			{
				isCurrent && isAvailablePlan &&
				<div className='flex-center'>
					<div
						className='black-filled-button'
						style={{ width: '60%', height: '40px' }}
						onClick={onClick}
					>
						<span className='small-text-bold dark-grey'>
							{capitalize(t('currentPlan'))}
						</span>
					</div>
				</div>
			}
			{
				isCurrent && !isAvailablePlan &&
				<div className='flex-column'>
					<div style={{ backgroundColor: '#C2C2C2', width: '100%', height: '2px' }}></div>
					<div className='small-separator'></div>
					{
						credits ?
						<span className='extra-small-text-bold'>
							{`${credits} ${credits > 1 ? t('creditsLeft') : t('creditLeft')} ${planType ? `- ${t('renewOn')} ${returnNextBillingDate(billingDate, moment.locale())}` : ''}`}
						</span> :
						<div className='small-separator'></div>
					}
				</div>
			}
			<style jsx='true'>
				{`
					.plan-card-container {
						height: 140px;
						width: 230px;
						border: 1px solid #C2C2C2;
						padding: 20px;
						justify-content: space-between;
						border-radius: 3px;
					}
					@media only screen and (max-width: 640px) {
						.plan-card-container {
							height: 150px;
							width: 240px;
							margin: 0 2.5%;
						}
						.plan-card-available-mobile {
							margin-bottom: 20px;
						}
					}
				`}
			</style>
		</div>
	)
}

export default PlanCard
