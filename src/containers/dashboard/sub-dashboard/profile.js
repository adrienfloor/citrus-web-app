import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'

import '../../../styling/headings.css'
import '../../../styling/colors.css'
import '../../../styling/buttons.css'
import '../../../styling/spacings.css'
import '../../../styling/App.css'

import {
	updateUser
} from '../../../actions/auth-actions'

import {
	capitalize,
	uppercase,
	titleCase
} from '../../../utils/various'

class Profile extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			isTopingUpAccount: false
		}
	}

	render() {
		const { t, user } = this.props
		const {
			firstName,
			lastName,
			userName,
			email,
			mangoPayUserId
		} = user

		return (
			<div className='full-container flex-column flex-start profile'>
				<span className='maxi-title title'>
					{capitalize(t('profile'))}
				</span>
				<div className='flex-row row-dashboard'>
					<span className='small-text row-item citrusGrey'>{capitalize(t('firstName'))}</span>
					<span className='small-text row-item'>{firstName}</span>
				</div>
				<div className='flex-row row-dashboard'>
					<span className='small-text row-item citrusGrey'>{capitalize(t('lastName'))}</span>
					<span className='small-text row-item'>{lastName}</span>
				</div>
				<div className='flex-row row-dashboard'>
					<span className='small-text row-item citrusGrey'>{capitalize(t('userName'))}</span>
					<span className='small-text row-item'>{userName}</span>
				</div>
				<div className='flex-row row-dashboard'>
					<span className='small-text row-item citrusGrey'>{capitalize(t('email'))}</span>
					<span className='small-text row-item'>{email}</span>
				</div>
				<div className='flex-row row-dashboard'>
					<span className='small-text row-item citrusGrey'>{capitalize(t('password'))}</span>
					<span className='small-text row-item'>*************</span>
				</div>
				<style jsx='true'>
					{`
						.row-item {
							width: 33.3%;
						}
						.title {
							margin-bottom: 30px;
						}
						@media only screen and (max-width: 640px) {
							.row-item {
								margin: 0 5px;
								height: 50px;
							}
							.title {
								margin-bottom: 10px;
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
	updateUser: (userInfo) => dispatch(updateUser(userInfo))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Profile))
