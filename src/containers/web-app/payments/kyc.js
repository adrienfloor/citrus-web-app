import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import Loader from 'react-loader-spinner'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'
import FileBase64 from 'react-file-base64'
import { Link } from 'react-router-dom'

import '../../../styling/headings.css'
import '../../../styling/colors.css'
import '../../../styling/buttons.css'
import '../../../styling/spacings.css'
import '../../../styling/App.css'

import { ReactComponent as CaretBack } from '../../../assets/svg/caret-left.svg'
import { ReactComponent as Close } from '../../../assets/svg/close.svg'

import {
	capitalize
} from '../../../utils/various'
import {
	createMpKycDocument,
	createMpKycPage,
	submitMpKycDocument,
	fetchKycsOfAUser,
	fetchMpUserInfo
} from '../../../services/mangopay'

import { setNotification } from '../../../actions/notifications-actions'

let mpUserKycs

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

		fetchKycsOfAUser(this.props.user.MPLegalUserId)
			.then(res => {
				mpUserKycs = res
				this.setState({ isLoading: false })
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
			if (status === 'CREATED' || status === 'VALIDATION_ASKED' || status === 'VALIDATED') {
				return true
			}
		}

		if (mpUserKycs) {
			const kyc = mpUserKycs.find(
				el => el.Type === type && checkKycStatus(el.Status)
			)
			if (kyc && kyc.Type) {
				return true
			}
			return false
		}
	}

	async handleSubmit(typeOfDocument, file) {
		const { user, t, setNotification } = this.props
		const { MPLegalUserId } = user

		if (!file) {
			this.setState({
				warningMessage: capitalize(t('pleaseSelectAFile'))
			})
			return
		}

		this.setState({ isLoading: true })

		const { KYCDocumentId } = await createMpKycDocument(MPLegalUserId, typeOfDocument)
		const kycPage = await createMpKycPage(MPLegalUserId, KYCDocumentId, file)
		if (kycPage == 204) {
			submitMpKycDocument(MPLegalUserId, KYCDocumentId)
				.then(res => {
					if (res.Status == 'VALIDATION_ASKED') {
						fetchKycsOfAUser(MPLegalUserId)
							.then(res => {
								mpUserKycs = res
								this.setState({ isLoading: false })
								setNotification({ message: capitalize(t('updatedSuccessfully')) })
							})
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

		const {
			t,
			onClose,
			mpLegalUserInfo
		} = this.props

		if (isLoading) {
			return (
				<div className='flex-column flex-center'>
					<Loader
						type='Oval'
						color='#C2C2C2'
						height={100}
						width={100}
					/>
				</div>
			)
		}

		return (
			<div className='flex-column'>
				<div className='flex-column'>
					{/*  IDENTITY PROOF */}
					<div className='small-separator'></div>
					<span className='small-text-bold'>{capitalize(t('identityProof'))}</span>
					{
						this.isKycValidationInProgress('IDENTITY_PROOF') ?
							<div>
								<div className='small-separator'></div>
								<span className='smaller-text citrusGrey'>{capitalize(t('yourIdValidationIsInProgress'))}</span>
							</div> :
							<div className='row flex-row upload-row'>
								{
									!identityProof &&
									<label className="custom-empty-file-upload">
										<FileBase64
											multiple={false}
											onDone={file => this.getFiles(file, 'identityProof')}
										/>
										<span className='small-text-bold citrusBlue'>{t('upload')}</span>
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
											<span className='small-text-bold citrusBlue'>{t('change')}</span>
										</label>
									</>
								}
								{
									identityProof &&
									<button
										className='filled-button'
										style={{ width: '130px', height: '40px' }}
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
					<div className='small-separator'></div>
					{
						mpLegalUserInfo && mpLegalUserInfo.LegalPersonType !== 'SOLETRADER' &&
						<div style={{ width: '100%' }}>
							<span className='small-text-bold'>{capitalize(t('articlesOfAssociation'))} : </span>
							{
								this.isKycValidationInProgress('ARTICLES_OF_ASSOCIATION') ?
									<div>
										<div className='small-separator'></div>
										<div>{this.isKycValidationInProgress('ARTICLES_OF_ASSOCIATION')}</div>
										<span className='smaller-text citrusGrey'>{capitalize(t('yourRegistrationValidationIsInProgress'))}</span>
									</div> :
									<div className='row flex-row upload-row'>
										{
											!articlesOfAssociation &&
											<label className="custom-empty-file-upload">
												<FileBase64
													multiple={false}
													onDone={file => this.getFiles(file, 'articlesOfAssociation')}
												/>
												<span className='small-text-bold citrusBlue'>{t('upload')}</span>
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
													<span className='small-text-bold citrusBlue'>{t('change')}</span>
												</label>
											</>
										}
										{
											articlesOfAssociation &&
											<button
												className='filled-button'
												style={{ width: '130px', height: '40px' }}
												onClick={() => this.handleSubmit('ARTICLES_OF_ASSOCIATION', articlesOfAssociation)}
											>
												<span className='small-text-bold citrusWhite'>
													{capitalize(t('submit'))}
												</span>
											</button>
										}
									</div>
							}
						</div>
					}

					{/*  REGISTRATION PROOF */}
					<div className='small-separator'></div>
					<span className='small-text-bold'>{capitalize(t('registrationProof'))}</span>
					{
						this.isKycValidationInProgress('REGISTRATION_PROOF') ?
							<div>
								<div className='small-separator'></div>
								<span className='smaller-text citrusGrey'>{capitalize(t('yourRegistrationValidationIsInProgress'))}</span>
							</div> :
							<div className='row flex-row upload-row'>
								{
									!registrationProof &&
									<label className="custom-empty-file-upload">
										<FileBase64
											multiple={false}
											onDone={file => this.getFiles(file, 'registrationProof')}
										/>
										<span className='small-text-bold citrusBlue'>{t('upload')}</span>
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
											<span className='small-text-bold citrusBlue'>{t('change')}</span>
										</label>
									</>
								}
								{
									registrationProof &&
									<button
										className='filled-button'
										style={{ width: '130px', height: '40px' }}
										onClick={() => this.handleSubmit('REGISTRATION_PROOF', registrationProof)}
									>
										<span className='small-title citrusWhite'>
											{capitalize(t('submit'))}
										</span>
									</button>
								}
							</div>
					}
					{
						(!identityProof || !articlesOfAssociation || !registrationProof) &&
						<>
							<div className='small-separator'></div>
							<div className='medium-separator'></div>
							<div
								// className='flex-center'
								style={{ width: '100%' }}
							>
								<div
									className='filled-button'
									onClick={this.handleWithdrawMissingProperties}
								>
									<span className='small-title citrusWhite'>
										{capitalize(t('submitKycDocuments'))}
									</span>
								</div>
							</div>
						</>
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
							// width: 454px;
							// height: 50px;
							background-color: #FFFFFF;
							// border: 2px solid #0075FF;
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
							max-width: 150px;
							overflow: hidden;
							text-overflow: ellipsis;
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