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
        
        // Safety Check: Ensure teachers is an array
        const teachersList = Array.isArray(teachers) ? teachers : [];

        if (teachersList.length > 0) {
            console.log("Scanner Deep Debug: First Teacher raw data:", teachersList[0]);
        }
        
        const withFace = teachersList.filter(t => {
          // Normalize descriptor - handles both objects and arrays
          if (t.faceDescriptor) {
            const arr = Array.isArray(t.faceDescriptor) ? t.faceDescriptor : Object.values(t.faceDescriptor);
            return arr.length > 50;
          }
          return false;
        });

        console.log("Scanner Data Check:", { total: teachersList.length, withFaceCount: withFace.length });

        const labeledDescriptors = withFace.map(t => {
            const descriptorArray = Array.isArray(t.faceDescriptor) ? t.faceDescriptor : Object.values(t.faceDescriptor);
            return new faceapi.LabeledFaceDescriptors(
              t._id,
              [new Float32Array(descriptorArray)]
            );
          });

        if (labeledDescriptors.length === 0) {
          setMessage(`Error: No faces found. Found ${teachersList.length} teachers, but 0 have face data saved.`);
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
    let matchCounter = 0; // Buffer to ensure stable recognition
    const REQUIRED_MATCHES = 3; // Consecutive matches needed

    if (recognizing && videoRef.current) {
      interval = setInterval(async () => {
        if (!videoRef.current || videoRef.current.paused || videoRef.current.ended || videoRef.current.readyState < 2) {
          return;
        }

        try {
          const detection = await faceapi
            .detectSingleFace(
              videoRef.current, 
              new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.5 })
            )
            .withFaceLandmarks()
            .withFaceDescriptor();

          if (!detection) {
            matchCounter = 0; // Reset if face lost
            setMessage('Scanning... Please look at the camera.');
            return;
          }

          // Check Orientation
          const landmarks = detection.landmarks;
          const nose = landmarks.getNose()[0];
          const leftEye = landmarks.getLeftEye()[0];
          const rightEye = landmarks.getRightEye()[0];
          
          const eyesCenter = (leftEye.x + rightEye.x) / 2;
          const eyeDist = rightEye.x - leftEye.x;
          const noseOffset = nose.x - eyesCenter;

          if (Math.abs(noseOffset) > eyeDist * 0.5) {
            setMessage('⚠️ Please look straight at the camera.');
            matchCounter = 0;
            return;
          }

          if (faceMatcherRef.current) {
            const match = faceMatcherRef.current.findBestMatch(detection.descriptor);
            
            if (match.label !== 'unknown') {
              matchCounter++;
              setMessage(`Recognizing... (${matchCounter}/${REQUIRED_MATCHES})`);
              
              if (matchCounter >= REQUIRED_MATCHES) {
                const matchedTeacher = teachers.find(t => t._id === match.label);
                if (matchedTeacher) {
                  const currentTime = new Date().toLocaleTimeString();
                  setRecognizing(false);
                  if (videoRef.current) {
                    videoRef.current.pause();
                  }
                  setMessage(`✅ ${matchedTeacher.name} verified!\nTime: ${currentTime}`);
                  setTimeout(() => {
                    if (videoRef.current?.srcObject) {
                      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
                    }
                    onMatch(matchedTeacher._id);
                  }, 1500);
                }
              }
            } else {
              matchCounter = 0;
              setMessage('Searching...');
            }
          }
        } catch (err) {
          console.error("Loop error:", err);
        }
      }, 200); // Faster polling (200ms)
    }
    return () => clearInterval(interval);
  }, [recognizing, teachers, onMatch]);

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '1rem auto', padding: '0', overflow: 'hidden' }}>
      <div className="card-header" style={{ padding: '1rem' }}>
        <h3 style={{ margin: 0 }}>Face Attendance Scanner</h3>
        {!message.includes('✅') && <button className="btn btn-outline" onClick={onCancel}>✕</button>}
      </div>
      
      <div style={{ position: 'relative', textAlign: 'center', background: '#000', minHeight: '300px' }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ 
            width: '100%', 
            display: 'block',
            transform: 'scaleX(-1)', // Mirror effect
            filter: message.includes('✅') ? 'brightness(0.7)' : 'none',
            transition: 'filter 0.5s ease'
          }}
        />

        {/* Status Pill - Shows at the bottom for both scanning and success */}
        <div style={{
          position: 'absolute',
          bottom: '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: message.includes('✅') ? 'rgba(40, 167, 69, 0.95)' : 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '0.8rem 1.5rem',
          borderRadius: '30px',
          fontSize: '1rem',
          fontWeight: '600',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.2)',
          whiteSpace: 'pre-line',
          textAlign: 'center',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          zIndex: 100,
          minWidth: '200px',
          animation: message.includes('✅') ? 'pulse 2s infinite' : 'none'
        }}>
          {message.includes('✅') ? (
            <>
              <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>✅</span>
              {message.replace('✅ Success!\n', '')}
            </>
          ) : (
            message
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) scale(1.05); }
          100% { transform: translateX(-50%) scale(1); }
        }
      `}</style>

      <div style={{ padding: '1.5rem', textAlign: 'center' }}>
        <button className="btn btn-outline" onClick={onCancel} disabled={message.includes('✅')}>Cancel</button>
      </div>
    </div>
  );
}
