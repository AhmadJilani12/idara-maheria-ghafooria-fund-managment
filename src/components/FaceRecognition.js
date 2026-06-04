'use client';

import { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { loadModels } from '@/lib/faceApi';

export default function FaceRecognition({ teachers, onMatch, onCancel }) {
  const [initializing, setInitializing] = useState(true);
  const [recognizing, setRecognizing] = useState(false);
  const [message, setMessage] = useState('Initializing Face API...');
  const [snapshot, setSnapshot] = useState(null);
  const videoRef = useRef();
  const canvasRef = useRef();
  const faceMatcherRef = useRef(null);

  useEffect(() => {
    let stream = null;
    const startRecognition = async () => {
      try {
        console.log("Recognition: Loading models...");
        setMessage('Loading models (this may take a moment)...');
        await loadModels();
        
        console.log("Recognition: Models loaded. Preparing teacher data...");
        setMessage('Preparing teacher data...');
        
        const teachersList = Array.isArray(teachers) ? teachers : [];
        const withFace = teachersList.filter(t => {
          if (t.faceDescriptor) {
            const arr = Array.isArray(t.faceDescriptor) ? t.faceDescriptor : Object.values(t.faceDescriptor);
            return arr.length > 50;
          }
          return false;
        });

        console.log(`Recognition: Found ${withFace.length} teachers with face data.`);

        const labeledDescriptors = withFace.map(t => {
            const descriptorArray = Array.isArray(t.faceDescriptor) ? t.faceDescriptor : Object.values(t.faceDescriptor);
            return new faceapi.LabeledFaceDescriptors(
              t._id,
              [new Float32Array(descriptorArray)]
            );
          });

        if (labeledDescriptors.length === 0) {
          setMessage(`No registered faces found in database.`);
          setInitializing(false);
          return;
        }

        faceMatcherRef.current = new faceapi.FaceMatcher(labeledDescriptors, 0.45);

        console.log("Recognition: Requesting camera access...");
        setMessage('Requesting camera access...');
        
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          } 
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Robust play call
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play()
              .then(() => {
                console.log("Recognition: Camera playing.");
                setMessage('Ready! Please look at the camera.');
                setRecognizing(true);
                setInitializing(false);
              })
              .catch(e => {
                console.error("Recognition: Play error:", e);
                setMessage('Camera error: Could not start video feed.');
              });
          };
        }
      } catch (err) {
        console.error("Recognition error:", err);
        setMessage('Error: ' + (err.message || 'Check camera permissions.'));
        setInitializing(false);
      }
    };
    startRecognition();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [teachers]);

  useEffect(() => {
    let interval;
    let matchCounter = 0; 
    let isProcessing = false; 
    const REQUIRED_MATCHES = 3; 

    if (recognizing && videoRef.current) {
      interval = setInterval(async () => {
        if (isProcessing || !videoRef.current || videoRef.current.paused || videoRef.current.ended || videoRef.current.readyState < 2) {
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
            matchCounter = 0; 
            setMessage('Face not detected. Please look at the camera.');
            return;
          }

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
                isProcessing = true; 
                const matchedTeacher = teachers.find(t => t._id === match.label);
                
                if (matchedTeacher) {
                  setRecognizing(false);
                  
                  // Snapshot
                  if (videoRef.current && canvasRef.current) {
                    const ctx = canvasRef.current.getContext('2d');
                    canvasRef.current.width = videoRef.current.videoWidth;
                    canvasRef.current.height = videoRef.current.videoHeight;
                    ctx.scale(-1, 1);
                    ctx.drawImage(videoRef.current, -canvasRef.current.width, 0, canvasRef.current.width, canvasRef.current.height);
                    setSnapshot(canvasRef.current.toDataURL('image/png'));
                  }

                  if (videoRef.current) videoRef.current.pause();
                  
                  if (videoRef.current?.srcObject) {
                    videoRef.current.srcObject.getTracks().forEach(track => track.stop());
                  }

                  setMessage(`✅ ${matchedTeacher.name} Verified!\n${new Date().getHours() < 12 ? 'Check-in' : 'Check-out'} marked successfully at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\nThank You!`);
                  
                  console.log("Scanner: Attempting onMatch callback for:", matchedTeacher.name, matchedTeacher._id);
                  
                  setTimeout(() => {
                    onMatch(matchedTeacher._id);
                  }, 3000);
                } else {
                  isProcessing = false; 
                }
              }
            } else {
              matchCounter = 0;
              setMessage('❌ Match not found. Please ensure you are registered.');
            }
          }
        } catch (err) {
          console.error("Loop error:", err);
          isProcessing = false;
        }
      }, 200);
    }
    return () => {
      clearInterval(interval);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [recognizing, teachers, onMatch]);

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '1rem auto', padding: '0', overflow: 'hidden' }}>
      <div className="card-header" style={{ padding: '1rem' }}>
        <h3 style={{ margin: 0 }}>Face Attendance Scanner</h3>
        {!message.includes('✅') && <button className="btn btn-outline" onClick={onCancel}>✕</button>}
      </div>
      
      <div style={{ position: 'relative', textAlign: 'center', background: '#000', minHeight: '300px' }}>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        {snapshot ? (
          <img src={snapshot} alt="Verified" style={{ width: '100%', display: 'block' }} />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            onLoadedMetadata={() => videoRef.current.play().catch(e => console.error("Play error:", e))}
            style={{ 
              width: '100%', 
              minHeight: '300px', 
              display: 'block',
              backgroundColor: '#333', 
              transform: 'scaleX(-1)', 
              transition: 'filter 0.5s ease'
            }}
          />
        )}
        <div style={{
          position: 'absolute',
          bottom: '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '0.8rem 1.5rem',
          borderRadius: '30px',
          fontSize: '1rem',
          fontWeight: '600',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.2)',
          textAlign: 'center',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          zIndex: 100,
          minWidth: '200px',
        }}>
          {message}
        </div>
      </div>
      <div style={{ padding: '1.5rem', textAlign: 'center' }}>
        {!message.includes('✅') && (
          <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem', lineHeight: '1.4' }}>
            <p>💡 <strong>Tip:</strong> Please hold still close to the camera.<br/>
            Scanning may take 10-15 seconds. Please be patient.</p>
          </div>
        )}
        <button className="btn btn-outline" onClick={onCancel} disabled={message.includes('✅')}>Cancel</button>
      </div>
    </div>
  );
}
