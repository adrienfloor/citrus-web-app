import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import Loader from 'react-loader-spinner'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'
import FileBase64 from 'react-file-base64'
import { Link } from 'react-router-dom'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'

import { ReactComponent as CaretBack } from '../../assets/svg/caret-left.svg'
import { ReactComponent as Close } from '../../assets/svg/close.svg'

import {
	capitalize
} from '../../utils/various'
import {
	createMpKycDocument,
	createMpKycPage,
	submitMpKycDocument,
	fetchKycsOfAUser,
	fetchMpUserInfo
} from '../../services/mangopay'

import { setNotification } from '../../actions/notifications-actions'

let mpUserKycs
let mpUserInfo

class Kyc extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			identityProof: '',
			identityProofFileName: '',
			articlesOfAssociation: '',
			articlesOfAssociationFileName: '',
			registrationProof: '',
			registrationProofFileName: '',
			isLoading: true,
			warningMessage: '',
			success: false
		}

		fetchMpUserInfo(this.props.user.MPLegalUserId)
		.then(res => {
			mpUserInfo = res
			fetchKycsOfAUser(this.props.user.MPLegalUserId)
			.then(res => {
				mpUserKycs = res
				this.setState({ isLoading: false })
			})
		})

		this.handleSubmit = this.handleSubmit.bind(this)
		this.getFiles = this.getFiles.bind(this)
		this.isKycValidationInProgress = this.isKycValidationInProgress.bind(this)
	}

	getFiles(file, fileName) {
		const statePropertyOfFile = `${fileName}FileName`
		this.setState({ [statePropertyOfFile]: file.name })
		const data = file.base64
		const arr = data.split((','))
		arr.shift()
		const cleanedFile = arr.join('')
		this.setState({ [fileName]: cleanedFile })
	}

	isKycValidationInProgress(type) {
		const checkKycStatus = status => {
			if(status === 'CREATED' || status === 'VALIDATION_ASKED' || status === 'VALIDATED') {
				return true
			}
		}
		if(mpUserKycs) {
			const kyc = mpUserKycs.find(
				el => el.Type === type && checkKycStatus(el.Status)
			)
			if(kyc && kyc.Type) {
				return true
			}
			return false
		}
	}

	async handleSubmit(typeOfDocument, file) {
		const { user, t, setNotification } = this.props
		const { MPLegalUserId } = user

		if(!file) {
			this.setState({
				warningMessage: capitalize(t('pleaseSelectAFile'))
			})
			return
		}

		this.setState({ isLoading: true })

		const { KYCDocumentId } = await createMpKycDocument(MPLegalUserId, typeOfDocument)
		const kycPage = await createMpKycPage(MPLegalUserId, KYCDocumentId, file)
		if(kycPage == 204) {
			submitMpKycDocument(MPLegalUserId, KYCDocumentId)
			.then(res => {
				if(res.Status == 'VALIDATION_ASKED') {
					fetchKycsOfAUser(MPLegalUserId)
						.then(res => {
							mpUserKycs = res
							this.setState({ isLoading: false })
							setNotification({ message: capitalize(t('updatedSuccessfully')) })
						})
					// this.setState({
					// 	success: true
					// })
				}
			})
		} else {
			this.setState({
				warningMessage: capitalize(t('somethingWentWrongUploadingYourFile'))
			})
		}
	}

	render() {
		const {
			isLoading,
			warningMessage,
			success,
			identityProof,
			identityProofFileName,
			articlesOfAssociation,
			articlesOfAssociationFileName,
			registrationProof,
			registrationProofFileName
		} = this.state

		const { t, onClose } = this.props

		// if (success) {
		// 	return (
		// 		<div className='full-container flex-column flex-center'>
		// 			<div
		// 				style={{
		// 					width: '100%',
		// 					height: '10%',
		// 					display: 'flex',
		// 					justifyContent: 'flex-end',
		// 					padding: '10px'
		// 				}}
		// 			>
		// 				<CloseIcon
		// 					className='action-icon'
		// 					fontSize='large'
		// 					onClick={onClose}
		// 				/>
		// 			</div>
		// 			<div
		// 				className='big-text'
		// 				style={{
		// 					width: '60%',
		// 					height: '90%',
		// 					marginTop: '100px'
		// 				}}
		// 			>
		// 				{capitalize(t('InformationSubmitedSuccessfully'))}...
		// 			</div>
		// 		</div>
		// 	)
		// }

		if(isLoading) {
			return (
				<div className='full-container flex-column flex-center'>
					<div className='big-separator'></div>
					<Loader
						type='Oval'
						color='#C2C2C2'
						height={100}
						width={100}
					/>
					<div className='big-separator'></div>
				</div>
			)
		}

		return (
			<div className='full-container flex-column kyc'>
				<div
					style={{
						width: '100%',
						height: '50px',
						display: 'flex',
						justifyContent: 'flex-start',
						alignItems: 'center'
					}}
					onClick={onClose}
					className='hover'
				>
					<CaretBack
						width={25}
						height={25}
						stroke={'#C2C2C2'}
						strokeWidth={2}
					/>
					<span className='small-text citrusGrey'>
						{capitalize(t('cashout'))}
					</span>
				</div>
				<span className='maxi-title title'>
					{capitalize(t('verifyYourKyc'))}
				</span>
				<span className='small-text-high'>
					{capitalize(t('inOrderToWithdrawYourEarnings'))}.
				</span>
				<div className='small-separator'></div>
				<span className='small-text-high'>
					{capitalize(t('ifYouRecentlySubmittedDocs'))}.
				</span>
				<div className='small-separator'></div>
				<span className='small-text'>{capitalize(t('pleaseUploadId'))}
					<a className='simple-link' target='_blank' href='https://docs.mangopay.com/guide/kyc-further-information'> {t('here')} .</a>
				</span>
				<div className='flex-column'>
					{/*  IDENTITY PROOF */}
					<div className='medium-separator'></div>
					<span className='small-title'>{capitalize(t('identityProof'))}</span>
					{
						this.isKycValidationInProgress('IDENTITY_PROOF') ?
						<div>
							<div className='small-separator'></div>
							<span className='small-text'>{capitalize(t('yourIdValidationIsInProgress'))}</span>
						</div> :
						<div className='row flex-row upload-row'>
							{
								!identityProof &&
								<label className="custom-empty-file-upload">
									<FileBase64
										multiple={false}
										onDone={file => this.getFiles(file, 'identityProof')}
									/>
									<span className='small-title citrusBlue'>{capitalize(t('upload'))}</span>
								</label>
							}
							{
								identityProofFileName &&
								<>
									<span className='small-text file-name'>{identityProofFileName}</span>
									<label className="custom-file-upload">
										<FileBase64
											multiple={false}
											onDone={file => this.getFiles(file, 'identityProof')}
										/>
										<span className='small-title citrusBlue'>{capitalize(t('change'))}</span>
									</label>
								</>
							}
							{
								identityProof &&
								<button
									className='filled-button'
									style={{ width: 300 }}
									onClick={() => this.handleSubmit('IDENTITY_PROOF', identityProof)}
								>
									<span className='small-title citrusWhite'>
										{capitalize(t('submit'))}
									</span>
								</button>
							}
						</div>
					}

					{/*  ARTICLES OF ASSOCIATION PROOF */}
					<div className='medium-separator'></div>
					{
						mpUserInfo && mpUserInfo.LegalPersonType !== 'SOLETRADER' &&
						<div style={{ width: '100%'}}>
							<span className='small-title'>{capitalize(t('articlesOfAssociation'))} : </span>
							{
								this.isKycValidationInProgress('ARTICLES_OF_ASSOCIATION') ?
								<div>
									<div className='small-separator'></div>
									<div>{this.isKycValidationInProgress('ARTICLES_OF_ASSOCIATION')}</div>
									<span className='small-text'>{capitalize(t('yourRegistrationValidationIsInProgress'))}</span>
								</div> :
								<div className='row flex-row upload-row'>
									{
										!articlesOfAssociation &&
										<label className="custom-empty-file-upload">
											<FileBase64
												multiple={false}
												onDone={file => this.getFiles(file, 'articlesOfAssociation')}
											/>
											<span className='small-title citrusBlue'>{capitalize(t('upload'))}</span>
										</label>
									}
									{
										articlesOfAssociationFileName &&
										<>
											<span className='small-text file-name'>{articlesOfAssociationFileName}</span>
											<label className="custom-file-upload">
												<FileBase64
													multiple={false}
													onDone={file => this.getFiles(file, 'articlesOfAssociation')}
												/>
												<span className='small-title citrusBlue'>{capitalize(t('change'))}</span>
											</label>
										</>
									}
									{
										articlesOfAssociation &&
										<button
											className='filled-button'
											style={{ width: 300 }}
											onClick={() => this.handleSubmit('ARTICLES_OF_ASSOCIATION', articlesOfAssociation)}
										>
											<span className='small-title citrusWhite'>
												{capitalize(t('submit'))}
											</span>
										</button>
									}
								</div>
							}
						</div>
					}

					{/*  REGISTRATION PROOF */}
					<div className='medium-separator'></div>
					<span className='small-title'>{capitalize(t('registrationProof'))} : </span>
					{
						this.isKycValidationInProgress('REGISTRATION_PROOF') ?
						<div>
							<div className='small-separator'></div>
							<span className='small-text'>{capitalize(t('yourRegistrationValidationIsInProgress'))}</span>
						</div> :
						<div className='row flex-row upload-row'>
							{
								!registrationProof &&
								<label className="custom-empty-file-upload">
									<FileBase64
										multiple={false}
										onDone={file => this.getFiles(file, 'registrationProof')}
									/>
									<span className='small-title citrusBlue'>{capitalize(t('upload'))}</span>
								</label>
							}
							{
								registrationProofFileName &&
								<>
									<span className='small-text file-name'>{registrationProofFileName}</span>
									<label className="custom-file-upload">
										<FileBase64
											multiple={false}
											onDone={file => this.getFiles(file, 'registrationProof')}
										/>
										<span className='small-title citrusBlue'>{capitalize(t('change'))}</span>
									</label>
								</>
							}
							{
								registrationProof &&
								<button
									className='filled-button'
									style={{ width: 300 }}
									onClick={() => this.handleSubmit('REGISTRATION_PROOF', registrationProof)}
								>
									<span className='small-title citrusWhite'>
										{capitalize(t('submit'))}
									</span>
								</button>
							}
						</div>
					}

					<div className='small-separator'></div>
					<span className='small-text citrusRed'>{warningMessage}</span>
				</div>
				<style jsx='true'>
					{`
						.row {
							width: 100%;
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
							line-height: 23px;
							color: #0075FF;
						}
						.file-name {
							max-width: 300px;
							overflow: hidden;
							text-overflow: ellipsis;
						}
						@media only screen and (max-width: 640px) {
							.kyc {
								width: 98%;
								margin: 0 1%;
								overflow-y: auto;
								padding-bottom: 100px;
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
	setNotification: notif => dispatch(setNotification(notif))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Kyc))