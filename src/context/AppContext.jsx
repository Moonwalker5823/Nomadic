import React, { createContext, useContext, useState, useEffect } from 'react'

const DEFAULT_SERVICES = [
  { id: 1,  name: 'Haircut (All Styles)',        price: 35, duration: '45 min' },
  { id: 2,  name: 'Haircut + Beard',             price: 45, duration: '1 hr' },
  { id: 3,  name: 'Beard Grooming',              price: 25, duration: '30 min' },
  { id: 4,  name: 'Beard Line-Up',               price: 15, duration: '30 min' },
  { id: 5,  name: 'Line-Up / Edge-Up',           price: 20, duration: '15 min' },
  { id: 6,  name: 'Neck Clean-Up',               price: 10, duration: '15 min' },
  { id: 7,  name: 'Luxury Haircut Experience',   price: 60, duration: '1 hr' },
  { id: 8,  name: 'Full Grooming Package',       price: 75, duration: '1 hr 15 min' },
  { id: 9,  name: 'Color Enhancement Service',   price: 50, duration: '1 hr 15 min' },
]

const DEFAULT_BIO = "Kevin J., also known as \"The Nomadic Barber,\" is a licensed barber with four years of experience, specializing in all hair types with a focus on detailed fades, tapers, combovers, and precise beard work. As a Navy veteran, he brings discipline, consistency, and a strong attention to detail into every service.\n\nFind Kevin at The Cutt'n Edge Barbershop — 6485 El Cajon Blvd, San Diego, CA 92115"

const DEFAULT_GALLERY = [
  'Pics/684164557_18105707891493880_6215444932153267330_n.jpg',
  'Pics/689525778_18106187012493880_4635702738478548565_n.jpg',
  'Pics/698639675_18106930835493880_8454435006802554062_n.jpg',
  'Pics/704703099_18107688311493880_2138951288938041713_n.jpg',
  'Pics/705590219_18108040844493880_85853694783984546_n.jpg',
  'Pics/706880751_18108958424493880_4668758891061015410_n.jpg',
  'Pics/709155910_18108427688493880_4354464547419515130_n.jpg',
  'Pics/709548976_18108705737493880_963180560121987404_n.jpg',
]

const AppContext = createContext(null)

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch { return fallback }
}

export function AppProvider({ children }) {
  const [services, setServices] = useState(() => load('nomadic_services', DEFAULT_SERVICES))
  const [bio, setBio] = useState(() => load('nomadic_bio', DEFAULT_BIO))
  const [gallery, setGallery] = useState(() => load('nomadic_gallery', DEFAULT_GALLERY))
  const [bookings, setBookings] = useState(() => load('nomadic_bookings', []))

  const saveServices = (val) => {
    setServices(val)
    localStorage.setItem('nomadic_services', JSON.stringify(val))
  }

  const saveBio = (val) => {
    setBio(val)
    localStorage.setItem('nomadic_bio', JSON.stringify(val))
  }

  const saveGallery = (val) => {
    setGallery(val)
    localStorage.setItem('nomadic_gallery', JSON.stringify(val))
  }

  const addBooking = (booking) => {
    const next = [...bookings, { ...booking, id: Date.now(), status: 'Pending' }]
    setBookings(next)
    localStorage.setItem('nomadic_bookings', JSON.stringify(next))
  }

  const updateBooking = (id, status) => {
    const next = bookings.map(b => b.id === id ? { ...b, status } : b)
    setBookings(next)
    localStorage.setItem('nomadic_bookings', JSON.stringify(next))
  }

  const clearBookings = () => {
    setBookings([])
    localStorage.removeItem('nomadic_bookings')
  }

  return (
    <AppContext.Provider value={{
      services, saveServices,
      bio, saveBio,
      gallery, saveGallery,
      bookings, addBooking, updateBooking, clearBookings,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
