export default function AboutPage({ onHome }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f9e0a0 0%, #f5b87a 40%, #f0906a 100%)",
      fontFamily: "Georgia, serif"
    }}>
      {/* Navbar */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 48px" }}>
        <span style={{ fontSize: "22px", fontWeight: "bold", color: "#c0392b" }}>colloquio</span>
        <span onClick={onHome} style={{ fontSize: "15px", color: "#7a3b2e", cursor: "pointer" }}>home</span>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: "600px", margin: "40px auto", padding: "0 24px", textAlign: "center" }}>
        <h1 style={{ fontSize: "36px", color: "#c0392b", marginBottom: "32px" }}>about us</h1>
        <p style={{ fontSize: "16px", color: "#7a2010", lineHeight: "1.9", textDecoration: "underline", marginBottom: "32px" }}>
          Hello! I am Anshika Singh, this is my personal project, colloquio (Italian for interview).
          I am really excited to share this with you all. This idea came into my mind when I was preparing
          for internships and during that time I always tried to find different questionnaires to practice
          interview questions from. Colloquio is for students like me who also want to prepare for
          internship interviews.
        </p>
        <p style={{ fontSize: "16px", fontWeight: "bold", color: "#c0392b" }}>Stay tuned for more updates!</p>
      </div>
    </div>
  )
}