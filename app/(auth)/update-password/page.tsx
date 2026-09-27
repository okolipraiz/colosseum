'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

  
    const handleUpdatePassword = async () => {
        try {
            setLoading(true)
            setError(null)
            setSuccess(null)

            if (!password || !confirmPassword) {
                setError('Please fill in all fields')
                return
            }

            if (password !== confirmPassword) {
                setError('Passwords do not match')
                return
            }

            if (password.length < 6) {
                setError('Password must be at least 6 characters')
                return
            }
        } catch (error) {
            console.error(error)
            setError('An unexpected error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleUpdatePassword()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="relative w-full max-w-md p-8 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-md shadow-lg text-white">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-1">Update Password</h1>
                    <p className="text-slate-300 text-sm">Set your new password below</p>
                </div>

                <div className="space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm">
                            {success}
                        </div>
                    )}

                    <div className="space-y-4">
                        <InputField
                            id="password"
                            label="New Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={setPassword}
                            onKeyPress={handleKeyPress}
                        />
                        <InputField
                            id="confirmPassword"
                            label="Confirm New Password"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={setConfirmPassword}
                            onKeyPress={handleKeyPress}
                        />
                    </div>

                    <button
                        onClick={handleUpdatePassword}
                        disabled={loading || !!success}
                        className="w-full py-4 rounded-xl bg-black hover:bg-slate-900 font-semibold shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </div>
        </div>
    )
}

function InputField({
    id,
    label,
    type,
    placeholder,
    value,
    onChange,
    onKeyPress,
}: {
    id: string
    label: string
    type: string
    placeholder: string
    value: string
    onChange: (val: string) => void
    onKeyPress: (e: React.KeyboardEvent) => void
}) {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-2">
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={inputType}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyPress={onKeyPress}
                    placeholder={placeholder}
                    className={`w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition ${isPassword ? 'pr-12' : ''
                        }`}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white transition"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                )}
            </div>
        </div>
    )
}
