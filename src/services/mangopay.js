import axios from 'axios'

const { REACT_APP_API_URL } = process.env

// CREATE MANGOPAY USER

export const createMpUser = async (
	FirstName,
	LastName,
	Birthday,
	Nationality,
	CountryOfResidence,
	Email
) => {
	// HEADERS
	const config = {
		headers: {
			"Content-type": "application/json"
		}
	}
	// BODY
	const body = JSON.stringify({
		FirstName,
		LastName,
		Birthday,
		Nationality,
		CountryOfResidence,
		Email
	})
	try {
		const response = await axios.post(`${REACT_APP_API_URL}/mp/mp_create_user`, body, config)
		return response.data
	} catch (err) {
		console.log(err)
		return err
	}
}

// CREATE MANGOPAY LEGAL USER

export const createMpLegalUser = async (
	LegalPersonType,
	Name,
	LegalRepresentativeFirstName,
	LegalRepresentativeLastName,
	LegalRepresentativeBirthday,
	LegalRepresentativeNationality,
	LegalRepresentativeCountryOfResidence,
	LegalRepresentativeEmail,
	Email,
	HeadquartersAddress,
	CompanyNumber
) => {
	// HEADERS
	const config = {
		headers: {
			"Content-type": "application/json"
		}
	}

	// BODY
	const body = JSON.stringify({
		LegalPersonType,
		Name,
		LegalRepresentativeFirstName,
		LegalRepresentativeLastName,
		LegalRepresentativeBirthday,
		LegalRepresentativeNationality,
		LegalRepresentativeCountryOfResidence,
		LegalRepresentativeEmail,
		Email,
		HeadquartersAddress,
		CompanyNumber
	})
	try {
		const response = await axios.post(`${REACT_APP_API_URL}/mp/mp_create_legal_user`, body, config)
		return response.data
	} catch (err) {
		console.log(err)
		return err
	}
}

// CREATE USER WALLET

export const createMpUserWallet = async (id) => {
	// HEADERS
	const config = {
		headers: {
			"Content-type": "application/json"
		}
	}
	// BODY
	const body = JSON.stringify({
		Owners: [ id ],
		Description: `${id} user wallet`,
		Currency: 'EUR'
	})
	try {
		const response = await axios.post(`${REACT_APP_API_URL}/mp/mp_create_wallet`, body, config)
		return response.data
	} catch (err) {
		console.log(err)
		return err
	}
}

// CREATE USER CARD REGISTRATION

export const createMpUserCardRegistration = async (UserId, CardType) => {
	// HEADERS
	const config = {
		headers: {
			"Content-type": "application/json"
		}
	}
	// BODY
	const body = JSON.stringify({
		UserId,
		Currency: 'EUR',
		CardType
	})
	try {
		const response = await axios.post(`${REACT_APP_API_URL}/mp/mp_create_card_registration`, body, config)
		return response.data
	} catch (err) {
		console.log(err)
		return err
	}
}

// UPDATE USER CARD REGISTRATION

export const updateMpUserCardRegistration = async (RegistrationData, cardRegistrationId) => {
	// HEADERS
	const config = {
		headers: {
			"Content-type": "application/json"
		}
	}
	// BODY
	const body = JSON.stringify({
		RegistrationData,
		cardRegistrationId
	})
	try {
		const response = await axios.put(`${REACT_APP_API_URL}/mp/mp_update_card_registration`, body, config)
		return response.data
	} catch (err) {
		console.log(err)
		return err
	}
}

// CREATE CARD DIRECT PAYIN

export const createMpCardDirectPayin = async (
	AuthorId,
	CreditedUserId,
	CreditedWalletId,
	DebitedFunds,
	Fees,
	SecureModeReturnURL,
	CardId,
	email,
	paymentPlan
) => {
	// HEADERS
	const config = {
		headers: {
			"Content-type": "application/json"
		}
	}
	// BODY
	const body = JSON.stringify({
		AuthorId,
		CreditedUserId,
		CreditedWalletId,
		DebitedFunds,
		Fees,
		SecureModeReturnURL,
		CardId,
		email,
		paymentPlan
	})
	try {
		const response = await axios.post(`${REACT_APP_API_URL}/mp/mp_create_card_direct_payin`, body, config)
		return response.data
	} catch (err) {
		console.log(err)
		return err
	}
}

// CREATE KYC DOCUMENT

