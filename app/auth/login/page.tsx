import { Metadata } from 'next'
import Link from 'next/link'
import LoginForm from '@/app/components/LoginForm'

export const metadata: Metadata = {
  title: 'Login - Graky Store',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-graky-tan/10 to-graky-brown/10 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-graky-cream rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-graky-dark">GRAKY</h1>
            <p className="text-graky-brown/70 text-sm mt-2">Masuk ke akun Anda</p>
          </div>

          <LoginForm />

          <div className="text-center text-sm text-graky-brown/70">
            <p>
              Belum punya akun?{' '}
              <Link href="/auth/register" className="text-graky-dark font-semibold hover:underline">
                Daftar
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-graky-brown hover:text-graky-dark text-sm font-semibold">
            ← Kembali ke Home
          </Link>
        </div>
      </div>
    </div>
  )
}