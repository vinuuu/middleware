const https = require('https');
const request = require('request');
const axios = require('axios');
let express = require('express'),
  bodyParser = require('body-parser'),
  port = process.env.PORT || 3000,
  app = express();
let alexaVerifier = require('alexa-verifier');
var isFisrtTime = true;
const SKILL_NAME = 'Real Page';
const GET_HERO_MESSAGE = "Here's your hero: ";
const HELP_MESSAGE = 'You can say please fetch me a hero, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const reprompt="Do you want more?"
const STOP_MESSAGE = 'Enjoy the day...Goodbye!';
const MORE_MESSAGE = 'Do you want more?'
const PAUSE = '<break time="0.3s" />'
const WHISPER = '<amazon:effect name="whispered"/>'

const data = [
  'Aladdin  ',
  'Cindrella ',
  'Bambi',
  'Bella ',
  'Bolt ',
  'Donald Duck',
  'Genie ',
  'Goofy',
  'Mickey Mouse',
];

app.use(bodyParser.json({
  verify: function getRawBody(req, res, buf) {
    req.rawBody = buf.toString();
  }
}));

function requestVerifier(req, res, next) {
  alexaVerifier(
    req.headers.signaturecertchainurl,
    req.headers.signature,
    req.rawBody,
    function verificationCallback(err) {
      if (err) {
        res.status(401).json({
          message: 'Verification Failure',
          error: err
        });
      } else {
        next();
      }
    }
  );
}

function log() {
  if (true) {
    console.log.apply(console, arguments);
  }
}

app.get('/check', function (req, res) {
  console.log("api strated");
  axios.post('https://qa-books.asseteye.net/RPHackathon/V1/ChatBot/1/rent')
    .then(response => {
      res.send("success is called " + response.data.Model);
    })

});

app.post('/realpage', requestVerifier, function (req, res) {
    console.log(req.body.request);
  if (req.body.request.type === 'LaunchRequest') {
    log(req.body.request);
    res.json(getNewHero());
    isFisrtTime = false
  } else if (req.body.request.type === 'SessionEndedRequest') { /* ... */
    res.json(stopAndExit());
  } else if (req.body.request.type === 'IntentRequest') {
    switch (req.body.request.intent.name) {
      case "GetRenewals":
      getRenewals('renewal').then(function (resp) {
        res.json(resp);
      })
      break;
      case "GetSerivceRequest":
      getRenewals('recent servicerequest status').then(function (resp) {
        res.json(resp);
      })
      break;
      case "GetPropertyEminities":    
      res.json(propertyeminities());
      break;
      case "GetBuildingHappeings":
      res.json(GetBuildingHappeings());
      break;
      case 'AMAZON.YesIntent':
        getNewHero().then(function (resp) {
          res.json(resp);
        })
        break;
      case 'AMAZON.NoIntent':
        res.json(stopAndExit());
        break;
      case 'AMAZON.HelpIntent':
        res.json(help());
        break;
        case 'AMAZON.StopIntent':
          res.json(stopAndExit());
        break;
        case 'AMAZON.FallbackIntent':
          res.json(getFallBack());
      break;
      
      default:
        res.json(help());
      break;

    }
  }
});
function propertyeminities (){
  const speechOutput = "Washer and Dryer , Air Conditioning, Washer and Dryer Hookups, Furniture,Patio,Hardwood,Floors, Dishwasher, Fireplace, Walk-in Closets, Wi-Fi";
  var jsonObj = buildResponse(speechOutput, true, "");
  return jsonObj;
}
function GetBuildingHappeings (){
  const speechOutput = "Michella Birthday party at Today 6.30PM follwing by Dinner in Peter's Home";
  var jsonObj = buildResponse(speechOutput, true, "");
  return jsonObj;
}
function GetBuildingHappeings (){
  const speechOutput = "Michella Birthday party at Today 6.30PM follwing by Dinner in Peter's Home";
  var jsonObj = buildResponse(speechOutput, true, "");
  return jsonObj;
}
function handleDataMissing() {
  return buildResponse(MISSING_DETAILS, true, null)
}
function getFallBack(){
  const speechOutput = "sorry..I am still learning and I can't understand this query please rephrase it.";
  var jsonObj = buildResponse(speechOutput, true, "");
  return jsonObj;
}
function stopAndExit() {

  const speechOutput = STOP_MESSAGE
  var jsonObj = buildResponse(speechOutput, true, "");
  return jsonObj;
}

function help() {

  const speechOutput = HELP_MESSAGE
  const reprompt = HELP_REPROMPT
  var jsonObj = buildResponseWithRepromt(speechOutput, false, "", reprompt);

  return jsonObj;
}

function buildResponse(speechText, shouldEndSession, cardText) {

  const speechOutput = "<speak>" + speechText + "</speak>"
  var jsonObj = {
    "version": "1.0",
    "response": {
      "shouldEndSession": shouldEndSession,
      "outputSpeech": {
        "type": "SSML",
        "ssml": speechOutput
      }
    },
    "card": {
      "type": "Simple",
      "title": SKILL_NAME,
      "content": cardText,
      "text": cardText
    },
  }
  return jsonObj
}

function getRenewals(param){ 
  return axios.post('https://qa-books.asseteye.net/RPHackathon/V1/alexa/1/'+param)
    .then(response => {
      const speechOutput = "<speak>"+ response.data.Model + "</speak>"
      var jsonObj = {
        "version": "1.0",
        "response": {
          "shouldEndSession": false,
          "outputSpeech": {
            "type": "SSML",
            "ssml": speechOutput
          }
        },     

        "reprompt": {
          "outputSpeech": {
            "type": "PlainText",
            "text": reprompt,
            "ssml": reprompt
          }
        },
      }
      return jsonObj
    });
}
function getNewHero() {

  var welcomeSpeechOutput = 'Welcome to Real Page <break time="0.3s" />'  
  const heroArr = data;
  const heroIndex = Math.floor(Math.random() * heroArr.length);
  const randomHero = heroArr[heroIndex];
  const tempOutput = WHISPER + GET_HERO_MESSAGE + randomHero + PAUSE;
  const speechText = welcomeSpeechOutput 
  const more = MORE_MESSAGE


  return buildResponseWithRepromt(speechText, false, randomHero, more);

}

function buildResponseWithRepromt(speechText, shouldEndSession, cardText, reprompt) {
       speechText= "Hello Johnson,Welcome to Real Page we are anxious to help you"
      const speechOutput = "<speak>" + speechText +"</speak>"
      var jsonObj = {
        "version": "1.0",
        "response": {
          "shouldEndSession": shouldEndSession,
          "outputSpeech": {
            "type": "SSML",
            "ssml": speechOutput
          }
        },
        "card": {
          "type": "Simple",
          "title": SKILL_NAME,
          "content": cardText,
          "text": cardText
        },
        "reprompt": {
          "outputSpeech": {
            "type": "PlainText",
            "text": reprompt,
            "ssml": reprompt
          }
        },
      }
      return jsonObj;
}

app.listen(port);

console.log('Alexa list RESTful API server started on: ' + port);