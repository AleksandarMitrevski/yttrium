import React, { Component } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

class PrivateRoute extends Component {
  render() {
    return this.props.user.isAuthenticated ?
      <Route exact={this.props.exact} path={this.props.path} component={this.props.component} /> :
      <Redirect to="/login" />;
  }
}

const mapStateToProps = state => {
  return {
    user: state.user
  };
};

export default connect(mapStateToProps)(PrivateRoute);