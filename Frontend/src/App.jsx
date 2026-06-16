import { useState } from "react"
import LandingPage from "./LandingPage"
import AuthPage from "./AuthPage"
import Dashboard from "./Dashboard"
import AboutPage from "./AboutPage"

const STEPS = {
  LANDING: "landing",
  AUTH: "auth",
  DASHBOARD: "dashboard",
  UPLOAD: "upload",
  INTERVIEW: "interview",
  EVALUATING: "evaluating",
  RESULTS: "results",
  ABOUT: "about"
}

function Navbar({ onNavigate }) {
  return (
    <nav style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "20px 48px", position: "relative", zIndex: 10
    }}>
      <span style={{ fontFamily: "Georgia, serif", fontSize: "22px", color: "#c0392b", fontWeight: "bold" }}>
        colloquio
      </span>
      <div style={{ display: "flex", gap: "48px" }}>
        {["home", "dashboard", "about us"].map(item => (
          <span key={item} onClick={() => onNavigate(item)}
            style={{ fontSize: "15px", color: "#7a3b2e", cursor: "pointer", textTransform: "lowercase" }}>
            {item}
          </span>
        ))}
      </div>
    </nav>
  )
}

function ScoreBar({ score }) {
  const color = score >= 8 ? "#22c55e" : score >= 5 ? "#eab308" : "#ef4444"
  return (
    <div style={{ width: "100%", background: "#e5e7eb", borderRadius: "999px", height: "8px", marginTop: "4px" }}>
      <div style={{ width: `${score * 10}%`, background: color, height: "8px", borderRadius: "999px" }} />
    </div>
  )
}

