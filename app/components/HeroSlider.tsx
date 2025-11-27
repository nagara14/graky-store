'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Slide {
  id: number
  title: string
  subtitle: string
  description: string
  image: string
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'Jual Beli',
    subtitle: 'Vintage Terbaik',
    description: 'Style Gak Harus Mahal',
    image: '/img/8.jpeg',
  },
  {
    id: 2,
    title: 'Streetwear',
    subtitle: 'Koleksi Premium',
    description: 'Thrift Dulu Biar Glow Up',
    image: '/img/7.jpeg',
  },
  {
    id: 3,
    title: 'Thrifting',
    subtitle: 'Unik & Berkualitas',
    description: 'Cari Barang Impianmu',
    image: '/img/6.jpeg',
  },
  {
    id: 4,
    title: 'Fashion',
    subtitle: 'Gaya Vintage Asli',
    description: 'Update Koleksi Setiap Hari',
    image: '/img/5.png',
  },
]

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const [transitionClass, setTransitionClass] = useState('')

  // Auto play slides
  useEffect(() => {
    if (!isAutoPlay) return

    const interval = setInterval(() => {
      setTransitionClass('transition-opacity duration-1000 ease-in-out')
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlay])

  const goToSlide = (index: number) => {
    setTransitionClass('transition-opacity duration-700 ease-in-out')
    setCurrentSlide(index)
    setIsAutoPlay(false)
    
    // Resume auto play after 8 seconds
    setTimeout(() => setIsAutoPlay(true), 8000)
  }

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % slides.length)
  }

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length)
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Slider Container */}
      <div className="relative h-96 sm:h-[500px] lg:h-[600px]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
            } ${transitionClass}`}
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
            }}
          >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/45" />

            {/* Content dengan text berwarna terang */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-2 sm:space-y-4 px-4 z-10">
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg mb-1 sm:mb-2">
                  {slide.title}
                </h2>
                <p className="text-xl sm:text-3xl lg:text-4xl font-semibold text-yellow-100 drop-shadow-md">
                  {slide.subtitle}
                </p>
                <p className="text-sm sm:text-lg text-white drop-shadow-md mt-2 sm:mt-4">
                  {slide.description}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-white/80 hover:bg-white rounded-full shadow-lg hover:scale-110 transition"
        >
          <ChevronLeft size={24} className="text-amber-900" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-white/80 hover:bg-white rounded-full shadow-lg hover:scale-110 transition"
        >
          <ChevronRight size={24} className="text-amber-900" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3 sm:gap-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-3 sm:h-4 rounded-full transition-all duration-500 ${
                index === currentSlide
                  ? 'w-8 sm:w-10 bg-white'
                  : 'w-3 sm:w-4 bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Info text */}
      <div className="bg-amber-900/20 border-t border-amber-900/30 px-4 sm:px-6 lg:px-8 py-4 text-center">
        <p className="text-xs sm:text-sm text-amber-900/70">
          Slide {currentSlide + 1} dari {slides.length}
        </p>
      </div>
    </div>
  )
}
