import { SURVEY_DELETE_START, SURVEY_DELETE_SUCCESS, SURVEY_DELETE_FAILURE, SURVEY_DELETE_RESET } from './actionTypes';
import axios from '../../axios-instance';

export const deleteSurvey = (id, token) => {
  const config = {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  };
  return function(dispatch){
    dispatch(surveyDeleteStart());
    axios.delete(`survey/${id}`, config)
      .then(_ => {
        dispatch(surveyDeleteSuccess(id));
      }).catch(error => {
        dispatch(surveyDeleteFailure(error));
      });
  };
};

export const surveyDeleteStart = () => {
  return {
    type: SURVEY_DELETE_START
  };
};

export const surveyDeleteSuccess = id => {
  return {
    type: SURVEY_DELETE_SUCCESS,
    id: id
  };
};

export const surveyDeleteFailure = error => {
  return {
    type: SURVEY_DELETE_FAILURE,
    error: error
  };
};

export const surveyDeleteReset = () => {
  return {
    type: SURVEY_DELETE_RESET
  };
};