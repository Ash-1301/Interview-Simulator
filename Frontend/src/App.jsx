import { useState } from "react"

const STEPS = {
  UPLOAD: "upload",
  INTERVIEW: "interview",
  DONE: "done"
}

function App() {
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [answers, setAnswers] = useState([])
  const [step, setStep] = useState(STEPS.UPLOAD)

  function handleFileChange(e) {
    setFile(e.target.files[0])
  }

  async function handleUpload() {
    if (!file) { setMessage("Please select a file first"); return }

    const formData = new FormData()
    formData.append("file", file)
    setLoading(true)
    setMessage("")

    try {
      const uploadRes = await fetch("http://127.0.0.1:8000/upload-resume", {
        method: "POST", body: formData,
      })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) { setMessage(uploadData.detail || "Upload failed"); setLoading(false); return }
      setMessage("Extracting resume info...")

      const extractRes = await fetch("http://127.0.0.1:8000/extract-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: uploadData.extracted_text }),
      })
      const extractData = await extractRes.json()
      if (!extractRes.ok) { setMessage("Extraction failed"); setLoading(false); return }
      setMessage("Generating questions...")

      const questionsRes = await fetch("http://127.0.0.1:8000/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_info: extractData }),
      })
      const questionsData = await questionsRes.json()
      if (!questionsRes.ok) { setMessage("Question generation failed"); setLoading(false); return }

      setQuestions(questionsData.questions)
      setStep(STEPS.INTERVIEW)

    } catch (error) {
      setMessage("Something went wrong. Make sure both servers are running.")
    }
    setLoading(false)
  }

  function handleNext() {
    if (!currentAnswer.trim()) return

    const newAnswers = [...answers, {
      question: questions[currentIndex],
      answer: currentAnswer.trim()
    }]
    setAnswers(newAnswers)
    setCurrentAnswer("")

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setStep(STEPS.DONE)
    }
  }

  // UPLOAD SCREEN
  if (step === STEPS.UPLOAD) {
    return (
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <h1>Interview Prep App</h1>
        <h2>Upload Your Resume</h2>
        <input type="file" accept=".pdf,.docx" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={loading} style={{ marginLeft: "10px" }}>
          {loading ? "Processing..." : "Upload Resume"}
        </button>
        <p>{message}</p>
      </div>
    )
  }

  // INTERVIEW SCREEN
  if (step === STEPS.INTERVIEW) {
    return (
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <h1>Interview Prep App</h1>
        <p style={{ color: "#666" }}>Question {currentIndex + 1} of {questions.length}</p>
        <h2>{questions[currentIndex]}</h2>
        <textarea
          value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          placeholder="Type your answer here..."
          rows={6}
          style={{ width: "100%", padding: "10px", fontSize: "16px", marginTop: "10px" }}
        />
        <br />
        <button
          onClick={handleNext}
          disabled={!currentAnswer.trim()}
          style={{ marginTop: "10px", padding: "10px 20px", fontSize: "16px" }}
        >
          {currentIndex + 1 === questions.length ? "Submit All Answers" : "Next Question →"}
        </button>
      </div>
    )
  }

  // DONE SCREEN
  if (step === STEPS.DONE) {
    return (
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <h1>Interview Complete!</h1>
        <p>You answered all {questions.length} questions. Here's a summary:</p>
        {answers.map((a, i) => (
          <div key={i} style={{ marginBottom: "20px", background: "#f5f5f5", padding: "15px", borderRadius: "8px" }}>
            <p><strong>Q{i + 1}: {a.question}</strong></p>
            <p>{a.answer}</p>
          </div>
        ))}
        <button onClick={() => window.location.reload()} style={{ padding: "10px 20px" }}>
          Start Over
        </button>
      </div>
    )
  }
}

export default App