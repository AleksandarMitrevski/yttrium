import React, { Component } from 'react';
import { Prompt } from 'react-router';
import { NavLink } from 'react-router-dom';
import Transition from 'react-transition-group/Transition';
import { connect } from 'react-redux';
import { authLogout } from '../../store/actions/user';
import { fetchSurveyData, surveyDetailsReset } from '../../store/actions/surveyDetails';
import { submitResponse, responseSubmitReset } from '../../store/actions/responseSubmit';
import styles from './SurveyTake.module.css';

const ANIMATION_DURATION = 300; // this should be identical to what is set in the CSS file

class SurveyTake extends Component {
  state = {
    error: null,
    errorValidation: null,

    hasUserStartedAnswering: false,
    answers: null,
    currentQuestionIndex: 0,
    currentQuestionTextareaValue: '',
    currentQuestionSelectedOptionIndex: -1,

    animateQuestion: false,
    animateQuestionNextIndex: -1
  }

  constructor(props) {
    super(props);

    this.animationContainer = React.createRef();

    if(!this.props.match.params.id || this.props.match.params.id.length === 0){
      this.state.error = "Invalid survey ID.";
    }
  }

  static getDerivedStateFromProps(props, state) {
    if(props.surveyDetails.survey && !state.answers){
      return {
        ...state,
        answers: props.surveyDetails.survey.questions.map(el => {
          let answer = {};
          if(el.options.length > 0){
            answer.optionIndex = -1;
          }else{
            answer.text = "";            
          }
          return answer;
        })
      };
    }else{
      return null;
    }
  }

  componentDidMount() {
    if(!this.state.error)
      this.props.onFetchSurveyData(this.props.match.params.id, this.props.user.authToken);
  }

  componentDidUpdate() {
    if((this.props.surveyDetails.error && this.props.surveyDetails.error.status === 401) || (this.props.responseSubmit.error && this.props.responseSubmit.error.status === 401)){
      this.props.onLogout();
    }
    if(this.props.responseSubmit.submitted){
      this.props.history.push("/survey/" + this.props.surveyDetails.survey._id);
    }
  }

  onLogout = () => {
    if(this.state.hasUserStartedAnswering && window.confirm("Are you sure you want to navigate away? You will lose your progress.")){
      this.props.onLogout();
    }
  }

  onQuestionPaginationClick = index => {
    if(index !== this.state.currentQuestionIndex){
      this.setState({
        errorValidation: null,

        animateQuestion: true,
        animateQuestionNextIndex: index,
      });
    }
  }

  onPreviousQuestion = () => {
    if(this.state.currentQuestionIndex > 0){
      this.setState({
        errorValidation: null,

        animateQuestion: true,
        animateQuestionNextIndex: this.state.currentQuestionIndex - 1
      });
    }
  }

  onNextQuestion = () => {
    if(this.state.currentQuestionIndex < this.props.surveyDetails.survey.questions.length){
      this.setState({
        errorValidation: null,

        animateQuestion: true,
        animateQuestionNextIndex: this.state.currentQuestionIndex + 1
      });
    }
  }

  onQuestionTextareaChange = event => {
    this.setState({
      hasUserStartedAnswering: true,
      answers: this.storeCurrentAnswerInNewArray(event.target.value),
      currentQuestionTextareaValue: event.target.value
    });
  }

  onQuestionRadioClicked = index => {
    if(this.state.currentQuestionSelectedOptionIndex !== index){
      this.setState({
        hasUserStartedAnswering: true,
        answers: this.storeCurrentAnswerInNewArray(index),
        currentQuestionSelectedOptionIndex: index
      });
    }
  }

  storeCurrentAnswerInNewArray = answerValue => {
    let answers = this.state.answers.slice(0);
    let answer = {};
    if(this.props.surveyDetails.survey.questions[this.state.currentQuestionIndex].options.length > 0){
      answer.optionIndex = answerValue;
    }else{
      answer.text = answerValue;
    }
    answers[this.state.currentQuestionIndex] = answer;
    return answers;
  }

  onAnimationEntered = () => {
    let answer = this.state.answers[this.state.animateQuestionNextIndex];
    let textareaValue = "";
    if(answer.text !== undefined)
      textareaValue = answer.text;
    let optionIndex = -1;
    if(answer.optionIndex !== undefined)
      optionIndex = answer.optionIndex;

    this.setState({
      currentQuestionIndex: this.state.animateQuestionNextIndex,
      currentQuestionTextareaValue: textareaValue,
      currentQuestionSelectedOptionIndex: optionIndex,

      animateQuestion: false,
      animateQuestionDirection: null,
    });
  }

  onSubmitAnswers = () => {
    let firstEmptyAnswer = this.findEmptyAnswer();
    if(firstEmptyAnswer === -1 && !this.props.responseSubmit.loading){
      let answers = this.generateAnswersForSubmission();
      this.props.onResponseSubmit(this.props.surveyDetails.survey._id, answers, this.props.user.authToken);
    }else{
      this.onQuestionPaginationClick(firstEmptyAnswer);
      this.setState({
        errorValidation: "you have unanswered questions"
      });
    }
  }

  findEmptyAnswer = () => {
    for(let i = 0, length = this.state.answers.length; i < length; ++i){
      if(this.state.answers[i].optionIndex === -1){
        return i;
      }
    }
    return -1;
  }

