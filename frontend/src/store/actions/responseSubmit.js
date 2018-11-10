import { RESPONSE_SUBMIT_START, RESPONSE_SUBMIT_SUCCESS, RESPONSE_SUBMIT_FAILURE, RESPONSE_SUBMIT_RESET } from './actionTypes';
import axios from '../../axios-instance';

export const submitResponse = (surveyId, answers, token) => {
  const payload = {
    answers: answers
  };
  const config = {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  };
  return function(dispatch){
    dispatch(responseSubmitStart());
    axios.post(`response/${surveyId}`, payload, config)
      .then(_ => {
        dispatch(responseSubmitSuccess());
      }).catch(error => {
        dispatch(responseSubmitFailure(error));
      });
  };
};

export const responseSubmitStart = () => {
  return {
    type: RESPONSE_SUBMIT_START
  };
};

export const responseSubmitSuccess = id => {
  return {
    type: RESPONSE_SUBMIT_SUCCESS,
    id: id
  };
};

export const responseSubmitFailure = error => {
  return {
    type: RESPONSE_SUBMIT_FAILURE,
    error: error
  };
};

export const responseSubmitReset = () => {
  return {
    type: RESPONSE_SUBMIT_RESET
  };
};