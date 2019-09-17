///
/// NodeJS API without frameworks or external dependencies for anduril web app
/// Requests for login and signup, respectively are expected to be in the form: 
/// 	fetch("localhost:3000/login?email=ab@cd.com&password=123abc")   AND
///		fetch("localhost:3000/signup?name=Johnson&email=ab@cd.com&password=123abc")
///
const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');	// For parsing the query string part of the url. 
									// That is where login/signup data will come from


const  hostname = "localhost/";
const port = process.env.PORT || 3000; // 3000 for localhost process.env.PORT for heroku hosting
const usersPath = "./users.json";
const APP_SECRET = "Not you business, no?"; // Used as part of the hash generation: Security measure

let users = [];				// Booted from users.json file at start
let loggedInUser;

// For hashing of password before saving to file: Security measure. 
// Also for generating login token for Authorization header
//
const performHashing  = str =>
{
  var hash = 0, i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) 
  {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
};

/// Boot database file into the `users` variable at start
///
fs.readFile(usersPath, (err, content) =>
{
    if (err)
    {
        console.log(err);
    }
    else 
    {
        users = JSON.parse(content);
    }
});

// Handle login, providing for issues like emails that have not 
// been signed up and incorrect passwords. Receives email and password
const login = (res, urlQueryObj) => 
{
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Access-Control-Allow-Origin', '*');

	if (!urlQueryObj || !urlQueryObj.email || !urlQueryObj.password)
	{
		res.statusCode = 400;
		res.end(JSON.stringify({code: 400}));
		return;
	}

	if (!users.some(a => a.email === urlQueryObj.email))
	{
		res.end(JSON.stringify({code: 496}));
		return;
	}
	let tempUser = users.find(a => a.email === urlQueryObj.email)
	if (tempUser && performHashing(urlQueryObj.password) !== tempUser.password)
	{
		res.end(JSON.stringify({code: 419}));
		return;
	}

	loggedInUser = users.find(a => a.token)
	res.statusCode = 200;
	res.end(JSON.stringify(users.find(a => a.email === urlQueryObj.email)));
}

// Handle signup, providing for issues like already used emails
// Receives email, name and password
const signup = (res, urlQueryObj) => 
{
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Access-Control-Allow-Origin', '*');

	if (!urlQueryObj || !urlQueryObj.name || !urlQueryObj.email || !urlQueryObj.password)
	{
		res.statusCode = 400;
		res.end(JSON.stringify({code: 400}));
		return;
	}

	if (users.some(a => a.email === urlQueryObj.email))
	{
		res.end(JSON.stringify({code: 427}));
		return;
	}

	users.push({
		name: urlQueryObj.name, 
		email: urlQueryObj.email, 
		password: performHashing(urlQueryObj.password),
		token: performHashing(urlQueryObj.email + APP_SECRET + urlQueryObj.password),
	});
	saveFile(users);
	res.statusCode = 200;
	res.end(JSON.stringify(users.find(a => a.email === urlQueryObj.email)));
}

// For saving users variable to json file after succesful signup
const saveFile = user =>
{
	fs.writeFile(usersPath, JSON.stringify(users), err => 
	{
    	if (err) 
    	{
			console.log(err);
			return false;
		}
		return true;
	});
}

// Creates server instance with basic routing
// for accepted paths
const server = http.createServer((req, res) => 
{
	let urlParts = url.parse(req.url, true);
	let urlPathname = urlParts.pathname;
	let urlQueryObj = urlParts.query;

	if (urlPathname === "/" && (!urlQueryObj.email || !urlQueryObj.password))
	{
		res.setHeader('Content-Type', 'text/html');
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.statusCode = 200;
		res.end(`
			<div style="text-align: center; font-family: 'segoe UI', sans-serif; background: lightgray; min-height: 100vh">
				<h1>Hello!</h1>
				<h3>Welcome to the NodeJS API (without frameworks or external dependencies) for anduril web app </h3>
				<br />
				<p style="display: block; font-size: 18px; margin: auto; width: 60vw; text-align: left;">  
					Only login and signup operations are allowed at the moment. <br /><br />
					To get started run 'node express.js' or 'npm start' in project directory <br /><br />
					Requests for login and signup, respectively are expected to be in the form: <br /><br /><br />
					<code>fetch("localhost:3000/login?email=ab@cd.com&password=123abc")</code>   <br /><br /> 
					AND <br /><br />
					<code>fetch("localhost:3000/signup?name=Johnson&email=ab@cd.com&password=123abc")</code>
					<br /><br /><br />All responses will be in JSON format<br />
					Responses for succesful login or signup will be in this format: <br /><br />
					<code>{<br />
							data: <br /> 
							{ <br />
								"name": "Johnson", <br />
								"email": "abc.xyz.com", <br />
								"password": "abc123" <br />
							} <br />
					</code> } <br />
					<br /><br /><br />
					Response after unsuccessful operations will be in this format: <br /><br />
					<code>{<br />
							data: <br /> 
							{ <br />
								"code": NUMBER, <br >
							} <br />
					} <br /></code> <br />
					Where NUMBER could be aby of the following:<br />
					<ul style="text-align: left; margin-left: 300px;"><li>400 - Querystring data needed for signup/login not supplied</li><br />
						<li>496 - Email used for login does not exist in databse </li><br />
						<li>419 - Wrong password used for login </li><br />
						<li>427 - Email used for signup already is signed up </li><br />
					</ul>
				</p>
				<br /><br /><br /><br /><strong>&copy 2019, </strong>THE ANDURIL TEAM<br /><br />
			</div>
			`);
		return;
	}

	switch(urlPathname)
	{
		case "/": login(res, urlQueryObj); return;
		case "/login": login(res, urlQueryObj); return;
		case "/signup": signup(res, urlQueryObj); return;
		default: res.end(JSON.stringify({code: 498, message: "Invalid operation"}));
	}
});

//const PORT = process.env.PORT
server.listen(port, () => 
{
	console.log(`Server running at http://${hostname}:${port}/`)
})
