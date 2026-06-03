'use client';

import { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { loadModels } from '@/lib/faceApi';

export default function FaceRecognition({ teachers, onMatch, onCancel }) {
  const [initializing, setInitializing] = useState(true);
  const [recognizing, setRecognizing] = useState(false);
  const [message, setMessage] = useState('Initializing...');
  const videoRef = useRef();
  const faceMatcherRef = useRef(null);

  useEffect(() => {
    const startRecognition = async () => {
      try {
        await loadModels();
        setMessage('Loading teacher face data...');
        
        // Prepare FaceMatcher
        console.log("Scanner Deep Debug: First Teacher raw data:", teachers[0]);
        
        const withFace = teachers.filter(t => {
          // Normalize descriptor - handles both objects and arrays
          if (t.faceDescriptor) {
            const arr = Array.isArray(t.faceDescriptor) ? t.faceDescriptor : Object.values(t.faceDescriptor);
            return arr.length > 50;
          }
          return false;
        });

        console.log("Scanner Data Check:", { total: teachers.length, withFaceCount: withFace.length });

        const labeledDescriptors = withFace.map(t => {
            const descriptorArray = Array.isArray(t.faceDescriptor) ? t.faceDescriptor : Object.values(t.faceDescriptor);
            return new faceapi.LabeledFaceDescriptors(
              t._id,
              [new Float32Array(descriptorArray)]
            );
          });

        if (labeledDescriptors.length === 0) {
          setMessage(`Error: No faces found. Found ${teachers.length} teachers, but 0 have face data saved.`);
          setInitializing(false);
          return;
        }

        faceMatcherRef.current = new faceapi.FaceMatcher(labeledDescriptors, 0.55);

        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setInitializing(false);
        setMessage('Ready! Please look at the camera.');
        setRecognizing(true);
      } catch (err) {
        console.error("Recognition error:", err);
        setMessage('Error initializing camera.');
        setInitializing(false);
      }
    };
    startRecognition();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [teachers]);

  // Recognition Loop
  useEffect(() => {
    let interval;
    if (recognizing && videoRef.current) {
      interval = setInterval(async () => {
        if (!videoRef.current || videoRef.current.paused || videoRef.current.ended || videoRef.current.readyState < 2) {
          return;
        }

        try {
          // Optimization: Increased input size for better detection at distance
          // and slightly lowered score threshold for faster detection
          const detection = await faceapi
            .detectSingleFace(
              videoRef.current, 
              new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.4 })
            )
            .withFaceLandmarks()
            .withFaceDescriptor();

          if (!detection) {
            // Only show message if no face has been seen for a bit to avoid flickering
            setMessage('Scanning... Please look at the camera.');
            return;
          }

          // Check Orientation (Basic Landmark Analysis)
          const landmarks = detection.landmarks;
          const nose = landmarks.getNose()[0];
          const leftEye = landmarks.getLeftEye()[0];
          const rightEye = landmarks.getRightEye()[0];
          
          const eyesCenter = (leftEye.x + rightEye.x) / 2;
          const eyeDist = rightEye.x - leftEye.x;
          const noseOffset = nose.x - eyesCenter;

          // If looking too far away
          if (Math.abs(noseOffset) > eyeDist * 0.5) {
            setMessage('⚠️ Please look straight at the camera.');
            return;
          }

          if (faceMatcherRef.current) {
            const match = faceMatcherRef.current.findBestMatch(detection.descriptor);
            
            if (match.label !== 'unknown') {
              const matchedTeacher = teachers.find(t => t._id === match.label);
              if (matchedTeacher) {
                const currentTime = new Date().toLocaleTimeString();
                setRecognizing(false);
                setMessage(`✅ ${matchedTeacher.name}\nThank You!\nTime: ${currentTime}`);
                
                setTimeout(() => {
                  onMatch(matchedTeacher._id);
                }, 2000);
              }
            } else {
              setMessage('❌ Face not recognized. Are you registered?');
            }
          }
        } catch (err) {
          console.error("Loop error:", err);
        }
      }, 500); // Faster interval for more responsive feel
    }
    return () => clearInterval(interval);
  }, [recognizing, teachers, onMatch]);

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '1rem auto' }}>
      <div className="card-header">
        <h3>Face Attendance Scanner</h3>
        <button className="btn btn-outline" onClick={onCancel}>✕</button>
      </div>
      
      <div style={{ position: 'relative', textAlign: 'center', background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ 
            width: '100%', 
            display: 'block',
            transform: 'scaleX(-1)' // Mirror effect
          }}
        />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '1.5rem 2rem',
          borderRadius: '15px',
          fontSize: '1.2rem',
          textAlign: 'center',
          whiteSpace: 'pre-line',
          border: '2px solid var(--accent)',
          display: message.includes('✅') ? 'block' : 'none',
          zIndex: 10
        }}>
          {message}
        </div>
        {!message.includes('✅') && (
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontSize: '0.9rem'
          }}>
            {message}
          </div>
        )}
      </div>

      <div style={{ padding: '1.5rem', textAlign: 'center' }}>
        <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
