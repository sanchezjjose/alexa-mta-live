'use strict';

const Alexa = require('alexa-sdk');
const request = require('request');

// TODO: move apiKey to Environment Variable before deploying
const apiKey = '7f7ac50a-def1-4470-a2fb-446e7a3ff580';
const stopMonitoringServiceHost = 'bustime.mta.info/api/siri/stop-monitoring.json';
const stopMonitoringServiceOptions = 'OperatorRef=MTA&MonitoringRef=552065&LineRef=MTABC_Q101&DirectionRef=1';
const stopMonitoringEndpoint = `http://${stopMonitoringServiceHost}?key=${apiKey}&${stopMonitoringServiceOptions}`

exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context);

    alexa.registerHandlers(handlers);
    alexa.execute();
};

const handlers = {

    'LaunchRequest': function () {
        console.log('Called LaunchRequest');
        this.emit('SayHello');
    },
    
    'HelloWorldIntent': function () {
        console.log('Called HelloWorldIntent');

        return request(stopMonitoringEndpoint, (error, response, body) => {
        
            if (!error && response.statusCode == 200) {
                console.log('HTTP Request Successful...');

                try {
                    const monitoredVehicle = JSON.parse(body).Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit[0].MonitoredVehicleJourney;
                    const distanceAway = monitoredVehicle.MonitoredCall.Extensions.Distances.PresentableDistance;
                    const outputSpeech = `Your bus is ${distanceAway}`;

                    this.emit(':tell', outputSpeech);

                } catch (err) {
                    console.log('Error occurred', err);
                    this.emit(':tell', `Sorry, mta live is unable to find your bus at the moment.`);
                }

            } else {
                console.log('HTTP Request Failed...');
                this.emit('SayHello');
            }
        });
    },
    
    'SayHello': function () {
        console.log('Called SayHello');
        this.emit(':tell', 'Hello World!');
    }
};

