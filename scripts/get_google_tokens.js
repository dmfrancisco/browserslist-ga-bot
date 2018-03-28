const { google } = require("googleapis");

function getTokens(code, callback) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "http://localhost:5000" // It's required and needs to be valid but is not used
  );

  oauth2Client.getToken(code, (err, tokens) => {
    if (err) return callback(err);
    callback(null, tokens);
  });
}

module.exports = getTokens;

// If being executed from the command-line
if (!module.parent) {
  const code = process.argv[2];

  getTokens(code, (err, tokens) => {
    if (err && err.response) {
      process.stdout.write(err.response.data.error_description);
    } else if (err) {
      process.stdout.write(err);
    } else {
      process.stdout.write(JSON.stringify(tokens));
    }
  });
}
