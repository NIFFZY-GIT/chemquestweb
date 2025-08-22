"use client";
import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const TutorAuthForm = () => {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const goToDashboard = () => router.push('/classroom/dashboard');

    const handleSignUp = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setError('');
        setLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            goToDashboard();
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
            else setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            goToDashboard();
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
            else setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const submit = (e: React.FormEvent) => {
        if (mode === 'login') return void handleLogin(e);
        return void handleSignUp(e);
    };

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-700 rounded-2xl shadow-xl">
            <div className="flex flex-col items-center gap-3 mb-4">
                <img src="/images/logo.png" alt="ChemQuest" className="w-28 h-auto" />
                <h2 className="text-2xl font-extrabold text-white">Tutor Portal</h2>
                <p className="text-sm text-zinc-300">Manage quizzes, run live sessions, and view results.</p>
            </div>

            <div className="bg-zinc-800 p-4 rounded-lg">
                <div role="tablist" aria-label="Authentication tabs" className="flex rounded-md bg-zinc-700 p-1 mb-4">
                    <button
                        role="tab"
                        aria-selected={mode === 'login'}
                        onClick={() => setMode('login')}
                        className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${mode === 'login' ? 'bg-zinc-900 text-white shadow-inner' : 'text-zinc-300 hover:bg-zinc-600'}`}
                    >
                        Login
                    </button>
                    <button
                        role="tab"
                        aria-selected={mode === 'signup'}
                        onClick={() => setMode('signup')}
                        className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${mode === 'signup' ? 'bg-zinc-900 text-white shadow-inner' : 'text-zinc-300 hover:bg-zinc-600'}`}
                    >
                        Sign Up
                    </button>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm text-zinc-300 mb-1">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 rounded bg-zinc-700 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="you@school.edu"
                            aria-label="Email address"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm text-zinc-300 mb-1">Password</label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-3 py-2 rounded bg-zinc-700 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter a strong password"
                                aria-label="Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((s) => !s)}
                                className="absolute right-2 top-2 text-zinc-300 hover:text-white"
                                aria-pressed={showPassword}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>

                    {error && <div className="text-sm text-red-400 bg-red-950/20 p-2 rounded">{error}</div>}

                    <div className="flex items-center justify-between gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-60 text-white font-semibold py-2 px-4 rounded-md transition-all"
                        >
                            {loading ? (mode === 'login' ? 'Signing in...' : 'Creating account...') : mode === 'login' ? 'Login' : 'Sign Up'}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setMode((m) => (m === 'login' ? 'signup' : 'login'));
                                setError('');
                            }}
                            className="text-sm text-zinc-300 hover:text-white"
                        >
                            {mode === 'login' ? "Need an account?" : 'Have an account?'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TutorAuthForm;