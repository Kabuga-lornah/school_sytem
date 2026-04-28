import { useEffect, useState } from 'react'

function getInitialTheme() {
  return localStorage.getItem('theme') || 'dark'
}

function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
    >
      {theme === 'dark' ? 'Light mode' : 'Dark mode'}
    </button>
  )
}

export default ThemeToggle
