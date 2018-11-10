import React, { Component } from 'react';
import { BrowserRouter, Switch, Route, NavLink } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute'; 
import Surveys from './containers/surveys/Surveys';
import Login from './containers/login/Login';
import Settings from './containers/settings/Settings';
import SurveyView from './containers/survey-view/SurveyView';
import SurveyTake from './containers/survey-take/SurveyTake';
import Response from './containers/response/Response';
import SurveyCreate from './containers/survey-create/SurveyCreate';
import './App.css';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div className="App">
          <h1 className="App-title"><NavLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Yttrium</NavLink></h1>
          <Switch>
            <Route exact path="/login" component={Login} />
            <PrivateRoute exact path="/settings" component={Settings} />
            <PrivateRoute exact path="/create/:id?" component={SurveyCreate} />
            <PrivateRoute exact path="/survey/:id" component={SurveyView} />
            <PrivateRoute exact path="/take/:id" component={SurveyTake} />
            <PrivateRoute exact path="/response/:id" component={Response} />
            <PrivateRoute path="/" component={Surveys} />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
