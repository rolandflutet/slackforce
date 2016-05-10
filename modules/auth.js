var nforce = require('nforce'),

    CLIENT_ID = process.env.CLIENT_ID,
    CLIENT_SECRET = process.env.CLIENT_SECRET,
    USER_NAME = process.env.USER_NAME,
    PASSWORD = process.env.PASSWORD,
    CURR_ENVT = process.env.CURR_ENVT,
    USER_SECURITY_TOKEN = process.env.USER_SECURITY_TOKEN;
    
    if (!CURR_ENVT) {
    	CURR_ENVT='sandbox';
    }


    org = nforce.createConnection({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      redirectUri: 'http://localhost:3000/oauth/_callback',
      environment: CURR_ENVT,
      mode: 'single'
    });

function login() {
    
    org.authenticate({ username: USER_NAME, password: PASSWORD, securityToken: USER_SECURITY_TOKEN}, function(err, resp) {
        console.error("--------------err-----------");
        console.error(err);
        console.error("--------------resp-----------");
        console.error(resp);
        if (err) {
            console.error("Authentication error");
            console.error(err);
        } else {
            console.log("Authentication successful");
        }
    });
    
    console.error("--------------Org-----------");
    console.error(org);
}

exports.login = login;
exports.org = org;
