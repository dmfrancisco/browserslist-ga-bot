import React, { Fragment } from "react";
import PropTypes from "prop-types";

class Setup extends React.Component {
  state = {
    error: null,
    authCode: null,
    accounts: [],
    webProperties: [],
    profiles: [],
    selectedAccountId: null,
    selectedWebPropertyId: null,
    selectedProfileId: null,
  };

  getAccounts = () =>
    new Promise((resolve, reject) => {
      const request = gapi.client.analytics.management.accounts.list();

      request.execute(data => {
        if (data.error) {
          return reject(data);
        }
        resolve(data.items.map(({ id, name }) => ({ id, name })));
      });
    });

  getWebProperties = accountId =>
    new Promise((resolve, reject) => {
      const request = gapi.client.analytics.management.webproperties.list({ accountId });

      request.execute(data => {
        if (data.error) {
          return reject(data);
        }
        resolve(data.items.map(({ id, name }) => ({ id, name })));
      });
    });

  getProfiles = (accountId, webPropertyId) =>
    new Promise((resolve, reject) => {
      const request = gapi.client.analytics.management.profiles.list({ accountId, webPropertyId });

      request.execute(data => {
        if (data.error) {
          return reject(data);
        }
        resolve(data.items.map(({ id, name }) => ({ id, name })));
      });
    });

  handleAccountChange = e => {
    const selectedAccountId = e.target.value;
    let webProperties, selectedWebPropertyId;

    this.getWebProperties(selectedAccountId)
      .then(data => {
        webProperties = data;
        selectedWebPropertyId = webProperties[0].id;

        return this.getProfiles(selectedAccountId, selectedWebPropertyId);
      })
      .then(data => {
        const profiles = data;
        const selectedProfileId = profiles[0].id;

        this.setState({
          webProperties,
          profiles,
          selectedAccountId,
          selectedWebPropertyId,
          selectedProfileId,
        });
      })
      .catch(data => {
        this.setState({ error: data.error.message });
      });
  };

  handleWebPropertyChange = e => {
    const selectedAccountId = this.state.selectedAccountId;
    const selectedWebPropertyId = e.target.value;

    this.getProfiles(selectedAccountId, selectedWebPropertyId)
      .then(data => {
        const profiles = data;
        const selectedProfileId = profiles[0].id;

        this.setState({
          profiles,
          selectedWebPropertyId,
          selectedProfileId,
        });
      })
      .catch(data => {
        this.setState({ error: data.error.message });
      });
  };

  handleProfileChange = e => {
    const selectedProfileId = e.target.value;

    this.setState({
      selectedProfileId,
    });
  };

  handleSignInSuccess = authCode => {
    let accounts, webProperties, selectedAccountId, selectedWebPropertyId;

    this.getAccounts()
      .then(data => {
        accounts = data;
        selectedAccountId = accounts[0].id;

        return this.getWebProperties(selectedAccountId);
      })
      .then(data => {
        webProperties = data;
        selectedWebPropertyId = webProperties[0].id;

        return this.getProfiles(selectedAccountId, selectedWebPropertyId);
      })
      .then(data => {
        const profiles = data;
        const selectedProfileId = profiles[0].id;

        this.setState({
          authCode,
          accounts,
          webProperties,
          profiles,
          selectedAccountId,
          selectedWebPropertyId,
          selectedProfileId,
        });
      })
      .catch(data => {
        this.setState({ error: data.error.message });
      });
  };

  handleSignIn = e => {
    e.preventDefault();

    this.auth2
      .grantOfflineAccess()
      .then(data => this.handleSignInSuccess(data.code))
      .catch(e => console.error(e));
  };

  handleSubmit = e => {
    e.preventDefault();

    const { authCode } = this.state;

    fetch(this.props.setupAuthUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRF-Token": this.props.csrfToken,
      },
      body: JSON.stringify({ code: authCode }),
      credentials: "same-origin",
    });
  };

  componentDidMount() {
    // Load both the "auth2" and "analytics" libraries (see https://goo.gl/emgo8U)
    gapi.load("auth2:analytics", () => {
      this.auth2 = gapi.auth2.init({
        client_id: this.props.gaClientId,
        scope: this.props.gaScope,
      });
    });
  }

  render() {
    const {
      error,
      authCode,
      accounts,
      webProperties,
      profiles,
      selectedAccountId,
      selectedWebPropertyId,
      selectedProfileId,
    } = this.state;

    if (error) {
      return <div>{error}</div>;
    }

    return (
      <Fragment>
        {authCode ? (
          <Fragment>
            <div>Signed in</div>

            <select value={selectedAccountId} onChange={this.handleAccountChange}>
              {accounts.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            <select value={selectedWebPropertyId} onChange={this.handleWebPropertyChange}>
              {webProperties.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            <select value={selectedProfileId} onChange={this.handleProfileChange}>
              {profiles.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Fragment>
        ) : (
          <button id="signinButton" onClick={this.handleSignIn}>
            Sign in with Google
          </button>
        )}

        <textarea cols="80" rows="20" id="query-output" value={JSON.stringify(this.state)} />

        <input type="submit" name="commit" value="Save" onSubmit={this.handleSubmit} />
      </Fragment>
    );
  }
}

Setup.propTypes = {
  csrfToken: PropTypes.string.isRequired,
  gaClientId: PropTypes.string,
  gaScope: PropTypes.string,
  setupAuthUrl: PropTypes.string,
};

Setup.defaultProps = {
  gaClientId: "343796874716-f6alt6bgaufif901tkr06a1vej5gde44.apps.googleusercontent.com",
  gaScope: "https://www.googleapis.com/auth/analytics.readonly",
  setupAuthUrl: "/setup/auth",
};

export default Setup;
