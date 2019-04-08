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
const STOP_MESSAGE = 'Enjoy the day...Goodbye!';
const MORE_MESSAGE = 'Do you want more?'
const PAUSE = '<break time="0.3s" />'
const WHISPER = '<amazon:effect name="whispered"/>'
const welcomeText='Hello Johnson,Welcome to Real Page <break time="0.3s" /> how can i assit you';
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
      res.json(lanchDataRequest());
    isFisrtTime = false
  } else if (req.body.request.type === 'SessionEndedRequest') { /* ... */
    log("Session End")
  } else if (req.body.request.type === 'IntentRequest') {
    switch (req.body.request.intent.name) {
      case "GetRenewalDetails":
      getRenewal().then(function (resp) {
        res.json(resp);
      })
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
      default:
      res.json(stopAndExit());
      break;
    }
  }
});


function lanchDataRequest(){
  return buildResponse(welcomeText,true,"");
}
function handleDataMissing() {
  return buildResponse(MISSING_DETAILS, true, null)
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

function getRenewal() {

  var welcomeSpeechOutput = 'Welcome to Real Page <break time="0.3s" />'
  // if (!isFisrtTime) {
  //   welcomeSpeechOutput = '';
  // }

  const heroArr = data;
  const heroIndex = Math.floor(Math.random() * heroArr.length);
  const randomHero = heroArr[heroIndex];
  const tempOutput = WHISPER + GET_HERO_MESSAGE + randomHero + PAUSE;
  const speechText = welcomeSpeechOutput 
  const more = MORE_MESSAGE


  return buildResponseWithRepromt(speechText, false, randomHero, more,'Renewal');

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

function buildResponseWithRepromt(speechText, shouldEndSession, cardText, reprompt,param) {
  return axios.post('https://qa-books.asseteye.net/RPHackathon/V1/ChatBot/1/'+param)
    .then(response => {
      const speechOutput = "<speak>" +response.data.Model + "</speak>"
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
      return jsonObj
    });

}

app.listen(port);

console.log('Alexa list RESTful API server started on: ' + port);