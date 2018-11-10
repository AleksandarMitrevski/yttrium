import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import Transition from 'react-transition-group/Transition';
import InfiniteScroll from "react-infinite-scroll-component";
import 'font-awesome/css/font-awesome.min.css';
import { authLogout } from '../../store/actions/user';
import { fetchSurveyData, surveyListReset } from '../../store/actions/surveys';
import styles from './Surveys.module.css';

const SURVEYS_PER_PAGE = 20;
const ANIMATION_DURATION = 100; // in milliseconds; animations overlap time-wise as this is less than transition duration value specified in CSS file

class Surveys extends Component {

  state = {
    animateSurveys: []
  };

  static getDerivedStateFromProps(props, state) {
    let newState = {
      ...state
    };
    if(props.surveys.surveys.length !== state.animateSurveys.length){
      for(let i = 0, length = props.surveys.surveys.length - state.animateSurveys.length; i < length; ++i){
        newState.animateSurveys.push(false);
      }
    }
    return newState;
  }

  // animate surveys fade-in
  fadeInSurveys = () => {
    for(let i = 0, animateSurveys = this.state.animateSurveys, length = animateSurveys.length; i < length; ++i){
      if(!animateSurveys[i]){
        setTimeout(() => {
          let newState = {
            ...this.state
          };
          newState.animateSurveys[i] = true;
          this.setState(newState);
        }, ANIMATION_DURATION);
        break;
      }
    }
  }

  componentDidMount() {
    if(!this.props.surveys.hasFetchHappened || this.props.surveys.error){
	    if(this.props.surveys.error && this.props.surveys.error.status === 401){
        this.props.onLogout();
	    }else{
        this.props.onFetchSurveys(this.props.surveys.filter, 1, this.props.user.authToken);
	    }
    }
    this.fadeInSurveys();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if(this.props.surveys.error && this.props.surveys.error.status === 401){
      this.props.onLogout();
    }else{
      this.fadeInSurveys();
    }
  }

  onFilterCreatedByUserClick = () => {
    if(this.props.surveys.filter !== "created"){
      this.setState({
        animateSurveys: []
      });
      this.props.onSelectFilterCreated(this.props.user.authToken);
    }
  }

  onFilterTakenByUserClick = () => {
    if(this.props.surveys.filter !== "taken"){
      this.setState({
        animateSurveys: []
      });
      this.props.onSelectFilterTaken(this.props.user.authToken);
    }
  }

  onFilterNoneClick = () => {
    if(this.props.surveys.filter){
      this.setState({
        animateSurveys: []
      });
      this.props.onSelectFilterNone(this.props.user.authToken);
    }
  }

  onSurveyClick = index => {
    this.props.history.push("/survey/" + this.props.surveys.surveys[index]._id);
  }

  hasNextSurveysPage = () => {
    return this.props.surveys.surveys.length < this.props.surveys.totalItems;
  }

  onScrollbarPaginationEvent = () => {
    if(!this.props.surveys.loading){
      this.props.onFetchSurveys(this.props.surveys.filter, this.props.surveys.page + 1, this.props.user.authToken);
    }
  }

  componentWillUnmount() {
    this.props.onUnmount();
  }

  render() {
    // filters
    let isFilterCreatedByMeActive = this.props.surveys.filter === 'created';
    let isFilterTakenByMeActive = this.props.surveys.filter === 'taken';
    let isNoFilter = !this.props.surveys.filter;

    // surveys
    let surveyHtml;
    if(this.props.surveys.surveys.length > 0){
      surveyHtml = (
        <div className={styles.SurveyContainer}>
        {
          this.props.surveys.surveys.map((el, index) => {
            return (
              <Transition mountOnEnter in={this.state.animateSurveys[index]} timeout={ANIMATION_DURATION} key={ index }>
              { state => {
                return (
                  <div className={styles.Survey} style={{
                    opacity: (state === 'entered' ? 1 : 0)
                  }} onClick={this.onSurveyClick.bind(this, index)}>
                    <div>
                      <span>{ el.title }</span>
                    </div>
                  </div>
                );
              }}
              </Transition>
            );  
          })
        }
          { /* using this component as a way of catching scrollbar event for pagination, this is not correct usage according to the documentation */ }
          <InfiniteScroll
            next={ this.onScrollbarPaginationEvent }
            hasMore={ this.hasNextSurveysPage() }
            style={{ marginTop: "5px", textAlign: "center", overflow: "hidden" }}
          />
        </div>
      );
    }else if(!this.props.surveys.error && !this.props.surveys.loading){
      surveyHtml = <div className={styles.SurveyContainerCenter}>No surveys.</div>;
    }

    // loading indicator and errors
    let loadingIndicator = '';
    let errorIndicator = '';
    if(this.props.surveys.loading){
      let marginTop = this.props.surveys.page > 1 ? "-5px" : "15px";
      loadingIndicator = <div className={styles.LoadingIndicator} style={{ marginTop: marginTop }}><i className="fa fa-spinner fa-spin" /></div>;
    }else if(this.props.surveys.error){
      let error = this.props.surveys.error;
      let errorMessage;
      if(error.response){
        if(error.response.data.length > 0){
          errorMessage = error.response.data;
        }else{
          errorMessage = "error status code " + error.response.status;
        }
      }else{
        errorMessage = error.message;
      }
      errorIndicator = <div className={styles.Errors}>{ errorMessage }</div>;
    }

    return (
	    <div className={styles.Container}>
        <div className={styles.Navigation}>
          <div className={styles.NavigationLeft}>
            <span className={isFilterCreatedByMeActive ? styles.FilterLinkActive : styles.FilterLink} onClick={this.onFilterCreatedByUserClick}>Created by me</span>&nbsp;|&nbsp;
            <span className={isFilterTakenByMeActive ? styles.FilterLinkActive : styles.FilterLink} onClick={this.onFilterTakenByUserClick}>Taken by me</span>&nbsp;|&nbsp;
            <span className={isNoFilter ? styles.FilterLinkActive : styles.FilterLink} onClick={this.onFilterNoneClick}>All</span>
          </div>
          <div className={styles.NavigationRight}>
            <NavLink className={styles.SpanLink} to="/create">Make Survey</NavLink>&nbsp;|&nbsp;
            <NavLink className={styles.SpanLink} to="/settings">Settings</NavLink>&nbsp;|&nbsp;
            <span className={styles.SpanLink} onClick={this.props.onLogout}>Logout</span>
          </div>
        </div>
        <div className={styles.Body}>
          { surveyHtml }
          { loadingIndicator }
          { errorIndicator }
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    surveys: state.surveys
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLogout: () => dispatch(authLogout()),

    onSelectFilterCreated: token => dispatch(fetchSurveyData('created', SURVEYS_PER_PAGE, 1, token)),
    onSelectFilterTaken: token => dispatch(fetchSurveyData('taken', SURVEYS_PER_PAGE, 1, token)),
    onSelectFilterNone: token => dispatch(fetchSurveyData(null, SURVEYS_PER_PAGE, 1, token)),
    onFetchSurveys: (filter, page, token) => dispatch(fetchSurveyData(filter, SURVEYS_PER_PAGE, page, token)),
    onUnmount: () => dispatch(surveyListReset())
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Surveys);
