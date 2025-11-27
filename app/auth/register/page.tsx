import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import RegisterForm from '@/app/components/RegisterForm'

export const metadata: Metadata = {
  title: 'Daftar - Graky Store',
}

export default async function RegisterPage() {
  const session = await auth()

  if (session) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-graky-tan/10 to-graky-brown/10 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-graky-cream rounded-2xl shadow-xl p-8 space-y-6">
          {/* Logo */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-graky-dark">GRAKY</h1>
            <p className="text-graky-brown/70 text-sm mt-2">Buat akun baru</p>
          </div>

          {/* Form */}
          <RegisterForm />

          {/* Footer */}
          <div className="text-center text-sm text-graky-brown/70">
            <p>
              Sudah punya akun?{' '}
              <Link href="/auth/login" className="text-graky-dark font-semibold hover:underline">
                Masuk
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-graky-brown hover:text-graky-dark text-sm font-semibold">
            ← Kembali ke Home
          </Link>
        </div>
      </div>
    </div>
  )
}
