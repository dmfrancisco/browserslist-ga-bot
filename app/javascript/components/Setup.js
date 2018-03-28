import React, { Fragment } from "react";
import PropTypes from "prop-types";

class Setup extends React.Component {
  state = {
    error: null,
    success: null,
    authCode: null,
    accounts: [],
    webProperties: [],
    profiles: [],
    selectedAccountId: null,
    selectedWebPropertyId: null,
    selectedProfileId: null,
    selectedDatePeriod: null,
    email: null,
  };

  handleRefresh = e => {
    e.preventDefault();
    window.location.reload();
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

    const {
      authCode,
      selectedAccountId,
      selectedWebPropertyId,
      selectedProfileId,
      selectedDatePeriod,
      email,
    } = this.state;

    const { installationId } = this.props;

    const body = JSON.stringify({
      authCode,
      selectedAccountId,
      selectedWebPropertyId,
      selectedProfileId,
      selectedDatePeriod,
      email,
      installationId,
    });

    fetch(this.props.action, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRF-Token": this.props.csrfToken,
      },
      credentials: "same-origin",
      body,
    })
      .then(response => {
        if (response.status >= 200 && response.status < 300) {
          return response;
        } else {
          var error = new Error(response.statusText);
          error.response = response;
          throw error;
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          return this.setState({ error: data.error.message });
        }
        this.setState({ success: true });
      })
      .catch(error => {
        this.setState({ error: error.message });
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

  renderSignedIn() {
    const {
      accounts,
      webProperties,
      profiles,
      selectedAccountId,
      selectedWebPropertyId,
      selectedProfileId,
    } = this.state;

    return (
      <form onSubmit={this.handleSubmit}>
        <div>
          Successfully signed in. Please{" "}
          <a href="#refresh" onClick={this.handleRefresh}>
            refresh
          </a>{" "}
          if you want to restart the process.
        </div>

        <label htmlFor="ga_account_id">Google Analytics Account</label>
        <select
          id="ga_account_id"
          name="ga_account_id"
          value={selectedAccountId}
          onChange={this.handleAccountChange}
        >
          {accounts.map(item => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        <label htmlFor="ga_web_property_id">Google Analytics Property</label>
        <select
          id="ga_web_property_id"
          name="ga_web_property_id"
          value={selectedWebPropertyId}
          onChange={this.handleWebPropertyChange}
        >
          {webProperties.map(item => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        <label htmlFor="ga_profile_id">Google Analytics Profile</label>
        <select
          id="ga_profile_id"
          name="ga_profile_id"
          value={selectedProfileId}
          onChange={this.handleProfileChange}
        >
          {profiles.map(item => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        <label htmlFor="date_period">Date period</label>
        <select
          id="date_period"
          name="date_period"
          onChange={e => this.setState({ selectedDatePeriod: e.target.value })}
        >
          <option value={30}>Last 30 days</option>
          <option value={60}>Last 60 days</option>
          <option value={90}>Last 90 days</option>
        </select>

        <label htmlFor="email" onChange={e => this.setState({ email: e.target.value })}>
          Contact email
        </label>
        <input type="email" id="email" name="email" placeholder="hello@world.com" />

        <input type="submit" name="commit" value="Save" />
      </form>
    );
  }

  renderSignedOut() {
    return (
      <button id="signinButton" onClick={this.handleSignIn}>
        Sign in with Google
      </button>
    );
  }

  render() {
    const { installationId } = this.props;
    const { error, success, authCode } = this.state;
    const signedIn = !!authCode;

    if (error) return <div>{error}</div>;
    if (success) return <div>Success!</div>;

    if (!installationId) {
      return (
        <div>
          Your GitHub app installation ID is missing. Do you come from the GitHub Marketplace by
          clicking the Install button? If you do please open an issue in our support page. We are
          sorry for the inconvenience.
        </div>
      );
    }

    return <Fragment>{signedIn ? this.renderSignedIn() : this.renderSignedOut()}</Fragment>;
  }
}

Setup.propTypes = {
  action: PropTypes.string.isRequired,
  csrfToken: PropTypes.string.isRequired,
  installationId: PropTypes.string.isRequired,
  gaClientId: PropTypes.string.isRequired,
  gaScope: PropTypes.string.isRequired,
};

export default Setup;
