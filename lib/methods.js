Meteor.methods({
  'updateLabel': function updateLabel(label)
  {
    if (!Meteor.userId())
    {
      throw new Meteor.Error("not-authorized");
    }

    // TODO validate label
    check(label, String);

    Meteor.users.update(
      {_id: Meteor.userId()},
      {$set: {newsletterLabel: label}}
    );

    console.log('new label', label);
  }
});