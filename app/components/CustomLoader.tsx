'use client'

interface CustomLoaderProps {
  show: boolean
  message?: string
}

export default function CustomLoader({ show, message }: CustomLoaderProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-6 shadow-2xl">
        <div className="flex-col gap-4 w-full flex items-center justify-center">
          <div className="w-20 h-20 border-4 border-transparent text-graky-brown text-4xl animate-spin flex items-center justify-center border-t-graky-brown rounded-full">
            <div className="w-16 h-16 border-4 border-transparent text-graky-rust text-2xl animate-spin flex items-center justify-center border-t-graky-rust rounded-full"></div>
          </div>
        </div>
        {message && (
          <p className="text-graky-dark font-medium text-center">{message}</p>
        )}
      </div>
    </div>
  )
}
