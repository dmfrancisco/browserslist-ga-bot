import React, { Fragment } from "react";
import PropTypes from "prop-types";

import RepoInput from "./RepoInput";
import { ToolsIcon } from "./Icons";

class Setup extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      validationError: null,
      success: null,
      authCode: null,
      accounts: [],
      webProperties: [],
      profiles: [],
      selectedAccountId: null,
      selectedWebPropertyId: null,
      selectedProfileId: null,
      selectedDatePeriod: this.props.gaDatePeriods[0],
      repo: null,
      base: "master",
      email: null,
    };
  }

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

  isValid() {
    const { base, repo, email } = this.state;

    if (!base || !repo || !email) return false;
    return true;
  }

  handleSubmit = e => {
    e.preventDefault();

    if (!this.isValid()) return this.setState({ validationError: true });

    const body = JSON.stringify({
      auth_code: this.state.authCode,
      account_id: this.state.selectedAccountId,
      web_property_id: this.state.selectedWebPropertyId,
      profile_id: this.state.selectedProfileId,
      date_period: this.state.selectedDatePeriod,
      installation_id: this.props.installationId,
      base: this.state.base,
      repo: this.state.repo,
      email: this.state.email,
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
          const error = new Error(response.statusText);
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
    const { checkAvailabilityPath, csrfToken, installationId } = this.props;

    const {
      validationError,
      accounts,
      webProperties,
      profiles,
      selectedAccountId,
      selectedWebPropertyId,
      selectedProfileId,
      repo,
    } = this.state;

    return (
      <form onSubmit={this.handleSubmit}>
        {!validationError && (
          <div className="flash flash-full flash-success">
            Successfully signed in! Please{" "}
            <a href="#refresh" onClick={this.handleRefresh}>
              refresh
            </a>{" "}
            if you need to sign in with a different account.
          </div>
        )}

        {validationError && (
          <div className="flash flash-full flash-error">
            Oops, it seems some required fields are missing or invalid.
          </div>
        )}

        <div className="Box-body">
          <div className="clearfix">
            <dl className="form-group col-4 float-left pr-2 my-0">
              <dt>
                <label htmlFor="ga_account_id">Account</label>
              </dt>
              <dd>
                <select
                  id="ga_account_id"
                  name="ga_account_id"
                  value={selectedAccountId}
                  onChange={this.handleAccountChange}
                  className="form-select input-block"
                >
                  {accounts.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </dd>
            </dl>

            <dl className="form-group col-4 float-left px-1 my-0">
              <dt>
                <label htmlFor="ga_web_property_id">Property</label>
              </dt>
              <dd>
                <select
                  id="ga_web_property_id"
                  name="ga_web_property_id"
                  value={selectedWebPropertyId}
                  onChange={this.handleWebPropertyChange}
                  className="form-select input-block"
                >
                  {webProperties.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </dd>
            </dl>

            <dl className="form-group col-4 float-left pl-2 my-0">
              <dt>
                <label htmlFor="ga_profile_id">Profile</label>
              </dt>
              <dd>
                <select
                  id="ga_profile_id"
                  name="ga_profile_id"
                  value={selectedProfileId}
                  onChange={this.handleProfileChange}
                  className="form-select input-block"
                >
                  {profiles.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </dd>
            </dl>
          </div>

          <dl className="form-group">
            <dt>
              <label htmlFor="date_period">Date period</label>
            </dt>
            <dd>
              <select
                id="date_period"
                name="date_period"
                value={this.state.selectedDatePeriod}
                onChange={e => this.setState({ selectedDatePeriod: e.target.value })}
                className="form-select"
              >
                {this.props.gaDatePeriods.map(period => (
                  <option key={period} value={period}>
                    Last {period} days
                  </option>
                ))}
              </select>
              <p className="note">The days that should be considered while fetching the stats.</p>
            </dd>
          </dl>

          <dl className="form-group">
            <dt>
              <label htmlFor="repo">Repository</label>
            </dt>
            <dd>
              <RepoInput
                id="repo"
                name="repo"
                placeholder="owner/name (eg. facebook/react)"
                onChange={value => this.setState({ repo: value })}
                className="form-control"
                checkAvailabilityPath={checkAvailabilityPath}
                csrfToken={csrfToken}
                installationId={installationId}
                valid={!!repo}
              />
              <p className="note">
                The repository you want the bot to commit <code>browserslist-stats.json</code> to.
              </p>
            </dd>
          </dl>

          <dl className="form-group">
            <dt>
              <label htmlFor="base">Branch</label>
            </dt>
            <dd>
              <input
                type="text"
                id="base"
                name="base"
                defaultValue={this.state.base}
                placeholder="(eg. master)"
                onChange={e => this.setState({ base: e.target.value })}
                className="form-control"
              />
              <p className="note">
                The existing branch you want the bot to commit <code>browserslist-stats.json</code>{" "}
                to.
              </p>
            </dd>
          </dl>

          <dl className="form-group">
            <dt>
              <label htmlFor="email">Contact email</label>
            </dt>
            <dd>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="hello@world.com"
                onChange={e => this.setState({ email: e.target.value })}
                className="form-control"
              />
              <p className="note">In case we need to contact you.</p>
            </dd>
          </dl>

          <div className="form-actions">
            <input
              type="submit"
              name="commit"
              value="Save configuration"
              className="btn btn-primary"
            />
          </div>
        </div>
      </form>
    );
  }

  renderSignedOut() {
    return (
      <div className="Box-body">
        <div className="blankslate blankslate-clean-background px-0">
          <button onClick={this.handleSignIn} className="btn btn-blue btn-large mb-2">
            Sign In with Google Analytics
          </button>
          <p className="note">The bot needs read access to your Google Analytics account.</p>
        </div>
      </div>
    );
  }

  renderError(error) {
    return (
      <div className="flash flash-full flash-error">
        Looks like something went wrong: "{error}". We track these errors automatically, but if the
        problem persists feel free to{" "}
        <a href="https://github.com/browserslist/browserslist-ga/issues/new">
          open an issue in our support page
        </a>. We are sorry for the inconvenience.
      </div>
    );
  }

  renderSuccess() {
    return (
      <div className="flash flash-full flash-success">
        Success! You should see in a couple hours a commit by this bot if a{" "}
        <code>browserslist-ga.json</code> file doesn't exist already. After that the file will be
        updated everytime there are substantial changes. You can close this page. Thank you!
      </div>
    );
  }

  renderNoInstallation() {
    return (
      <div className="flash flash-full flash-warn">
        Your GitHub app installation ID is missing. Do you come from the GitHub Marketplace by
        clicking the Install button? Please{" "}
        <a href="https://github.com/browserslist/browserslist-ga/issues/new">
          open an issue in our support page
        </a>. We are sorry for the inconvenience.
      </div>
    );
  }

  renderContent() {
    const { installationId } = this.props;
    const { error, success, authCode } = this.state;
    const signedIn = !!authCode;

    if (error) return this.renderError(error);
    if (success) return this.renderSuccess();
    if (!installationId) return this.renderNoInstallation();

    return signedIn ? this.renderSignedIn() : this.renderSignedOut();
  }

  render() {
    return (
      <div className="main">
        <div className="text-center">
          <img
            src="/logo.svg"
            alt="Browserslist-GA logo"
            className="my-4"
            draggable={false}
            style={{ maxWidth: 520 }}
          />

          <p className="f2-light mb-4" style={{ fontSize: 16 }}>
            Thank you. You're almost done!
          </p>
        </div>

        <div className="Box">
          <div className="Box-header">
            <h2 className="Box-title">
              <ToolsIcon width={11} height={11} style={{ marginRight: 4 }} /> Configure your
              installation
            </h2>
          </div>
          {this.renderContent()}
        </div>
      </div>
    );
  }
}

Setup.propTypes = {
  action: PropTypes.string.isRequired,
  checkAvailabilityPath: PropTypes.string.isRequired,
  csrfToken: PropTypes.string.isRequired,
  installationId: PropTypes.string.isRequired,
  gaClientId: PropTypes.string.isRequired,
  gaScope: PropTypes.string.isRequired,
  gaDatePeriods: PropTypes.array.isRequired,
};

export default Setup;
