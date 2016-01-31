Pages = new Meteor.Pagination(
  Newsletters,
  {
    debug: true,
    infinite: true,
    itemTemplate: 'newsletter',
    sort: {'parsedMessage.date': -1},
    auth: function auth(skip, subscription)
    {
      if (subscription.userId === null)
        return false;

      return Newsletters.find(
        {
          userId: subscription.userId
        },
        {
          fields: {parsedMessage: 1},

          // TODO figure why is date a string here
          sort: {'parsedMessage.date': -1}
        }
      );
    }
  }
);