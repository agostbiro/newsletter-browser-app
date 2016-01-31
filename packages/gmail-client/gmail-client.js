'use strict';

var 
  gcloud = Npm.require('gcloud'),
  google = Npm.require('googleapis'),
  googleAuth = Npm.require('google-auth-library'),
  gmailAPI = google.gmail('v1'),

  proto = {};


// TODO pontential bug: user's latest auth token returned by Google and auth
// token in database will be out of sync as the oauth2Client will update
// with the refresh token on its own when needed. 
// Solution: overwrite methods and sync with db.
abiroGmail = function abiroGmail(userServiceGoogle, googleConfiguration)
{
  var
    auth, 
    oauth2Client;

  check(
    userServiceGoogle,
    Match.ObjectIncluding({
      accessToken: String,
      expiresAt: Number,
      refreshToken: String
    })
  );

  check(
    googleConfiguration,
    Match.ObjectIncluding({
      clientId: String,
      secret: String
    })
  );

  auth = new googleAuth();

  // TODO redirect url
  oauth2Client = new auth.OAuth2(
    googleConfiguration.clientId, googleConfiguration.secret, ''
  );

  oauth2Client.setCredentials({
    access_token: userServiceGoogle.accessToken,
    expiry_date: userServiceGoogle.expiresAt,
    refresh_token: userServiceGoogle.refreshToken,
    token_type: 'Bearer'
  });

  return Object.create(
    proto,
    {
      oauth2Client: {
        value: oauth2Client
      }
    }
  );
}

/* 
  Argument is an e-mail message resource in its full, as specified here:
  https://developers.google.com/gmail/api/v1/reference/users/messages

  'parsedMessage' is an object of such shape:
  {
    date: Date,
    from: {
      email: String,
      name: String
    },
    historyId: Number,
    html: String,
    id: String,
    subject: String
  }

  TODO tests
  TODO what if no html part
*/
function parseMessage(originalMessage)
{
  var 
    fromHeader,
    htmlBase64,
    htmlPart,
    parsedMessage,
    subjectHeader;

  check(
    originalMessage,
    Match.ObjectIncluding({
      id: String,
      internalDate: String,
      historyId: String,
      payload: Match.ObjectIncluding({
        headers: Array,
        parts: Match.Optional(Array)
      })
    })
  );

  fromHeader = _.find(
    originalMessage.payload.headers, 
    function predicate(header)
    {
      return header.name === 'From';
    }
  );

  htmlPart = _.find(
    originalMessage.payload.parts,
    function predicate(part)
    {
      return part.mimeType === 'text/html';
    }
  );

  subjectHeader = _.find(
    originalMessage.payload.headers, 
    function predicate(header)
    {
      return header.name === 'Subject';
    }
  );

  parsedMessage = {
    // Date headers are unreliable.
    date: new Date(parseInt(originalMessage.internalDate, 10)),
    from: {
      // TODO
      email: fromHeader.value.replace(/^.*<|>.*$/g, ''),
      name: fromHeader.value.replace(/^"|"*\s*<.*$/g, '')
    },
    historyId: parseInt(originalMessage.historyId, 10),
    id: originalMessage.id,
    subject: subjectHeader.value
  };

  // convert to Base64 RFC 4648 standard
  htmlBase64 = htmlPart.body.data.replace(/-/g, '+').replace(/_/g, '/');
  parsedMessage.html = new Buffer(htmlBase64, 'base64').toString('utf8');

  return {
    // 'id' and 'historyId' are exposed here to allow for efficient searching.
    messageId: originalMessage.id,
    historyId: parsedMessage.historyId,
    originalMessage: originalMessage,
    parsedMessage: parsedMessage
  };
}

// TODO pagination
proto.getMessagesByLabel = function getMessagesByLabel(label,
                                                       maxResults, 
                                                       callbackArg)
{
  var that = this;

  gmailAPI.users.messages.list(
    { 
      auth: that.oauth2Client,
      maxResults: maxResults,
      // TODO use label id
      q: 'label:' + label,
      userId: 'me'
    },
    function callback(err, response)
    {
      var
        count,
        fullMessages;

      if (err !== null)
      {
        callbackArg(err);
        return;
      }

      count = response.messages.length;
      fullMessages = new Array(count);

      _.each(response.messages, function iteratee(message, i)
      {
        gmailAPI.users.messages.get(
          {
            auth: that.oauth2Client,
            format: 'full',
            id: message.id,
            userId: 'me'
          },
          function callback(err, response)
          {
            if (err !== null)
            {
              callbackArg(err);
              return;
            }

            fullMessages[i] = parseMessage(response);

            count -= 1;

            if (count === 0)
              callbackArg(null, fullMessages);
          }
        );
      });
    }
  );
};