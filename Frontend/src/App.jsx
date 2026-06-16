import { useState } from "react"

function App() {
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  function handleFileChange(e) {
    setFile(e.target.files[0])
  }

  async function handleUpload() {
    if (!file) {
      setMessage("Please select a file first")
      return
    }

    const formData = new FormData()
    formData.append("file", file)

    setLoading(true)
    try {
      const response = await fetch("http://127.0.0.1:8000/upload-resume", {
        method: "POST",
        body: formData,
      })
      const data = await response.json()
      setMessage(data.message || data.detail)
    } catch (error) {
      setMessage("Upload failed, check if backend is running")
    }
    setLoading(false)
  }

  return (
    <div>
      <h1>Interview Prep App</h1>
      <h2>Upload Your Resume</h2>
      <input type="file" accept=".pdf,.docx" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload Resume"}
      </button>
      <p>{message}</p>
    </div>
  )
}

export default App