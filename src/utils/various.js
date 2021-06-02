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