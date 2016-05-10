var nforce = require('nforce'),
    org = require('./auth').org,

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
    console.error("TEST1");
    org.refreshToken();
    console.error("TEST2");
    
    var params = req.body.text.split(":");
    var subject = params[0];
    var description = params[1];

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
