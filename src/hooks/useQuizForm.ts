import { useState, useEffect } from 'react';
import { Quiz, Question } from '@/app/classroom/dashboard/page'; // Adjust path if needed

const initialQuestionState: Question = {
    questionText: '',
    answers: ['', '', '', '', ''],
    correctAnswerIndex: 0,
};

const createNewQuestion = (): Question => {
    return JSON.parse(JSON.stringify(initialQuestionState));
};

export function useQuizForm(initialQuiz: Quiz | null = null) {
    const [quizTitle, setQuizTitle] = useState('');
    const [questions, setQuestions] = useState<Question[]>([createNewQuestion()]);
    const [defaultTimer, setDefaultTimer] = useState(30); // Default to 30 seconds

    useEffect(() => {
        if (initialQuiz) {
            setQuizTitle(initialQuiz.title);
            setQuestions(JSON.parse(JSON.stringify(initialQuiz.questions || [createNewQuestion()])));
            setDefaultTimer(initialQuiz.defaultTimer || 30);
        } else {
            setQuizTitle('');
            setQuestions([createNewQuestion()]);
            setDefaultTimer(30);
        }
    }, [initialQuiz]);

    const addQuestion = () => {
        setQuestions(prev => [...prev, createNewQuestion()]);
    };

    const removeQuestion = (index: number) => {
        setQuestions(prev => prev.filter((_, i) => i !== index));
    };

    const handleQuestionTextChange = (index: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[index].questionText = value;
        setQuestions(newQuestions);
    };

    const handleAnswerChange = (qIndex: number, aIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].answers[aIndex] = value;
        setQuestions(newQuestions);
    };
    
    const handleCorrectAnswerChange = (qIndex: number, value: number) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].correctAnswerIndex = value;
        setQuestions(newQuestions);
    };

    return {
        quizTitle,
        setQuizTitle,
        questions,
        setQuestions,
        defaultTimer,
        setDefaultTimer,
        addQuestion,
        removeQuestion,
        handleQuestionTextChange,
        handleAnswerChange,
        handleCorrectAnswerChange
    };
}