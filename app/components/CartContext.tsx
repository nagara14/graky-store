'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'

interface CartItem {
  cartId: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    photoUrl: string
    categoryId: string
    condition: string
  }
}

interface CartContextType {
  items: CartItem[]
  loading: boolean
  total: number
  addItem: (productId: string, quantity?: number) => Promise<void>
  removeItem: (cartId: string) => Promise<void>
  updateQuantity: (cartId: string, quantity: number) => Promise<void>
  clear: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Mount pada client saja
  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchCart = async () => {
    if (!session || status !== 'authenticated') {
      setItems([])
      return
    }
    try {
      setLoading(true)
      const res = await axios.get('/api/cart')
      setItems(res.data || [])
    } catch (error) {
      console.error('Error fetching cart:', error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch cart saat session berubah
  useEffect(() => {
    if (!mounted) return

    if (status === 'authenticated') {
      fetchCart()
    } else {
      setItems([])
    }
  }, [status, session, mounted])

  const addItem = async (productId: string, quantity = 1) => {
    try {
      setLoading(true)
      await axios.post('/api/cart', { productId, quantity })
      await fetchCart()
    } catch (error) {
      console.error('Error adding to cart:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (cartId: string) => {
    try {
      setLoading(true)
      await axios.delete(`/api/cart/${cartId}`)
      await fetchCart()
    } catch (error) {
      console.error('Error removing from cart:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (cartId: string, quantity: number) => {
    try {
      setLoading(true)
      if (quantity <= 0) {
        await removeItem(cartId)
      } else {
        await axios.put(`/api/cart/${cartId}`, { quantity })
        await fetchCart()
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const clear = async () => {
    setItems([])
  }

  const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

  // Always render Provider to avoid "useCart must be used within CartProvider" error
  // The content inside will handle loading states if needed
  return (
    <CartContext.Provider value={{ items, loading, total, addItem, removeItem, updateQuantity, clear }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
