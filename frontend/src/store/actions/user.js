import { AUTH_START, AUTH_SUCCESS, AUTH_FAILURE, AUTH_LOGOUT, AUTH_RESET, SETTINGS_CHANGE_USERNAME_START, SETTINGS_CHANGE_USERNAME_SUCCESS, SETTINGS_CHANGE_USERNAME_FAILURE, SETTINGS_CHANGE_USERNAME_RESET, SETTINGS_CHANGE_PASSWORD_START, SETTINGS_CHANGE_PASSWORD_SUCCESS, SETTINGS_CHANGE_PASSWORD_FAILURE, SETTINGS_CHANGE_PASSWORD_RESET } from './actionTypes';
import axios from '../../axios-instance';
import querystring from 'querystring';

export const login = (username, password, rememberMe) => {
  const requestBody = querystring.stringify({
    username: username,
    password: password,
    remember_me: rememberMe.toString()
  });
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
  return function(dispatch){
    dispatch(authStart());
    axios.post("user/login", requestBody, config)
      .then(response => {
        dispatch(authSuccess(response.data, username, rememberMe));
      }).catch(error => {
        dispatch(authFailure(error));
      });
  };
};

export const register = (username, password) => {
  const requestBody = querystring.stringify({
    username: username,
    password: password
  });
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
  return function(dispatch){
    dispatch(authStart());
    axios.post("user/register", requestBody, config)
      .then(response => {
        dispatch(authSuccess(response.data));
      }).catch(error => {
        dispatch(authFailure(error));
      });
  };
};

export const resetErrors = () => {
  return {
    type: AUTH_RESET
  }
};

export const authStart = () => {
  return {
    type: AUTH_START
  }
};

export const authSuccess = (token, username, rememberMe) => {
  return {
    type: AUTH_SUCCESS,
    token: token,
    username: username,
    rememberMe: rememberMe
  };
};

export const authFailure = error => {
  return {
    type: AUTH_FAILURE,
    error: error
  };
};

export const authLogout = () => {
  return {
    type: AUTH_LOGOUT
  }
};

export const changeUsername = (token, newUsername) => {
  const requestBody = querystring.stringify({
    username: newUsername
  });
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Bearer ' + token
    }
  };
  return function(dispatch){
    dispatch(changeUsernameStart());
    axios.post("user/change-username", requestBody, config)
      .then(_ => {
        dispatch(changeUsernameSuccess(newUsername));
      }).catch(error => {
        dispatch(changeUsernameFailure(error));
      });
  };
};

export const changePassword = (token, newPassword) => {
  const requestBody = querystring.stringify({
    password: newPassword
  });
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Bearer ' + token
    }
  };
  return function(dispatch){
    dispatch(changePasswordStart());
    axios.post("user/change-password", requestBody, config)
      .then(_ => {
        dispatch(changePasswordSuccess());
      }).catch(error => {
        dispatch(changePasswordFailure(error));
      });
  };
};

export const resetUsername = () => {
  return {
    type: SETTINGS_CHANGE_USERNAME_RESET
  }
};

export const changeUsernameStart = () => {
  return {
    type: SETTINGS_CHANGE_USERNAME_START
  }
};

export const changeUsernameSuccess = newUsername => {
  return {
    type: SETTINGS_CHANGE_USERNAME_SUCCESS,
    username: newUsername
  };
};

export const changeUsernameFailure = error => {
  return {
    type: SETTINGS_CHANGE_USERNAME_FAILURE,
    error: error
  };
};

export const resetPassword = () => {
  return {
    type: SETTINGS_CHANGE_PASSWORD_RESET
  }
};

export const changePasswordStart = () => {
  return {
    type: SETTINGS_CHANGE_PASSWORD_START
  }
};

export const changePasswordSuccess = () => {
  return {
    type: SETTINGS_CHANGE_PASSWORD_SUCCESS
  };
};

export const changePasswordFailure = error => {
  return {
    type: SETTINGS_CHANGE_PASSWORD_FAILURE,
    error: error
  };
};