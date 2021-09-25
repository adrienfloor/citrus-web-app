import axios from 'axios'

const { REACT_APP_API_URL } = process.env

export const fetchMonthTransfer = async () => {
	try {
		const response = await axios.get(`${REACT_APP_API_URL}/store_transfers`)
		return response.data
	} catch (err) {
		console.log(err)
		return err
	}
}

export const createTransfer = async (android, ios) => {
	// HEADERS
	const config = {
		headers: {
			"Content-type": "application/json"
		}
	}

	// BODY
	const body = JSON.stringify({
		month: new Date(),
		android,
		ios
	})

	try {
		const response = await axios.post(`${REACT_APP_API_URL}/store_transfers`, body, config)
		return response.data
	} catch (err) {
		console.log(err)
		return err
	}
}

export const updateTransfer = async (month, android, ios) => {
	// HEADERS
	const config = {
		headers: {
			"Content-type": "application/json"
		}
	}

	// BODY
	const body = JSON.stringify({
		month,
		android,
		ios
	})

	try {
		const response = await axios.put(`${REACT_APP_API_URL}/store_transfers`, body, config)
		return response.data
	} catch (err) {
		console.log(err)
		return err
	}
}