import { SURVEY_CREATE_EDIT_START, SURVEY_CREATE_EDIT_SUCCESS, SURVEY_CREATE_EDIT_FAILURE, SURVEY_CREATE_EDIT_RESET } from './actionTypes';
import axios from '../../axios-instance';

export const createSurvey = (title, questions, token) => {
  const payload = {
    title: title,
    questions: questions
  };
  const config = {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  };
  return function(dispatch){
    dispatch(surveyCreateEditStart());
    axios.post(`survey`, payload, config)
      .then(response => {
        dispatch(surveyCreateEditSuccess(response.data.id));
      }).catch(error => {
        dispatch(surveyCreateEditFailure(error));
      });
  };
};

export const editSurvey = (id, title, questions, token) => {
  const payload = {
    title: title,
    questions: questions
  };
  const config = {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  };
  return function(dispatch){
    dispatch(surveyCreateEditStart());
    axios.post(`survey/${id}`, payload, config)
      .then(_ => {
        dispatch(surveyCreateEditSuccess(id));
      }).catch(error => {
        dispatch(surveyCreateEditFailure(error));
      });
  };
};

export const surveyCreateEditStart = () => {
  return {
    type: SURVEY_CREATE_EDIT_START
  };
};

export const surveyCreateEditSuccess = id => {
  return {
    type: SURVEY_CREATE_EDIT_SUCCESS,
    id: id
  };
};

export const surveyCreateEditFailure = error => {
  return {
    type: SURVEY_CREATE_EDIT_FAILURE,
    error: error
  };
};

export const surveyCreateEditReset = () => {
  return {
    type: SURVEY_CREATE_EDIT_RESET
  };
};