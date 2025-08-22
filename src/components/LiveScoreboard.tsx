"use client";
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

// Define a type for participants for better code quality
type Participant = {
    name: string;
    score: number;
};

const LiveScoreboard = ({ sessionId }: { sessionId: string }) => {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        if (!sessionId) return;

        const sessionDocRef = doc(db, 'quizSessions', sessionId);

        // This is the real-time listener!
        const unsubscribe = onSnapshot(sessionDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setStatus(data.status);
                // Sort participants by score, descending
                const sortedParticipants = (data.participants || []).sort((a: Participant, b: Participant) => b.score - a.score);
                setParticipants(sortedParticipants);
            } else {
                console.error("Session not found!");
                setStatus('error');
            }
        });

        // Cleanup function to stop listening when the component unmounts
        return () => unsubscribe();
    }, [sessionId]);

    return (
        <div className="p-8 bg-zinc-800 rounded-lg text-white">
            <h2 className="text-3xl font-bold mb-4">Live Scoreboard</h2>
            <p className="mb-6">Status: <span className="font-mono bg-zinc-700 px-2 py-1 rounded">{status}</span></p>
            
            <div className="space-y-2">
                {participants.map((p, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-zinc-700 rounded">
                        <span className="text-lg">{index + 1}. {p.name}</span>
                        <span className="text-xl font-bold">{p.score}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LiveScoreboard;