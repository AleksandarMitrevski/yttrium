import { SURVEY_LIST_START, SURVEY_LIST_SUCCESS, SURVEY_LIST_FAILURE, SURVEY_LIST_RESET } from './actionTypes';
import axios from '../../axios-instance';

export const fetchSurveyData = (filter, itemsPerPage, page, token) => {
  const config = {
    params: {
      page: page,
      itemsPerPage: itemsPerPage
    },
    headers: {
      'Authorization': 'Bearer ' + token
    }
  };
  if(filter){
    config.params.filter = filter;
  }
  return function(dispatch){
    dispatch(surveyListStart(filter, itemsPerPage, page));
    axios.get("survey", config)
      .then(response => {
        dispatch(surveyListSuccess(response.data.data, response.data.pagination.totalItems));
      }).catch(error => {
        dispatch(surveyListFailure(error));
      });
  };
};

export const surveyListStart = (filter, itemsPerPage, page) => {
  return {
    type: SURVEY_LIST_START,
    filter: filter,
    page: page,
    itemsPerPage: itemsPerPage
  };
};

export const surveyListSuccess = (data, totalItems) => {
  return {
    type: SURVEY_LIST_SUCCESS,
    data: data,
    totalItems: totalItems
  };
};

export const surveyListFailure = error => {
  return {
    type: SURVEY_LIST_FAILURE,
    error: error
  };
};

export const surveyListReset = () => {
  return {
    type: SURVEY_LIST_RESET
  };
};