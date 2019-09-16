##This to the NodeJS API (without frameworks) for anduril web app

Only login and signup operations are allowed at the moment.
Requests for login and signup, respectively are expected to be in the form: 

#fetch("localhost:3000/login?email=ab@cd.com&password=123abc")

AND

#fetch("localhost:3000/signup?name=Johnson&email=ab@cd.com&password=123abc")

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


Where NUMBER could be aby of the following:

    400 - Querystring data needed for signup/login not supplied

    496 - Email used for login does not exist in databse

    419 - Wrong password used for login

    427 - Email used for signup already is signed up 




				© 2019, THE ANDURIL TEAM