export default function App() {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [answers, setAnswers] = useState([])
  const [evaluations, setEvaluations] = useState([])
  const [token, setToken] = useState(localStorage.getItem("token") || null)
  const [userEmail, setUserEmail] = useState(localStorage.getItem("email") || null)
  const [step, setStep] = useState(STEPS.LANDING)

  function handleFileChange(e) { setFile(e.target.files[0]) }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }

 function handleNavigate(item) {
  if (item === "home") setStep(STEPS.LANDING)
  if (item === "dashboard") {
    if (token) setStep(STEPS.DASHBOARD)
    else setStep(STEPS.AUTH)
  }
  if (item === "about us") setStep(STEPS.ABOUT)
}

  async function handleUpload() {
    if (!file) { setMessage("Please select a file first"); return }
    const formData = new FormData()
    formData.append("file", file)
    setLoading(true)
    setMessage("")
    try {
      const uploadRes = await fetch("http://127.0.0.1:8000/upload-resume", { method: "POST", body: formData })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) { setMessage(uploadData.detail || "Upload failed"); setLoading(false); return }
      setMessage("Extracting resume info...")
      const extractRes = await fetch("http://127.0.0.1:8000/extract-info", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: uploadData.extracted_text }),
      })
      const extractData = await extractRes.json()
      if (!extractRes.ok) { setMessage("Extraction failed"); setLoading(false); return }
      setMessage("Generating questions...")
      const questionsRes = await fetch("http://127.0.0.1:8000/generate-questions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_info: extractData }),
      })
      const questionsData = await questionsRes.json()
      if (!questionsRes.ok) { setMessage("Question generation failed"); setLoading(false); return }
      setQuestions(questionsData.questions)
      setStep(STEPS.INTERVIEW)
    } catch {
      setMessage("Something went wrong. Make sure backend is running.")
    }
    setLoading(false)
  }

  function handleNext() {
    if (!currentAnswer.trim()) return
    const newAnswers = [...answers, { question: questions[currentIndex], answer: currentAnswer.trim() }]
    setAnswers(newAnswers)
    setCurrentAnswer("")
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1)
    } else {
      handleEvaluateAll(newAnswers)
    }
  }

  async function handleEvaluateAll(allAnswers) {
    setStep(STEPS.EVALUATING)
    try {
      const results = []
      for (const item of allAnswers) {
        const res = await fetch("http://127.0.0.1:8000/evaluate-answer", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: item.question, answer: item.answer }),
        })
        const data = await res.json()
        results.push({ ...item, evaluation: data })
      }
      setEvaluations(results)

      if (token) {
        await fetch("http://127.0.0.1:8000/save-results", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, evaluations: results })
        })
      }

      setStep(STEPS.RESULTS)
    } catch {
      setMessage("Evaluation failed.")
      setStep(STEPS.INTERVIEW)
    }
  }

  // AUTH
  if (step === STEPS.AUTH) {
    return <AuthPage onLogin={(t, e) => {
      setToken(t)
      setUserEmail(e)
      setStep(STEPS.DASHBOARD)
    }} />
  }

  // DASHBOARD
  if (step === STEPS.DASHBOARD) {
    return <Dashboard
      token={token}
      email={userEmail}
      onLogout={() => {
        localStorage.removeItem("token")
        localStorage.removeItem("email")
        setToken(null)
        setUserEmail(null)
        setStep(STEPS.LANDING)
      }}
      onStartNew={() => {
        setFile(null)
        setAnswers([])
        setEvaluations([])
        setCurrentIndex(0)
        setCurrentAnswer("")
        setMessage("")
        setStep(STEPS.UPLOAD)
      }}
    />
  }

  if (step === STEPS.ABOUT) {
  return <AboutPage onHome={() => setStep(STEPS.LANDING)} />
}


  // LANDING
  if (step === STEPS.LANDING) {
    return <LandingPage onStart={() => setStep(STEPS.UPLOAD)} />
  }

  // UPLOAD
  if (step === STEPS.UPLOAD) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f9e0a0 0%, #f5b87a 40%, #f0906a 100%)",
        fontFamily: "Georgia, serif"
      }}>
        <Navbar onNavigate={handleNavigate} />
        <div style={{ textAlign: "center", padding: "10px 24px 0" }}>
          <h1 style={{ fontSize: "42px", fontWeight: "bold", color: "#c0392b", letterSpacing: "2px", marginBottom: "8px" }}>
            INTERVIEW PREPARATION
          </h1>
          <p style={{ color: "#7a3b2e", fontSize: "16px", marginBottom: "24px" }}>How It Works</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "36px", flexWrap: "wrap" }}>
            {["Upload Your Resume", "Practice Personalized Questions", "Get Instant Evaluation"].map((label, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  background: "#f5a07a", color: "#7a2010", padding: "10px 22px",
                  borderRadius: "999px", fontSize: "14px", fontWeight: "600", fontFamily: "sans-serif"
                }}>
                  {label}
                </div>
                {i < 2 && <span style={{ color: "#7a3b2e", fontSize: "20px" }}>→</span>}
              </div>
            ))}
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            style={{
              margin: "0 auto", maxWidth: "600px",
              border: `2px dashed ${dragging ? "#c0392b" : "#e07050"}`,
              borderRadius: "16px", padding: "48px 32px",
              background: dragging ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)",
              transition: "all 0.2s"
            }}>
            <p style={{ color: "#c0392b", fontSize: "15px", marginBottom: "20px", fontFamily: "sans-serif" }}>
              {file ? `Selected: ${file.name}` : "Drag and drop a resume file or click to upload"}
            </p>
            <label style={{ cursor: "pointer" }}>
              <input type="file" accept=".pdf,.docx" onChange={handleFileChange} style={{ display: "none" }} />
              <div style={{
                display: "inline-block", background: "#e8604a", color: "white",
                padding: "14px 48px", borderRadius: "999px", fontSize: "18px",
                fontWeight: "bold", letterSpacing: "2px", fontFamily: "sans-serif", cursor: "pointer"
              }}>
                UPLOAD
              </div>
            </label>
            <p style={{ color: "#b05040", fontSize: "13px", marginTop: "14px", fontFamily: "sans-serif" }}>
              PDF, doc, docx or word file
            </p>
            {file && (
              <button onClick={handleUpload} disabled={loading} style={{
                marginTop: "20px", background: "#c0392b", color: "white", border: "none",
                padding: "12px 36px", borderRadius: "999px", fontSize: "16px",
                cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
                fontFamily: "sans-serif"
              }}>
                {loading ? "Processing..." : "Start Interview →"}
              </button>
            )}
            {message && <p style={{ color: "#7a2010", marginTop: "12px", fontSize: "14px", fontFamily: "sans-serif" }}>{message}</p>}
          </div>
        </div>
      </div>
    )
  }

  // INTERVIEW
  if (step === STEPS.INTERVIEW) {
    const progress = (currentIndex / questions.length) * 100
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f9e0a0 0%, #f5b87a 40%, #f0906a 100%)",
        fontFamily: "sans-serif"
      }}>
        <Navbar onNavigate={handleNavigate} />
        <div style={{ maxWidth: "700px", margin: "0 auto", padding: "24px" }}>
          <div style={{ background: "rgba(255,255,255,0.6)", borderRadius: "20px", padding: "36px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#7a3b2e", fontSize: "14px" }}>Question {currentIndex + 1} of {questions.length}</span>
              <span style={{ color: "#c0392b", fontSize: "14px", fontWeight: "600" }}>{Math.round(progress)}% done</span>
            </div>
            <div style={{ background: "#e5e7eb", borderRadius: "999px", height: "6px", marginBottom: "24px" }}>
              <div style={{ width: `${progress}%`, background: "#c0392b", height: "6px", borderRadius: "999px", transition: "width 0.3s" }} />
            </div>
            <h2 style={{ fontSize: "20px", color: "#3b1a10", marginBottom: "20px", lineHeight: "1.5" }}>
              {questions[currentIndex]}
            </h2>
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={6}
              style={{
                width: "100%", border: "1px solid #e07050", borderRadius: "12px",
                padding: "14px", fontSize: "15px", resize: "none",
                background: "rgba(255,255,255,0.8)", color: "#3b1a10",
                outline: "none", boxSizing: "border-box"
              }}
            />
            <button onClick={handleNext} disabled={!currentAnswer.trim()} style={{
              marginTop: "16px", width: "100%",
              background: currentAnswer.trim() ? "#c0392b" : "#e0a090",
              color: "white", border: "none", padding: "14px", borderRadius: "999px",
              fontSize: "16px", cursor: currentAnswer.trim() ? "pointer" : "not-allowed",
              fontWeight: "600", letterSpacing: "1px"
            }}>
              {currentIndex + 1 === questions.length ? "Submit All Answers ✓" : "Next Question →"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // EVALUATING
  if (step === STEPS.EVALUATING) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, #f9e0a0 0%, #f5b87a 40%, #f0906a 100%)",
        fontFamily: "sans-serif"
      }}>
        <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: "20px", padding: "48px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🤖</div>
          <h1 style={{ fontSize: "24px", color: "#c0392b", marginBottom: "8px" }}>Evaluating your answers...</h1>
          <p style={{ color: "#7a3b2e" }}>This may take 15–20 seconds.</p>
        </div>
      </div>
    )
  }

  // RESULTS
  if (step === STEPS.RESULTS) {
    const avgScore = (
      evaluations.reduce((sum, e) => sum + (e.evaluation?.score || 0), 0) / evaluations.length
    ).toFixed(1)
    const avgColor = avgScore >= 8 ? "#16a34a" : avgScore >= 5 ? "#ca8a04" : "#dc2626"

    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f9e0a0 0%, #f5b87a 40%, #f0906a 100%)",
        fontFamily: "sans-serif"
      }}>
        <Navbar onNavigate={handleNavigate} />
        <div style={{ maxWidth: "750px", margin: "0 auto", padding: "24px" }}>
          <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: "20px", padding: "36px", textAlign: "center", marginBottom: "24px" }}>
            <h1 style={{ fontSize: "28px", color: "#c0392b", marginBottom: "4px" }}>Interview Results</h1>
            <p style={{ color: "#7a3b2e", marginBottom: "16px" }}>Here's how you performed</p>
            <div style={{ fontSize: "64px", fontWeight: "bold", color: avgColor }}>
              {avgScore}<span style={{ fontSize: "24px", color: "#9ca3af" }}>/10</span>
            </div>
            <p style={{ color: "#7a3b2e" }}>Overall Score</p>
          </div>

          {evaluations.map((e, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.7)", borderRadius: "20px", padding: "24px", marginBottom: "16px" }}>
              <p style={{ fontSize: "11px", color: "#c0392b", fontWeight: "700", textTransform: "uppercase", marginBottom: "6px" }}>Question {i + 1}</p>
              <p style={{ fontWeight: "600", color: "#3b1a10", marginBottom: "8px" }}>{e.question}</p>
              <p style={{ color: "#7a3b2e", fontSize: "14px", marginBottom: "12px" }}><b>Your answer:</b> {e.answer}</p>
              <hr style={{ borderColor: "#f0c0a0", marginBottom: "12px" }} />
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <span style={{ fontSize: "28px", fontWeight: "bold", color: "#c0392b" }}>{e.evaluation?.score}/10</span>
                <div style={{ flex: 1 }}><ScoreBar score={e.evaluation?.score || 0} /></div>
              </div>
              <p style={{ fontSize: "13px", color: "#3b1a10", marginBottom: "4px" }}><b>Clarity:</b> {e.evaluation?.clarity}</p>
              <p style={{ fontSize: "13px", color: "#3b1a10", marginBottom: "4px" }}><b>Relevance:</b> {e.evaluation?.relevance}</p>
              <p style={{ fontSize: "13px", color: "#3b1a10", marginBottom: "12px" }}><b>Depth:</b> {e.evaluation?.depth}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ background: "#f0fdf4", borderRadius: "12px", padding: "12px" }}>
                  <p style={{ color: "#16a34a", fontWeight: "700", fontSize: "12px", marginBottom: "6px" }}> Strengths</p>
                  {e.evaluation?.strengths?.map((s, j) => <p key={j} style={{ color: "#15803d", fontSize: "13px", margin: "0 0 4px" }}>• {s}</p>)}
                </div>
                <div style={{ background: "#fff7ed", borderRadius: "12px", padding: "12px" }}>
                  <p style={{ color: "#ea580c", fontWeight: "700", fontSize: "12px", marginBottom: "6px" }}> Improvements</p>
                  {e.evaluation?.improvements?.map((s, j) => <p key={j} style={{ color: "#c2410c", fontSize: "13px", margin: "0 0 4px" }}>• {s}</p>)}
                </div>
              </div>
            </div>
          ))}

          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            {token && (
              <button onClick={() => setStep(STEPS.DASHBOARD)} style={{
                flex: 1, background: "#7c3aed", color: "white", border: "none",
                padding: "16px", borderRadius: "999px", fontSize: "16px",
                cursor: "pointer", fontWeight: "600"
              }}>
                View Dashboard
              </button>
            )}
            <button onClick={() => window.location.reload()} style={{
              flex: 1, background: "#c0392b", color: "white", border: "none",
              padding: "16px", borderRadius: "999px", fontSize: "16px",
              cursor: "pointer", fontWeight: "600"
            }}>
              Start Over
            </button>
          </div>
        </div>
      </div>
    )
  }
}