import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { authLogout } from '../../store/actions/user';
import { fetchSurveyData, surveyDetailsReset } from '../../store/actions/surveyDetails';
import { deleteSurvey, surveyDeleteReset } from '../../store/actions/surveyDelete';
import styles from './SurveyView.module.css';

class SurveyView extends Component {
  
  constructor(props) {
    super(props);

    this.state = {
      error: null
    };

    if(!this.props.match.params.id || this.props.match.params.id.length === 0){
      this.state.error = "Invalid survey ID.";
    }
  }

  componentDidMount() {
    if(!this.state.error)
      this.props.onFetchSurveyData(this.props.match.params.id, this.props.user.authToken);
  }

  componentDidUpdate() {
    if((this.props.surveyDetails.error && this.props.surveyDetails.error.status === 401) || (this.props.surveyDelete.error && this.props.surveyDelete.error.status === 401)){
      this.props.onLogout();
    }
    if(this.props.surveyDetails.survey && this.props.surveyDelete.deleted === this.props.surveyDetails.survey._id){
      this.props.history.push("/");
    }
  }

  static formatDate(date) {
    let formatOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return date.toLocaleDateString(undefined, formatOptions);
  }

  onViewResponse = () => {
    this.props.history.push("/response/" + this.props.surveyDetails.survey.takenByUser);
  }

  onTakeSurvey = () => {
    this.props.history.push("/take/" + this.props.surveyDetails.survey._id);
  }

  onEditSurvey = () => {
    this.props.history.push("/create/" + this.props.surveyDetails.survey._id);
  }

  onDeleteSurvey = () => {
    // using window.confirm since react-confirm-alert does not look good here (even with custom UI) and creating a custom confirmation dialog is a bit out of scope
    if(window.confirm("Are you sure you want to delete the survey?") && !this.props.surveyDelete.loading){
      this.props.onSurveyDelete(this.props.surveyDetails.survey._id, this.props.user.authToken);
    }
  }

  render() {
    let error = this.state.error ? this.state.error : this.props.surveyDetails.error;
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
        errorMessage = this.state.error ? this.state.error : this.props.surveyDetails.error.message;
      }
      body = <div className={styles.Errors}>{ errorMessage }</div>;
    }else if(this.props.surveyDetails.loading || !this.props.surveyDetails.survey){
      body = <div className={styles.LoadingIndicator}><i className="fa fa-spinner fa-spin" /></div>;
    }else{
      let createdBy = this.props.surveyDetails.survey.createdByUser ? "you" : this.props.surveyDetails.survey.created_by.username;
      let createdOn = SurveyView.formatDate(new Date(this.props.surveyDetails.survey.timestamp));

      let responsesList;
      if(this.props.surveyDetails.survey.createdByUser && (this.props.surveyDetails.survey.responses.length > 1 || !this.props.surveyDetails.survey.takenByUser)){
        if(this.props.surveyDetails.survey.responses.length > 0){
          responsesList = <div className={styles.DataRow} style={{marginTop: "10px"}}>Taken by:&nbsp;
          {
            this.props.surveyDetails.survey.responses.map((el, index) => {
              let responsePage = "/response/" + el._id;
              let response = <NavLink className={styles.UserLink} to={responsePage}>{el.username}</NavLink>;
              return <span key={index}>{ response }{index !== this.props.surveyDetails.survey.responses.length - 1 ? ", " : "."}</span>;
            })
          }
          </div>;
        }else{
          responsesList = <div className={styles.DataRow} style={{marginTop: "10px"}}>Not taken yet.</div>
        }
      }

      let takeControl;
      if(this.props.surveyDetails.survey.takenByUser){
        if(!this.props.surveyDetails.survey.createdByUser || this.props.surveyDetails.survey.responses.length === 1){
          takeControl = (
            <div className={styles.ActionRow}>
              You have taken this survey. <span className={styles.BodyLink} onClick={this.onViewResponse}>View response</span>
            </div>
          );
        }else{
          takeControl = (
            <div className={styles.ActionRow}>You have taken this survey.</div>
          );
        }
      }else{
        takeControl = (
          <div className={styles.ActionRow}>
            <button className={styles.Button} onClick={this.onTakeSurvey}>Take survey</button>
          </div>
        );
      }

      let editDeleteControl;
      let deleteError;
      if(this.props.surveyDetails.survey.createdByUser && this.props.surveyDetails.survey.responses.length === 0){
        editDeleteControl = (
          <div className={styles.ActionRow}>
            <button className={styles.Button} onClick={this.onEditSurvey}>Edit survey</button>
            <button className={styles.Button} onClick={this.onDeleteSurvey}>Delete survey</button>
          </div>
        );
        
        if(this.props.surveyDelete.error){
          if(this.props.surveyDelete.error.response){
            if(this.props.surveyDelete.error.response.data.length > 0){
              errorMessage = this.props.surveyDelete.error.response.data;
            }else{
              errorMessage = "error status code " + this.props.surveyDelete.error.response.status;
            }
          }else{
            errorMessage = this.props.surveyDelete.error.message;
          }
          deleteError = <div className={styles.Errors}> { errorMessage }</div>;
        }
      }

      body = (
        <React.Fragment>
          <h2 className={styles.Header}>{ this.props.surveyDetails.survey.title }</h2>
          <div className={styles.DataRow}>Created by <span className={styles.HighlightedData}>{ createdBy }</span> on <span className={styles.HighlightedData}>{ createdOn }</span>.</div>
          <div className={styles.DataRow}><span className={styles.HighlightedData}>{this.props.surveyDetails.survey.questions.length}</span> questions</div>
          { responsesList }
          { editDeleteControl }
          { deleteError }
          { takeControl }
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
    surveyDetails: state.surveyDetails,
    surveyDelete: state.surveyDelete
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLogout: () => dispatch(authLogout()),
    onFetchSurveyData: (id, token) => dispatch(fetchSurveyData(id, token)),
    onSurveyDelete: (id, token) => dispatch(deleteSurvey(id, token)),
    onUnmount: () => {
      dispatch(surveyDetailsReset());
      dispatch(surveyDeleteReset());
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(SurveyView);