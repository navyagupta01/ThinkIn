import React, { useState } from "react";

function App() {
  const [topic, setTopic] = useState("");
  const [sessions, setSessions] = useState(4);
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const generatePPT = async () => {
    if (!topic || !sessions) {
      alert("Please enter a topic and number of sessions.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5001/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, sessions, details }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate presentation.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "lesson_slides.pptx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Something went wrong: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px", fontFamily: "Arial" }}>
      <h1>📚 Teacher PPT Assistant</h1>
      <p>Generate teaching slides from a simple plan of action.</p>

      <label>📌 Topic:</label>
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="e.g. Photosynthesis"
        style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
      />

      <label>📆 Number of Sessions:</label>
      <input
        type="number"
        min="1"
        value={sessions}
        onChange={(e) => setSessions(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
      />

      <label>📝 Additional Details (optional):</label>
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="e.g. include real-life examples, 7th grade, add MCQs"
        style={{ width: "100%", height: "100px", padding: "10px", marginBottom: "20px" }}
      />

      <button
        onClick={generatePPT}
        disabled={loading}
        style={{
          padding: "12px 20px",
          backgroundColor: "#4CAF50",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        {loading ? "Generating..." : "Generate PPT 🎉"}
      </button>
    </div>
  );
}

export default App;
