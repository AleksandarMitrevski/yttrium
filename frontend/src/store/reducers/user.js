import * as actionTypes from '../actions/actionTypes';

const initialState = {
  isAuthenticated: localStorage.getItem("token") && localStorage.getItem("token").length > 0,
  authLoading: false,
  authError: null,
  authToken: localStorage.getItem("token"),
  authUsername: localStorage.getItem("username"),

  settingsUsernameLoading: false,
  settingsUsernameError: null,
  hasUsernameChanged: false,
  settingsPasswordLoading: false,
  settingsPasswordError: null,
  hasPasswordChanged: false
};

let authStart = (state, action) => {
  return {
    ...state,
    authLoading: true
  };
};

let authSuccess = (state, action) => {
  if(action.rememberMe){
    localStorage.setItem("token", action.token);
    localStorage.setItem("username", action.username);
  }
  return {
    ...state,
    isAuthenticated: true,
    authLoading: false,
    authToken: action.token,
    authUsername: action.username,
  };
};

let authFailure = (state, action) => {
  return {
    ...state,
    authError: action.error,
    authLoading: false
  };
};

let authLogout = (state, action) => {
  localStorage.removeItem("token");
  return {
    ...state,
    isAuthenticated: false,
    authToken: null,
    authUsername: null
  };
}

let resetAuthErrors = (state, action) => {
  return {
    ...state,
    authError: null
  };
}

let usernameChangeStart = (state, action) => {
  return {
    ...state,
    settingsUsernameLoading: true,
    settingsUsernameError: false,
    hasUsernameChanged: false
  };
};

let usernameChangeSuccess = (state, action) => {
  return {
    ...state,
    settingsUsernameLoading: false,
    hasUsernameChanged: true,
    authUsername: action.username
  }
};

let usernameChangeFailure = (state, action) => {
  return {
    ...state,
    settingsUsernameLoading: false,
    settingsUsernameError: action.error
  }
};

let resetUsername = (state, action) => {
  return {
    ...state,
    hasUsernameChanged: false,
    settingsUsernameError: null
  }
}

let passwordChangeStart = (state, action) => {
  return {
    ...state,
    settingsPasswordLoading: true,
    settingsPasswordError: null,
    hasPasswordChanged: false
  };
};

let passwordChangeSuccess = (state, action) => {
  return {
    ...state,
    settingsPasswordLoading: false,
    hasPasswordChanged: true
  }
};

let passwordChangeFailure = (state, action) => {
  return {
    ...state,
    settingsPasswordLoading: false,
    settingsPasswordError: action.error
  }
};

let resetPassword = (state, action) => {
  return {
    ...state,
    hasPasswordChanged: false,
    settingsPasswordError: null
  }
}

const reducer = (state = initialState, action) => {
  switch(action.type){
    case actionTypes.AUTH_START: return authStart(state, action);
    case actionTypes.AUTH_SUCCESS: return authSuccess(state, action);
    case actionTypes.AUTH_FAILURE: return authFailure(state, action);
    case actionTypes.AUTH_LOGOUT: return authLogout(state, action);
    case actionTypes.AUTH_RESET: return resetAuthErrors(state, action);
    case actionTypes.SETTINGS_CHANGE_USERNAME_START: return usernameChangeStart(state, action);
    case actionTypes.SETTINGS_CHANGE_USERNAME_SUCCESS: return usernameChangeSuccess(state, action);
    case actionTypes.SETTINGS_CHANGE_USERNAME_FAILURE: return usernameChangeFailure(state, action);
    case actionTypes.SETTINGS_CHANGE_USERNAME_RESET: return resetUsername(state, action);
    case actionTypes.SETTINGS_CHANGE_PASSWORD_START: return passwordChangeStart(state, action);
    case actionTypes.SETTINGS_CHANGE_PASSWORD_SUCCESS: return passwordChangeSuccess(state, action);
    case actionTypes.SETTINGS_CHANGE_PASSWORD_FAILURE: return passwordChangeFailure(state, action);
    case actionTypes.SETTINGS_CHANGE_PASSWORD_RESET: return resetPassword(state, action);
    default: return state;
  }
};

export default reducer;