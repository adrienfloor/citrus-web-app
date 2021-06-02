import axios from 'axios'

const { REACT_APP_API_URL } = process.env

export const fetchAllCashouts = async (receipt) => {

	try {
		const response = await axios.get(`${REACT_APP_API_URL}/payments/cash_outs`)
		return response.data
	} catch (err) {
		console.log(err)
		return err
	}
}

export const updateCashOut = async (cashout) => {
	// HEADERS
	const config = {
		headers: {
			"Content-type": "application/json"
		}
	}

	// BODY
	const body = JSON.stringify({ cashout })

	try {
		const response = await axios.put(`${REACT_APP_API_URL}/payments/cash_out`, body, config)
		return response.data
	} catch (err) {
		console.log(err)
		return err
	}
}