import { useState } from "react"

export default function AuthPage({ onLogin }) {
  const [tab, setTab] = useState("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError("")
    if (!email || !password) { setError("Please fill all fields"); return }
    if (tab === "signup" && password !== confirmPassword) { setError("Passwords don't match"); return }
    if (tab === "signup" && !agreed) { setError("Please agree to the terms"); return }

    setLoading(true)
    try {
      const endpoint = tab === "login" ? "/login" : "/signup"
      const res = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.detail || "Something went wrong"); setLoading(false); return }
      localStorage.setItem("token", data.token)
      localStorage.setItem("email", data.email)
      onLogin(data.token, data.email)
    } catch {
      setError("Could not connect to server")
    }
    setLoading(false)
  }

  const inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: "8px",
    border: "1px solid #e0a080", background: "rgba(255,255,255,0.7)",
    fontSize: "14px", color: "#3b1a10", outline: "none",
    boxSizing: "border-box", fontFamily: "sans-serif"
  }

  const labelStyle = {
    fontSize: "11px", fontWeight: "700", color: "#c0392b",
    letterSpacing: "1px", marginBottom: "4px", display: "block",
    fontFamily: "sans-serif"
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #f9e0a0 0%, #f5b87a 40%, #f0906a 100%)",
      fontFamily: "Georgia, serif"
    }}>
      <div style={{
        background: "rgba(255,220,180,0.6)", borderRadius: "20px",
        padding: "40px", width: "100%", maxWidth: "420px",
        boxShadow: "0 8px 32px rgba(180,80,40,0.15)"
      }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "40px", marginBottom: "32px" }}>
          {["login", "signup"].map(t => (
            <span key={t} onClick={() => { setTab(t); setError("") }}
              style={{
                fontSize: "18px", fontWeight: "bold", cursor: "pointer",
                color: tab === t ? "#c0392b" : "#e0a080",
                borderBottom: tab === t ? "2px solid #c0392b" : "none",
                paddingBottom: "4px", letterSpacing: "1px",
                textTransform: "uppercase"
              }}>
              {t === "login" ? "LOGIN" : "SIGN UP"}
            </span>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={labelStyle}>EMAIL</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              style={inputStyle} placeholder="you@email.com" />
          </div>
          <div>
            <label style={labelStyle}>PASSWORD</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              style={inputStyle} placeholder="••••••••" />
          </div>

          {tab === "signup" && (
            <>
              <div>
                <label style={labelStyle}>PASSWORD CONFIRMATION</label>
                <input type="password" value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={inputStyle} placeholder="••••••••" />
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                  style={{ marginTop: "2px", accentColor: "#c0392b" }} />
                <span style={{ fontSize: "12px", color: "#7a3b2e", fontFamily: "sans-serif" }}>
                  I agree to the <u>Terms of Service</u>, <u>General Terms and Conditions</u> and <u>Privacy Policy</u>
                </span>
              </div>
            </>
          )}

          {error && <p style={{ color: "#c0392b", fontSize: "13px", fontFamily: "sans-serif", margin: 0 }}>{error}</p>}

          <button onClick={handleSubmit} disabled={loading} style={{
            background: "#e8604a", color: "white", border: "none",
            padding: "13px", borderRadius: "999px", fontSize: "16px",
            fontWeight: "bold", letterSpacing: "2px", cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1, marginTop: "8px", fontFamily: "Georgia, serif"
          }}>
            {loading ? "..." : tab === "login" ? "LOG IN" : "SIGN UP"}
          </button>
        </div>
      </div>
    </div>
  )
}