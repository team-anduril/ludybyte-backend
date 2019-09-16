///
/// NodeJS without ExpressJS framework
///
const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');

const port = 3000;
const hostname = "localhost";
const usersPath = "./users.json";
const APP_SECRET = "Not you business, no?";
let users = [];
let loggedInUser;

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

const server = http.createServer((req, res) => 
{
	let urlParts = url.parse(req.url, true);
	let urlPathname = urlParts.pathname;
	let urlQueryObj = urlParts.query;
	switch(urlPathname)
	{
		case "/": login(res, urlQueryObj); return;
		case "/login": login(res, urlQueryObj); return;
		case "/signup": signup(res, urlQueryObj); return;
		default: res.end(JSON.stringify({code: 498, message: "Invalid operation"}));
	}
});


server.listen(port, () => 
{
	console.log(`Server running at http://${hostname}:${port}/`)
})