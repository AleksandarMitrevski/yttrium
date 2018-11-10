import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { authLogout, changeUsername, changePassword, resetUsername, resetPassword } from '../../store/actions/user';
import styles from './Settings.module.css';

class Settings extends Component {
  state = {
    usernameErrors: [], // these are pre-request validation errors, any HTTP errors are received from Redux
    passwordErrors: [],

    usernameValue: this.props.user.authUsername,
    passwordValue: '',
    passwordRepeatValue: ''
  };

  componentDidUpdate() {
    if((this.props.user.usernameError && this.props.user.usernameError.status === 401) || (this.props.user.passwordError && this.props.user.passwordError.status === 401)){
      this.props.onLogout();
    }
  }

  validateUsername = () => {
    let errors = [];
    if(this.state.usernameValue.length === 0){
      errors.push("Username can not be empty.");
    }else if(this.state.usernameValue === this.props.user.authUsername){
      errors.push("Username is identical to current.");
    }
    this.setState({
      usernameErrors: errors
    });
    return errors.length === 0;
  }

  onChangeUsernameClick = event => {
    event.preventDefault();
    if(this.validateUsername() && !this.props.settingsUsernameLoading)
      this.props.onChangeUsername(this.props.user.authToken, this.state.usernameValue);
  }

  validatePassword = () => {
    let errors = [];
    if(this.state.passwordValue.length === 0){
      errors.push("Password can not be empty.");
    }else if(this.state.passwordValue !== this.state.passwordRepeatValue){
      errors.push("Passwords do not match.");
    }
    this.setState({
      passwordErrors: errors
    });
    return errors.length === 0;
  }

  onChangePasswordClick = event => {
    event.preventDefault();
    if(this.validatePassword() && !this.props.settingsPasswordLoading)
      this.props.onChangePassword(this.props.user.authToken, this.state.passwordValue);
  }

  updateUsernameValue = event => {
    this.setState({
      usernameValue: event.target.value
    });
  }

  updatePasswordValue = event => {
    this.setState({
      passwordValue: event.target.value
    });
  }

  updatePasswordRepeatValue = event => {
    this.setState({
      passwordRepeatValue: event.target.value
    });
  }

  onChangeUsernameKeyPress = event => {
    if(event.keyCode === 13){
      this.onChangeUsernameClick();
    }
  }

  onChangePasswordKeyPress = event => {
    if(event.keyCode === 13){
      this.onChangePasswordClick();
    }
  }

  render() {
    let usernameErrors = this.state.usernameErrors.slice(0);
    let requestUsernameError = this.props.user.usernameError;
    if(requestUsernameError){
      if(requestUsernameError.response.data.length > 0){
        usernameErrors.push(requestUsernameError.response.data);
      }else{
        usernameErrors.push("error status code " + requestUsernameError.response.status);
      }
    }
    let passwordErrors = this.state.passwordErrors.slice(0);
    let requestPasswordError = this.props.user.passwordError;
    if(requestPasswordError){
      if(requestPasswordError.response.data.length > 0){
        passwordErrors.push(requestPasswordError.response.data);
      }else{
        passwordErrors.push("error status code " + requestPasswordError.response.status);
      }
    }

    let usernameSuccess;
    if(this.props.user.hasUsernameChanged){
      usernameSuccess = <div className={styles.Success}>Changed.</div>
    }
    let passwordSuccess;
    if(this.props.user.hasPasswordChanged){
      passwordSuccess = <div className={styles.Success}>Changed.</div>
    }

    return (
      <div className={styles.Container}>
        <div className={styles.Navigation}>
          <div className={styles.NavigationLeft}>
            <NavLink className={styles.SpanLink} to="/">Surveys</NavLink>&nbsp;|&nbsp;
            <NavLink className={styles.SpanLink} to="/create">Make survey</NavLink>
          </div>
          <div className={styles.NavigationRight}>
            <NavLink className={styles.SpanLink} to="/settings">Settings</NavLink>&nbsp;|&nbsp;
            <span className={styles.SpanLink} onClick={this.props.onLogout}>Logout</span>
          </div>
        </div>
        <div className={styles.Body}>
          <form className={styles.Form} onKeyPress={this.onChangeUsernameKeyPress}>
            <h2 className={styles.Header}>Change Username</h2>
            <input className={styles.Input} type="text" name="change-username" placeholder="Username" value={this.state.usernameValue} onChange={this.updateUsernameValue} />
            <div className={styles.Errors}>
            { usernameErrors.map((error, index) => {
              return <div className={styles.Error} key={index}>{error}</div>
              }) }
            </div>
            { usernameSuccess }
            <button className={styles.Button} onClick={this.onChangeUsernameClick}>Change</button>
          </form>
          <form className={styles.Form} onKeyPress={this.onChangePasswordKeyPress}>
            <h2 className={styles.Header}>Change Password</h2>
            <input className={styles.Input} type="password" name="change-password" placeholder="Password" value={this.state.passwordValue} onChange={this.updatePasswordValue} />
            <input className={styles.Input} type="password" name="change-password-repeat" placeholder="Password (repeat)" value={this.state.passwordRepeatValue} onChange={this.updatePasswordRepeatValue} />
            <div className={styles.Errors}>
            { passwordErrors.map((error, index) => {
              return <div className={styles.Error} key={index}>{error}</div>
              }) }
            </div>
            { passwordSuccess }
            <button className={styles.Button} onClick={this.onChangePasswordClick}>Change</button>
          </form>
        </div>
      </div>
    );
  }

  componentWillUnmount() {
    this.props.onResetUsername();
    this.props.onResetPassword();
  }
}

const mapStateToProps = state => {
  return {
    user: state.user
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLogout: () => dispatch(authLogout()),
    onChangeUsername: (token, newUsername) => dispatch(changeUsername(token, newUsername)),
    onChangePassword: (token, newPassword) => dispatch(changePassword(token, newPassword)),
    onResetUsername: () => dispatch(resetUsername()),
    onResetPassword: () => dispatch(resetPassword())
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
  