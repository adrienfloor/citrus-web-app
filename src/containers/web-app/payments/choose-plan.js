import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'

import PlanCard from '../../../components/web-app/plan-card'
import { ReactComponent as Close } from '../../../assets/svg/close.svg'

import { updateUser } from '../../../actions/auth-actions'

import '../../../styling/headings.css'
import '../../../styling/colors.css'
import '../../../styling/buttons.css'
import '../../../styling/spacings.css'
import '../../../styling/App.css'

import {
	capitalize,
	uppercase
} from '../../../utils/various'


class ChoosePlan extends React.Component {
	render() {
		const {
			t,
			history,
			user,
			onCancel
		} = this.props
		return (
			<div className='full-container flex-column choose-plan-container'>
				<div className='desktop-only-medium-separator'></div>
				<div
					style={{
						width: '98.5%',
						height: '40px',
						display: 'flex',
						justifyContent: 'flex-end',
						alignItems: 'center'
					}}
					onClick={onCancel}
					className='hover mobile-only'
				>
					<Close
						width={25}
						height={25}
						stroke={'#C2C2C2'}
						strokeWidth={2}
					/>
				</div>
				<span className='small-title citrusBlack small-responsive-title'>
					{capitalize(t('yourPlan'))}
				</span>
				<div className='small-separator'></div>
				<span className='small-text citrusBlack small-responsive-title'>
					{capitalize(t('youCanChangeYouPlanAnytimeOr'))}
				</span>
				<div className='medium-separator'></div>
				<div className='flex-row available-plans'>
					<PlanCard
						t={t}
						planType={user.subscription}
						onClick={() => console.log('clicked')}
						isCurrent={true}
					/>
				</div>
				<div className='medium-separator'></div>
				<div className='medium-separator'></div>
				<span className='small-title citrusBlack small-responsive-title'>
					{capitalize(t('availablePlans'))}
				</span>
				<div className='small-separator'></div>
				<span className='small-text citrusBlack small-responsive-title'>
					{capitalize(t('exploreMorePlans'))}
				</span>
				<div className='medium-separator'></div>
				<div className='flex-row available-plans'>
					<PlanCard
						t={t}
						planType={10}
						onClick={() => console.log('clicked')}
						isCurrent={user.subscription === 10}
					/>
					<div className='mobile-only-small-separator'></div>
					<PlanCard
						t={t}
						planType={20}
						onClick={() => console.log('clicked')}
						isCurrent={user.subscription === 20}
					/>
					<div className='mobile-only-small-separator'></div>
					<PlanCard
						t={t}
						planType={30}
						onClick={() => console.log('clicked')}
						isCurrent={user.subscription === 30}
					/>
				</div>
				<div className='medium-separator'></div>
				<style jsx='true'>
					{`
						.available-plans {
							width: 97.5%;
							justify-content: space-between;
							flex-wrap: wrap;
						}
						@media only screen and (max-width: 640px) {
							.available-plans {
								flex-direction: column;
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

const mapDispatchToProps = dispatch => ({
	updateUser: userInfo => dispatch(updateUser(userInfo))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ChoosePlan))