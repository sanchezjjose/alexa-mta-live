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
        this.emit('BusTimeIntent');
    },
    
    'BusTimeIntent': function () {
        console.log('Called BusTimeIntent');

        return request(stopMonitoringEndpoint, (error, response, body) => {
        
            if (!error && response.statusCode == 200) {
                console.log('HTTP Request Successful...');

                try {
                    const monitoredStopVisit1 = JSON.parse(body).Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit[0].MonitoredVehicleJourney;
                    const monitoredStopVisit2 = JSON.parse(body).Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit[1].MonitoredVehicleJourney;
                    const nextBusStopsAway = monitoredStopVisit1.MonitoredVehicleJourney.MonitoredCall.Extensions.Distances.PresentableDistance;
                    const outputSpeech = `The next bus is ${nextBusStopsAway}.`;

                    if (monitoredStopVisit2) {
                        const followingBusStopsAway = monitoredStopVisit2.MonitoredVehicleJourney.MonitoredCall.Extensions.Distances.PresentableDistance;
                        outputSpeech += `The bus after is ${followingBusStopsAway}`;    
                    }

                    console.log('Output speech is ', outputSpeech);

                    this.emit(':tell', outputSpeech);

                } catch (err) {
                    console.log('Error occurred', err);

                    this.emit(':tell', `Sorry, mta live does not show any buses being tracked at the moment. Please try again later.`);
                }

            } else {
                console.log('HTTP Request Failed...');
                console.log('Error occurred', err);

                this.emit(':tell', 'An error occurred. Unable to fulfill request.');
            }
        });
    }
};

