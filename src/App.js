import React, { useRef, useEffect, useState } from 'react';
import './App.css';
import * as tf from '@tensorflow/tfjs';
import * as facemesh from '@tensorflow-models/face-landmarks-detection';
import Webcam from 'react-webcam';
import { drawMesh } from './utilities';

function App() {
	const webcamRef = useRef(null);
	const canvasRef = useRef(null);
	const [cameraAvailable, setCameraAvailable] = useState(true);

	// Load facemesh
	const runFacemesh = async () => {
		const net = await facemesh.load(
			facemesh.SupportedPackages.mediapipeFacemesh
		);
		setInterval(() => {
			detect(net);
		}, 10);
	};

	const detect = async (net) => {
		if (
			typeof webcamRef.current !== 'undefined' &&
			webcamRef.current !== null &&
			webcamRef.current.video.readyState === 4
		) {
			const video = webcamRef.current.video;
			const videoWidth = webcamRef.current.video.videoWidth;
			const videoHeight = webcamRef.current.video.videoHeight;

			webcamRef.current.video.width = videoWidth;
			webcamRef.current.video.height = videoHeight;

			canvasRef.current.width = videoWidth;
			canvasRef.current.height = videoHeight;

			const face = await net.estimateFaces({ input: video });
			console.log(face);

			const ctx = canvasRef.current.getContext('2d');
			requestAnimationFrame(() => {
				drawMesh(face, ctx);
			});
		}
	};

	useEffect(() => {
		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			navigator.mediaDevices
				.getUserMedia({ video: true })
				.then(() => {
					runFacemesh();
				})
				.catch(() => {
					setCameraAvailable(false);
				});
		} else {
			setCameraAvailable(false);
		}
	}, []);

	return (
		<div className='App'>
			<header className='App-header'>
				{cameraAvailable ? (
					<>
						<Webcam
							ref={webcamRef}
							style={{
								position: 'absolute',
								marginLeft: 'auto',
								marginRight: 'auto',
								left: 0,
								right: 0,
								textAlign: 'center',
								zIndex: 9,
								width: 640,
								height: 480,
							}}
						/>
						<canvas
							ref={canvasRef}
							style={{
								position: 'absolute',
								marginLeft: 'auto',
								marginRight: 'auto',
								left: 0,
								right: 0,
								textAlign: 'center',
								zIndex: 9,
								width: 640,
								height: 480,
							}}
						/>
					</>
				) : (
					<div>
						No camera found. Please connect a camera and try again.
					</div>
				)}
			</header>
		</div>
	);
}

export default App;
