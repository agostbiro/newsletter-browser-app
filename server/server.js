'use strict';

// TODO development only
/*Meteor.startup(function onStartup()
{
  Meteor.users.update({}, {$set: {newsletterLabel: null}}, {multi: true});

  console.log('newsletterLabel deleted');
});*/

Accounts.onCreateUser(function onCreateUser(options, user)
{
  if (user.services.google.id !== '100255365823608739632')
    throw new Meteor.Error('not-authorized');

  user.newsletterLabel = null;

  return user;
});

Meteor.users.after.update(function getEmailsByLabel(userId, doc, fieldNames)
{
  var
    getMessagesByLabelWrapped,
    gmailClient,
    googleConf,
    user;

  if (fieldNames.indexOf('newsletterLabel') < 0 || doc.newsletterLabel === null)
    return;

  // TODO is this required?
  if (Meteor.userId() !== userId)
    throw new Meteor.Error('not-authorized');

  user = Meteor.users.findOne({_id: userId});
  googleConf = ServiceConfiguration.configurations.findOne(
    {service: 'google'}
  );
  gmailClient = abiroGmail(user.services.google, googleConf)

  // Remove all existing newsletters, as they were acquired from a different
  // label.
  Newsletters.remove({userId: userId});

  getMessagesByLabelWrapped = Meteor.wrapAsync(
    gmailClient.getMessagesByLabel, 
    gmailClient
  );

  console.log('started downloading newsletters')

  // TODO magic number
  getMessagesByLabelWrapped(
    doc.newsletterLabel, 
    10,
    function callback(err, messages)
    {
      if (err !== null)
      {
        console.error(err);
        return;
      }

      check(messages.length, 10);

      _.each(messages, function iteratee(message)
      {
        if (Newsletters.findOne({messageId: message.messageId}) === undefined)
        {
          message.userId = userId;
          Newsletters.insert(message);
        }
      });

      console.log('finished downloading newsletters');
    }
  );
});

Meteor.publish(null, function publishSingleUSer() 
{
  return Meteor.users.find({_id: this.userId}, {fields: {newsletterLabel: 1}});
});
