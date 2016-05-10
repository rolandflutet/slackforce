var nforce = require('nforce'),
    sleep = require('sleep'),

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
        if (err) {
            console.error("Authentication error");
            console.error(err);
        } else {
            console.log("Authentication successful");
            // BELOW IS MY DEBUG CODE
            console.log("--------------resp-----------");
            console.log(resp);
            sleep.sleep(5); //sleep for 1 sec
            console.log("--------------oauth token BEFORE-----------");
            console.log(org.oauth);
            sleep.sleep(5); //sleep for 1 sec
            org.oauth = resp;
            sleep.sleep(1); //sleep for 1 sec
            console.log("--------------oauth token AFTER-----------");
            console.log(org.oauth);
        }
    });
    
    console.error("--------------Org-----------");
    console.error(org);
}

exports.login = login;
exports.org = org;
