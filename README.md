# This is the NodeJS API (without frameworks or external dependencies) for anduril web app

Only login and signup operations are allowed at the moment.
## To get started run `node express.js` or `npm start` in project directory

Requests for login and signup, respectively are expected to be in the form: 

fetch("localhost:3000/login?email=ab@cd.com&password=123abc")

AND

fetch("localhost:3000/signup?name=Johnson&email=ab@cd.com&password=123abc")

All responses will be in JSON format

Responses for succesful login or signup will be in this format:

{
	data:
		{
		
			"name": "Johnson",
			"email": "abc.xyz.com",
			"password": "abc123"
		}
}

Response after unsuccessful operations will be in this format:

{
	data:
	
		{
		
			"code": NUMBER,
		}
}


Where NUMBER could be any of the following:

    400 - Querystring data needed for signup/login not supplied

    496 - Email used for login does not exist in database

    419 - Wrong password used for login

    427 - Email used for signup, is already signed up 




				© 2019, THE ANDURIL TEAM


