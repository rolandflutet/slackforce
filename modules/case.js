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
    
var Slack = require('slack-node');
slack = new Slack(SLACK_SECURITY_TOKEN);
    

function execute(req, res) {
    if (req.body.token != CASE_TOKEN) {
        res.send("Invalid token");
        return;
    }

    //DEBUG
    console.log("--------------res-----------");
    console.log(res);


            // BELOW IS MY DEBUG CODE
            // console.log("--------------req.body-----------");
            // console.log(req.body);  
    
    UserID=req.body.user_id;
    console.log("--------------original UserID-----------"+UserID);

    // HERE I'M GOING TO TRY AND GET MORE USER INFO FROM SLACK

    var params = req.body.text.split(" ");
    var first = params[0];
    
    console.log("--------------first-----------"+first);

    if (first.charAt(0)=='@') {
        // THIS CASE IS BEING CREATED FOR SOMEONE ELSE
        // HOW DO I GET THE USER ID BASED ON THE USERNAME??
        
        var username=first.slice(1)
    	console.log("--------------username-----------"+username);
        
        slack.api("users.list", {"token": SLACK_SECURITY_TOKEN}, function(err, response, UserID) {
            console.log();
            for (var i = 0, len = response.members.length; i < len; i++) {
                if (username == response.members[i].name) {
	                UserID = response.members[i].id;
		    	console.log("--------------updated UserID-----------"+UserID);
	                break;
                }
            }
        });
    }
    //console.log("--------------first-----------"+first);
    console.log("--------------UserID after the loop-----------"+UserID);
    
    slack.api("users.info", {"token": SLACK_SECURITY_TOKEN,"user":UserID }, function(err, response) {


    // HERE I'M GOING TO TRY AND CHANGE THE CONTENT OF THE CASE
    // SUBJECT = "Slack case from username"
    // DESCRIPTION = "the whole text typed by the user"
    //    var subject = "Slack case from "+req.body.user_name;
    //    var description = req.body.text;


    var subject = "Slack case from "+response.user.profile.real_name_normalized+" in "+req.body.channel_name;
    var description = req.body.text;


// LET'S TRY AND GET THE CONTACT ID FOR THIS EMAIL ADDRESS

    var q1 = "SELECT Id FROM Contact WHERE Email LIKE '%" + response.user.profile.email + "%' LIMIT 1";
    org.query({query: q1}, function(err3, resp3) {
        if (err3) {
            console.error(err3);
            res.send("An error as occurred");
            return;
        }
        
        
        //NOW THAT WE HAVE THE CONTACT ID, 
    // BACK TO BUSINESS AND INSERT CASE IN SFDC
    // I HAVE TO DO IT IN HERE BECAUSE I HAVE NOT BEEN ABLE TO UNDERSTAND WHY THE VARIABLE DOESN'T KEEP THE VALUE OUTSIDE
    var c = nforce.createSObject('Case');
    c.set('subject', subject);
    c.set('description', description);
    c.set('origin', 'Slack');
    c.set('status', 'New');
    //    c.set('SuppliedEmail', UserEmail);  
    c.set('SuppliedEmail', response.user.profile.email);  
    
        //IF WE HAVE A CONTACT ID, LET'S ADD IT HERE
        if (resp3.records && resp3.records.length>0) {
        	var contact = resp3.records[0];
		c.set('ContactID', contact.get("Id"));
        }

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
    
            
        
        
        
        
        
        
        
    });


















    
  });
 





}

exports.execute = execute;
