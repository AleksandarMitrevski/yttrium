import React, { Component } from 'react';
import { Prompt } from 'react-router';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { authLogout } from '../../store/actions/user';
import { fetchSurveyData, surveyDetailsReset } from '../../store/actions/surveyDetails';
import { createSurvey, editSurvey, surveyCreateEditReset } from '../../store/actions/surveyCreateEdit';
import styles from './SurveyCreate.module.css';

// concerning animation, for simplicity of development this component avoids ReactTransitionGroup and instead uses CSS animations and timers
const ANIMATION_DURATION = 200;	// this should match the value specified in the CSS file

class SurveyCreate extends Component {
  state = {
    hasUserStartedCreating: false,
    title: null,
    model: [],
    pushedQuestionPlaceholder: false,
    popQuestionIndex: -1,
    errorValidation: null
  }

  static getDerivedStateFromProps(props, state) {
    if(props.match.params.id){
      if(props.surveyDetails.survey && state.model.length === 0){
        let model = props.surveyDetails.survey.questions.map(el => {
          let options = el.options.slice(0);
          options.push("");
          return {
            title: el.title,
            options: options
          };
        });
        model.push({
          title: "",
          options: [""]
        });
        return {
          ...state,
          title: props.surveyDetails.survey.title,
          model: model
        };
      }
    }else if(state.model.length === 0){
      return {
        ...state,
        title: "",
        model: [{
          title: "",
          options: [""]
        }]
      }
    }
    return null;
  }

  componentDidMount() {
    if(this.props.match.params.id)
      this.props.onFetchSurveyData(this.props.match.params.id, this.props.user.authToken);
  }

  componentDidUpdate() {
    if((this.props.surveyDetails.error && this.props.surveyDetails.error.status === 401) || (this.props.surveyCreateEdit.error && this.props.surveyCreateEdit.error.status === 401)){
      this.props.onLogout();
    }
    if(this.props.surveyCreateEdit.executed){
      this.props.history.push("/survey/" + this.props.surveyCreateEdit.executed);
    }
    if(this.state.pushedQuestionPlaceholder){
      // needed so that rapid keystrokes do not interrupt this animation
      setTimeout(() => {
        this.setState({
          pushedQuestionPlaceholder: false
        });
      }, ANIMATION_DURATION);
    }
    if(this.state.popQuestionIndex !== -1){
      setTimeout(() => {
        let model = this.state.model.slice(0);
        model.splice(this.state.popQuestionIndex, 1);
        this.setState({
          model: model,
          popQuestionIndex: -1
        });
      }, ANIMATION_DURATION);
    }
  }

  onValidationErrorClick = () => {
    window.alert("A survey is valid if its title is non-empty and the survey contains at least one question.\nA question is valid if the following hold:\n- title is not empty;\n- if question is of closed type, there is more than one answer option.");
  }

  validate = () => {
    let haveError = false;
    if(this.state.title === ""){
      haveError = true;
    }

    let model = this.state.model.slice(0);
    for(let i = 0, length = model.length === 1 ? model.length : model.length - 1; i < length; ++i){
      let question = model[i];
      if(question.title === "" || question.options.length === 2){
        haveError = true;
        question.invalid = true;
      }
    }
    if(haveError){
      this.setState({
        model: model,
        errorValidation: "check highlighted elements for errors"
      });
    }
    return !haveError;
  }

  generateQuestionsForSubmission = () => {
    let questions = [];
    for(let i = 0, length = this.state.model.length - 1; i < length; ++i){
      let question = this.state.model[i];
      let options = question.options.slice(0);
      options.splice(options.length - 1, 1);
      questions.push({
        title: question.title,
        options: options
      });
    }
    return questions;
  }

  onLogout = () => {
    if(this.state.hasUserStartedCreating && window.confirm("Are you sure you want to navigate away? You will lose your progress.")){
      this.props.onLogout();
    }
  }

  onSubmit = () => {
    if(!this.props.surveyCreateEdit.loading && this.validate()){
      let questions = this.generateQuestionsForSubmission();
      if(this.props.surveyDetails.survey){
        this.props.onEdit(this.props.surveyDetails.survey._id, this.state.title, questions, this.props.user.authToken);
      }else{
        this.props.onCreate(this.state.title, questions, this.props.user.authToken);
      }
    }
  }

