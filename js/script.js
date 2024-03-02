//Select Elements
let mainApp = document.querySelector(".quiz-app");
let difficult = document.querySelector("#difficulty");
let currIdx = document.querySelector(".quiz-info .cur-index span");
let bulContainer = document.querySelector(".footer .bullets-container");
let quizArea = document.querySelector(".quiz-area");
let answerArea = document.querySelector(".answers-area");
let submitBtn = document.querySelector(".submit-btn");
let theFooter = document.querySelector(".footer");
let resultRow = document.querySelector(".result");
let theRank = document.querySelector(".result .rank");
let right = document.querySelector(".result .right");
let qCount = document.querySelector(".q-count");
let successSound = document.getElementById("success");
let failSound = document.getElementById("fail");

//Global Variables
let categoryLength = 0;
let currentIndex = 0;
let totalUserCorrectAnswers = 0;
let userCorrectAnswers = 0;
// let currentCategory = 0;
let currentCategory = difficult.selectedIndex;

//main function
function getQuestions() {
  let myReq = new XMLHttpRequest();

  myReq.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      let quiz = JSON.parse(this.responseText);
      //Note: Need to shuffle qusions
      let hard = [];
      let medium = [];
      let easy = [];

      for (let q of quiz["results"]) {
        let dic = {
          question: q.question,
          correct_answer: q.correct_answer,
          incorrect_answers: q.incorrect_answers,
        };
        q.difficulty == "easy"
          ? easy.push(dic)
          : q.difficulty == "medium"
          ? medium.push(dic)
          : hard.push(dic);
      }

      //To move up level
      if (categoryLength === currentIndex && currentIndex > 0) {
        // totalUserCorrectAnswers= userCorrectAnswers;
        // userCorrectAnswers = 0;
        levelCompletePopup();
      } else {
        //If Easy Category Selected.
        if (currentCategory == 0) {
          //Create Bullets and Set questions count
          categoryLength = easy.length;
          // qCount.innerHTML = categoryLength;
          createBullets(easy.length);
          //Put Current Question Text in its position.
          addQuestionData(easy[currentIndex]);
          //Put Current Answers Text in its position.
          addAnswesData(easy[currentIndex]);
          //Check The answer When Submit Button Clicked
          checkAnswer(easy[currentIndex].correct_answer);
          //If Medium Category Selected.
        } else if (currentCategory == 1) {
          categoryLength = medium.length;
          createBullets(categoryLength);
          addQuestionData(medium[currentIndex]);
          addAnswesData(medium[currentIndex]);
          checkAnswer(medium[currentIndex].correct_answer);
          //If Hard Category Selected.
        } else {
          categoryLength = hard.length;
          createBullets(categoryLength);
          addQuestionData(hard[currentIndex]);
          addAnswesData(hard[currentIndex]);
          checkAnswer(hard[currentIndex].correct_answer);
        }
      }
      qCount.innerHTML = categoryLength;
    }
  };
  myReq.open("GET", "json/quiz.json", true);
  myReq.send();
}
//Calling main Function
getQuestions();
//Create Bullets Function
function createBullets(num) {
  for (let i = 0; i < num; i++) {
    let myBullet = document.createElement("span");
    myBullet.className = "bullet";
    if (i <= currentIndex) {
      myBullet.classList.add("on");
    }
    bulContainer.appendChild(myBullet);
  }
}

//Append Question to its position
function addQuestionData(category) {
  let quiz = document.createElement("h2");
  quiz.innerHTML = category["question"];
  quizArea.appendChild(quiz);
}
//Create Answers forms and Append Answers
function addAnswesData(category) {
  //Gather Answersa
  let answers = [];
  answers.push(category["correct_answer"]);
  // console.log(category['correct_answer'])
  for (let ans of category["incorrect_answers"]) {
    answers.push(ans);
  }
  //Shuffle Answers
  let randAnswers = [];
  let len = 0;
  while (len < 4) {
    let idx = Math.floor(Math.random() * answers.length);
    if (!randAnswers.includes(answers[idx])) {
      randAnswers.push(answers[idx]);
      len++;
    } else continue;
  }

  for (let i = 1; i <= 4; i++) {
    //Create Forms
    let parent = document.createElement("div");
    let radio = document.createElement("input");
    let ansLabel = document.createElement("label");
    parent.classList.add("answer");
    radio.setAttribute("name", "answers");
    radio.setAttribute("type", "radio");
    radio.setAttribute("id", `answer${i}`);
    radio.dataset.answer = randAnswers[i - 1];

    //Append Answers
    ansLabel.setAttribute("for", `answer${i}`);
    ansLabel.innerHTML = randAnswers[i - 1];
    parent.appendChild(radio);
    parent.appendChild(ansLabel);
    answerArea.appendChild(parent);
  }
}

// //Submit the answer
function checkAnswer(correct) {
  currIdx.innerHTML = `${currentIndex + 1}`;
  right.innerHTML = userCorrectAnswers;
  submitBtn.onclick = function () {
    let answerElements = document.getElementsByName("answers");
    let answerChecked;
    for (let i = 0; i < 4; i++) {
      if (answerElements[i].checked) {
        answerChecked = answerElements[i].dataset.answer;
      }
    }
    if (answerChecked === correct) {
      successSound.play();
      userCorrectAnswers++;
      right.innerHTML = userCorrectAnswers;
    } else {
      failSound.play();
    }
    currentIndex++;
    clearContainers();
  };
  //Check The Rank
  if (currentIndex > 0) {
    if (userCorrectAnswers === currentIndex) {
      theRank.innerHTML = "PERFECT";
      theRank.classList.add("perfect");
    } else if (userCorrectAnswers >= Math.round(currentIndex / 2)) {
      theRank.innerHTML = "GOOD";
      theRank.classList.add("good");
    } else {
      theRank.innerHTML = "BAD!!";
      theRank.classList.add("bad");
    }
  }
}

//Move to next levle when finished current level.
function levelCompletePopup() {
  //Create a Popup window
  let popUp = document.createElement("div");
  let okBtn = document.createElement("button");
  let text = document.createTextNode(
    "You've Finshed this level , Go Forward.."
  );
  popUp.className = "the-popup";
  popUp.appendChild(text);
  popUp.appendChild(resultRow);
  okBtn.className = "ok-btn";
  okBtn.innerHTML = "OK";
  popUp.appendChild(okBtn);
  document.body.appendChild(popUp);
  mainApp.style.display = "none";

  //Confirm the Result and levle up
  okBtn.onclick = function () {
    totalUserCorrectAnswers = userCorrectAnswers;
    userCorrectAnswers = 0;
    right.innerHTML = userCorrectAnswers;
    currentCategory++;
    difficult.options.selectedIndex = currentCategory;
    currentIndex = 0;
    clearContainers();
    mainApp.style.display = "block";
    theFooter.appendChild(resultRow);
    popUp.remove();
  };
}

//Choose Category Manualy
addEventListener("click", (e) => {
  if (
    e.target.getAttribute("class") === "diff-sel" &&
    e.target.selectedIndex !== currentCategory
  ) {
    currentCategory = e.target.selectedIndex;
    currentIndex = 0;
    userCorrectAnswers = 0;
    clearContainers();
    theRank.innerHTML = "";
  }
});
function clearContainers() {
  bulContainer.innerHTML = "";
  quizArea.innerHTML = "";
  answerArea.innerHTML = "";
  getQuestions();
}
