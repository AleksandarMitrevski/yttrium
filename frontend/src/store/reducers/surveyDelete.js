import * as actionTypes from '../actions/actionTypes';

const initialState = {
  deleted: null,
  loading: false,
  error: null
};

const reducer = (state = initialState, action) => {
  switch(action.type){
    case actionTypes.SURVEY_DELETE_START: return surveyDeleteStart(state, action);
    case actionTypes.SURVEY_DELETE_SUCCESS: return surveyDeleteSuccess(state, action);
    case actionTypes.SURVEY_DELETE_FAILURE: return surveyDeleteFailure(state, action);
    case actionTypes.SURVEY_DELETE_RESET: return surveyDeleteReset(state, action);
    default: return state;
  }
};

let surveyDeleteStart = (state, action) => {
  return {
    ...initialState,
    loading: true
  };
};

let surveyDeleteSuccess = (state, action) => {
  return {
    ...state,
    deleted: action.id,
    loading: false
  };
};

let surveyDeleteFailure = (state, action) => {
  return {
    ...state,
    loading: false,
    error: action.error
  };
};

let surveyDeleteReset = (state, action) => {
  return initialState;
}

export default reducer;