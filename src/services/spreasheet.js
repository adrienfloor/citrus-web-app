import axios from 'axios'

const { REACT_APP_API_URL } = process.env

export const generateSpreadsheet = async (startDate, endDate, platform) => {
	// HEADERS
	const config = {
		headers: {
			"Content-type": "application/json"
		}
	}

	// BODY
	const body = JSON.stringify({
		startDate,
		endDate,
		platform
	})

	try {
		const response = await axios.post(`${REACT_APP_API_URL}/transactions/generate_sheet`, body, config)
		return response
	} catch (err) {
		console.log(err)
		return err
	}
}