export const createMpKycDocument = async (UserId, type) => {
	// HEADERS
	const config = {
		headers: {
			"Content-type": "application/json"
		}
	}

	// BODY
	const body = JSON.stringify({ UserId, type })
	try {
		const response = await axios.post(`${REACT_APP_API_URL}/mp/mp_create_kyc_document`, body, config)
		return response.data
	} catch (err) {
		console.log(err)
		return err
	}
}

// CREATE KYC PAGE

export const createMpKycPage = async (UserId, KYCDocumentId, File) => {
	// HEADERS
	const config = {
		headers: {
			"Content-type": "application/json"
		}
	}

	// BODY
	const body = JSON.stringify({
		UserId,
		KYCDocumentId,
		File
	})
	try {
		const response = await axios.post(`${REACT_APP_API_URL}/mp/mp_create_kyc_page`, body, config)
		return response.status
	} catch (err) {
		console.log(err)
		return err
	}
}

// SUBMIT KYC DOCUMENT

export const submitMpKycDocument = async (UserId, KYCDocumentId) => {
	// HEADERS
	const config = {
		headers: {
			"Content-type": "application/json"
		}
	}

	// BODY
	const body = JSON.stringify({
		UserId,
		KYCDocumentId
	})
	try {
		const response = await axios.put(`${REACT_APP_API_URL}/mp/mp_submit_kyc_document`, body, config)
		return response.data
	} catch (err) {
		console.log(err)
		return err
	}
}


// LIST KYCS OF A USER

export const fetchKycsOfAUser = async (UserId) => {
	// HEADERS
	const config = {
		headers: {
			"Content-type": "application/json"
		}
	}

	try {
		const response = await axios.get(`${REACT_APP_API_URL}/mp/mp_list_user_kyc_documents?user_id=${UserId}`, {}, config)
		return response.data
	} catch (err) {
		console.log(err)
		return err
	}
}

// CREATE A BANK ACCOUNT

export const createMpBankAccount = async (
		UserId,
		OwnerName,
		OwnerAddress,
		Iban
	) => {
	// HEADERS
	const config = {
		headers: {
			"Content-type": "application/json"
		}
	}

	// BODY
	const body = JSON.stringify({
		UserId,
		OwnerName,
		OwnerAddress,
		Iban
	})
	try {
		const response = await axios.post(`${REACT_APP_API_URL}/mp/mp_create_iban_bank_account`, body, config)
		return response.data
	} catch (err) {
		console.log(err)
		return err
	}
}

// GET A MANGOPAY USER INFO

export const fetchMpUserInfo = async (UserId) => {
	try {
		const response = await axios.get(`${REACT_APP_API_URL}/mp/mp_fetch_user_info?UserId=${UserId}`)
		return response.data
	} catch (err) {
		console.log(err)
		return err
	}
}

// GET A MANGOPAY USER'S BANK ACCOUNT ID

export const fetchMpBankAccountId = async (UserId) => {
	try {
		const response = await axios.get(`${REACT_APP_API_URL}/mp/mp_fetch_user_bank_account_id?UserId=${UserId}`)
		return response.data
	} catch (err) {
		console.log(err)
		return err
	}
}

// GET A MANGOPAY USER'S BANK ACCOUNT

export const fetchMpBankAccount = async (UserId) => {
	try {
		const response = await axios.get(`${REACT_APP_API_URL}/mp/mp_fetch_user_bank_account?UserId=${UserId}`)
		return response.data
	} catch (err) {
		console.log(err)
		return err
	}
}

// GET A MANGOPAY USER'S WALLET ID

export const fetchMpWalletInfo = async (UserId) => {
	try {
		const response = await axios.get(`${REACT_APP_API_URL}/mp/mp_fetch_user_w_info?UserId=${UserId}`)
		return response.data
	} catch (err) {
		console.log(err)
		return err
	}
}

// GET A MANGOPAY USER'S CARD

export const fetchMpCardInfo = async (UserId) => {
	try {
		const response = await axios.get(`${REACT_APP_API_URL}/mp/mp_fetch_user_card_info?UserId=${UserId}`)
		return response.data
	} catch (err) {
		console.log(err)
		return err
	}
}

// CREATE A PAYOUT

export const createMpPayout = async (UserId, BankAccountId, amountToWithdraw) => {
	// HEADERS
	const config = {
		headers: {
			"Content-type": "application/json"
		}
	}

	// BODY
	const body = JSON.stringify({ UserId, BankAccountId, amountToWithdraw })
	try {
		const response = await axios.post(`${REACT_APP_API_URL}/mp/mp_create_payout`, body, config)
		return response.data
	} catch (err) {
		console.log(err)
		return err
	}
}



