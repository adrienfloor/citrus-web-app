import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import TextField from '@material-ui/core/TextField'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import Loader from 'react-loader-spinner'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'
import { ReactComponent as CaretBack } from '../../assets/svg/caret-left.svg'
import { capitalize } from '../../utils/various'

import { generateSpreadsheet } from '../../services/spreasheet'

class AdminAccountsLedger extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			startDate: null,
			endDate: null,
			platform: 'both',
			errorMessage: '',
			isAlertOpen: false,
			sheetGenerated: false,
			isLoading: false
		}
		this.handleClick = this.handleClick.bind(this)
	}

	handleDateChange(type, e) {
		this.setState({ sheetGenerated: false })
		if(type === 'start') {
			return this.setState({ startDate: e.target.value })
		}
		if (type === 'end') {
			return this.setState({ endDate: e.target.value })
		}
	}

	handleClick() {
		const {
			startDate,
			endDate,
			platform
		} = this.state
		this.setState({ isLoading: true })
		if (!startDate || !endDate) {
			this.setState({
				errorMessage: capitalize(this.props.t('pleaseEnterAllFields')),
				isLoading: false
			})
			setTimeout(function () {
				this.setState({
					errorMessage: ''
				})
			}.bind(this), 3000)
			return
		}
		generateSpreadsheet(startDate, endDate, platform)
		.then(res => {
			if(res ) {
				if(res.status === 204) {
					this.setState({
						isLoading: false,
						errorMessage: capitalize(this.props.t('noTransactionsForThatPeriod'))
					})
					setTimeout(function () {
						this.setState({
							errorMessage: ''
						})
					}.bind(this), 3000)
				} else {
					this.setState({
						sheetGenerated: true,
						isLoading: false
					})
				}
			}
		})
	}

	render() {
		const {
			t,
			history
		} = this.props
		const {
			platform,
			isAlertOpen,
			errorMessage,
			sheetGenerated,
			isLoading
		} = this.state

		if (isLoading) {
			return (
				<div className='loader'>
					<Loader
						type="Grid"
						color="#0075FF"
						height={100}
						width={100}
					/>
					<style jsx='true'>
						{`
						.loader {
							width: 100%;
							height: 100%;
							display: flex;
							align-items: center;
							justify-content: center;
						}
					`}
						</style>
				</div>
			)
		}

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
						Start date :
					</span>
					<TextField
						onChange={e => this.handleDateChange('start', e)}
						id='date'
						type='date'
						InputLabelProps={{ shrink: true }}
					/>
				</div>
				<div className='flex-row cta'>
					<span className='small-text citrusBlack wording'>
						End date :
					</span>
					<TextField
						onChange={e => this.handleDateChange('end', e)}
						id='date'
						type='date'
						InputLabelProps={{ shrink: true }}
					/>
				</div>
				<div className='flex-row cta'>
					<span className='small-text citrusBlack wording'>
						Platform :
					</span>
					<Select
						id='simple-select'
						value={platform}
						onChange={e => this.setState({
							platform: e.target.value,
							sheetGenerated: false
						})}
						style={{ width: '175px'}}
					>
						<MenuItem value='both'>Both</MenuItem>
						<MenuItem value='ios'>iOS</MenuItem>
						<MenuItem value='android'>Android</MenuItem>
					</Select>
				</div>
				<div style={{ marginTop: '10px', color: 'red' }}>{errorMessage}</div>
				{
					sheetGenerated && !isLoading &&
					<div style={{ marginTop: '10px' }}>
						<a
							href='https://drive.google.com/drive/u/2/folders/1zlTrLEqfADiXBZn0mbcTDoHPX5mOIsbp'
							target='_blank'
							className='simple-link'
						>
							{capitalize(t('checkOutYourDocumentHere'))}
						</a>
					</div>
				}
				<div
					className='flex-row'
					style={{ marginTop: '100px' }}
				>
					<div
						onClick={() => this.setState({ isAlertOpen: true })}
						className='filled-button'
					>
						<span className='small-title citrusWhite'>
							{capitalize(t('generateSpreadsheet'))}
						</span>
					</div>
				</div>
				<Dialog
					open={isAlertOpen}
					onClose={() => this.setState({ isAlertOpen: false })}
					aria-labelledby="alert-dialog-title"
					aria-describedby="alert-dialog-description"
				>
					<DialogTitle id="alert-dialog-title">{capitalize(t('generateSpreadsheet'))}</DialogTitle>
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
								this.handleClick()
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
						width: 600px;
						margin-bottom: 20px;
						display: flex;
						justify-content: space-between;
						align-items: center;
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

export default connect(mapStateToProps, null)(withTranslation()(AdminAccountsLedger))