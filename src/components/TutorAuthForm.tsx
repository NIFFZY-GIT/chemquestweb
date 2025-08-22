"use client";
import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const TutorAuthForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            router.push('/classroom/dashboard');
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred.');
            }
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/classroom/dashboard');
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred.');
            }
        }
    };

    return (
        <div className="max-w-md mx-auto p-8 bg-zinc-800 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-6">Tutor Portal</h2>
            <form className="space-y-4">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full p-2 rounded bg-zinc-700 text-white" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full p-2 rounded bg-zinc-700 text-white" />
                {error && <p className="text-red-500">{error}</p>}
                <div className="flex gap-4">
                    <button onClick={handleLogin} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Login</button>
                    <button onClick={handleSignUp} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Sign Up</button>
                </div>
            </form>
        </div>
    );
};

export default TutorAuthForm;