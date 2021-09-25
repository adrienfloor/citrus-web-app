import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import moment from 'moment'
import 'moment/locale/fr'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'
import { ReactComponent as CaretBack } from '../../assets/svg/caret-left.svg'
import { capitalize } from '../../utils/various'

import {
	fetchMonthTransfer,
	createTransfer,
	updateTransfer
} from '../../services/store-transfer'

class AdminStoreTransfer extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			monthTransfer: null,
			isAlertOpen: false,
			platform: null
		}
		fetchMonthTransfer()
		.then(res => {
			this.setState({
				monthTransfer: res
			})
		})
		this.handleClick = this.handleClick.bind(this)
	}

	handleClick(platform) {
		const { monthTransfer} = this.state
		if(!monthTransfer) {
			const android = platform === 'android' ? 'done' : 'pending'
			const ios = platform === 'ios' ? 'done' : 'pending'
			createTransfer(android, ios)
			.then(() => {
				fetchMonthTransfer()
				.then(res => {
					this.setState({
						monthTransfer: res
					})
				})
			})
			return
		}

		const android = platform === 'android' ? 'done' : monthTransfer.android
		const ios = platform === 'ios' ? 'done' : monthTransfer.ios
		updateTransfer(new Date(), android, ios)
		.then(() => {
			fetchMonthTransfer()
			.then(res => {
				this.setState({
					monthTransfer: res
				})
			})
		})
	}

	render() {
		const {
			t,
			user,
			history
		} = this.props
		const {
			monthTransfer,
			isAlertOpen,
			platform
		} = this.state
		const isTransferExisting = monthTransfer !== undefined && monthTransfer !== null && monthTransfer !== ''
		return (
			<div className='full-container flex-column main'>
				<div
					onClick={() => history.push('/admin/dashboard')}
					className='back hover'
				>
					<CaretBack
						width={25}
						height={25}
						stroke={'#000000'}
						strokeWidth={2}
					/>
					<span className='small-text citrusGrey'>
						{capitalize(t('back'))}
					</span>
				</div>
				<div className='flex-row cta'>
					<span className='small-text citrusBlack wording'>
						{
							isTransferExisting ?
							`${capitalize(t('iosTransfer'))} ${capitalize(moment(new Date()).format('MMMM YYYY'))} : ${monthTransfer.ios}` :
							`${capitalize(t('iosTransfer'))} ${capitalize(moment(new Date()).format('MMMM YYYY'))} : pending`
						}
					</span>
					{
						(!isTransferExisting || monthTransfer.ios === 'pending') &&
						<div
							onClick={() => this.setState({ isAlertOpen: true, platform: 'ios'})}
							className='light-button'
						>
							<span className='small-text-bold citrusBlue'>
								{capitalize(t('markAsSent'))}
							</span>
						</div>
					}
				</div>
				<div className='flex-row cta'>
					<span className='small-text citrusBlack wording'>
						{
							isTransferExisting ?
							`${capitalize(t('androidTransfer'))} ${capitalize(moment(new Date()).format('MMMM YYYY'))} : ${monthTransfer.android}` :
								`${capitalize(t('androidTransfer'))} ${capitalize(moment(new Date()).format('MMMM YYYY'))} : pending`
						}
					</span>
					{
						(!isTransferExisting || monthTransfer.android === 'pending') &&
						<div
							onClick={() => this.setState({ isAlertOpen: true, platform: 'android' })}
							className='light-button'
						>
							<span className='small-text-bold citrusBlue'>
								{capitalize(t('markAsSent'))}
							</span>
						</div>
					}
				</div>
				<Dialog
					open={isAlertOpen}
					onClose={() => this.setState({ isAlertOpen: false })}
					aria-labelledby="alert-dialog-title"
					aria-describedby="alert-dialog-description"
				>
					<DialogTitle id="alert-dialog-title">{capitalize(t('markAsSent'))}</DialogTitle>
					<DialogContent>
						<DialogContentText id="alert-dialog-description">
							{capitalize(t('areYouSureQuentin'))}
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button
							onClick={() => {
								this.setState({ isAlertOpen: false })
							}}
							color="primary"
						>
							{capitalize(t('no'))}
						</Button>
						<Button
							onClick={() => {
								this.handleClick(platform)
								this.setState({ isAlertOpen: false })
							}}
							color="primary"
							autoFocus
						>
							{capitalize(t('yes'))}
						</Button>
					</DialogActions>
				</Dialog>
				<style jsx='true'>
					{`
					.main {
						align-items: center;
						justify-content: center;
						width: 100%;
					}
					.cta {
						width: 100%;
						margin-bottom: 20px;
						display: flex;
						justify-content: space-around;
						align-items: center;
					}
					.wording {
						width: 400px;
					}
					.back {
						position: absolute;
						top: 200px;
						left: 200px;
						display: flex;
						justify-content: center;
						align-items: center;
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

export default connect(mapStateToProps, null)(withTranslation()(AdminStoreTransfer))