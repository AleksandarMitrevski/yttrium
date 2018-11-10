import * as actionTypes from '../actions/actionTypes';

const initialState = {
  loading: false,
  error: null,
  response: null
};

const reducer = (state = initialState, action) => {
  switch(action.type){
    case actionTypes.RESPONSE_DETAILS_START: return responseDetailsStart(state, action);
    case actionTypes.RESPONSE_DETAILS_SUCCESS: return responseDetailsSuccess(state, action);
    case actionTypes.RESPONSE_DETAILS_FAILURE: return responseDetailsFailure(state, action);
    case actionTypes.RESPONSE_DETAILS_RESET: return responseDetailsReset(state, action);
    default: return state;
  }
};

let responseDetailsStart = (state, action) => {
  return {
    ...initialState,
    loading: true
  };
};

let responseDetailsSuccess = (state, action) => {
  return {
    ...state,
    loading: false,
    response: action.data
  };
};

let responseDetailsFailure = (state, action) => {
  return {
    ...state,
    loading: false,
    error: action.error
  };
};

let responseDetailsReset = (state, action) => {
  return initialState;
}

export default reducer;