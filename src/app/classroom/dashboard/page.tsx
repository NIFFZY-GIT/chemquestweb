"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import EditQuizModal from '@/components/EditQuizModal';
import { useQuizForm } from '@/hooks/useQuizForm';

// --- TYPE DEFINITIONS ---
export interface Question {
    questionText: string;
    answers: string[];
    correctAnswerIndex: number;
}
export interface Quiz {
    id: string;
    title: string;
    questions: Question[];
    defaultTimer?: number; // Timer is optional for backwards compatibility
}

// --- MAIN DASHBOARD COMPONENT ---
const DashboardPage = () => {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    
    const createForm = useQuizForm(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

    useEffect(() => { if (!loading && !user) router.push('/classroom'); }, [user, loading, router]);
    useEffect(() => {
        if (user) {
            const q = query(collection(db, 'quizzes'), where('tutorId', '==', user.uid));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const quizzesData: Quiz[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz));
                setQuizzes(quizzesData);
            });
            return () => unsubscribe();
        }
    }, [user]);

    
    const handleDeleteQuiz = async (quizId: string) => { if (window.confirm("Are you sure?")) { await deleteDoc(doc(db, 'quizzes', quizId)); } };
    const handleOpenEditModal = (quiz: Quiz) => { setEditingQuiz(quiz); setIsModalOpen(true); };
    
    const handleCreateQuizSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !createForm.quizTitle.trim() || createForm.questions.some(q => !q.questionText.trim())) {
            alert("Please fill out the quiz title and all question fields."); return;
        }
        try {
            await addDoc(collection(db, 'quizzes'), {
                tutorId: user.uid,
                title: createForm.quizTitle,
                questions: createForm.questions,
                defaultTimer: createForm.defaultTimer, // Save the timer
                createdAt: serverTimestamp(),
            });
            createForm.setQuizTitle('');
            createForm.setQuestions([{ questionText: '', answers: ['', '', '', '', ''], correctAnswerIndex: 0 }]);
            createForm.setDefaultTimer(30); // Reset the timer in the form
        } catch (error) { console.error("Error creating quiz:", error); }
    };

    const handleStartSession = async (quiz: Quiz) => {
        if (!user) return;
        const secretCode = Math.floor(100000 + Math.random() * 900000).toString();
        const sessionRef = await addDoc(collection(db, 'quizSessions'), { tutorId: user.uid, quizData: quiz, secretCode, status: 'waiting', participants: [], currentQuestionIndex: -1, createdAt: serverTimestamp() });
        router.push(`/classroom/live/${sessionRef.id}`);
    };

    if (loading) return <div className="text-center text-white">Loading...</div>;
    if (!user) return null;

    return (
        <>
            <EditQuizModal quiz={editingQuiz} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <div className="text-white">
                 <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Tutor Dashboard</h1>
                    <div><span className="text-zinc-400 mr-4">{user.email}</span></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-zinc-800 p-6 rounded-lg">
                        <h2 className="text-2xl font-semibold mb-4">Create New Quiz</h2>
                        <form onSubmit={handleCreateQuizSubmit} className="space-y-6">
                            <div><label className="block mb-1 text-lg">Quiz Title</label><input type="text" value={createForm.quizTitle} onChange={(e) => createForm.setQuizTitle(e.target.value)} required className="w-full p-2 rounded bg-zinc-700" /></div>
                            <div><label className="block mb-1 text-lg">Default Timer (seconds)</label><input type="number" value={createForm.defaultTimer} onChange={(e) => createForm.setDefaultTimer(Number(e.target.value))} required className="w-full p-2 rounded bg-zinc-700" min="5" /></div>
                            {createForm.questions.map((q, qIndex) => (<div key={qIndex} className="bg-zinc-900 p-4 rounded-md border border-zinc-700 space-y-3"><div className="flex justify-between items-center"><h3 className="font-semibold">Question {qIndex + 1}</h3>{createForm.questions.length > 1 && (<button type="button" onClick={() => createForm.removeQuestion(qIndex)} className="text-red-500 hover:text-red-400 text-sm">Remove</button>)}</div><input type="text" value={q.questionText} onChange={(e) => createForm.handleQuestionTextChange(qIndex, e.target.value)} placeholder="Question Text" required className="w-full p-2 rounded bg-zinc-700" />{q.answers.map((answer, aIndex) => (<input key={aIndex} type="text" value={answer} onChange={(e) => createForm.handleAnswerChange(qIndex, aIndex, e.target.value)} placeholder={`Answer ${aIndex + 1}`} required className="w-full p-2 rounded bg-zinc-700" />))}<select value={q.correctAnswerIndex} onChange={(e) => createForm.handleCorrectAnswerChange(qIndex, Number(e.target.value))} className="w-full p-2 rounded bg-zinc-700">{q.answers.map((_, index) => (<option key={index} value={index}>Answer {index + 1} is correct</option>))}</select></div>))}
                            <button type="button" onClick={createForm.addQuestion} className="w-full border-2 border-dashed border-zinc-600 hover:bg-zinc-700 text-zinc-300 font-bold py-2 px-4 rounded">+ Add Question</button>
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded text-lg">Create Quiz</button>
                        </form>
                    </div>
                    <div className="bg-zinc-800 p-6 rounded-lg">
                        <h2 className="text-2xl font-semibold mb-4">Your Quizzes</h2>
                        <div className="space-y-3">{quizzes.map((quiz) => (<div key={quiz.id} className="bg-zinc-700 p-4 rounded"><div className="flex justify-between items-center"><div><p className="font-bold">{quiz.title}</p><p className="text-sm text-zinc-400">{quiz.questions?.length || 0} Question(s)</p></div><button onClick={() => handleStartSession(quiz)} className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded text-sm font-semibold">Start Live Session</button></div><div className="flex justify-end gap-2 mt-2 pt-2 border-t border-zinc-600"><button onClick={() => handleOpenEditModal(quiz)} className="text-xs text-blue-400 hover:underline">Edit</button><button onClick={() => handleDeleteQuiz(quiz.id)} className="text-xs text-red-400 hover:underline">Delete</button></div></div>))}</div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardPage;