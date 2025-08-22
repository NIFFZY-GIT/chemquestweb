"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';

const JoinPage = () => {
    const [step, setStep] = useState<'code' | 'name'>('code');
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [sessionId, setSessionId] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Added for better UX
    const router = useRouter();

    const handleCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        // Find the quiz session with the entered code
        const sessionsRef = collection(db, 'quizSessions');
        const q = query(sessionsRef, where('secretCode', '==', code.trim()), where('status', '==', 'waiting'));
        
        try {
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setError('Invalid code or the quiz has already started.');
                setIsLoading(false);
                return;
            }

            const sessionDoc = querySnapshot.docs[0];
            setSessionId(sessionDoc.id);
            setStep('name'); // Move to the next step
        } catch (err) {
            setError("Failed to connect to the server. Please try again.");
            console.error(err);
        }
        setIsLoading(false);
    };

    const handleNameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name.trim()) {
            setError('Please enter your name.');
            return;
        }
        setIsLoading(true);

        // This is the new player object that will be added to Firestore
        const newPlayer = {
            name: name.trim(),
            score: 0,
            playerId: `${Date.now()}-${Math.random()}` 
        };

        // Add the student to the participants array in Firestore
        const sessionRef = doc(db, 'quizSessions', sessionId);
        try {
            await updateDoc(sessionRef, {
                participants: arrayUnion(newPlayer)
            });

            // --- THIS IS THE CRITICAL FIX ---
            // Save the unique player ID to the browser's local storage.
            // This is how the next page will identify the current player.
            localStorage.setItem(`player_id_${sessionId}`, newPlayer.playerId);

            // Redirect the student to the quiz playing page
            router.push(`/quiz/${sessionId}`);

        } catch (err) {
            setError("Failed to join the game. Please try again.");
            console.error(err);
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-12 text-white">
            <div className="max-w-md w-full mx-auto p-8 bg-zinc-800 rounded-lg">
                {step === 'code' && (
                    <form onSubmit={handleCodeSubmit} className="space-y-4">
                        <h2 className="text-2xl font-bold text-center">Join Quiz</h2>
                        <input 
                            type="text" 
                            value={code} 
                            onChange={(e) => setCode(e.target.value)} 
                            placeholder="Enter Secret Code" 
                            disabled={isLoading}
                            className="w-full p-3 rounded bg-zinc-700 text-white text-center text-lg tracking-widest disabled:opacity-50" 
                        />
                        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 font-bold py-3 px-4 rounded disabled:bg-blue-800">
                            {isLoading ? 'Finding...' : 'Find Quiz'}
                        </button>
                    </form>
                )}
                {step === 'name' && (
                     <form onSubmit={handleNameSubmit} className="space-y-4">
                        <h2 className="text-2xl font-bold text-center">Enter Your Name</h2>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="Your Name" 
                            disabled={isLoading}
                            className="w-full p-3 rounded bg-zinc-700 text-white text-center text-lg disabled:opacity-50" 
                        />
                        <button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 font-bold py-3 px-4 rounded disabled:bg-green-800">
                             {isLoading ? 'Joining...' : 'Join Game'}
                        </button>
                    </form>
                )}
                 {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
            </div>
        </div>
    );
};

export default JoinPage;