/* AWS Study Buddy App */

let flashcards = [];
let schedule = [];
let currentCardIndex = 0;
let currentQuizIndex = 0;
let quizScore = 0;

// Parse uploaded file and generate flashcards
async function parseFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      if (file.name.toLowerCase().endsWith('.csv')) {
        const lines = text.split(/\r?\n/);
        lines.forEach(line => {
          const parts = line.split(',');
          if (parts.length >= 2) {
            const question = parts[0].trim();
            const answer = parts.slice(1).join(',').trim();
            if (question && answer) {
              flashcards.push({ question, answer });
            }
          }
        });
      } else {
        const lines = text.split(/\r?\n/);
        lines.forEach(line => {
          const parts = line.split(' - ');
          if (parts.length >= 2) {
            const question = parts[0].trim();
            const answer = parts.slice(1).join(' - ').trim();
            if (question && answer) {
              flashcards.push({ question, answer });
            }
          }
        });
      }
      resolve();
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function generatePlan() {
  const examDateValue = document.getElementById('examDate').value;
  const daysPerWeek = parseInt(document.getElementById('daysPerWeek').value) || 3;
  if (!examDateValue || flashcards.length === 0) {
    alert('Please provide an exam date and upload study materials first.');
    return;
  }
  const examDate = new Date(examDateValue);
  const today = new Date();
  const diffMs = examDate.getTime() - today.getTime();
  if (diffMs <= 0) {
    alert('Exam date must be in the future.');
    return;
  }
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.max(1, Math.ceil(daysLeft / 7));
  const cardsPerWeek = Math.max(1, Math.ceil(flashcards.length / totalWeeks));
  schedule = [];
  let index = 0;
  for (let w = 1; w <= totalWeeks; w++) {
    const weekCards = flashcards.slice(index, index + cardsPerWeek);
    index += cardsPerWeek;
    schedule.push({ week: w, cards: weekCards });
  }
  showPlan();
}

function showPlan() {
  const planSection = document.getElementById('planSection');
  const planTable = document.getElementById('planTable');
  planTable.innerHTML = '<tr><th>Week</th><th>Cards to Study</th></tr>';
  schedule.forEach(item => {
    const tr = document.createElement('tr');
    const weekTd = document.createElement('td');
    weekTd.textContent = 'Week ' + item.week;
    const cardsTd = document.createElement('td');
    cardsTd.textContent = item.cards.length + ' flashcards';
    tr.appendChild(weekTd);
    tr.appendChild(cardsTd);
    planTable.appendChild(tr);
  });
  planSection.style.display = 'block';
}

// Flashcards
function startFlashcards() {
  if (flashcards.length === 0) {
    alert('No flashcards loaded.');
    return;
  }
  currentCardIndex = 0;
  document.getElementById('flashcardSection').style.display = 'block';
  showFlashcard();
}

function showFlashcard() {
  const card = flashcards[currentCardIndex];
  document.getElementById('flashcard').textContent = card.question;
  document.getElementById('showAnswerButton').style.display = 'inline-block';
  document.getElementById('nextCardButton').disabled = true;
}

function revealAnswer() {
  const card = flashcards[currentCardIndex];
  document.getElementById('flashcard').textContent = card.question + '\n\nAnswer: ' + card.answer;
  document.getElementById('nextCardButton').disabled = false;
}

function nextFlashcard() {
  currentCardIndex++;
  if (currentCardIndex >= flashcards.length) {
    alert('You have reached the end of the flashcards.');
    closeFlashcards();
  } else {
    showFlashcard();
  }
}

function closeFlashcards() {
  document.getElementById('flashcardSection').style.display = 'none';
}

// Quiz
function startQuiz() {
  if (flashcards.length === 0) {
    alert('No flashcards loaded.');
    return;
  }
  currentQuizIndex = 0;
  quizScore = 0;
  document.getElementById('quizSection').style.display = 'block';
  showQuizQuestion();
}

function showQuizQuestion() {
  const card = flashcards[currentQuizIndex];
  document.getElementById('question').textContent = card.question;
  document.getElementById('answerInput').value = '';
  document.getElementById('feedback').textContent = '';
  document.getElementById('submitAnswerButton').disabled = false;
  document.getElementById('nextQuestionButton').disabled = true;
}

function submitAnswer() {
  const card = flashcards[currentQuizIndex];
  const userAnswer = document.getElementById('answerInput').value.trim();
  const feedback = document.getElementById('feedback');
  if (userAnswer.toLowerCase() === card.answer.toLowerCase()) {
    feedback.textContent = 'Correct!';
    quizScore++;
  } else {
    feedback.textContent = 'Incorrect. The correct answer is: ' + card.answer;
  }
  document.getElementById('submitAnswerButton').disabled = true;
  document.getElementById('nextQuestionButton').disabled = false;
}

function nextQuizQuestion() {
  currentQuizIndex++;
  if (currentQuizIndex >= flashcards.length) {
    alert('Quiz finished! Your score: ' + quizScore + '/' + flashcards.length);
    closeQuiz();
  } else {
    showQuizQuestion();
  }
}

function closeQuiz() {
  document.getElementById('quizSection').style.display = 'none';
}

// Chat buddy
function sendChat() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  if (message === '') return;
  addChatMessage('You', message);
  const reply = generateChatReply(message);
  addChatMessage('Buddy', reply);
  input.value = '';
}

function addChatMessage(sender, text) {
  const div = document.getElementById('chatMessages');
  const p = document.createElement('p');
  p.innerHTML = '<strong>' + sender + ':</strong> ' + text;
  div.appendChild(p);
  div.scrollTop = div.scrollHeight;
}

function generateChatReply(msg) {
  const lower = msg.toLowerCase();
  if (lower.includes('hi') || lower.includes('hello')) {
    return 'Hello! Ready to study some AWS?';
  } else if (lower.includes('stress') || lower.includes('worried')) {
    return 'Take a deep breath—you can do this! Let\'s review some flashcards.';
  } else if (lower.includes('thanks')) {
    return 'You\'re welcome! Keep up the great work!';
  }
  return 'Keep going! Practice makes perfect.';
}

// Attach event listeners once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('generatePlanButton').addEventListener('click', generatePlan);
  document.getElementById('startFlashcardsButton').addEventListener('click', startFlashcards);
  document.getElementById('showAnswerButton').addEventListener('click', revealAnswer);
  document.getElementById('nextCardButton').addEventListener('click', nextFlashcard);
  document.getElementById('closeFlashcardButton').addEventListener('click', closeFlashcards);
  document.getElementById('startQuizButton').addEventListener('click', startQuiz);
  document.getElementById('submitAnswerButton').addEventListener('click', submitAnswer);
  document.getElementById('nextQuestionButton').addEventListener('click', nextQuizQuestion);
  document.getElementById('closeQuizButton').addEventListener('click', closeQuiz);
  document.getElementById('sendChatButton').addEventListener('click', sendChat);
  // Parse file on change
  document.getElementById('materialsInput').addEventListener('change', async (e) => {
    flashcards = [];
    const file = e.target.files[0];
    if (file) {
      await parseFile(file);
      alert('Study materials loaded: ' + flashcards.length + ' cards.');
    }
  });
});
