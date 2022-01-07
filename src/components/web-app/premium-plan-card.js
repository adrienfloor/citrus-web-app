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

const PremiumPlanCard = ({
	onClick,
	planType,
	t,
	isCurrent,
	isAvailablePlan,
	billingDate,
	lastBillingMonth,
	lastBillingYear
}) => {

	let mainTitle = ''
	let title = ''
	let text = ''
	let subtext = ''

	if(planType === 4.99) {
		mainTitle = `${capitalize(t('premiumMonthly'))}`
		title = `4.99${returnCurrency(moment.locale())}/${t('month')}`
		text = capitalize(t('noAdditionnalFeePerTraining'))
	} else if(planType === 49.99) {
		mainTitle = `${capitalize(t('premiumAnnually'))}`
		title = `49.99${returnCurrency(moment.locale())}/${t('year')}`
		text = capitalize(t('noAdditionnalFeePerTraining'))
		subtext = `${capitalize(t('2FreeMonthsOfPremium'))}`
	} else {
		mainTitle = capitalize(t('aLaCarte'))
		title=''
		text = `${capitalize(t('costOfCoaching'))}`
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
			<span className='medium-title-card citrusBlack'>
				{mainTitle}
			</span>
			<div className='small-separator'></div>
			<span className='small-text-bold citrusBlack'>
				{title}
			</span>
			<div className='small-separator'></div>
			<div className='flex-column'>
				<div
					style={{
						display: 'flex',
						justifyContent: 'flex-start',
						alignItems: 'center',
						// marginBottom: '5px'
					}}
				>
					<span style={{ marginRight: '5px' }}>&#8226;</span>
					<span className='smaller-text citrusBlack'>
						{text}
					</span>
				</div>
				{
					subtext &&
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
				}
			</div>
			{
				!isCurrent && isAvailablePlan &&
				<div
					className='flex-center'
					style={{ marginTop: '20px' }}
				>
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
				<div
					className='flex-center'
					style={{ marginTop: '20px' }}
				>
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
						planType && billingDate ?
						<span className='extra-small-text-bold'>
							{
								planType === 4.99 ?
								`${t('renewOn')} ${returnNextBillingDate(billingDate, moment.locale())}` :
											`${t('renewOn')} ${returnNextBillingDate(billingDate, moment.locale(), lastBillingMonth, lastBillingYear)}`
							}
						</span> :
						<div className='small-separator'></div>
					}
				</div>
			}
			<style jsx='true'>
				{`
					.plan-card-container {
						height: 160px;
						width: 250px;
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

export default PremiumPlanCard