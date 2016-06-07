var nforce = require('nforce'),
    org = require('./auth').org,
    express2 = require('express'),
    app2 = express2();


    CASE_TOKEN = process.env.CASE_TOKEN;
    CURR_ENVT = process.env.CURR_ENVT;
    SLACK_SECURITY_TOKEN = process.env.SLACK_SECURITY_TOKEN;
    SFDC_URL= 'https://test.salesforce.com/';

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
    
            // BELOW IS MY DEBUG CODE
            // console.log("--------------req-----------");
            // console.log(req);    



// HERE I'M GOING TO TRY AND GET MORE USER INFO FROM SLACK
/*
app2.post('/', function (req2, res2) {
  res2.send('POST https://slack.com/api/users.info
                Content-type: application/json
                {
                    "token": "xoxp-2914796973-3709085066-48862191478-3328a54d30",
                	"user": req.body.user_id;
                }');
});


 userdetails=app2.get("https://slack.com/api/users.info?token=xoxp-2914796973-3709085066-48862191478-3328a54d30&user="+req.body.user_id);

app2.get('', function (req2, userdetails){
    userdetails.send("https://slack.com/api/users.info?token=xoxp-2914796973-3709085066-48862191478-3328a54d30&user="+req.body.user_id);
});
*/



var Slack = require('slack-node');

 
slack = new Slack(SLACK_SECURITY_TOKEN);
 
slack.api("users.info", {"token": SLACK_SECURITY_TOKEN,"user":req.body.user_id }, function(err, response) {
  console.log(response);
});
 
slack.api('chat.postMessage', {
  text:'hello from nodejs',
  channel:'#general'
}, function(err, response){
  console.log(response);
});



// HERE I'M GOING TO TRY AND CHANGE THE CONTENT OF THE CASE
// SUBJECT = "Slack case from username"
// DESCRIPTION = "the whole text typed by the user"
    var subject = "Slack case from "+req.body.user_name;
    var description = req.body.text;


    var c = nforce.createSObject('Case');
    c.set('subject', subject);
    c.set('description', description);
    c.set('origin', 'Slack');
    c.set('status', 'New');
    c.set('SuppliedEmail', 'roland_flutet@acl.com');  

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