  generateAnswersForSubmission = () => {
    return this.state.answers.map((el, index) => {
      if(el.optionIndex !== undefined){
        return this.props.surveyDetails.survey.questions[index].options[el.optionIndex];
      }else{
        return el.text;
      }
    });
  }

  render() {
    let body;
    let error = this.state.error ? this.state.error : this.props.surveyDetails.error;
    if(error){
      let errorMessage;
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
      let questionTitle = this.props.surveyDetails.survey.questions[this.state.currentQuestionIndex].title;
      let questionBody;
      let answerOptions = this.props.surveyDetails.survey.questions[this.state.currentQuestionIndex].options;
      if(answerOptions.length > 0){
        // radio buttons
        questionBody = answerOptions.map((el, index) => {
          let spanContainerClass;
          let spanClass;
          if(index !== this.state.currentQuestionSelectedOptionIndex){
            spanContainerClass = styles.SpanRadioContainer;
            spanClass = styles.SpanRadio;
          }else{
            spanContainerClass = styles.SpanRadioContainerActive;
            spanClass = styles.SpanRadioActive;
          }
          return (
            <span className={spanContainerClass} key={index} onClick={() => this.onQuestionRadioClicked(index)}>
              <span className={spanClass}></span>
              <span className={styles.SpanRadioText}>{ el }</span>
            </span>
          );
        });
      }else{
        // textarea
        questionBody = <textarea className={styles.Textarea} onChange={this.onQuestionTextareaChange} value={this.state.currentQuestionTextareaValue} />
      }

      let inlineErrorBody;
      let inlineError = this.state.errorValidation ? this.state.errorValidation : this.props.responseSubmit.error;
      if(inlineError){
        let inlineErrorMessage = "";
        if(inlineError.response){
          if(inlineError.response.data.length > 0){
            inlineErrorMessage = inlineError.response.data;
          }else{
            inlineErrorMessage = "error status code " + inlineError.response.status;
          }
        }else{
          inlineErrorMessage = this.state.errorValidation ? this.state.errorValidation : this.props.responseSubmit.error.message;
        }
        inlineErrorBody = (
          <span className={styles.ErrorsInline}>{ inlineErrorMessage }</span>
        );
      }

      let mainButtonClass;
      let mainButtonText;
      let mainButtonHandler;
      if(this.state.currentQuestionIndex !== this.props.surveyDetails.survey.questions.length - 1){
        mainButtonClass = styles.Button;
        mainButtonText = "Next";
        mainButtonHandler = this.onNextQuestion;
      }else{
        mainButtonClass = styles.ButtonHighlighted;
        mainButtonText = "Submit";
        mainButtonHandler = this.onSubmitAnswers;
      }
      body = (
        <React.Fragment>
          <h2 className={styles.Header}>{ this.props.surveyDetails.survey.title }</h2>
          <div className={styles.QuestionPagination}>
          {
            this.props.surveyDetails.survey.questions.map((el, index) => {
              let questionClass;
              if(index !== this.state.currentQuestionIndex){
                questionClass = styles.QuestionPaginationNumber;
              }else{
                questionClass = styles.QuestionPaginationNumberActive;
              }
              return (
                <span className={questionClass} onClick={() => this.onQuestionPaginationClick(index)} key={index}>{index + 1}</span>
              );
            })
          }
          </div>
          <div className={styles.QuestionOuterContainer}>
            <Transition in={this.state.animateQuestion} timeout={ANIMATION_DURATION} onEntered={this.onAnimationEntered}>
            { state => {
              let containerStyle;
              if(state === "entering" || state === "entered")
                containerStyle = {transform: `scale(1.2, 1.2)`, opacity: "0"};
              else if(state === "exiting" || state === "exited")
                containerStyle = {transform: "none", opacity: "1"};
              return (
                <div className={styles.QuestionInnerContainer} style={containerStyle} ref={this.animationContainer}>
                  <div className={styles.QuestionTitle}>{ questionTitle }</div>
                  <div className={styles.QuestionBody}>
                    { questionBody }
                  </div>
                </div>
              );
            }}
            </Transition>
          </div>
          <div className={styles.QuestionControls}>
            { inlineErrorBody }
            {
              this.state.currentQuestionIndex > 0 ?
              <button className={styles.Button} onClick={this.onPreviousQuestion}>Previous</button>
              : null
            }
            <button className={mainButtonClass} onClick={mainButtonHandler}>{ mainButtonText }</button>
          </div>
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
            <span className={styles.SpanLink} onClick={this.onLogout}>Logout</span>
          </div>
        </div>
        <div className={styles.Body}>
          { body }
        </div>
        <Prompt
          when={this.state.hasUserStartedAnswering && !this.props.responseSubmit.submitted}
          message="Are you sure you want to navigate away? You will lose your progress."
        />
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
    responseSubmit: state.responseSubmit
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLogout: () => dispatch(authLogout()),
    onFetchSurveyData: (id, token) => dispatch(fetchSurveyData(id, token)),
    onResponseSubmit: (surveyId, answers, token) => dispatch(submitResponse(surveyId, answers, token)),
    onUnmount: () => {
      dispatch(surveyDetailsReset());
      dispatch(responseSubmitReset());
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(SurveyTake);