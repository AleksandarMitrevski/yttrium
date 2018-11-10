import * as actionTypes from '../actions/actionTypes';

const initialState = {
  hasFetchHappened: false,
  loading: false,
  error: null,
  filter: null,
  itemsPerPage: 0,
  totalItems: 0,
  page: 0,
  surveys: []
};

const reducer = (state = initialState, action) => {
  switch(action.type){
    case actionTypes.SURVEY_LIST_START: return surveyListStart(state, action);
    case actionTypes.SURVEY_LIST_SUCCESS: return surveyListSuccess(state, action);
    case actionTypes.SURVEY_LIST_FAILURE: return surveyListFailure(state, action);
    case actionTypes.SURVEY_LIST_RESET: return surveyListReset(state, action);
    default: return state;
  }
};

let surveyListStart = (state, action) => {
  let newState = {
    ...state,
    loading: true,
    error: null,
    filter: action.filter,
    itemsPerPage: action.itemsPerPage,
    page: action.page
  };
  if(state.filter !== action.filter || state.itemsPerPage !== action.itemsPerPage){
    newState.hasFetchHappened = false;
    newState.surveys = [];
  }
  return newState;
};

let surveyListSuccess = (state, action) => {
  return {
    ...state,
    hasFetchHappened: true,
    loading: false,
    surveys: state.surveys.concat(action.data),
    totalItems: action.totalItems
  };
};

let surveyListFailure = (state, action) => {
  return {
    ...state,
    hasFetchHappened: true,
    loading: false,
    error: action.error
  };
};

let surveyListReset = (state, action) => {
  return initialState;
}

export default reducer;