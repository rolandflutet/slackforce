var nforce = require('nforce'),

    CLIENT_ID = process.env.CLIENT_ID,
    CLIENT_SECRET = process.env.CLIENT_SECRET,
    USER_NAME = process.env.USER_NAME,
    PASSWORD = process.env.PASSWORD;

    org = nforce.createConnection({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      redirectUri: 'http://localhost:3000/oauth/_callback',
//      environment: 'production',
	  environment: 'sandbox',
      mode: 'single'
    });

function login() {
    org.authenticate({ username: USER_NAME, password: PASSWORD}, function(err, resp) {
        if (err) {
            console.error("Authentication error");
            console.error(err);
        } else {
            console.log("Authentication successful");
        }
    });
}

exports.login = login;
exports.org = org;
