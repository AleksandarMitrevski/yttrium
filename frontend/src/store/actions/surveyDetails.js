import { SURVEY_DETAILS_START, SURVEY_DETAILS_SUCCESS, SURVEY_DETAILS_FAILURE, SURVEY_DETAILS_RESET } from './actionTypes';
import axios from '../../axios-instance';

export const fetchSurveyData = (id, token) => {
  const config = {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  };
  return function(dispatch){
    dispatch(surveyDetailsStart());
    axios.get(`survey/${id}`, config)
      .then(response => {
        dispatch(surveyDetailsSuccess(response.data));
      }).catch(error => {
        dispatch(surveyDetailsFailure(error));
      });
  };
};

export const surveyDetailsStart = () => {
  return {
    type: SURVEY_DETAILS_START
  };
};

export const surveyDetailsSuccess = data => {
  return {
    type: SURVEY_DETAILS_SUCCESS,
    data: data
  };
};

export const surveyDetailsFailure = error => {
  return {
    type: SURVEY_DETAILS_FAILURE,
    error: error
  };
};

export const surveyDetailsReset = () => {
  return {
    type: SURVEY_DETAILS_RESET
  };
};