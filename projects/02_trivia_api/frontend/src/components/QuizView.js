import React, { Component } from 'react';
import $ from 'jquery';

import '../stylesheets/QuizView.css';

const questionsPerPlay = 5; 

class QuizView extends Component {
  constructor(props){
    super();
    this.state = {
        quizCategory: null,
        previousQuestions: [], 
        showAnswer: false,
        categories: [],
        numCorrect: 0,
        currentQuestion: {},
        guess: '',
        forceEnd: false
    }
  }

  componentDidMount(){
    $.ajax({
      url: `/categories`, //TODO: update request URL
      type: "GET",
      success: (result) => {
        this.setState({ categories: result.categories })
        return;
      },
      error: (error) => {
        alert('Unable to load categories. Please try your request again')
        return;
      }
    })
  }

  selectCategory = (type=null, id=0) => {
    this.setState({quizCategory: {type, id}}, this.getNextQuestion)
  }

  handleChange = (event) => {
    this.setState({[event.target.name]: event.target.value})
  }

  getNextQuestion = () => {
    const previousQuestions = [...this.state.previousQuestions]
    if(this.state.currentQuestion.id) { previousQuestions.push(this.state.currentQuestion.id) }
    $.ajax({
      url: '/quizzes', //TODO: update request URL
      type: "POST",
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({
        previous_questions: previousQuestions,
        quiz_category: this.state.quizCategory
      }),
      xhrFields: {
        withCredentials: true
      },
      crossDomain: true,
      success: (result) => {
        this.setState({
          showAnswer: false,
          previousQuestions: previousQuestions,
          currentQuestion: result.question,
          guess: '',
          forceEnd: result.question ? false : true
        })
        return;
      },
      error: (error) => {
        alert('Unable to load question. Please try your request again')
        return;
      }
    })
  }

  submitGuess = (event) => {
    event.preventDefault();
    const formatGuess = this.state.guess.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").toLowerCase()
    let evaluate =  this.evaluateAnswer(formatGuess, this.state.currentQuestion.answer)
    this.setState({
      numCorrect: !evaluate ? this.state.numCorrect : this.state.numCorrect + 1,
      showAnswer: true,
    })
  }

  restartGame = () => {
    this.setState({
      quizCategory: null,
      previousQuestions: [], 
      showAnswer: false,
      numCorrect: 0,
      currentQuestion: {},
      guess: '',
      forceEnd: false
    })
  }

  renderPrePlay(){
      return (
          <div className="quiz-play-holder">
              <div className="choose-header">Choose Category</div>
              <div className="category-holder">
                  <div className="play-category" onClick={() => this.selectCategory(null,0)}>ALL</div>
                  {this.state.categories.map((category) =>
                  <div
                      key={category.id}
                      value={category.id}
                      className="play-category"
                      onClick={() => this.selectCategory(category.type,category.id)}>
                      {category.type}
                    </div>
                )}
              </div>
          </div>
      )
  }

  renderFinalScore(){
    return(
      <div className="quiz-play-holder">
        <div className="quiz-question"> Your Final Score is {this.state.numCorrect}</div>
        <button className="play-again button" onClick={this.restartGame}> Play Again? </button>
      </div>
    )
  }

  evaluateAnswer = (guess, answer) => {
    const formatGuess = guess.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").toLowerCase()
    const formatAnswer = answer.toLowerCase();
    const answerArray = answer.toLowerCase().split(' ');
    if(answerArray.includes(formatGuess) || formatAnswer==formatGuess) {
      return true
    } else {
      return false
    }
  }

  renderCorrectAnswer(){
    const formatGuess = this.state.guess.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").toLowerCase()
    let evaluate =  this.evaluateAnswer(this.state.guess, this.state.currentQuestion.answer)
    return(
      <div className="quiz-play-holder">
        <div className="quiz-question">{this.state.currentQuestion.question}</div>
        <div className={`${evaluate ? 'correct' : 'wrong'}`}>{evaluate ? "You were correct!" : "You were incorrect"}</div>
        <div className="quiz-answer">{this.state.currentQuestion.answer} - {this.state.guess}</div>
        <button className="next-question button" onClick={this.getNextQuestion}> Next Question </button>
      </div>
    )
  }

  renderPlay(){
    return this.state.previousQuestions.length === questionsPerPlay || this.state.forceEnd
      ? this.renderFinalScore()
      : this.state.showAnswer 
        ? this.renderCorrectAnswer()
        : (
          <div className="quiz-play-holder">
            <div className="quiz-question">{this.state.currentQuestion.question}</div>
            <form onSubmit={this.submitGuess}>
              <p><input type="text" name="guess" onChange={this.handleChange}/></p>
              <button className="submit-guess button" type="submit">Submit Answer</button>
            </form>
          </div>
        )
  }


  render() {
    return this.state.quizCategory
        ? this.renderPlay()
        : this.renderPrePlay()
  }
}

export default QuizView;
