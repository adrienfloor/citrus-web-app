import React from 'react'
import { connect } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { withTranslation } from 'react-i18next'

import { fetchUserReplays } from '../../actions/auth-actions'
import { fetchTrainerCoachings } from '../../actions/coachings-actions'

import Home from './home'
import Explore from './explore'
import Post from './post'
import Profile from './profile'
import Settings from './settings'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'
import '../../styling/web-app.css'

import {
	capitalize
} from '../../utils/various'


class WebApp extends React.Component {
	constructor(props) {
		super(props)
		this.renderScreen = this.renderScreen.bind(this)

		this.props.fetchUserReplays(this.props.user._id)
		this.props.fetchTrainerCoachings(this.props.user._id, true)
	}

	renderScreen() {
		const { appScreen, user } = this.props
		switch (appScreen) {
			case 1:
				return <Home />
			case 2:
				return <Explore />
			case 3:
				return <Post />
			case 4:
				return <Profile coach={user} />
			case 5:
				return <Settings />
			default:
				return <Home />
		}
	}

	render() {
		return (
			<div className='parent-container'>
					{this.renderScreen()}
			</div>
		)
	}
}

const mapStateToProps = (state) => ({
	user: state.auth.user,
	appScreen: state.navigation.appScreen
})

const mapDispatchToProps = (dispatch) => ({
	fetchUserReplays: id => dispatch(fetchUserReplays(id)),
	fetchTrainerCoachings: (id, isMe) => dispatch(fetchTrainerCoachings(id, isMe))
})

export default connect(mapStateToProps, mapDispatchToProps)(WebApp)
