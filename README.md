This is an abandoned experiment to create a newsletter browser app with Meteor for the web, iOS and Android platforms. The app extracts newsletters from a user's Gmail account and displays them in a view that is optimized for the fast browsing and processing of newsletters.

A particular challenge was integrating the official Google Node library for push notifications via the Cloud Pub/Sub API, as Meteor did not support native NPM packages at the time.

Screenshots of the app running with a mockup design:

List view
![List view](http://www.agostbiro.com/assets/images/1-list-view.png)

Newsletter opened
![Newsletter opened](http://www.agostbiro.com/assets/images/2-newsletter-opened.png)

Scrolled past opened newsletter
![Scrolled past opened newsletter](http://www.agostbiro.com/assets/images/3-scrolled-past-newsletter.png)
