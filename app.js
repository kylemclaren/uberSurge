var request = require('request');
var mongo = require('mongodb');
var mandrill = require('mandrill-api/mandrill');
var twilio_client = require('twilio')(twilio_account_sid, twilio_auth_token);

mandrill_client = new mandrill.Mandrill(process.env.MANDRILL_APIKEY);

timestamp = new Date().toString();

secret = process.env.UBER_SECRET;
clientid = process.env.UBER_CLIENT_ID;
servertoken = process.env.UBER_SERVER_TOKEN;
startlat = process.env.START_LATITUDE;
startlong = process.env.START_LONGITUDE;
endlat = process.env.END_LATITUDE;
endlong = process.env.END_LONGITUDE;
zone = process.env.ZONE;
from_email =process.env.MANDRILL_USERNAME;
to_email =process.env.TO_EMAIL;
to_name =process.env.TO_NAME;
driver_number =process.env.DRIVER_NUMBER;
twilio_number =process.env.TWILIO_NUMBER;
twilio_account_sid =process.env.TWILIO_ACCOUNT_SID;
twilio_auth_token =process.env.TWILIO_AUTH_TOKEN;

zoneCaps = zone.toUppercase();

request('https://api.uber.com/v1/estimates/price?client_id=' + clientid + '&server_token=' + servertoken + '&secret=' + secret + '&start_latitude=' + startlat + '&start_longitude=' + startlong + '&end_latitude=' + endlat + '&end_longitude=' + endlong, function (error, response, body) {

  if (!error && response.statusCode == 200) {

    var data = JSON.parse(body);
    surge = data.prices[0].surge_multiplier;
    console.log('Surge is: ' + surge);
    console.log(data);

    if (surge > 1)

      message = {
          "text": "Surge pricing is in effect! The current multiplier is " + surge + "X.",
          "subject": "Uber Surge - " + zone,
          "from_email": from_email,
          "from_name": "Uber Surge Alert",
          "to": [{
                  "email": to_email,
                  "name": to_name,
                  "type": "to"
                }],
          "important": true,
      };
      var async = false;
      mandrill_client.messages.send({"message": message, "async": async}, function(result) {
          console.log(result);
      }, function(e) {
          // Mandrill returns the error as an object with name and message keys
          console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
          // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
      });

      if (surge > 1.4)

        twilio_client.sendMessage({

            to: driver_number,
            from: twilio_number,
            body: 'Uber surge pricing in ' + zoneCaps + '. ' + 'Current multiplier is' + surge + 'x.'

        }, function(err, responseData) {

            if (!err) {

                console.log(responseData.from);
                console.log(responseData.body);

            }
        });

  }
});
