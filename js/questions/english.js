// questions/english.js
export const englishQuestions = {
    first: {
        unit1: {
            "Reading and Vocabulary": {
                questions: [
                    {
                        id: 1,
                        type: "multiple",
                        question: "What is the difference between 'affect' and 'effect'?",
                        options: [
                            "'Affect' is usually a verb, 'effect' is usually a noun",
                            "'Affect' and 'effect' are completely interchangeable",
                            "'Affect' is only used in medical contexts",
                            "'Effect' is only used as a verb"
                        ],
                        correctAnswer: 0,
                        explanation: "'Affect' is typically used as a verb meaning 'to influence,' while 'effect' is typically used as a noun meaning 'a result or consequence.'"
                    },
                    {
                        id: 2,
                        type: "true-false",
                        question: "The words 'their', 'there', and 'they're' are homophones.",
                        correctAnswer: true,
                        explanation: "These words sound the same but have different meanings and spellings."
                    }
                ]
            },
            "Past & Present Tenses": {
                questions: [
                    {
                        id: 1,
                        type: "multiple",
                        question: "Which tense is used to describe a habit or routine?",
                        options: [
                            "Simple Present",
                            "Present Continuous",
                            "Present Perfect",
                            "Past Simple"
                        ],
                        correctAnswer: 0,
                        explanation: "The Simple Present tense is used to describe habits, routines, and general truths."
                    }
                ]
            }
        }
    }
};