  tidyUpNewModel = model => {
    let popQuestionIndex = -1; // in practice, one question at most will be selected for popping by a single execution of this method
    let pushedQuestionPlaceholder = false;
    let i = model.length - 1;
    while(--i >= 0) {
      let question = model[i];
      let j = question.options.length - 1;
      while(--j >= 0) {
        if(question.options[j] === ""){
          question.options.splice(j, 1);
        }
      }
      let lastOptionIsEmpty = question.options[question.options.length - 1] === "";
      if(!lastOptionIsEmpty){
        question.options.push("");
      }
      if(question.title === "" && question.options.length === 1 && question.options[question.options.length - 1] === ""){
        popQuestionIndex = i;
        //model.splice(i, 1);
      }
    }
    let lastQuestion = model[model.length - 1];
    let lastQuestionIsEmpty = lastQuestion.title === "" && lastQuestion.options.length === 1 && lastQuestion.options[0] === "";
    if(!lastQuestionIsEmpty){
      model.push({
        title: "",
        options: [""]
      });
      pushedQuestionPlaceholder = true;
    }
    return [model, pushedQuestionPlaceholder, popQuestionIndex];
  }

  onTitleChange = event => {
    this.setState({
      hasUserStartedCreating: true,
      title: event.target.value,
      errorValidation: false
    });
  }

  onQuestionTitleChange = (questionIndex, value) => {
    let model = this.state.model.slice(0);
    model[questionIndex].title = value;
    model[questionIndex].invalid = false;
    let pushedQuestionPlaceholder;
    let popQuestionIndex;
    [model, pushedQuestionPlaceholder, popQuestionIndex] = this.tidyUpNewModel(model);
    this.setState({
      hasUserStartedCreating: true,
      model: model,
      errorValidation: false,
      pushedQuestionPlaceholder: pushedQuestionPlaceholder || this.state.pushedQuestionPlaceholder, // see componentDidUpdate()
      popQuestionIndex: popQuestionIndex
    });
  }

  onQuestionOptionChange = (questionIndex, optionIndex, value) => {
    let model = this.state.model.slice(0);
    model[questionIndex].options[optionIndex] = value;
    model[questionIndex].invalid = false;
    let pushedQuestionPlaceholder;
    let popQuestionIndex;
    [model, pushedQuestionPlaceholder, popQuestionIndex] = this.tidyUpNewModel(model);
    this.setState({
      hasUserStartedCreating: true,
      model: model,
      errorValidation: false,
      pushedQuestionPlaceholder: pushedQuestionPlaceholder || this.state.pushedQuestionPlaceholder, // see componentDidUpdate()
      popQuestionIndex: popQuestionIndex
    });
  }

