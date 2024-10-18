'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Upload, Image as ImageIcon, AlertCircle, Send, Info, Activity } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'

const diseaseFacts = {
  covid19: "COVID-19 is caused by the SARS-CoV-2 virus and primarily affects the respiratory system.",
  breastCancer: "Breast cancer is the most common cancer in women worldwide, and early detection significantly improves treatment outcomes.",
}

interface AnalysisResult {
  disease: string
  confidence: number
}

export default function MedicalImageAnalyzer() {
  const [image, setImage] = useState<File | null>(null)
  const [analysisType, setAnalysisType] = useState<string>('')
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(70)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [funFact, setFunFact] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [model, setModel] = useState<tf.LayersModel | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    async function loadModel() {
      try {
        // Replace 'path/to/your/model.json' with the actual path to your model file
        const loadedModel = await tf.loadLayersModel('file://path/to/your/model.json')
        setModel(loadedModel)
      } catch (error) {
        console.error('Error loading the model:', error)
      }
    }
    loadModel()
  }, [])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImage(file)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file) {
      setImage(file)
    }
  }

  const handleAnalyze = async () => {
    if (!model || !image || !canvasRef.current || !analysisType) return

    setIsLoading(true)

    try {
      const img = new Image()
      img.src = URL.createObjectURL(image)
      await new Promise((resolve) => { img.onload = resolve })

      const canvas = canvasRef.current
      canvas.width = 224
      canvas.height = 224
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(img, 0, 0, 224, 224)

      const tensor = tf.browser.fromPixels(canvas)
        .resizeNearestNeighbor([224, 224])
        .toFloat()
        .expandDims()
      
      const predictions = await model.predict(tensor) as tf.Tensor
      const topPrediction = tf.topk(predictions, 1)
      const classIndex = topPrediction.indices.dataSync()[0]
      const confidence = topPrediction.values.dataSync()[0]

      const detectedDisease = classIndex === 0 ? 'covid19' : 'breastCancer'

      setResult({ 
        disease: detectedDisease === 'covid19' ? 'COVID-19' : 'Breast Cancer', 
        confidence: confidence * 100 
      })
      setFunFact(diseaseFacts[detectedDisease as keyof typeof diseaseFacts] || '')
    } catch (error) {
      console.error('Error during analysis:', error)
      setResult(null)
      setFunFact('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEscalate = () => {
    alert("Case escalated to a medical professional for review!")
  }

  return (
    <div className="min-h-screen bg-gray-900 text-cyan-300 p-4 sm:p-6">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-center mb-6 text-cyan-400"
      >
        Medical Image Analyzer <Activity className="inline-block ml-2 text-red-400" />
      </motion.h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
        
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-gray-800 border-cyan-500 shadow-lg shadow-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400">Upload MRI Image</CardTitle>
                <CardDescription className="text-cyan-300">Drag and drop or click to select an MRI image</CardDescription>
              </CardHeader>
              <CardContent>
                <motion.div 
                  className="border-2 border-dashed border-cyan-500 rounded-lg p-6 text-center cursor-pointer bg-gray-700"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('fileInput')?.click()}
                  whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(0, 255, 255, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  {image ? (
                    <div className="flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-cyan-400" />
                      <span className="ml-2 text-cyan-300">{image.name}</span>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto h-12 w-12 text-cyan-400" />
                      <p className="mt-1 text-cyan-300">Drag and drop an MRI image here, or click to select a file</p>
                    </div>
                  )}
                  <input 
                    id="fileInput"
                    type="file" 
                    className="hidden" 
                    onChange={handleImageUpload} 
                    accept="image/*"
                  />
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-gray-800 border-cyan-500 shadow-lg shadow-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400">Analysis Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select onValueChange={(value: string) => setAnalysisType(value)}>
                  <SelectTrigger className="bg-gray-700 border-cyan-500 text-cyan-300">
                    <SelectValue placeholder="Select analysis type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-cyan-500">
                    <SelectItem value="covid19" className="text-cyan-300">COVID-19 Detection</SelectItem>
                    <SelectItem value="breastCancer" className="text-cyan-300">Breast Cancer Detection</SelectItem>
                  </SelectContent>
                </Select>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="threshold" className="text-sm font-medium text-cyan-400">
                      Confidence Threshold
                    </label>
                    <span className="text-sm text-cyan-300">{confidenceThreshold}%</span>
                  </div>
                  <Slider
                    id="threshold"
                    min={0}
                    max={100}
                    step={1}
                    value={[confidenceThreshold]}
                    onValueChange={(value) => setConfidenceThreshold(value[0])}
                    className="[&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-cyan-500"
                  />
                </div>

                <Button 
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-gray-900 font-bold" 
                  onClick={handleAnalyze}
                  disabled={!image || !model || isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <AlertCircle className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    "Analyze Image"
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="bg-gray-800 border-cyan-500 shadow-lg shadow-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400">Analysis Result</CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {result ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert className="bg-gray-700 border-cyan-500 text-cyan-300">
                        <AlertCircle className="h-4 w-4 text-cyan-400" />
                        <AlertTitle className="text-cyan-400">Result</AlertTitle>
                        <AlertDescription>
                          {`Detected ${result.disease} with ${result.confidence.toFixed(2)}% confidence`}
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  ) : (
                    <motion.p
                      key="no-result"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="text-cyan-300"
                    >
                      No analysis performed yet.
                    </motion.p>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          <AnimatePresence>
            {funFact && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-gray-800 border-cyan-500 shadow-lg shadow-cyan-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center text-cyan-400">
                      Medical Fact
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 ml-2 text-cyan-300" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-gray-700 border-cyan-500 text-cyan-300">
                            <p>Interesting information about the detected condition</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-cyan-300">{funFact}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card className="bg-gray-800 border-cyan-500 shadow-lg shadow-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400">Escalation</CardTitle>
                <CardDescription className="text-cyan-300">If you need further analysis, escalate to a medical professional</CardDescription>
              </CardHeader>
              <CardContent>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    onClick={handleEscalate} 
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-gray-900 font-bold"
                  >
                    <Send className="mr-2 h-4 w-4" /> Escalate to Medical Professional
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}