import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { authLogout } from '../../store/actions/user';
import { fetchResponseData, responseDetailsReset } from '../../store/actions/responseDetails';
import styles from './Response.module.css';

class Response extends Component {
  
  constructor(props) {
    super(props);

    this.state = {
      error: null
    };

    if(!this.props.match.params.id || this.props.match.params.id.length === 0){
      this.state.error = "Invalid response ID.";
    }
  }

  componentDidMount() {
    if(!this.state.error)
      this.props.onFetchResponseData(this.props.match.params.id, this.props.user.authToken);
  }

  componentDidUpdate() {
    if(this.props.responseDetails.error && this.props.responseDetails.error.status === 401){
      this.props.onLogout();
    }
  }

  static formatDate(date) {
    let formatOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return date.toLocaleDateString(undefined, formatOptions);
  }

  onBackToSurvey = () => {
    this.props.history.push("/survey/" + this.props.responseDetails.response.survey._id);
  }

  render() {
    let error = this.state.error ? this.state.error : this.props.responseDetails.error;
    let errorMessage;
    let body;
    if(error){
      if(error.response){
        if(error.response.data.length > 0){
          errorMessage = error.response.data;
        }else{
          errorMessage = "error status code " + error.response.status;
        }
      }else{
        errorMessage = this.state.error ? this.state.error : this.props.responseDetails.error.message;
      }
      body = <div className={styles.Errors}>{ errorMessage }</div>;
    }else if(this.props.responseDetails.loading || !this.props.responseDetails.response){
      body = <div className={styles.LoadingIndicator}><i className="fa fa-spinner fa-spin" /></div>;
    }else{
      let createdBy = this.props.responseDetails.response.made_by.username !== this.props.user.authUsername ? this.props.responseDetails.response.made_by.username : "you";
      let createdOn = Response.formatDate(new Date(this.props.responseDetails.response.timestamp));

      let questionResponsePairs = this.props.responseDetails.response.survey.questions.map((el, index) => {
        return {
          q: el.title,
          a: this.props.responseDetails.response.contents[index]
        };
      });
      body = (
        <React.Fragment>
          <h2 className={styles.Header}>{ this.props.responseDetails.response.survey.title }</h2>
          <div className={styles.DataRow}>Response made by <span className={styles.HighlightedData}>{ createdBy }</span> on <span className={styles.HighlightedData}>{ createdOn }</span>.</div>
          <div className={styles.ResponseContainer}>
          {
            questionResponsePairs.map((el, index) => {
              let answerDash = (el.a && el.a.length) > 0 ? "- " : "\u00A0";
              return (
                <div className={styles.QAPair} key={index}>
                  <table>
                    <tbody>
                      <tr>
                        <td className={styles.QuestionIndex}>{(index + 1).toString() + ". "}</td>
                        <td className={styles.Question}>{el.q}</td>
                      </tr>
                    </tbody>
                  </table>
                  <table>
                    <tbody>
                      <tr>
                        <td className={styles.AnswerDash}>{answerDash}</td>
                        <td className={styles.Answer}>{el.a}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })
          }
          </div>
          <div className={styles.LinkBackContainer} onClick={this.onBackToSurvey}><span className={styles.LinkBack}>&lt; Back to survey</span></div>
        </React.Fragment>
      );
    }

    return (
      <div className={styles.Container}>
        <div className={styles.Navigation}>
          <div className={styles.NavigationLeft}>
            <NavLink className={styles.SpanLink} to="/">Surveys</NavLink>&nbsp;|&nbsp;
            <NavLink className={styles.SpanLink} to="/create">Make survey</NavLink>
          </div>
          <div className={styles.NavigationRight}>
            <NavLink className={styles.SpanLink} to="/settings">Settings</NavLink>&nbsp;|&nbsp;
            <span className={styles.SpanLink} onClick={this.props.onLogout}>Logout</span>
          </div>
        </div>
        <div className={styles.Body}>
          { body }
        </div>
      </div>
    );
  }

  componentWillUnmount() {
    this.props.onUnmount();
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    responseDetails: state.responseDetails
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLogout: () => dispatch(authLogout()),
    onFetchResponseData: (id, token) => dispatch(fetchResponseData(id, token)),
    onUnmount: () => dispatch(responseDetailsReset())
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Response);