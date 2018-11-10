import { RESPONSE_DETAILS_START, RESPONSE_DETAILS_SUCCESS, RESPONSE_DETAILS_FAILURE, RESPONSE_DETAILS_RESET } from './actionTypes';
import axios from '../../axios-instance';

export const fetchResponseData = (id, token) => {
  const config = {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  };
  return function(dispatch){
    dispatch(responseDetailsStart());
    axios.get(`response/${id}`, config)
      .then(response => {
        dispatch(responseDetailsSuccess(response.data));
      }).catch(error => {
        dispatch(responseDetailsFailure(error));
      });
  };
};

export const responseDetailsStart = () => {
  return {
    type: RESPONSE_DETAILS_START
  };
};

export const responseDetailsSuccess = data => {
  return {
    type: RESPONSE_DETAILS_SUCCESS,
    data: data
  };
};

export const responseDetailsFailure = error => {
  return {
    type: RESPONSE_DETAILS_FAILURE,
    error: error
  };
};

export const responseDetailsReset = () => {
  return {
    type: RESPONSE_DETAILS_RESET
  };
};