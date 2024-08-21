import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [selectedModel, setSelectedModel] = useState('breast_cancer');
  const [file, setFile] = useState(null);
  const [output, setOutput] = useState('');
  const [threshold, setThreshold] = useState(0.5);

  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
  };

  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
  };

  const handleThresholdChange = (e) => {
    setThreshold(parseFloat(e.target.value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setOutput(`Analysis complete for ${selectedModel} model with threshold ${threshold}`);
  };

  return (
    <div className="App">
      <header>
        <h1>Medical AI Assistant</h1>
      </header>
      <main>
        <div className="container">
          <div className="input-section">
            <h2>Input</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="model-select">Select Model</label>
                <select id="model-select" value={selectedModel} onChange={handleModelChange}>
                  <option value="breast_cancer">Breast Cancer Detection</option>
                  <option value="covid19">COVID-19 Detection</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="file-upload">Upload Image</label>
                <input type="file" id="file-upload" onChange={handleFileUpload} accept="image/*" />
              </div>

              <div className="form-group">
                <label htmlFor="threshold">Detection Threshold: {threshold}</label>
                <input
                  type="range"
                  id="threshold"
                  min="0"
                  max="1"
                  step="0.01"
                  value={threshold}
                  onChange={handleThresholdChange}
                />
              </div>

              <button type="submit" className="submit-btn">Analyze</button>
            </form>
          </div>

          <div className="output-section">
            <h2>Output</h2>
            {output ? (
              <div className="output-result">{output}</div>
            ) : (
              <div className="output-placeholder">Analysis results will appear here</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;