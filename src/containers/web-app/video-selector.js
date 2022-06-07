import React from 'react'
import Loader from 'react-loader-spinner'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import { Dialog, Tooltip } from '@material-ui/core'

import { ReactComponent as Upload } from '../../assets/svg/upload.svg'
import { ReactComponent as Close } from '../../assets/svg/close.svg'
import Card from '../../components/web-app/card'

import { fetchTrainerCoachings } from '../../actions/coachings-actions'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'
import '../../styling/web-app.css'

import {
	capitalize,
	titleCase
} from '../../utils/various'


class VideoSelector extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			selectedCoachings: [],
			coachings: [],
			isLoading: false,
			isModalOpen: false,
			selectedCoachingIndexes: []
		}
		this.handleCardClick = this.handleCardClick.bind(this)
	}

	componentDidMount() {
		const {
			user,
			fetchTrainerCoachings
		} = this.props
		fetchTrainerCoachings(user._id, true)
		.then(res => {
			console.log(res)
			this.setState({ coachings: res.payload })
		})
	}

	handleCardClick(coaching, i) {
		const {
			selectedCoachingIndexes,
			selectedCoachings
		} = this.state
		const isSelected = selectedCoachingIndexes.includes(i)
		console.log(coaching, i)
		if(isSelected) {
			const filteredSelectedCoachings = selectedCoachings.filter(selectedCoaching => selectedCoaching._id !== coaching._id)
			const filteredIndexes = selectedCoachingIndexes.filter(index => index !== i)
			this.setState({
				selectedCoachings: filteredSelectedCoachings,
				selectedCoachingIndexes: filteredIndexes
			})
		} else {
			this.setState({
				selectedCoachings: [...selectedCoachings, coaching],
				selectedCoachingIndexes: [...selectedCoachingIndexes, i]
			})
		}
	}

	render() {
		const { t } = this.props
		const {
			isLoading,
			selectedCoachings,
			isModalOpen,
			coachings,
			selectedCoachingIndexes
		} = this.state

		return (
			<div
				className='uploader-container'
				style={ selectedCoachings.length ?
					{
						backgroundColor: '#FFFFFF',
						alignItems: 'flex-start',
						flexWrap: 'wrap',
						width: '400px'
					} : {
				}}
			>
				{
					selectedCoachings.length === 0 &&
					<>
						<Upload
							height={120}
							width={120}
							stroke={'#FFFFFF'}
							strokeWidth={2}
						/>
						{
							selectedCoachings.length === 0 &&
							<label
								className="custom-file-upload"
								onClick={() => this.setState({ isModalOpen: !isModalOpen })}
							>
								<div style={{ width: '100%', height: '30px' }}>
									<span className='smaller-text-bold citrusBlue'>
										{capitalize(t('chooseVideo'))}
									</span>
								</div>
							</label>
						}
					</>
				}
				{
					selectedCoachings.length > 0 &&
					<div className='flex-row' style={{maxWidth: '600px', overflowY: 'auto', minHeight: '110px' }}>
						{
							selectedCoachings.map((coaching, i) => (
								<img
									onClick={() => this.setState({ isModalOpen: !isModalOpen })}
									src={coaching.pictureUri}
									style={{ width: '150px', height: '100px', marginRight: '30px' }}
								/>
							))
						}
					</div>
				}
				{
					isModalOpen &&
					<Dialog
						open={true}
						onClose={() => this.setState({ isModalOpen: false })}
					>
						<div className='small-separator'></div>
						<div className='full-width-and-height-dialog'>
							<div className='flex-row top-row'>
								<span className='medium-title citrusBlack'>
								{capitalize(t('selectFromYourVideos'))}
								</span>
								<div onClick={() => {
									console.log('kirikou')
									this.setState({ isModalOpen: false })
								}}>
									<Close
										className='hover'
										width={25}
										height={25}
										stroke={'#C2C2C2'}
										strokeWidth={2}
									/>
								</div>
							</div>
							<div className='video-selector-container'>
								{
									coachings.map((coaching, i) => (
										<Card
											onClick={() => this.handleCardClick(coaching, i)}
											size='medium'
											key={i}
											title={titleCase(coaching.title)}
											subtitle={`${capitalize(t(coaching.sport))} ${t('with')} ${titleCase(coaching.coachUserName)}`}
											imgUri={coaching.pictureUri}
											hasCheckSign={selectedCoachingIndexes.includes(i)}
										/>
									))
								}
							</div>
						</div>
					</Dialog>
						
				}
				<style jsx='true'>
					{`
						.top-row {
							justify-content: space-between;
							padding-left: 60px;
							padding-right: 10px;
						}
						.info-row {
							width: 100%;
							display: flex;
							justify-content: center;
							align-items: flex-start;
						}
						.info-column {
							width: 50%;
							display: flex;
							flex-direction: column;
							justify-content: center;
							align-items: flex-start;
						}
						.video-container {
							position: relative;
							background-color: #000000;
						}
						.upload-row {
							justify-content: space-between;
							align-items: center;
							margin-top: 10px;
						}
						input[type="file"] {
							display: none;
						}
						.custom-empty-file-upload {
							display: inline-block;
							cursor: pointer;
							width: 454px;
							height: 50px;
							background-color: #FFFFFF;
							border: 2px solid #0075FF;
							display: flex;
							justify-content: center;
							align-items: center;
							color: #0075FF;
						}
						.custom-file-upload {
							display: inline-block;
							cursor: pointer;
							font-family: Raleway-Bold;
							font-style: normal;
							font-weight: bold !important;
							font-size: 20px;
						}
						.file-name {
							max-width: 300px;
							overflow: hidden;
							text-overflow: ellipsis;
						}
						.edit-button {
							position: absolute;
							padding: 0 10px;
							height: 25px;
							top: 0;
							right: 0;
							background-color: #FFFFFF;
						}
					`}
				</style>
			</div>
		)
	}
}

const mapStateToProps = (state) => ({
	user: state.auth.user
})

const mapDispatchToProps = (dispatch) => ({
	fetchTrainerCoachings: (id, isMe) => dispatch(fetchTrainerCoachings(id, isMe))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(VideoSelector))
