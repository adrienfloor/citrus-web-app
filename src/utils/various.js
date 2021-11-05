export const capitalize = string => {
	if (typeof string !== 'string') return ''
	return string.charAt(0).toUpperCase() + string.slice(1)
}

export const uppercase = string => {
	if (typeof string !== 'string') return ''
	return string.toUpperCase()
}

export const titleCase = string => {
	if (typeof string !== 'string') return ''
	return string
		.toLowerCase()
		.split(' ')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ')
}

export const returnCurrency = locale => {
	switch (locale) {
		case 'fr':
		case 'nl':
		case 'es':
		case 'it':
			return '€'
			break;
		case 'en-US':
			return '$'
			break;
		case 'en':
			return '£'
			break;
		default:
			return '€'
	}
}

export const returnCurrencyCode = locale => {
	switch (locale) {
		case 'fr':
		case 'nl':
		case 'es':
		case 'it':
			return 'EUR'
			break;
		case 'en-US':
			return 'USD'
			break;
		case 'en':
			return 'GBP'
			break;
		default:
			return 'EUR'
	}
}

export const returnTheHighestOccurrence = arrayOfStrings => {
	if (arrayOfStrings.length == 0)
		return null
	const modeMap = {}
	let maxEl = arrayOfStrings[0], maxCount = 1
	for (let i = 0; i < arrayOfStrings.length; i++) {
		let el = arrayOfStrings[i]
		if (modeMap[el] == null)
			modeMap[el] = 1
		else
			modeMap[el]++
		if (modeMap[el] > maxCount) {
			maxEl = el
			maxCount = modeMap[el]
		}
	}
	return maxEl
}

export const returnUserStatus = numberOfActivities => {
	let status = ''
	let reachGoldStatusIn = null
	let reachPlatinumStatusIn = null
	switch (numberOfActivities) {
		case 0 < numberOfActivities <= 25:
			status = 'silver'
			reachGoldStatusIn = 50 - numberOfActivities
			reachPlatinumStatusIn = 100 - numberOfActivities
			break;
		case 50 < numberOfActivities <= 100:
			status = 'gold'
			reachGoldStatusIn = null
			reachPlatinumStatusIn = 100 - numberOfActivities
			break;
		case 100 < numberOfActivities <= 200:
			status = 'platinum'
			reachGoldStatusIn = null
			reachPlatinumStatusIn = null
			break;
		default:
			status = 'silver'
			reachGoldStatusIn = 50 - numberOfActivities
			reachPlatinumStatusIn = 100 - numberOfActivities
			break;
	}
	return {
		status,
		reachGoldStatusIn,
		reachPlatinumStatusIn
	}
}


export const returnUserStatusProgressBarColor = numberOfActivities => {
	switch (numberOfActivities) {
		case 0 < numberOfActivities <= 25:
			return '#B4B4B4'
			break;
		case 50 < numberOfActivities <= 100:
			return 'FFD700'
			break;
		case 100 < numberOfActivities <= 200:
			return 'B8B7B2'
			break;
		default:
			return '#B4B4B4'
			break;
	}
}

export const returnUserStatusProgressBar = numberOfActivities => {
	let result = 0
	switch (numberOfActivities) {
		case 0 < numberOfActivities <= 25:
			result = 25
			break;
		case 50 < numberOfActivities <= 100:
			result = 100
			break;
		case 100 < numberOfActivities <= 200:
			result = 200
			break;
		default:
			result = 25
			break;
	}
	return result
}

export const countryCodeToLanguage = countryCode => {
	if (typeof countryCode !== 'string') return ''
	switch (countryCode) {
		case 'en':
		case 'EN':
			return 'english'
			break;
		case 'fr':
		case 'FR':
			return 'french'
			break;
		default:
			return 'english'
	}
}

export const returnNextBillingDate = (userBillingDate, locale) => {
	const currentDay = new Date().getDay()
	const currentMonth = new Date().getMonth()
	const currentYear = new Date().getFullYear()
	let month = null
	let date = null

	if(userBillingDate>currentDay) {
		month = currentMonth + 1
	} else {
		month = currentMonth + 2
	}

	if(locale == 'fr') {
		date = `${userBillingDate}/${month}/${currentYear}`
	} else {
		date = `${month}/${userBillingDate}/${currentYear}`
	}
	return date
}

export const returnTotalLengthOfActivities = userReplays => {
	let duration = 0
	if(!userReplays || userReplays.length === 0) {
		return duration
	}
	for(let i = 0; i < userReplays.length ; i++) {
		if(userReplays[i].duration) {
			duration = duration + returnTextDurationToNumber(userReplays[i].duration)
		} else {
			duration = duration + 30
		}
	}
	return duration
}

const returnTextDurationToNumber = string => {
	switch (string) {
		case 'tenMin':
			return 10
			break;
		case 'twentyMin':
			return 20
			break;
		case 'thirtyMin':
			return 30
			break;
		case 'fourtyMin':
			return 40
			break;
		case 'fiftyMin':
			return 50
			break;
		case 'sixtyMin':
			return 60
			break;
		default:
			return 0;
			break;
	}
}