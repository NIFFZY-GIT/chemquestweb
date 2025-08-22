"use client";

import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Quiz } from '@/app/classroom/dashboard/page';
import { useQuizForm } from '@/hooks/useQuizForm';

interface EditQuizModalProps {
    quiz: Quiz | null;
    isOpen: boolean;
    onClose: () => void;
}

const EditQuizModal = ({ quiz, isOpen, onClose }: EditQuizModalProps) => {
    const {
        quizTitle, setQuizTitle, questions, addQuestion, removeQuestion,
        handleQuestionTextChange, handleAnswerChange, handleCorrectAnswerChange,
        defaultTimer, setDefaultTimer
    } = useQuizForm(quiz);

    if (!isOpen || !quiz) return null;

    const handleSaveChanges = async () => {
        const quizRef = doc(db, 'quizzes', quiz.id);
        try {
            await updateDoc(quizRef, {
                title: quizTitle,
                questions: questions,
                defaultTimer: defaultTimer,
            });
            onClose();
        } catch (error) {
            console.error("Error updating quiz:", error);
            alert("Failed to save changes.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-zinc-800 p-6 rounded-lg w-full max-w-3xl text-white max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6">Edit Quiz</h2>
                <div className="space-y-6">
                    <div>
                        <label className="block mb-1 text-lg">Quiz Title</label>
                        <input type="text" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} required className="w-full p-2 rounded bg-zinc-700" />
                    </div>
                    <div>
                        <label className="block mb-1 text-lg">Default Timer (seconds)</label>
                        <input type="number" value={defaultTimer} onChange={(e) => setDefaultTimer(Number(e.target.value))} required className="w-full p-2 rounded bg-zinc-700" min="5" />
                    </div>
                    {questions.map((q, qIndex) => (
                        <div key={qIndex} className="bg-zinc-900 p-4 rounded-md border border-zinc-700 space-y-3">
                            <div className="flex justify-between items-center"><h3 className="font-semibold">Question {qIndex + 1}</h3>{questions.length > 1 && (<button type="button" onClick={() => removeQuestion(qIndex)} className="text-red-500 hover:text-red-400 text-sm">Remove</button>)}</div>
                            <input type="text" value={q.questionText} onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)} placeholder="Question Text" required className="w-full p-2 rounded bg-zinc-700" />
                            {q.answers.map((answer, aIndex) => (<input key={aIndex} type="text" value={answer} onChange={(e) => handleAnswerChange(qIndex, aIndex, e.target.value)} placeholder={`Answer ${aIndex + 1}`} required className="w-full p-2 rounded bg-zinc-700" />))}
                            <select value={q.correctAnswerIndex} onChange={(e) => handleCorrectAnswerChange(qIndex, Number(e.target.value))} className="w-full p-2 rounded bg-zinc-700">{q.answers.map((_, index) => (<option key={index} value={index}>Answer {index + 1} is correct</option>))}</select>
                        </div>
                    ))}
                    <button type="button" onClick={addQuestion} className="w-full border-2 border-dashed border-zinc-600 hover:bg-zinc-700 text-zinc-300 font-bold py-2 px-4 rounded">+ Add Question</button>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="bg-zinc-600 hover:bg-zinc-700 font-bold py-2 px-4 rounded">Cancel</button>
                    <button onClick={handleSaveChanges} className="bg-blue-600 hover:bg-blue-700 font-bold py-2 px-4 rounded">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export default EditQuizModal;