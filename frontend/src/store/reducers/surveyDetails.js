import * as actionTypes from '../actions/actionTypes';

const initialState = {
  loading: false,
  error: null,
  survey: null
};

const reducer = (state = initialState, action) => {
  switch(action.type){
    case actionTypes.SURVEY_DETAILS_START: return surveyDetailsStart(state, action);
    case actionTypes.SURVEY_DETAILS_SUCCESS: return surveyDetailsSuccess(state, action);
    case actionTypes.SURVEY_DETAILS_FAILURE: return surveyDetailsFailure(state, action);
    case actionTypes.SURVEY_DETAILS_RESET: return surveyDetailsReset(state, action);
    default: return state;
  }
};

let surveyDetailsStart = (state, action) => {
  return {
    ...initialState,
    loading: true
  };
};

let surveyDetailsSuccess = (state, action) => {
  return {
    ...state,
    loading: false,
    survey: action.data
  };
};

let surveyDetailsFailure = (state, action) => {
  return {
    ...state,
    loading: false,
    error: action.error
  };
};

let surveyDetailsReset = (state, action) => {
  return initialState;
}

export default reducer;