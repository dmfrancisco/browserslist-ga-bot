const { google } = require("googleapis");

function getTokens(access_token, refresh_token, callback) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL // It's required and needs to be valid but is not used
  );

  oauth2Client.setCredentials({ access_token, refresh_token });

  oauth2Client.refreshAccessToken((err, tokens) => {
    if (err) return callback(err);
    callback(null, tokens);
  });
}

module.exports = getTokens;

// If being executed from the command-line
if (!module.parent) {
  const access_token = process.argv[2];
  const refresh_token = process.argv[3];

  getTokens(access_token, refresh_token, (err, tokens) => {
    if (err && err.response) {
      process.stdout.write(err.response.data.error_description);
    } else if (err) {
      process.stdout.write(err);
    } else {
      process.stdout.write(JSON.stringify(tokens));
    }
  });
}
