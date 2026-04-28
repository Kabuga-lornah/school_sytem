import { Link } from 'react-router-dom'

import ThemeToggle from '../components/ThemeToggle'
import { ROLE_CONFIG } from '../utils/roles'
import '../App.css'

const featureCards = [
  {
    title: 'Academic tracking',
    description: 'Follow results, ongoing performance, and subject-level trends without relying on scattered updates.',
  },
  {
    title: 'Fees management',
    description: 'Monitor balances, overdue accounts, and payment activity with clearer visibility for both parents and schools.',
  },
  {
    title: 'Pocket money wallet',
    description: 'Track wallet balances, spending activity, and student transactions from one trusted platform.',
  },
  {
    title: 'Smart alerts',
    description: 'Get timely notifications about low balance, overdue fees, and academic concerns.',
  },
  {
    title: 'Parent-teacher communication',
    description: 'Keep families and school teams connected through faster, more reliable updates.',
  },
  {
    title: 'Report cards',
    description: 'Present results in a clear format that is easy to access whenever parents need them.',
  },
  {
    title: 'Analytics',
    description: 'Give school teams a better picture of collections, performance trends, and communication health.',
  },
]

function HomePage() {
  return (
    <div className="landing-premium">
      <div className="landing-shell">
        <div className="landing-toolbar">
          <ThemeToggle />
        </div>
        <section className="home-hero">
          <p className="landing-kicker">About MyShule</p>
          <h1>Everything schools need to keep parents informed and operations running smoothly</h1>
          <p className="landing-subtext">
            MyShule brings academics, finance, communication, and analytics into one connected
            school platform that feels clear for parents and efficient for administrators.
          </p>
          <div className="landing-actions landing-actions-left">
            <Link className="button-primary" to="/">
              Choose your role
            </Link>
            <Link className="button-link" to="/login?role=parent">
              Try Parent Login
            </Link>
          </div>
        </section>

        <section className="landing-section">
          <div className="landing-section-heading">
            <h2>What MyShule helps you manage</h2>
            <p>
              From fee collection to report cards, the platform is designed to reduce confusion and
              create better school-home visibility.
            </p>
          </div>

          <div className="feature-grid-premium">
            {featureCards.map((feature, index) => (
              <article key={feature.title} className="glass-card feature-card-premium">
                <div className="feature-icon">{String(index + 1).padStart(2, '0')}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section">
          <div className="landing-section-heading">
            <h2>Three role-specific experiences, one connected system</h2>
          </div>
          <div className="role-grid">
            {Object.entries(ROLE_CONFIG).map(([key, role]) => (
              <article key={key} className="glass-card role-card">
                <div className="role-card-top">
                  <span className="role-badge">{role.label}</span>
                  <h3>
                    {role.icon} {role.value}
                  </h3>
                </div>
                <div className="landing-actions landing-actions-left">
                  {key === 'admin' ? (
                    <Link className="button-primary" to="/register-school">
                      Register School
                    </Link>
                  ) : (
                    <Link className="button-primary" to={`/activate?role=${key}`}>
                      Activate Account
                    </Link>
                  )}
                  <Link className="button-link" to={`/login?role=${key}`}>
                    Login
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default HomePage
