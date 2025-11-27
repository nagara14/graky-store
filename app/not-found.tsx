import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-graky-cream">
      <div className="text-center space-y-4">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-4xl font-bold text-graky-dark">404</h1>
        <p className="text-graky-brown/70">Halaman tidak ditemukan</p>
        <Link
          href="/"
          className="inline-block bg-graky-dark text-white px-6 py-2 rounded-lg hover:bg-graky-charcoal transition font-semibold"
        >
          Kembali ke Home
        </Link>
      </div>
    </div>
  )
}
