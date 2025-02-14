// app.js
import { subjectStructure } from './data/subjects.js';
import { englishQuestions } from './data/english.js';
import { arabicQuestions } from './data/arabic.js';
import { historyQuestions } from './data/history.js';
import { islamicQuestions } from './data/islamic.js';

const questionBank = {
    english: englishQuestions,
    arabic: arabicQuestions,
    history: historyQuestions,
    islamic: islamicQuestions
};

class QuestionBankApp {
    constructor() {
        // DOM Elements
        this.subjectSelect = document.getElementById('subjectSelect');
        this.semesterSelect = document.getElementById('semesterSelect');
        this.unitSelect = document.getElementById('unitSelect');
        this.lessonSelect = document.getElementById('lessonSelect');
        this.questionArea = document.getElementById('questionArea');
        this.questionContent = document.getElementById('questionContent');
        this.resultsArea = document.getElementById('resultsArea');

        // State
        this.currentQuestions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.startTime = null;

        // Initialize
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Selection change handlers
        this.subjectSelect.addEventListener('change', () => this.handleSubjectChange());
        this.semesterSelect.addEventListener('change', () => this.handleSemesterChange());
        this.unitSelect.addEventListener('change', () => this.handleUnitChange());
        this.lessonSelect.addEventListener('change', () => this.handleLessonChange());

        // Button handlers
        document.addEventListener('click', (e) => {
            switch(e.target.id) {
                case 'submitBtn':
                    this.submitAnswer();
                    break;
                case 'nextBtn':
                    this.showNextQuestion();
                    break;
                case 'restartBtn':
                    this.restartQuiz();
                    break;
                case 'finishBtn':
                    this.finishQuiz();
                    break;
            }
        });
    }

    handleSubjectChange() {
        const subject = this.subjectSelect.value;
        if (!subject) {
            this.resetSelects(['semester', 'unit', 'lesson']);
            return;
        }

        this.populateSemesterSelect(subject);
        this.semesterSelect.disabled = false;
        this.resetSelects(['unit', 'lesson']);
    }

    handleSemesterChange() {
        const subject = this.subjectSelect.value;
        const semester = this.semesterSelect.value;
        if (!semester) {
            this.resetSelects(['unit', 'lesson']);
            return;
        }

        this.populateUnitSelect(subject, semester);
        this.unitSelect.disabled = false;
        this.resetSelects(['lesson']);
    }

    handleUnitChange() {
        const subject = this.subjectSelect.value;
        const semester = this.semesterSelect.value;
        const unit = this.unitSelect.value;
        if (!unit) {
            this.resetSelects(['lesson']);
            return;
        }

        this.populateLessonSelect(subject, semester, unit);
        this.lessonSelect.disabled = false;
    }

    handleLessonChange() {
        const subject = this.subjectSelect.value;
        const semester = this.semesterSelect.value;
        const unit = this.unitSelect.value;
        const lesson = this.lessonSelect.value;

        if (!lesson) {
            this.hideQuestions();
            return;
        }

        this.loadQuestions(subject, semester, unit, lesson);
    }

    populateSemesterSelect(subject) {
        const semesters = Object.entries(subjectStructure[subject].semesters);
        this.semesterSelect.innerHTML = '<option value="">Select Semester</option>';
        semesters.forEach(([value, data]) => {
            this.semesterSelect.innerHTML += `<option value="${value}">${data.name}</option>`;
        });
    }

    populateUnitSelect(subject, semester) {
        const units = Object.entries(subjectStructure[subject].semesters[semester].units);
        this.unitSelect.innerHTML = '<option value="">Select Unit</option>';
        units.forEach(([value, data]) => {
            this.unitSelect.innerHTML += `<option value="${value}">${data.name}</option>`;
        });
    }

    populateLessonSelect(subject, semester, unit) {
        const lessons = subjectStructure[subject].semesters[semester].units[unit].lessons;
        this.lessonSelect.innerHTML = '<option value="">Select Lesson</option>';
        lessons.forEach(lesson => {
            this.lessonSelect.innerHTML += `<option value="${lesson}">${lesson}</option>`;
        });
    }

