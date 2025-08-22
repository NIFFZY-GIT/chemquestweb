"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import LiveScoreboard from '@/components/LiveScoreboard';

// --- TYPE DEFINITIONS ---
interface Question {
    questionText: string;
    answers: string[];
    correctAnswerIndex: number;
}
interface Participant {
    name: string;
    score: number;
    playerId: string;
}
interface Session {
    quizData: { title: string; questions: Question[]; defaultTimer?: number; };
    secretCode: string;
    status: 'waiting' | 'active' | 'finished';
    currentQuestionIndex: number;
    participants: Participant[];
    timer: number;
}

const LiveSessionClient = ({ sessionId }: { sessionId: string }) => {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    
    const [session, setSession] = useState<Session | null>(null);
    const [timer, setTimer] = useState(30);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId || authLoading) return;
        if (!user) {
            router.push('/classroom');
            return;
        }
        
        const sessionRef = doc(db, 'quizSessions', sessionId);
        const unsubscribe = onSnapshot(sessionRef, 
            (docSnap) => {
                if (docSnap.exists()) {
                    const sessionData = docSnap.data() as Session;
                    if (!session) { // Only set the timer on the very first load
                        setTimer(sessionData.quizData.defaultTimer || 30);
                    }
                    setSession(sessionData);
                } else {
                    setError("This quiz session could not be found.");
                    setTimeout(() => router.push('/classroom/dashboard'), 3000);
                }
            }, 
            (err) => {
                setError("Permission denied. Check Firestore rules.");
                console.error("Firestore listener error:", err);
            }
        );
        return () => unsubscribe();
    }, [user, authLoading, router, sessionId, session]);

    const handleNextQuestion = async () => {
        if (!session) return;
        const nextIndex = session.currentQuestionIndex + 1;
        const sessionRef = doc(db, 'quizSessions', sessionId);
        if (nextIndex < session.quizData.questions.length) {
            await updateDoc(sessionRef, {
                currentQuestionIndex: nextIndex,
                status: 'active',
                timer: timer,
                questionStartTime: serverTimestamp()
            });
        } else {
            await updateDoc(sessionRef, { status: 'finished' });
        }
    };

    const handleEndSession = async () => {
        await signOut(auth);
        router.push('/classroom');
    };

    if (error) return <div className="text-red-500 text-center p-8 font-semibold">{error}</div>;
    if (authLoading || !session) return <div className="text-white text-center p-8">Loading Session...</div>;

    const currentQuestion = session.quizData.questions[session.currentQuestionIndex];

    return (
        <div className="text-white">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold">{session.quizData.title}</h1>
                <button onClick={handleEndSession} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                    End Session & Logout
                </button>
            </div>
            
            {/* Control Bar Section */}
            <div className="mt-4 p-4 bg-zinc-800 rounded-lg flex flex-wrap justify-between items-center gap-4">
                <div>
                    <p className="text-zinc-400">Join with Secret Code:</p>
                    <p className="text-4xl font-mono tracking-widest">{session.secretCode}</p>
                </div>
                <div className="flex items-center gap-4">
                    <label>Timer (sec):</label>
                    <input type="number" value={timer} onChange={(e) => setTimer(Number(e.target.value))} className="w-20 p-2 rounded bg-zinc-700" />
                </div>
                <div className="text-center">
                    <p className="text-zinc-400">Players Joined</p>
                    <p className="text-4xl font-bold">{session.participants.length}</p>
                </div>
                <button 
                    onClick={handleNextQuestion} 
                    disabled={session.status === 'finished'} 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded disabled:bg-zinc-600">
                    {session.status === 'waiting' ? 'Start Quiz' : session.status === 'finished' ? 'Quiz Finished' : 'Next Question'}
                </button>
            </div>

            {/* Main Content Grid */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Live View Panel */}
                <div className="md:col-span-2 bg-zinc-800 p-6 rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4">Live View</h2>
                    {session.status === 'waiting' && <p>Waiting for players to join... Share the code!</p>}
                    {session.status === 'finished' && <p>The quiz has ended! Here are the final results.</p>}
                    {currentQuestion && session.status === 'active' && (
                        <div>
                            <h3 className="text-xl mb-4">Question {session.currentQuestionIndex + 1}: {currentQuestion.questionText}</h3>
                        </div>
                    )}
                </div>
                
                {/* Scoreboard Panel */}
                <div className="md:col-span-1">
                    <LiveScoreboard sessionId={sessionId} />
                </div>
            </div>
        </div>
    );
};

export default LiveSessionClient;