'use client'

import { useLoading } from '@/app/context/LoadingContext'
import CustomLoader from './CustomLoader'

export default function GlobalLoader() {
  const { isLoading, message } = useLoading()
  return <CustomLoader show={isLoading} message={message} />
}
