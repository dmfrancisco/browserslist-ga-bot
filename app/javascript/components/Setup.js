import React, { Fragment } from "react";
import PropTypes from "prop-types";

// Replace with your view ID.
var VIEW_ID = "113877450";

function displayResults(response) {
  var formattedJson = JSON.stringify(response.result, null, 2);
  document.getElementById("query-output").value = formattedJson;
}

class Setup extends React.Component {
  getData = () => {
    const reportRequests = [
      {
        viewId: VIEW_ID,
        dateRanges: [
          {
            startDate: "30daysAgo",
            endDate: "today",
          },
        ],
        metrics: [
          {
            expression: "ga:pageviews",
          },
        ],
        dimensions: [
          { name: "ga:operatingSystem" },
          { name: "ga:operatingSystemVersion" },
          { name: "ga:browser" },
          { name: "ga:browserVersion" },
          { name: "ga:isMobile" },
        ],
        orderBys: [{ fieldName: "ga:browser", sortOrder: "ASCENDING" }],
        pageSize: "10000",
      },
    ];

    gapi.client
      .request({
        path: "/v4/reports:batchGet",
        root: "https://analyticsreporting.googleapis.com/",
        method: "POST",
        body: { reportRequests },
      })
      .then(displayResults, console.error.bind(console));
  };

  handleSubmit() {
    console.log("yep", this);
  }

  onSignInSuccess = () => {
    console.log("Successfully signed in.");
    this.getData();
  };

  onSignInFailure = () => {
    console.log("An error occurred while signing in.");
  };

  handleSignIn = e => {
    e.preventDefault();
  };

  componentDidMount() {
    gapi.signin2.render("sign-in", {
      onsuccess: this.onSignInSuccess,
      onfailure: this.onSignInFailure,
    });
  }

  render() {
    return (
      <Fragment>
        <div id="sign-in" />

        <textarea cols="80" rows="20" id="query-output" />

        <input type="submit" name="commit" value="Save" onSubmit={this.handleSubmit} />
      </Fragment>
    );
  }
}

export default Setup;
