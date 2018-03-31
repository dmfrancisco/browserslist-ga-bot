import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { DebounceInput } from "react-debounce-input";

import { AlertIcon, CheckIcon } from "./Icons";

class RepoInput extends React.Component {
  static defaultProps = {
    valid: false,
  };

  state = {
    loading: false,
  };

  handleChange = e => {
    const value = e.target.value;

    this.setState({ loading: true });
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.setState({ loading: false }), 2000);
    this.props.onChange(null);

    const regex = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}\/([-_.\w]+)$/i;
    if (!regex.test(value)) return false;

    const body = JSON.stringify({
      installation_id: this.props.installationId,
      repo: value,
    });

    fetch(this.props.checkAvailabilityPath, {
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
          return console.error(data.error.message);
        }
        if (data.available) {
          this.props.onChange(value);
        }
      })
      .catch(error => {
        console.error(error.message);
      });
  };

  render() {
    const { checkAvailabilityPath, csrfToken, installationId, valid, ...otherProps } = this.props;
    const { loading } = this.state;

    return (
      <Fragment>
        <DebounceInput
          {...otherProps}
          type="text"
          onChange={this.handleChange}
          style={{ marginRight: 0, paddingRight: 32 }}
        />
        {valid ? (
          <CheckIcon style={{ verticalAlign: "text-bottom", fill: "#28a745", marginLeft: -24 }} />
        ) : (
          !loading && (
            <span
              className="tooltipped tooltipped-s"
              aria-label="Repository not found or unauthorized"
              style={{ marginLeft: -24 }}
            >
              <AlertIcon style={{ verticalAlign: "text-bottom", fill: "#f66a0a" }} />
            </span>
          )
        )}
      </Fragment>
    );
  }
}

RepoInput.propTypes = {
  checkAvailabilityPath: PropTypes.string.isRequired,
  csrfToken: PropTypes.string.isRequired,
  installationId: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  valid: PropTypes.bool,
};

export default RepoInput;
