import * as actionTypes from '../actions/actionTypes';

const initialState = {
  submitted: false,
  loading: false,
  error: null
};

const reducer = (state = initialState, action) => {
  switch(action.type){
    case actionTypes.RESPONSE_SUBMIT_START: return responseSubmitStart(state, action);
    case actionTypes.RESPONSE_SUBMIT_SUCCESS: return responseSubmitSuccess(state, action);
    case actionTypes.RESPONSE_SUBMIT_FAILURE: return responseSubmitFailure(state, action);
    case actionTypes.RESPONSE_SUBMIT_RESET: return responseSubmitReset(state, action);
    default: return state;
  }
};

let responseSubmitStart = (state, action) => {
  return {
    ...initialState,
    loading: true
  };
};

let responseSubmitSuccess = (state, action) => {
  return {
    ...state,
    submitted: true,
    loading: false
  };
};

let responseSubmitFailure = (state, action) => {
  return {
    ...state,
    loading: false,
    error: action.error
  };
};

let responseSubmitReset = (state, action) => {
  return initialState;
}

export default reducer;