"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, runTransaction, Timestamp } from 'firebase/firestore';
import Link from 'next/link';

// --- TYPE DEFINITIONS ---
interface Question { questionText: string; answers: string[]; correctAnswerIndex: number; }
interface Participant { name: string; score: number; playerId: string; }
interface Session {
    quizData: { questions: Question[] };
    status: 'waiting' | 'active' | 'finished';
    currentQuestionIndex: number;
    timer: number;
    questionStartTime?: Timestamp;
    participants: Participant[];
}
interface AnswerRecord { questionIndex: number; selectedAnswerIndex: number; isCorrect: boolean; }

// --- HELPER ICONS ---
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

const QuizPlayPage = () => {
    const router = useRouter();
    const params = useParams();
    const sessionId = params.sessionId as string;

    const [session, setSession] = useState<Session | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [myAnswerForCurrentQ, setMyAnswerForCurrentQ] = useState<number | null>(null);
    const [answersHistory, setAnswersHistory] = useState<AnswerRecord[]>([]);
    const [playerId, setPlayerId] = useState<string | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => { if (!sessionId) return; const storedPlayerId = localStorage.getItem(`player_id_${sessionId}`); if (storedPlayerId) setPlayerId(storedPlayerId); else router.push('/join'); }, [sessionId, router]);

    useEffect(() => {
        if (!sessionId) return;
        const sessionRef = doc(db, 'quizSessions', sessionId);
        const unsubscribe = onSnapshot(sessionRef, (docSnap) => {
            if (docSnap.exists()) { setSession(docSnap.data() as Session); } else { router.push('/join'); }
        });
        return () => unsubscribe();
    }, [sessionId, router]);

    useEffect(() => {
        if (!session) return;
        const previousAnswer = answersHistory.find(a => a.questionIndex === session.currentQuestionIndex);
        setMyAnswerForCurrentQ(previousAnswer ? previousAnswer.selectedAnswerIndex : null);

        if (intervalRef.current) clearInterval(intervalRef.current);
        if (session.status === 'active' && session.questionStartTime) {
            const updateTimer = () => {
                const startTime = session.questionStartTime!.toDate().getTime();
                const now = Date.now();
                const elapsedSeconds = Math.floor((now - startTime) / 1000);
                const remaining = session.timer - elapsedSeconds;
                setTimeLeft(remaining > 0 ? remaining : 0);
            };
            updateTimer();
            intervalRef.current = setInterval(updateTimer, 1000);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [session]);

    const submitAnswer = async (answerIndex: number) => {
        if (!session || myAnswerForCurrentQ !== null || timeLeft <= 0 || session.status !== 'active') return;
        setMyAnswerForCurrentQ(answerIndex);
        const currentQuestion = session.quizData.questions[session.currentQuestionIndex];
        const isCorrect = currentQuestion.correctAnswerIndex === answerIndex;
        const scoreToAdd = isCorrect ? (100 + (timeLeft * 5)) : 0;
        setAnswersHistory(prev => [...prev, { questionIndex: session.currentQuestionIndex, selectedAnswerIndex: answerIndex, isCorrect }]);
        if (playerId && scoreToAdd > 0) {
            try {
                const sessionRef = doc(db, 'quizSessions', sessionId);
                await runTransaction(db, async (transaction) => {
                    const sessionDoc = await transaction.get(sessionRef);
                    if (!sessionDoc.exists()) throw "Session does not exist!";
                    const participants = sessionDoc.data().participants as Participant[];
                    const playerIndex = participants.findIndex(p => p.playerId === playerId);
                    if (playerIndex !== -1) {
                        const newParticipants = [...participants];
                        newParticipants[playerIndex].score += scoreToAdd;
                        transaction.update(sessionRef, { participants: newParticipants });
                    }
                });
            } catch (e) { console.error("Score update failed: ", e); }
        }
    };

    if (!session || !playerId) return <div className="text-white text-center p-8">Validating session...</div>;

    const currentQuestion = session.quizData.questions[session.currentQuestionIndex];
    const sortedParticipants = [...session.participants].sort((a, b) => b.score - a.score);

    return (
        <div className="text-white text-center p-8 min-h-screen">
            <div className='absolute top-4 right-4'><Link href="/" className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 px-4 rounded transition-colors">Exit</Link></div>
            {session.status === 'waiting' && (<div className="max-w-lg mx-auto"><h1 className="text-4xl font-bold">You&apos;re in!</h1><p className="text-zinc-400 mt-2 text-lg">Get ready... The quiz will start soon.</p><div className="mt-8 bg-zinc-800 p-6 rounded-lg"><h2 className="text-2xl font-semibold mb-4">Players Joined ({session.participants.length})</h2><div className="space-y-2 max-h-60 overflow-y-auto">{session.participants.map(p => (<p key={p.playerId} className="p-2 bg-zinc-700 rounded text-center">{p.name}</p>))}</div></div></div>)}
            {session.status === 'active' && currentQuestion && (<div className="max-w-2xl mx-auto"><div className="text-2xl font-bold mb-4">Time Left: {timeLeft}</div><h2 className="text-3xl font-semibold mb-8">{currentQuestion.questionText}</h2><div className="grid grid-cols-2 gap-4">{currentQuestion.answers.map((answer: string, index: number) => (<button key={index} onClick={() => submitAnswer(index)} disabled={myAnswerForCurrentQ !== null || timeLeft <= 0} className={`p-4 rounded-lg text-lg font-semibold transition-all duration-300 disabled:cursor-not-allowed ${myAnswerForCurrentQ === null ? 'bg-blue-600 hover:bg-blue-500' : ''} ${myAnswerForCurrentQ !== null && currentQuestion.correctAnswerIndex === index ? 'bg-green-600 scale-105' : ''} ${myAnswerForCurrentQ === index && currentQuestion.correctAnswerIndex !== index ? 'bg-red-600' : ''} ${myAnswerForCurrentQ !== null && myAnswerForCurrentQ !== index && currentQuestion.correctAnswerIndex !== index ? 'bg-zinc-700 opacity-50' : ''} `}>{answer}</button>))}</div>{myAnswerForCurrentQ !== null && <p className="mt-8 text-xl text-zinc-400 animate-pulse">Waiting for the next question...</p>}</div>)}
            {session.status === 'finished' && (<div className="max-w-3xl mx-auto"><h1 className="text-5xl font-bold mb-2">Quiz Over!</h1><h2 className="text-3xl font-semibold mb-8 text-zinc-300">Final Results</h2><div className="grid grid-cols-3 gap-4 mb-8 text-center">{sortedParticipants.slice(1, 2).map(p => (<div key={p.playerId} className="bg-zinc-700 p-4 rounded-lg border-2 border-gray-400 mt-4"><p className="text-2xl">🥈</p><p className="font-bold text-xl">{p.name}</p><p className="text-lg text-zinc-300">{p.score} pts</p></div>))}{sortedParticipants.slice(0, 1).map(p => (<div key={p.playerId} className="bg-zinc-700 p-6 rounded-lg border-2 border-yellow-400 transform scale-110"><p className="text-4xl">👑</p><p className="font-bold text-2xl">{p.name}</p><p className="text-xl text-zinc-200">{p.score} pts</p></div>))}{sortedParticipants.slice(2, 3).map(p => (<div key={p.playerId} className="bg-zinc-700 p-4 rounded-lg border-2 border-orange-400 mt-4"><p className="text-2xl">🥉</p><p className="font-bold text-xl">{p.name}</p><p className="text-lg text-zinc-300">{p.score} pts</p></div>))}</div><div className="space-y-2 mb-8">{sortedParticipants.map((p, index) => (<div key={p.playerId} className={`flex justify-between items-center p-3 rounded text-left ${p.playerId === playerId ? 'bg-blue-800 border-2 border-blue-400' : 'bg-zinc-800'}`}><span className="text-lg font-semibold">{index + 1}. {p.name}</span><span className="text-xl font-bold">{p.score}</span></div>))}</div><h2 className="text-3xl font-semibold mb-4 mt-12">Your Answer Review</h2><div className='space-y-4'>{session.quizData.questions.map((q, index) => { const myAnswer = answersHistory.find(a => a.questionIndex === index); return (<div key={index} className="p-4 bg-zinc-800 rounded-lg text-left"><p className="font-bold text-lg mb-2">{index + 1}. {q.questionText}</p><div className='space-y-1'>{q.answers.map((ans: string, ansIndex: number) => { const isCorrect = ansIndex === q.correctAnswerIndex; const isMyChoice = myAnswer?.selectedAnswerIndex === ansIndex; return (<div key={ansIndex} className={`flex items-center p-2 rounded ${isCorrect ? 'bg-green-800/60' : ''} ${isMyChoice && !isCorrect ? 'bg-red-800/60' : ''} ${!isMyChoice && !isCorrect ? 'bg-zinc-700/50' : ''}`}><div className="w-6">{isMyChoice && !isCorrect && <XIcon />}{isCorrect && <CheckIcon />}</div><span className={`ml-2 ${isMyChoice && !isCorrect ? 'line-through' : ''}`}>{ans}</span></div>); })}</div></div>); })}</div><Link href="/join" className="mt-12 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded text-lg">Play Again?</Link></div>)}
        </div>
    );
};

export default QuizPlayPage;