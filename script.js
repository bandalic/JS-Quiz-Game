//DOM çekildi

const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const leaderboardScreen = document.getElementById("leaderboard-screen");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const leaderboardBtn = document.getElementById("leaderboard-btn");
const backBtn = document.getElementById("back-btn");
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const leaderboardEl = document.getElementById("leaderboard");


let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 15;

//API'den soru çekimi ve şıkların karıştırılması

async function loadQuestions() {
  try {
    const response = await fetch("https://opentdb.com/api.php?amount=10&category=23&difficulty=medium&type=multiple");
    const data = await response.json();
    questions = data.results.map(q => ({
      question: q.question,
      options: [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5),
      correct: q.correct_answer
    }));
  } catch (error) {
    console.error("API hatası:", error);
    alert("Sorular yüklenemedi, lütfen tekrar deneyin!");
  }
}

//Quiz'in başlatılması

startBtn.addEventListener("click", () => {
  startScreen.classList.add("hidden");
  quizScreen.classList.remove("hidden");
  loadQuestions().then(startQuiz);
});

//Quiz'in başlama mantığı 

function startQuiz() {
  score = 0;
  currentQuestionIndex = 0;
  showQuestion();
}

//Sorunun gösterilmesi

function showQuestion() {
  const q = questions[currentQuestionIndex];
  questionEl.textContent = q.question;
  optionsEl.innerHTML = "";
  q.options.forEach(option => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.addEventListener("click", () => checkAnswer(option));
    optionsEl.appendChild(btn);
  });
  startTimer();
}

// Zamanlayıcı

function startTimer() {
  timeLeft = 15;
  timerEl.textContent = `Kalan süre: ${timeLeft}s`;
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `Kalan süre: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      checkAnswer(null); 
    }
  }, 1000);
}

// Cevap kontrolü

function checkAnswer(selected) {
  clearInterval(timer);
  const q = questions[currentQuestionIndex];
  if (selected === q.correct) {
    score += 10;
  }  
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showResult();
  }

}


// Sonuç ekranı

function showResult() {
  quizScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");
  scoreEl.textContent = `Skorun: ${score} / ${questions.length * 10}`;
  saveScore();
}

// Skoru kaydetme

function saveScore() {
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  leaderboard.push({ score, date: new Date().toLocaleString() });
  leaderboard.sort((a, b) => b.score - a.score);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard.slice(0, 5))); 
}

// Lider tablosu gösterme

leaderboardBtn.addEventListener("click", () => {
  resultScreen.classList.add("hidden");
  leaderboardScreen.classList.remove("hidden");
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  leaderboardEl.innerHTML = "";
  leaderboard.forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `Skor: ${entry.score} - Tarih: ${entry.date}`;
    leaderboardEl.appendChild(li);
  });
});

// Geri dönme

backBtn.addEventListener("click", () => {
  leaderboardScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");
});

// Yeniden başlatma

restartBtn.addEventListener("click", () => {
  resultScreen.classList.add("hidden");
  quizScreen.classList.remove("hidden");
  startQuiz();
});

