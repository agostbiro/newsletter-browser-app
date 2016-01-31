Package.describe({
  name: 'abiro:accounts-google',
  summary: "Login service for Google accounts",
  version: "1.0.4",
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.use(['underscore', 'random']);
  api.use('accounts-base', ['client', 'server']);
  // Export Accounts (etc) to packages using this one.
  api.imply('accounts-base', ['client', 'server']);
  api.use('accounts-oauth', ['client', 'server']);
  api.use('abiro:google', ['client', 'server']);

  api.addFiles('google_login_button.css', 'client');

  api.addFiles("google.js");
});