    loadQuestions(subject, semester, unit, lesson) {
        try {
            const questions = [...questionBank[subject][semester][unit][lesson].questions];
            this.currentQuestions = this.shuffleArray(questions);
            this.currentQuestionIndex = 0;
            this.score = 0;
            this.startTime = new Date();
            this.showQuestion();
        } catch (error) {
            console.error('Error loading questions:', error);
            this.showError('Unable to load questions. Please try again.');
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    showQuestion() {
        if (!this.currentQuestions.length) {
            this.showError('No questions available.');
            return;
        }

        const question = this.currentQuestions[this.currentQuestionIndex];
        this.questionArea.classList.remove('hidden');
        this.resultsArea.classList.add('hidden');

        document.getElementById('lessonTitle').textContent = this.lessonSelect.value;
        document.getElementById('questionCounter').textContent = 
            `Question ${this.currentQuestionIndex + 1} of ${this.currentQuestions.length}`;

        this.questionContent.innerHTML = this.createQuestionHTML(question);
    }

    createQuestionHTML(question) {
        if (question.options) {
            const shuffledOptions = [...question.options];
            const correctAnswer = question.options[question.correctAnswer];
            this.shuffleArray(shuffledOptions);
            question.correctAnswer = shuffledOptions.indexOf(correctAnswer);
            question.options = shuffledOptions;
        }

        return `
            <div class="question-card">
                <p class="question-text">${question.question}</p>
                <div class="answer-options">
                    ${this.createAnswerOptionsHTML(question)}
                </div>
                <div id="feedback" class="feedback hidden"></div>
                <div class="button-group">
                    <button id="submitBtn" class="btn primary">Submit Answer</button>
                    <button id="nextBtn" class="btn secondary hidden">Next Question</button>
                    <button id="finishBtn" class="btn warning">Finish Quiz</button>
                </div>
            </div>
        `;
    }

    createAnswerOptionsHTML(question) {
        if (question.options) {
            return question.options.map((option, index) => `
                <label class="answer-option">
                    <input type="radio" name="answer" value="${index}">
                    ${option}
                </label>
            `).join('');
        }
        return `<textarea class="short-answer" rows="4" placeholder="Type your answer here..."></textarea>`;
    }

    submitAnswer() {
        const question = this.currentQuestions[this.currentQuestionIndex];
        const feedback = document.getElementById('feedback');
        const submitBtn = document.getElementById('submitBtn');
        const nextBtn = document.getElementById('nextBtn');

        if (!feedback || !submitBtn || !nextBtn) return;

        let isCorrect = false;

        switch (question.type) {
            case 'multiple':
            case 'true-false':
                const selectedAnswer = document.querySelector('input[name="answer"]:checked');
                if (!selectedAnswer) {
                    this.showFeedback('Please select an answer.', 'incorrect');
                    return;
                }
                isCorrect = parseInt(selectedAnswer.value) === question.correctAnswer;
                break;

            case 'short':
                const answer = document.querySelector('.short-answer')?.value.trim();
                if (!answer) {
                    this.showFeedback('Please enter an answer.', 'incorrect');
                    return;
                }
                this.showFeedback(`
                    <h4>Sample Answer:</h4>
                    <p>${question.sampleAnswer}</p>
                    <p class="mt-2">Compare your answer with the sample answer above.</p>
                `);
                break;
        }

        submitBtn.classList.add('hidden');
        nextBtn.classList.remove('hidden');

        if (question.type !== 'short') {
            this.showFeedback(`
                <p>${isCorrect ? 'Correct!' : 'Incorrect.'}</p>
                <p>${question.explanation}</p>
            `, isCorrect ? 'correct' : 'incorrect');
            if (isCorrect) this.score++;
        }
    }

    showFeedback(message, type = '') {
        const feedback = document.getElementById('feedback');
        if (!feedback) return;

        feedback.innerHTML = message;
        feedback.className = `feedback ${type}`;
        feedback.classList.remove('hidden');
    }

    showNextQuestion() {
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex < this.currentQuestions.length) {
            this.showQuestion();
        } else {
            this.showResults();
        }
    }

    finishQuiz() {
        if (confirm('Are you sure you want to finish the quiz? This will end the quiz immediately.')) {
            this.showResults();
        }
    }

    showResults() {
        const endTime = new Date();
        const timeSpent = Math.floor((endTime - this.startTime) / 1000);
        const minutes = Math.floor(timeSpent / 60);
        const seconds = timeSpent % 60;

        this.questionArea.classList.add('hidden');
        this.resultsArea.classList.remove('hidden');

        document.getElementById('finalScore').textContent = 
            `${Math.round((this.score / this.currentQuestions.length) * 100)}%`;
        document.getElementById('correctAnswers').textContent = this.score;
        document.getElementById('incorrectAnswers').textContent = 
            this.currentQuestions.length - this.score;
        document.getElementById('timeSpent').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    restartQuiz() {
        const subject = this.subjectSelect.value;
        const semester = this.semesterSelect.value;
        const unit = this.unitSelect.value;
        const lesson = this.lessonSelect.value;
        
        this.resultsArea.classList.add('hidden');
        this.loadQuestions(subject, semester, unit, lesson);
    }

    resetSelects(selects) {
        selects.forEach(select => {
            const element = document.getElementById(`${select}Select`);
            if (element) {
                element.innerHTML = `<option value="">Select ${select.charAt(0).toUpperCase() + select.slice(1)}</option>`;
                element.disabled = true;
            }
        });
        this.hideQuestions();
    }

    hideQuestions() {
        this.questionArea.classList.add('hidden');
        this.resultsArea.classList.add('hidden');
    }

    showError(message) {
        this.questionContent.innerHTML = `
            <div class="message-box">
                <p>${message}</p>
            </div>
        `;
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new QuestionBankApp();
});
