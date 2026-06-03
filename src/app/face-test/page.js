'use client';

import { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { loadModels } from '@/lib/faceApi';

export default function FaceTestPage() {
  const [initializing, setInitializing] = useState(true);
  const [localDescriptor, setLocalDescriptor] = useState(null);
  const [message, setMessage] = useState('Initializing AI...');
  const [matchStatus, setMatchStatus] = useState('');
  const videoRef = useRef();

  useEffect(() => {
    const init = async () => {
      try {
        await loadModels();
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setInitializing(false);
        setMessage('Ready! Step 1: Click "Save My Face" to test.');
      } catch (err) {
        console.error(err);
        setMessage('Error: ' + err.message);
      }
    };
    init();
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const saveLocalFace = async () => {
    setMessage('Capturing...');
    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      setLocalDescriptor(detection.descriptor);
      setMessage('Step 2: Face Saved Locally! Now looking for a match...');
    } else {
      alert("No face detected!");
    }
  };

  useEffect(() => {
    let interval;
    if (localDescriptor && videoRef.current) {
      const faceMatcher = new faceapi.FaceMatcher(
        [new faceapi.LabeledFaceDescriptors('TEST_USER', [localDescriptor])],
        0.6
      );

      interval = setInterval(async () => {
        const detection = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection) {
          const match = faceMatcher.findBestMatch(detection.descriptor);
          if (match.label !== 'unknown') {
            setMatchStatus('✅ MATCH FOUND: It is YOU!');
          } else {
            setMatchStatus('❌ No Match (Try looking closer)');
          }
        } else {
          setMatchStatus('❓ Looking for face...');
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [localDescriptor]);

  return (
    <div className="container-fluid" style={{ padding: '2rem' }}>
      <h1>🔬 Face AI Local Test</h1>
      <p>Is page par hum database ke baghair check karenge ke AI kaam kar rahi hai ya nahi.</p>
      
      <div className="card" style={{ maxWidth: '600px', margin: 'auto' }}>
        <div style={{ position: 'relative', background: '#000' }}>
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline
            style={{ 
              width: '100%',
              transform: 'scaleX(-1)' // Mirror effect
            }} 
          />
          <div style={{
            position: 'absolute', bottom: 10, left: 10, right: 10,
            background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '10px', borderRadius: '5px'
          }}>
            {message}
          </div>
        </div>

        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
          {!localDescriptor ? (
            <button className="btn btn-primary" onClick={saveLocalFace} disabled={initializing}>
              📸 Step 1: Save My Face (Local)
            </button>
          ) : (
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: matchStatus.includes('✅') ? 'green' : 'red' }}>
              {matchStatus}
            </div>
          )}
          
          <div style={{ marginTop: '1rem' }}>
            <button className="btn btn-outline" onClick={() => window.location.reload()}>🔄 Reset Test</button>
          </div>
        </div>
      </div>
    </div>
  );
}
