import React, { useState } from 'react'
import { AppProvider } from './context/AppContext'
import Intro from './components/Intro'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Picks from './components/Picks'
import Prices from './components/Prices'
import About from './components/About'
import Booking from './components/Booking'
import Footer from './components/Footer'
import Admin from './components/Admin'
import PasswordModal from './components/PasswordModal'

const introSeen = sessionStorage.getItem('nomadic_intro_seen')

function Site() {
  const [showIntro, setShowIntro] = useState(!introSeen)
  const [showPwd, setShowPwd] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)

  return (
    <>
      {showIntro && <Intro onDone={() => setShowIntro(false)} />}

      {!showIntro && (
        <>
          <Nav />
          <main>
            <Hero />
            <Picks />
            <Prices />
            <About />
            <Booking />
          </main>
          <Footer
            onAdminTrigger={() => setShowPwd(true)}
          />
        </>
      )}

      {showPwd && (
        <PasswordModal
          onSuccess={() => { setShowPwd(false); setShowAdmin(true) }}
          onClose={() => setShowPwd(false)}
        />
      )}

      {showAdmin && (
        <Admin onClose={() => setShowAdmin(false)} />
      )}
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Site />
    </AppProvider>
  )
}
