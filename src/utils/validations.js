import moment from 'moment'

// validate string longer than 5 characters
export const isValidStringLength = (input, length) => {
	if (input.length >= length) {
		return true
	}
	return false
}

// validate email
export const isValidEmailInput = email => {
	//eslint-disable-next-line
	const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
	return regEx.test(String(email).toLowerCase())
}


// validate password
export const isValidPassword = password => {
	let result = []
	const oneNumberRegEx = /\d/
	if (oneNumberRegEx.test(password)) {
		result.push('number')
	}
	const oneUppercaseRegEx = /^(?=.*[A-Z])/
	if (oneUppercaseRegEx.test(password)) {
		result.push('uppercase')
	}
	if (password.length >= 8) {
		result.push('length')
	}
	return result
}

// test if same string

export const isSameString = (string1, string2) => {
	if (string1.toLowerCase() === string2.toLowerCase()) {
		return true
	}
	return false
}

// test if a number is even or odd

export const isEven = (n) => {
	return Number(n) % 2 === 0
}

export const isOdd = (n) => {
	return Math.abs(Number(n) % 2) === 1
}

export const checkDateValue = (str, max) => {
	if (str.charAt(0) !== '0' || str == '00') {
		var num = parseInt(str)
		if (isNaN(num) || num <= 0 || num > max) num = 1
		str = num > parseInt(max.toString().charAt(0)) && num.toString().length == 1 ? '0' + num : num.toString()
	}
	return str
};