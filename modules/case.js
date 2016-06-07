var nforce = require('nforce'),
    org = require('./auth').org,
    express2 = require('express'),
    app2 = express2();

    CASE_TOKEN = process.env.CASE_TOKEN;
    CURR_ENVT = process.env.CURR_ENVT;
    SFDC_URL= 'https://test.salesforce.com/'

    if (CURR_ENVT=='production') {
    	SFDC_URL='https://login.salesforce.com/';
    }
    
    

function execute(req, res) {

    if (req.body.token != CASE_TOKEN) {
        res.send("Invalid token");
        return;
    }
    
    var params = req.body.text.split(":");
    var subject = params[0];
    var description = params[1];
    
 

// HERE I'M GOINMG TO TRY AND GET MORE INFO ABOUT THE USER
// I'm assuming I need a new app to carry the request but maybe not? Hum I'm not sure. It might mess things up.
// Ok I'll try and use the same app and we'll see!
/*
response_url = req.body.response_url;
APIurl = 'https://slack.com/api/users.info';
userID = req.body.user_id;

app2.post(APIurl, function (req2, res2) {
  res2.send('POST xoxp-2914796973-3709085066-48862191478-3328a54d30, userID');
});

    // BELOW IS MY DEBUG CODE
    // console.log("--------------res2-----------");
    // console.log(res2);   
    UserEmail = res2.user.profile.email;
    
*/

// HERE I'M GOING TO TRY AND CHANGE THE CONTENT OF THE CASE
// SUBJECT = "Slack case from username"
// DESCRIPTION = "the whole text typed by the user"
    var subject = "Slack case from "+req.body.user_name+"("+UserEmail+")";
    var description = req.body.text;


    var c = nforce.createSObject('Case');
    c.set('subject', subject);
    c.set('description', description);
    c.set('origin', 'Slack');
    c.set('status', 'New');

    org.insert({ sobject: c}, function(err, resp) {
        if (err) {
            console.error(err);
            res.send("An error occurred while creating a case");
        } else {
            var fields = [];
            fields.push({title: "Subject", value: subject, short:false});
            fields.push({title: "Description", value: description, short:false});
            fields.push({title: "Link", value: SFDC_URL + resp.id, short:false});
            var message = {
                response_type: "in_channel",
                text: "A new case has been created:",
                attachments: [
                    {color: "#009cdb", fields: fields}
                ]
            };
            res.json(message);
        }
    });
}

exports.execute = execute;
