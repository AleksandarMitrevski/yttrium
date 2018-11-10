import { combineReducers } from 'redux';
import userReducer from './user';
import surveysReducer from './surveys';
import surveyDetailsReducer from './surveyDetails';
import surveyCreateEditReducer from './surveyCreateEdit';
import surveyDeleteReducer from './surveyDelete';
import responseDetailsReducer from './responseDetails';
import responseSubmitReducer from './responseSubmit';

const reducer = combineReducers({
  'user': userReducer,
  'surveys': surveysReducer,
  'surveyDetails': surveyDetailsReducer,
  'surveyCreateEdit': surveyCreateEditReducer,
  'surveyDelete': surveyDeleteReducer,
  'responseDetails': responseDetailsReducer,
  'responseSubmit': responseSubmitReducer
});

export default reducer;