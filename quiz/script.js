let question = document.querySelector('.question');
let answerBox = document.querySelector('#answer');
let answerOptions = document.querySelector('#options');
let scoreboard = document.querySelector('.scoreboard');
let modalOverlay = document.querySelector('#modal-overlay');
let modalContent = document.querySelector('.modal-content');

answerBox.addEventListener('dragover', dragOver)
answerBox.addEventListener('dragenter', dragEnter)
answerBox.addEventListener('dragleave', dragLeave)
answerBox.addEventListener('drop', dragDrop)

// Ci servono 2 variabili: un oggetto per gestire lo stato del gioco e un array per ospitare le domande
let game;
let questions = [];

// Recuperiamo le domande dal file json e facciamo partire il gioco
fetch('./quiz.json')
  .then(response => response.json())
  .then(data => {
    questions = data;
    game = initializeGame();
    startGame(questions);
  })

// Inizializziamo l'oggetto game, impostando il numero di vite
function initializeGame() {
  return {
    questions: [],
    questionsLeft: [],
    totalLives: 3,
    livesLeft: 3,
    correctAnswer: null,
    userChoice: null
  }
}

// Facciamo partire il gioco!
function startGame(questions) {
  // aggiorniamo la UI del numero di vite a disposizione
  updateLives(game.totalLives, game.livesLeft)
  // Generiamo una nuova domanda e aggiorniamo l'array di domande rimaste
  let [currentQuestion, questionsLeft] = generateQuestion(questions);
  game = {
    ...game,
    questions,
    correctAnswer: currentQuestion.answer,
    questionsLeft
  }
}

function generateQuestion(questions) {
  // Scegliamo una domanda e mostriamola nella UI
  let currentQuestion = selectQuestion(questions);
  // Togliamo la domanda selezionata dall'array di quelle rimaste
  let questionsLeft = questions.filter(question => question.question !== currentQuestion.question);
  return [currentQuestion, questionsLeft];
}

function selectQuestion(questions) {
  // Resettiamo la UI
  modalOverlay.style.display = 'none';
  answerOptions.innerHTML = '';
  question.innerHTML = '';
  answerBox.className = '';
  answerBox.textContent = ''
  // Se abbiamo ancora domande da mostrare
  if(questions.length > 0) {
    // Ne scegliamo una a caso
    let selectedQuestion = questions[Math.floor(Math.random() * questions.length)];
    // Mostriamo la domanda
    question.textContent = selectedQuestion.question;
    // Mostriamo le risposte multiple
    selectedQuestion.options.map(option => {
      let newListEl = document.createElement('li');
      newListEl.setAttribute('draggable', 'true');
      newListEl.textContent = option;
      answerOptions.append(newListEl);
      newListEl.addEventListener('dragstart', dragStart)
    })
    return selectedQuestion
  } else {
    // Se non abbiamo più domande da mostrare, abbiamo vinto!
    showModal('Wow, you won!', 'Start new game', restart)
  }
}

// Resettiamo il gioco
function restart() {
  modalOverlay.style.display = 'none';
  game = initializeGame();
  startGame(questions)
}

// Eventi di drag relativi all'opzione trascinata
function dragStart() {
  game.userChoice = this;
  this.className = 'lift';
}

// Eventi di drag relativi al box della risposta
function dragEnter() {
  this.className = 'active'
}
function dragLeave() {
  this.className = ''
}
function dragOver(e) {
  e.preventDefault();
}
// Quando viene effettuato il drop controllo che la risposta sia quella corretta
function dragDrop(e) {
  e.preventDefault();
  // Se la risposta è esatta...
  if(game.userChoice.textContent === game.correctAnswer) {
    this.className = 'visited';
    // inserisco il testo nel box della risposta
    e.target.textContent = game.userChoice.textContent;
    // e mostro una modale!
    showModal('Correct answer!', 'Next question', () => {
      // Quando l'utente clicca il pulsante, genero una nuova domanda e aggiorno lo stato del gioco
      // (Per un codice più leggibile potrei spostare questa logica in una funzione dedicata!)
      let [currentQuestion, questionsLeft] = generateQuestion(game.questionsLeft);
      game = {
        ...game,
        correctAnswer: currentQuestion.answer,
        questionsLeft
      }
    })
  } else {
    // Se la risposta è sbagliata, perdo una vita
    game.livesLeft = game.livesLeft -1;
    // Disabilito il drag per la risposta sbagliata
    game.userChoice.setAttribute('draggable', 'false')
    // Aggiorno la UI
    updateLives(game.totalLives, game.livesLeft);
    // Se non ho più vite... Game over!
    if(game.livesLeft === 0) {
      showModal('Game Over', 'Restart', restart)
    }
  }
}

// Aggiorniamo la UI che indica il numero di vite
function updateLives(totalLives, livesLeft) {
  scoreboard.innerHTML = '';
  // Facciamo un ciclo sul totale delle vite che il gioco offre
  for(let i = 1; i <= totalLives; i++) {
    let lifeIcon = document.createElement('span');
    // Se il contatore supera il numero di vite rimaste, mostro un teschio
    if(i > livesLeft) {
      lifeIcon.innerHTML = '&#x1F480';
    // Altrimenti mostro una faccia sorridente
    } else {
      lifeIcon.innerHTML = '&#x1F603';
    }
    scoreboard.append(lifeIcon);
  }
}

// Creiamo la modale passando dinamicamente il titolo, il testo del pulsante e l'azione del pulsante
function showModal(text, buttonText, buttonAction) {
  modalOverlay.style.display = 'flex';
  modalContent.innerHTML = '';
  let modalTitle = document.createElement('h2');
  modalTitle.textContent = text;
  modalContent.append(modalTitle);
  let button = document.createElement('button');
  button.textContent= buttonText;
  button.addEventListener('click', () => {
    buttonAction();
  })
  modalContent.append(button);
}