'use client';

import { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { loadModels } from '@/lib/faceApi';

export default function FaceEnrollment({ teacher, onComplete, onCancel }) {
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    let stream = null;
    const startVideo = async () => {
      try {
        await loadModels();
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 }
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Ensure video plays
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch(e => console.error("Video play failed:", e));
          };
        }
        setInitializing(false);
      } catch (err) {
        console.error("Error starting video:", err);
        setError("Could not access camera or load models. Please check permissions.");
        setInitializing(false);
      }
    };
    startVideo();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureFace = async () => {
    if (!videoRef.current) return;
    setScanning(true);
    
    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        alert("Face not detected. Please look clearly into the camera.");
        setScanning(false);
        return;
      }

      // Convert descriptor to regular array and ensure it's clean
      const descriptor = Array.from(detection.descriptor);

      const response = await fetch(`/api/teachers/${teacher._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ faceDescriptor: descriptor })
      });

      if (response.ok) {
        alert("Face enrolled successfully!");
        onComplete();
      } else {
        alert("Failed to save face data.");
      }
    } catch (err) {
      console.error("Capture error:", err);
      alert("Error during scanning.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '1rem auto' }}>
      <div className="card-header">
        <h3>Face Enrollment: {teacher.name}</h3>
        <button className="btn btn-outline" onClick={onCancel}>✕</button>
      </div>
      
      <div style={{ position: 'relative', textAlign: 'center', background: '#000', borderRadius: '8px', overflow: 'hidden', minHeight: '300px' }}>
        {initializing && (
          <div style={{ padding: '4rem', color: 'white' }}>Initializing camera & models...</div>
        )}
        
        {error && (
          <div style={{ padding: '4rem', color: '#ff4d4d' }}>{error}</div>
        )}

        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ 
            width: '100%', 
            display: (initializing || error) ? 'none' : 'block',
            transform: 'scaleX(-1)' // Mirror effect for better UX
          }}
        />
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
      </div>

      <div style={{ padding: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button 
          className="btn btn-primary" 
          onClick={captureFace} 
          disabled={initializing || scanning}
        >
          {scanning ? 'Scanning...' : '📸 Capture & Register Face'}
        </button>
        <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
      </div>
      
      <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', paddingBottom: '1rem' }}>
        Please look directly at the camera in good lighting.
      </p>
    </div>
  );
}
