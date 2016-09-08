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
                    // Just testing slots below
                    const slots = this.event.request.intent.slots; 
                    console.log(slots.Bus.value.replace(' ', '').toUpperCase());

                    const monitoredStopVisit1 = JSON.parse(body).Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit[0];
                    const monitoredStopVisit2 = JSON.parse(body).Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit[1];

                    const nextBusStopsAway = monitoredStopVisit1.MonitoredVehicleJourney.MonitoredCall.Extensions.Distances.PresentableDistance;
                    const nextBusExpectedArrivalTime = monitoredStopVisit1.MonitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime;
                    
                    const metersAway = monitoredStopVisit1.MonitoredVehicleJourney.MonitoredCall.Extensions.Distances.DistanceFromCall;
                    const milesAway = metersAway/1609.34; // convert meters to miles
                    const guessedNextBusArrivalTime = Math.round(60*milesAway/50); // assumes driving 50 mph

                    let outputSpeech = `The next bus is ${nextBusStopsAway}`;

                    if (nextBusExpectedArrivalTime) {
                        outputSpeech += `, and is arriving in 3 minutes`;

                    } else {
                        outputSpeech += `, and is arriving in approximately ${guessedNextBusArrivalTime} minutes`;
                    }

                    // TODO: when working make a function that builds the outputSpeech, and takes a MonitoredStopVisit object
                    if (monitoredStopVisit2) {
                        const followingBusStopsAway = monitoredStopVisit2.MonitoredVehicleJourney.MonitoredCall.Extensions.Distances.PresentableDistance;
                        const followingBusExpectedArrivalTime = monitoredStopVisit1.MonitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime;

                        const metersAway = monitoredStopVisit2.MonitoredVehicleJourney.MonitoredCall.Extensions.Distances.DistanceFromCall;
                        const milesAway = metersAway/1609.34; // convert meters to miles
                        const guessedNextBusArrivalTime = Math.round(60*milesAway/50); // assumes driving 50 mph

                        outputSpeech += `. The bus after is ${followingBusStopsAway}`;    

                        if (followingBusExpectedArrivalTime) {
                            outputSpeech += `, and is arriving in 10 minutes.`;

                        } else {
                            outputSpeech += `, and is arriving in approximately ${guessedNextBusArrivalTime} minutes`;
                        }
                    }

                    console.log('Output speech is: ', outputSpeech);

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

