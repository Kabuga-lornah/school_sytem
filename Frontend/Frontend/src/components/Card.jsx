function Card({ title, subtitle, children }) {
  return (
    <section className="card">
      {title ? <h2>{title}</h2> : null}
      {subtitle ? <p>{subtitle}</p> : null}
      {children}
    </section>
  )
}

export default Card
