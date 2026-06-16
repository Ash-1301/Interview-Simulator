import { useState, useEffect } from "react"

export default function Dashboard({ token, email, onLogout, onStartNew }) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch(`http://127.0.0.1:8000/dashboard?token=${token}`)
        const data = await res.json()
        setResults(data)
      } catch {
        console.error("Failed to fetch dashboard")
      }
      setLoading(false)
    }
    fetchResults()
  }, [token])

  // Group results by session (by date)
  const sessions = results.reduce((acc, r) => {
    const date = r.created_at.split("T")[0]
    if (!acc[date]) acc[date] = []
    acc[date].push(r)
    return acc
  }, {})

  const avgScore = results.length
    ? (results.reduce((s, r) => s + r.score, 0) / results.length).toFixed(1)
    : "—"

  const allStrengths = results.flatMap(r => r.strengths).slice(0, 5)
  const allImprovements = results.flatMap(r => r.improvements).slice(0, 5)

  const cardStyle = {
    background: "white", borderRadius: "16px",
    padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0f0f7", fontFamily: "sans-serif" }}>

      {/* Sidebar */}
      <div style={{
        width: "220px", background: "white", padding: "32px 20px",
        display: "flex", flexDirection: "column", gap: "8px",
        boxShadow: "2px 0 12px rgba(0,0,0,0.05)", flexShrink: 0
      }}>
        <div style={{ fontSize: "20px", fontWeight: "bold", color: "#c0392b", fontFamily: "Georgia, serif", marginBottom: "32px" }}>
          colloquio
        </div>

        {[
          { label: "Home", action: () => onStartNew() },
          { label: "Dashboard", action: null },
          { label: "Log Out", action: onLogout },
        ].map(item => (
          <div key={item.label} onClick={item.action}
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "12px 16px", borderRadius: "10px", cursor: item.action ? "pointer" : "default",
              background: item.label === "Dashboard" ? "#f9f0ff" : "transparent",
              color: item.label === "Dashboard" ? "#7c3aed" : "#555",
              fontWeight: item.label === "Dashboard" ? "600" : "400",
              transition: "background 0.2s"
            }}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}

        <div style={{ marginTop: "auto", padding: "16px", background: "#f9f0ff", borderRadius: "12px" }}>
          <p style={{ fontSize: "12px", color: "#7c3aed", fontWeight: "600", margin: "0 0 4px" }}>Signed in as</p>
          <p style={{ fontSize: "12px", color: "#555", margin: 0, wordBreak: "break-all" }}>{email}</p>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#1a1a2e", margin: 0 }}>Dashboard</h1>
          <button onClick={onStartNew} style={{
            background: "#c0392b", color: "white", border: "none",
            padding: "10px 24px", borderRadius: "999px", fontSize: "14px",
            fontWeight: "600", cursor: "pointer"
          }}>
            + New Interview
          </button>
        </div>

        {loading ? (
          <p style={{ color: "#888" }}>Loading your results...</p>
        ) : results.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: "center", padding: "48px" }}>
            <p style={{ fontSize: "48px", margin: "0 0 16px" }}>🎯</p>
            <p style={{ fontSize: "18px", color: "#555", marginBottom: "16px" }}>No interviews yet</p>
            <button onClick={onStartNew} style={{
              background: "#c0392b", color: "white", border: "none",
              padding: "12px 32px", borderRadius: "999px", fontSize: "15px", cursor: "pointer"
            }}>
              Start Your First Interview
            </button>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
              <div style={{ ...cardStyle, textAlign: "center" }}>
                <p style={{ fontSize: "13px", color: "#888", margin: "0 0 8px" }}>Average Score</p>
                <p style={{ fontSize: "42px", fontWeight: "bold", color: "#7c3aed", margin: 0 }}>{avgScore}<span style={{ fontSize: "18px", color: "#aaa" }}>/10</span></p>
              </div>
              <div style={{ ...cardStyle, textAlign: "center" }}>
                <p style={{ fontSize: "13px", color: "#888", margin: "0 0 8px" }}>Total Questions</p>
                <p style={{ fontSize: "42px", fontWeight: "bold", color: "#c0392b", margin: 0 }}>{results.length}</p>
              </div>
              <div style={{ ...cardStyle, textAlign: "center" }}>
                <p style={{ fontSize: "13px", color: "#888", margin: "0 0 8px" }}>Sessions</p>
                <p style={{ fontSize: "42px", fontWeight: "bold", color: "#e8604a", margin: 0 }}>{Object.keys(sessions).length}</p>
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
              <div style={cardStyle}>
                <p style={{ fontWeight: "700", color: "#16a34a", marginBottom: "12px", fontSize: "14px" }}>Top Strengths</p>
                {allStrengths.length === 0
                  ? <p style={{ color: "#aaa", fontSize: "13px" }}>No data yet</p>
                  : allStrengths.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                      <span style={{ color: "#16a34a", fontSize: "13px" }}>•</span>
                      <p style={{ margin: 0, fontSize: "13px", color: "#374151" }}>{s}</p>
                    </div>
                  ))
                }
              </div>
              <div style={cardStyle}>
                <p style={{ fontWeight: "700", color: "#ea580c", marginBottom: "12px", fontSize: "14px" }}>Areas to Improve</p>
                {allImprovements.length === 0
                  ? <p style={{ color: "#aaa", fontSize: "13px" }}>No data yet</p>
                  : allImprovements.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                      <span style={{ color: "#ea580c", fontSize: "13px" }}>•</span>
                      <p style={{ margin: 0, fontSize: "13px", color: "#374151" }}>{s}</p>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Recent sessions */}
            <div style={cardStyle}>
              <p style={{ fontWeight: "700", color: "#1a1a2e", marginBottom: "16px", fontSize: "15px" }}>Recent Sessions</p>
              {Object.entries(sessions).map(([date, items]) => {
                const sessionAvg = (items.reduce((s, r) => s + r.score, 0) / items.length).toFixed(1)
                const color = sessionAvg >= 8 ? "#16a34a" : sessionAvg >= 5 ? "#ca8a04" : "#dc2626"
                return (
                  <div key={date} onClick={() => setSelected(selected === date ? null : date)}
                    style={{
                      padding: "16px", borderRadius: "12px", marginBottom: "10px",
                      background: selected === date ? "#f9f0ff" : "#f9fafb",
                      cursor: "pointer", border: selected === date ? "1px solid #c4b5fd" : "1px solid transparent",
                      transition: "all 0.2s"
                    }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <p style={{ margin: "0 0 4px", fontWeight: "600", color: "#1a1a2e", fontSize: "14px" }}>{date}</p>
                        <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>{items.length} questions answered</p>
                      </div>
                      <span style={{ fontSize: "20px", fontWeight: "bold", color }}>{sessionAvg}/10</span>
                    </div>

                    {selected === date && (
                      <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        {items.map((r, i) => (
                          <div key={i} style={{ background: "white", borderRadius: "10px", padding: "12px" }}>
                            <p style={{ margin: "0 0 4px", fontWeight: "600", fontSize: "13px", color: "#374151" }}>{r.question}</p>
                            <p style={{ margin: "0 0 6px", fontSize: "12px", color: "#6b7280" }}>{r.answer}</p>
                            <div style={{ display: "flex", gap: "16px", fontSize: "12px" }}>
                              <span style={{ color: "#7c3aed", fontWeight: "600" }}>Score: {r.score}/10</span>
                              <span style={{ color: "#16a34a" }}>{r.strengths?.[0]}</span>
                              <span style={{ color: "#ea580c" }}>{r.improvements?.[0]}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}