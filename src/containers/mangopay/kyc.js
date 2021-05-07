import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import Loader from 'react-loader-spinner'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'
import FileBase64 from 'react-file-base64'
import { Link } from 'react-router-dom'
import CloseIcon from '@material-ui/icons/Close'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'

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

		fetchMpUserInfo(this.props.user.mangoPayLegalUserId)
		.then(res => {
			mpUserInfo = res
			fetchKycsOfAUser(this.props.user.mangoPayLegalUserId)
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
		const { mangoPayLegalUserId } = user

		if(!file) {
			this.setState({
				warningMessage: capitalize(t('pleaseSelectAFile'))
			})
			return
		}

		this.setState({ isLoading: true })

		const { KYCDocumentId } = await createMpKycDocument(mangoPayLegalUserId, typeOfDocument)
		const kycPage = await createMpKycPage(mangoPayLegalUserId, KYCDocumentId, file)
		if(kycPage == 204) {
			submitMpKycDocument(mangoPayLegalUserId, KYCDocumentId)
			.then(res => {
				if(res.Status == 'VALIDATION_ASKED') {
					fetchKycsOfAUser(this.props.user.mangoPayLegalUserId)
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
						type="Grid"
						color="#0075FF"
						height={100}
						width={100}
					/>
					<div className='big-separator'></div>
				</div>
			)
		}

		return (
			<div
				className='full-container flex-column kyc'
				style={{ alignItems: 'center' }}
			>
				<div
					style={{
						width: '100%',
						height: '50px',
						display: 'flex',
						justifyContent: 'flex-start',
						alignItems: 'center'
					}}
				>
					<KeyboardBackspaceIcon
						className='action-icon'
						fontSize='large'
						onClick={onClose}
					/>
				</div>
				<div className='billing-card flex-column padded'>
					<div className='medium-title'>KYC Regulations</div>
					<span className='small-text'>In order to withdraw your earnings, and according to the law in place, we need to verify your identity.</span>
					<div className='small-separator'></div>
					<span className='small-text'>If you recently submitted documents, please note that this verification is manual and can take a few days</span>
					<div className='small-separator'></div>
					<span className='small-text'>Please upload an identification. Find more info
						<a className='simple-link' target='_blank' href='https://docs.mangopay.com/guide/kyc-further-information'> here.</a>
					</span>

					{/*  IDENTITY PROOF */}
					<div className='medium-separator'></div>
					<span className='small-title'>{capitalize(t('identityProof'))} : </span>
					{
						this.isKycValidationInProgress('IDENTITY_PROOF') ?
						<div>
							<div className='small-separator'></div>
							<span className='small-text'>{capitalize(t('yourIdValidationIsInProgress'))}</span>
						</div> :
						<div
							className='row flex-row'
							style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}
						>
							<label className="custom-file-upload">
								<FileBase64
									multiple={false}
									onDone={file => this.getFiles(file, 'identityProof')}
								/>
								<span className='small-text'>
									{
										identityProofFileName ?
											'Change file' :
											'Upload'
									}
								</span>
							</label>
							{
								identityProofFileName &&
								<span className='small-text file-name'>{identityProofFileName}</span>
							}
							<div className='small-separator'></div>
							{
								identityProof &&
								<button
									className='small-action-button'
									onClick={() => this.handleSubmit('IDENTITY_PROOF', identityProof)}
								>
									{capitalize(t('submit'))}
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
									<div
										className='row flex-row'
										style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}
									>
										<label className="custom-file-upload">
											<FileBase64
												multiple={false}
												onDone={file => this.getFiles(file, 'articlesOfAssociation')}
											/>
											<span className='small-text'>
												{
													articlesOfAssociationFileName ?
														'Change file' :
														'Upload'
												}
											</span>
										</label>
										{
											articlesOfAssociationFileName &&
											<span className='small-text file-name'>{articlesOfAssociationFileName}</span>
										}
										<div className='small-separator'></div>
										{
											articlesOfAssociation &&
											<button
												className='small-action-button'
												onClick={() => this.handleSubmit('ARTICLES_OF_ASSOCIATION', articlesOfAssociation)}
											>
												{capitalize(t('submit'))}
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
							<div
								className='row flex-row'
								style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}
							>
								<label className="custom-file-upload">
									<FileBase64
										multiple={false}
										onDone={file => this.getFiles(file, 'registrationProof')}
									/>
									<span className='small-text'>
										{
											registrationProofFileName ?
												'Change file' :
												'Upload'
										}
									</span>
								</label>
								{
									registrationProofFileName &&
									<span className='small-text file-name'>{registrationProofFileName}</span>
								}
								<div className='small-separator'></div>
								{
									registrationProof &&
									<button
										className='small-action-button'
										onClick={() => this.handleSubmit('REGISTRATION_PROOF', registrationProof)}
									>
										{capitalize(t('submit'))}
									</button>
								}
							</div>
					}


					<div className='small-separator'></div>
					<span className='small-text red'>{warningMessage}</span>
				</div>
				<style jsx='true'>
					{`
						.row {
							width: 100%;
						}
						.padded {
							padding: 0 10px;
						}
						input[type="file"] {
							display: none;
						}
						.custom-file-upload {
							border: 1px solid lightGrey;
							display: inline-block;
							padding: 6px 12px;
							border-radius: 2px;
							cursor: pointer;
							text-align: center;
						}
						.file-name {
							max-width: 300px;
							overflow: hidden;
							text-overflow: ellipsis;
						}
						@media only screen and (max-width: 640px) {
							.kyc {
								width: 96%;
								margin: 0 2%;
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