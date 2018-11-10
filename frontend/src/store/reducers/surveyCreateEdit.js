import * as actionTypes from '../actions/actionTypes';

const initialState = {
  executed: null,
  loading: false,
  error: null
};

const reducer = (state = initialState, action) => {
  switch(action.type){
    case actionTypes.SURVEY_CREATE_EDIT_START: return surveyCreateEditStart(state, action);
    case actionTypes.SURVEY_CREATE_EDIT_SUCCESS: return surveyCreateEditSuccess(state, action);
    case actionTypes.SURVEY_CREATE_EDIT_FAILURE: return surveyCreateEditFailure(state, action);
    case actionTypes.SURVEY_CREATE_EDIT_RESET: return surveyCreateEditReset(state, action);
    default: return state;
  }
};

let surveyCreateEditStart = (state, action) => {
  return {
    ...initialState,
    loading: true
  };
};

let surveyCreateEditSuccess = (state, action) => {
  return {
    ...state,
    executed: action.id,
    loading: false
  };
};

let surveyCreateEditFailure = (state, action) => {
  return {
    ...state,
    loading: false,
    error: action.error
  };
};

let surveyCreateEditReset = (state, action) => {
  return initialState;
}

export default reducer;