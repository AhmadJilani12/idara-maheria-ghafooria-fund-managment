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
                
                // 1. Stop recognition loop
                setRecognizing(false);
                
                // 2. Freeze the camera frame
                if (videoRef.current) {
                  videoRef.current.pause();
                }

                // 3. Set Message
                setMessage(`✅ Success!\nThank You, ${matchedTeacher.name}\nTime: ${currentTime}`);
                
                // 4. Stop tracks and finish after 3 seconds
                setTimeout(() => {
                  if (videoRef.current?.srcObject) {
                    videoRef.current.srcObject.getTracks().forEach(track => track.stop());
                  }
                  onMatch(matchedTeacher._id);
                }, 3000);
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
            filter: message.includes('✅') ? 'brightness(0.6) blur(2px)' : 'none',
            transition: 'filter 0.5s ease'
          }}
        />

        {/* Success Overlay - Polished and compact */}
        {message.includes('✅') && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(255, 255, 255, 0.95)',
            color: '#1a5f3d',
            padding: '2rem',
            borderRadius: '20px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            zIndex: 100,
            width: '85%',
            maxWidth: '380px',
            border: '4px solid #28a745'
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>✅</div>
            <h2 style={{ color: '#1a5f3d', marginBottom: '0.5rem', fontSize: '1.4rem' }}>Attendance Marked!</h2>
            <p style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>
              {message.split('\n')[1]}
            </p>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>{message.split('\n')[2]}</p>
            
            <div style={{ marginTop: '1.5rem', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                background: '#28a745', 
                width: '100%',
                transition: 'width 3s linear'
              }}></div>
            </div>
          </div>
        )}

        {!message.includes('✅') && (
          <div style={{
            position: 'absolute',
            bottom: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '0.6rem 1.2rem',
            borderRadius: '30px',
            fontSize: '0.85rem',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.1)',
            whiteSpace: 'nowrap'
          }}>
            {message}
          </div>
        )}
      </div>

      <div style={{ padding: '1.5rem', textAlign: 'center' }}>
        <button className="btn btn-outline" onClick={onCancel} disabled={message.includes('✅')}>Cancel</button>
      </div>
    </div>
  );
}