  onControlDragEnd = (result, provided) => {
    if(!result.destination){
      return;
    }
    const source = result.source;
    const destination = result.destination;
    if(result.type === "QUESTION"){
      if(destination.index !== this.state.model.length - 1){
        let newModel = this.state.model.slice(0);
        const [removed] = newModel.splice(source.index, 1);
        newModel.splice(destination.index, 0, removed);

        this.setState({
          model: newModel
        });
      }
    }else if(result.type === "OPTION"){
      const parts = result.draggableId.split("-");
      const questionIndex = Number(parts[1]);
      if(destination.index !== this.state.model[questionIndex].options.length - 1){
        let newOptions = this.state.model[questionIndex].options.slice(0);
        const [removed] = newOptions.splice(source.index, 1);
        newOptions.splice(destination.index, 0, removed);

        let newModel = this.state.model.slice(0);
        newModel[questionIndex].options = newOptions;
        this.setState({
          model: newModel
        });
      }
    }
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
    }else if(this.props.surveyDetails.loading || (this.props.match.params.id && !this.props.surveyDetails.survey)){
      body = <div className={styles.LoadingIndicator}><i className="fa fa-spinner fa-spin" /></div>;
    }else{
      let inlineErrorBody;
      let inlineError;
      let inlineErrorClass;
      let onErrorClick;
      if(this.state.errorValidation){
        inlineError = this.state.errorValidation;
        inlineErrorClass = styles.ErrorsInlineLink;
        onErrorClick = this.onValidationErrorClick;
      }else{
        inlineError = this.props.surveyCreateEdit.error;
        inlineErrorClass = styles.ErrorsInline;
      }
      let titleClass = styles.InputTitle;
      if(inlineError){
        let inlineErrorMessage = "";
        if(inlineError.response){
          if(inlineError.response.data.length > 0){
            inlineErrorMessage = inlineError.response.data;
          }else{
            inlineErrorMessage = "error status code " + inlineError.response.status;
          }
        }else{
          inlineErrorMessage = this.state.errorValidation ? this.state.errorValidation : this.props.surveyCreateEdit.error.message;
        }
        if(this.state.title === ""){
          titleClass = styles.InputTitleError;
        }
        inlineErrorBody = (
          <span className={inlineErrorClass} onClick={onErrorClick}>{ inlineErrorMessage }</span>
        );
      }

      let mainButtonText = this.props.surveyDetails.survey ? "Edit" : "Create";
      body = (
        <React.Fragment>
          <div className={styles.TitleContainer}>
            <input className={titleClass} placeholder="Title" type="text" onChange={this.onTitleChange} value={this.state.title}></input>
          </div>
          <div className={styles.ContronlContainer}>
            <DragDropContext onDragEnd={this.onControlDragEnd}>
              <Droppable droppableId="droppable-questions" type="QUESTION">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    className={styles.ControlContainer}
                    {...provided.droppableProps}
                  >
                  {
                    this.state.model.map((questionEl, questionIndex) => {
                      let containerClassName;
                      if(questionIndex === this.state.model.length - 1 && this.state.pushedQuestionPlaceholder){
                        containerClassName = styles.QuestionContainerAnimateEntry;
                      }else if(questionIndex === this.state.popQuestionIndex){
                        containerClassName = styles.QuestionContainerAnimateExit;
                      }else{
                        containerClassName = !questionEl.invalid ? styles.QuestionContainer : styles.QuestionContainerInvalid;
                      }
                      let isQuestionDragDisabled = questionIndex === this.state.model.length - 1 || this.state.model.length === 2;
                      
                      return (
                        <Draggable draggableId={"question-" + questionIndex} index={questionIndex} type="QUESTION" isDragDisabled={isQuestionDragDisabled} key={questionIndex}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={containerClassName}
                            >
                              <div>
                                <textarea className={styles.Textarea} placeholder="Question" value={ questionEl.title } onChange={ event => this.onQuestionTitleChange(questionIndex, event.target.value) }></textarea>
                              </div>
                              <Droppable droppableId={"droppable-question-" + questionIndex + "-options"} type="OPTION">
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                  >
                                  {
                                    questionEl.options.map((optionEl, optionIndex) => {
                                      let isOptionDragDisabled = optionIndex === questionEl.options.length - 1 || questionEl.options.length === 2;
                                      return (
                                        <Draggable draggableId={"question-" + questionIndex + "-option-" + optionIndex} index={optionIndex} type="OPTION" isDragDisabled={isOptionDragDisabled} key={optionIndex}>
                                          {(provided, snapshot) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                              className={styles.QuestionOptionsContainer}
                                            >
                                              &#x25CF; <input className={styles.Input} placeholder="Answer Option" type="text" onChange={ event => this.onQuestionOptionChange(questionIndex, optionIndex, event.target.value) } value={ optionEl } />
                                            </div>
                                          )}
                                        </Draggable>
                                      );
                                    })
                                  }
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          )}
                        </Draggable>
                      );
                    })
                  }
                  { provided.placeholder }
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
          <div className={styles.SubmissionControls}>
            { inlineErrorBody }
            <button className={styles.ButtonHighlighted} onClick={this.onSubmit}>{ mainButtonText }</button>
          </div>
        </React.Fragment>
      );
    }

    return (
      <div className={styles.Container}>
        <div className={styles.Navigation}>
          <div className={styles.NavigationLeft}>
            <NavLink className={styles.SpanLink} to="/">Surveys</NavLink>
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
          when={this.state.hasUserStartedCreating && !this.props.surveyCreateEdit.executed}
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
    surveyCreateEdit: state.surveyCreateEdit
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLogout: () => dispatch(authLogout()),
    onFetchSurveyData: (id, token) => dispatch(fetchSurveyData(id, token)),
    onCreate: (title, questions, token) => dispatch(createSurvey(title, questions, token)),
    onEdit: (id, title, questions, token) => dispatch(editSurvey(id, title, questions, token)),
    onUnmount: () => {
      dispatch(surveyDetailsReset());
      dispatch(surveyCreateEditReset());
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(SurveyCreate);