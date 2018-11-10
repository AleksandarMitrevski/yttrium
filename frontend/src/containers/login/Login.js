import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { login, register, resetErrors } from '../../store/actions/user';
import styles from './Login.module.css';

class Login extends Component {

  state = {
    mode: 'login',
    errors: [], // these are pre-request validation errors, any HTTP errors are received from Redux

    loginUsernameValue: '',
    loginPasswordValue: '',
    loginRememberMeChecked: false,
    registerUsernameValue: '',
    registerPasswordValue: '',
    registerPasswordRepeatValue: ''
  };

  validateLogin = () => {
    let errors = [];
    if(this.state.loginUsernameValue.length === 0){
      errors.push("Username can not be empty.");
    }
    if(this.state.loginPasswordValue.length === 0){
      errors.push("Password can not be empty.");
    }
    this.setState({
      errors: errors
    });
    return errors.length === 0;
  }

  onLoginLoginClick = event => {
    event.preventDefault();
    if(this.validateLogin() && !this.props.user.authLoading)
      this.props.onLogin(this.state.loginUsernameValue, this.state.loginPasswordValue, this.state.loginRememberMeChecked);
  }

  validateRegister = () => {
    let errors = [];
    if(this.state.registerUsernameValue.length === 0){
      errors.push("Username can not be empty.");
    }
    if(this.state.registerPasswordValue.length === 0){
      errors.push("Password can not be empty.");
    }else if(this.state.registerPasswordValue !== this.state.registerPasswordRepeatValue){
      errors.push("Passwords do not match.");
    }
    this.setState({
      errors: errors
    });
    return errors.length === 0;
  }

  onLoginRegisterClick = event => {
    event.preventDefault();
    this.props.onResetErrors();
    this.setState({ mode: 'register', errors: [] });
  }

  onRegisterLoginClick = event => {
    event.preventDefault();
    this.props.onResetErrors();
    this.setState({ mode: 'login', errors: [] });
  }

  onRegisterRegisterClick = event => {
    event.preventDefault();
    if(this.validateRegister() && !this.props.user.authLoading)
      this.props.onRegister(this.state.registerUsernameValue, this.state.registerPasswordValue);
  }

  updateLoginUsernameValue = event => {
    this.setState({
      loginUsernameValue: event.target.value
    });
  }

  updateLoginPasswordValue = event => {
    this.setState({
      loginPasswordValue: event.target.value
    });
  }

  updateLoginRememberMeChecked = event => {
    this.setState({
      loginRememberMeChecked: event.target.checked
    });
  }

  toggleLoginRememberMe = () => {
    this.setState({ loginRememberMeChecked: !this.state.loginRememberMeChecked })
  }

  updateRegisterUsernameValue = event => {
    this.setState({
      registerUsernameValue: event.target.value
    });
  }

  updateRegisterPasswordValue = event => {
    this.setState({
      registerPasswordValue: event.target.value
    });
  }

  updateRegisterPasswordRepeatValue = event => {
    this.setState({
      registerPasswordRepeatValue: event.target.value
    });
  }

  onFormKeyPress = event => {
    if(event.keyCode === 13){
      if(this.state.mode === 'login'){
        this.onLoginLoginClick();
      }else{
        this.onRegisterRegisterClick();
      }
    }
  }
  
  render() {
    let html;
    let errors = this.state.errors.slice(0);
    let requestError = this.props.user.authError;
    if(requestError){
      if(requestError.response){
        if(requestError.response.data.length > 0){
          errors.push(requestError.response.data);
        }else{
          errors.push("error status code " + requestError.response.status);
        }
      }else{
        errors.push(requestError.message);
      }
    }
    if(!this.props.user.isAuthenticated){
      // there are much better ways to create validated forms with React, I'm opting for the simplest, quickest option here
      if(this.state.mode === 'login'){
        html = (
          <form className={styles.Container} onKeyPress={this.onFormKeyPress}>
            <input className={styles.Input} type="text" name="login-username" placeholder="Username" value={this.state.loginUsernameValue} onChange={this.updateLoginUsernameValue} />
            <input className={styles.Input} type="password" name="login-password" placeholder="Password" value={this.state.loginPasswordValue} onChange={this.updateLoginPasswordValue} />
            <div className={styles.RememberMe}>
              <input className={styles.InputCheckbox} type="checkbox" name="login-remember-me" checked={this.state.loginRememberMeChecked} onChange={this.updateLoginRememberMeChecked} /><label htmlFor="input-remember-me" className={styles.InputLabel} onClick={this.toggleLoginRememberMe}>Remember me</label>
            </div>
            <div className={styles.Errors}>
            { errors.map((error, index) => {
                return <div className={styles.Error} key={index}>{error}</div>
              }) }
            </div>
            <div className={styles.Controls}>
              <button className={styles.Button} onClick={this.onLoginLoginClick}>Login</button>
              <button className={styles.ButtonRight} onClick={this.onLoginRegisterClick}>Register</button>
            </div>
          </form>
        );
      }else{
        html = (
          <form className={styles.Container} onKeyPress={this.onFormKeyPress}>
            <input className={styles.Input} type="text" name="register-username" placeholder="Username" value={this.state.registerUsernameValue} onChange={this.updateRegisterUsernameValue} />
            <input className={styles.Input} type="password" name="register-password" placeholder="Password" value={this.state.registerPasswordValue} onChange={this.updateRegisterPasswordValue} />
            <input className={styles.Input} type="password" name="register-password-repeat" placeholder="Password (repeat)" value={this.state.registerPasswordRepeatValue} onChange={this.updateRegisterPasswordRepeatValue} />
            <div className={styles.Errors}>
            { errors.map((error, index) => {
                return <div className={styles.Error} key={index}>{error}</div>
              }) }
            </div>
            <div className={styles.Controls}>
              <button className={styles.Button} onClick={this.onRegisterRegisterClick}>Register</button>
              <button className={styles.ButtonRight} onClick={this.onRegisterLoginClick}>Login</button>
            </div>
          </form>
        );
      }
    }else{
      html = <Redirect to="/" />
    }
    return html;
  }

  componentWillUnmount() {
    this.props.onResetErrors();
  }
}

const mapStateToProps = state => {
  return {
    user: state.user
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLogin: (username, password, rememberMe) => dispatch(login(username, password, rememberMe)),
    onRegister: (username, password) => dispatch(register(username, password)),
    onResetErrors: () => dispatch(resetErrors())
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
