// This is used to determine if a user is authenticated and
// if they are allowed to visit the page they navigated to.

// If they are: they proceed to the page
// If not: they are redirected to the login page.
import React from 'react'
import { Redirect, Route } from 'react-router-dom'

function PrivateRoute({ auth, path, component }) {
	if (auth) {
		return (
			<Route
				authed={auth}
				path={path}
				component={component}
			/>
		)
	} else {
		return (
			<Redirect to='/' />
		)
	}
}

export default PrivateRoute