'use strict';

// TODO development only
/*Meteor.startup(function onStartup()
{
  console.log('user logged out');
  Meteor.logout();
});*/

Accounts.ui.config({
  requestPermissions: {
    google: [
      'https://www.googleapis.com/auth/plus.profile.emails.read',
      'https://www.googleapis.com/auth/gmail.readonly'
    ]
  },
  requestOfflineToken: {
    google: true
  }
});

Template.body.helpers({
  // TODO
  newsletterLabelSet: function getValue()
  {
    return (Session.get('newsletterLabelSet') ||
            Meteor.user().newsletterLabel !== null);
  }
});

Template.body.events({

});

Template.config.helpers({

});

Template.config.events({
  'submit form': function callback(event)
  {
    event.preventDefault();

    // TODO validate
    // TODO value
    Meteor.call('updateLabel', event.target[0].value);

    // TODO
    Session.set('newsletterLabelSet', true);
  }
});

Template.newsletter.helpers({
  dateString: function toLocaleString()
  {
    return Template.instance().data.parsedMessage.date.toLocaleString(
      'en-US',
      { 
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      }
    );
  },
  showContent: function getValue()
  {
    return Session.get('newsletterToShow') === Template.instance().data._id;
  }
});

Template.newsletter.events({
  'click .close': function callback(event, template)
  {
    Session.set('newsletterToShow', null);
  },
  'click .newsletter-title': function callback(event, template)
  {
    Session.set('newsletterToShow', template.data._id);

    $('html, body').animate(
      {
        scrollTop: $(template.firstNode).offset().top
      },
      'slow'
    );
  }
});

// TODO buggy
/*Template.newsletter.onRendered(function onRendered()
{
  $(window).scroll(function callback(event)
  {
    var 
      newsletterList = Session.get('newsletterList'),
      ordinal = Session.get('ordinal'),
      nextOrdinal = (0 < $(this).scrollTop() ? ordinal + 1 : ordinal - 1);

    if (nextOrdinal < 0)
      console.log('at the beginning');
    else if (newsletterList.length <= nextOrdinal)
      console.log('at the end');
    else
      Session.set('ordinal', nextOrdinal);

    console.log(ordinal, nextOrdinal);
  });
});

Template.newsletter.onDestroyed(function onDestroyed()
{
  $(window).off('scroll');
});*/


// TODO do it on client for localization
/*parsedMessage.dateString = parsedMessage.date.toLocaleString(
  'en-US',
  { 
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }
);*/