import { useEffect, useRef, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Peer from 'simple-peer';
import io from 'socket.io-client';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { auth, logout } from './firebase';
import './App.css';
import './loading.png';
// import { colorCount } from './helpers';

const socket = io.connect('http://localhost:5000');

export default function Chat() {
	const [user, loading] = useAuthState(auth);
	const navigate = useNavigate();
	const [me, setMe] = useState('');
	const [stream, setStream] = useState();
	const [receivingCall, setReceivingCall] = useState(false);
	const [caller, setCaller] = useState('');
	const [callerSignal, setCallerSignal] = useState();
	const [callAccepted, setCallAccepted] = useState(false);
	const [idToCall, setIdToCall] = useState('');
	const [callEnded, setCallEnded] = useState(false);
	const [name, setName] = useState('');
	const myVideo = useRef();
	const userVideo = useRef();
	const connectionRef = useRef();
	const [sessionId, setSessionId] = useState('');

	useEffect(() => {
		if (loading) return;
		if (!user) navigate('/');
	}, [user, loading, navigate]);

	useEffect(() => {
		navigator.mediaDevices
			.getUserMedia({ video: true, audio: true })
			.then((stream) => {
				setStream(stream);
				myVideo.current.srcObject = stream;
			});

		socket.on('me', (id) => {
			setMe(id);
			setSessionId(id);
		});

		socket.on('callUser', (data) => {
			setReceivingCall(true);
			setCaller(data.from);
			setName(data.name);
			setCallerSignal(data.signal);
		});
	}, []);

	const callUser = (id) => {
		const peer = new Peer({
			initiator: true,
			trickle: false,
			stream: stream,
		});
		peer.on('signal', (data) => {
			socket.emit('callUser', {
				userToCall: id,
				signalData: data,
				from: me,
				name: name,
			});
		});

		peer.on('stream', (stream) => {
			userVideo.current.srcObject = stream;
		});
		socket.on('callAccepted', (signal) => {
			setCallAccepted(true);
			peer.signal(signal);
		});

		connectionRef.current = peer;
	};

	const answerCall = () => {
		setCallAccepted(true);
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream: stream,
		});
		peer.on('signal', (data) => {
			socket.emit('answerCall', { signal: data, to: caller });
		});
		peer.on('stream', (stream) => {
			userVideo.current.srcObject = stream;
		});

		peer.signal(callerSignal);
		connectionRef.current = peer;
	};

	const leaveCall = () => {
		setCallEnded(true);
		connectionRef.current.destroy();
	};

	// class bgColorizer {
	// 	constructor(element) {
	// 		//can put while loop here if needed while bgcolorizer exists
	// 		if (element) {
	// 			document.querySelector(element);
	// 		}
	// 		const elements = [];
	// 		for (let i = 0; i < 360; i++) {
	// 			elements.push(document.querySelector(element));
	// 		}
	// 		for (element of elements) {
	// 			element.setProperty('--colorAdderBase', colorCount());
	// 		}
	// 	}
	// }

	// new bgColorizer('.bgGradient');

	// const bgColorizerooo = document.querySelector('.bgGradient');
	// bgColorizer.style.setProperty('--colorAdderBase', colorCount());

	// setInterval(function () {
	// 	const colorArr = [];
	// 	for (let i = 0; i < 360; i++) {
	// 		colorArr.push(document.div.style.setProperty('--colorAdderBase', i));
	// 		if (i === 360) {
	// 			i = 0;
	// 		}
	// 	}
	// }, 2000);
	// setTimeout(function () {
	// 	document.div.style.setProperty('--colorAdderBase', colorCount());
	// }, 2000);

	// 	Array.from(document.querySelectorAll('div')).forEach(function (item) {
	// 		item.addEventListener('div', onNewValue);
	// 	});

	// 	function onNewValue(element) {
	// 		if (element.tagName !== 'DIV') {
	// 			element = element.currentTarget;
	// 		}
	// 	}
	// }
	// element.style.setProperty('--colorAdderBase', colorCount());

	return (
		<>
			<div className='container' id='bgGradient'>
				<div className='headerDiv'>
					<h1 className='titleHeader'>Quick Chat</h1>
				</div>
				<div className='myWindow'>
					{stream && (
						<video
							className='myStream'
							poster='loading.png'
							playsInline
							muted
							ref={myVideo}
							autoPlay
							preload='none'
						/>
					)}
				</div>

				<div className='userWindow'>
					{callAccepted && !callEnded ? (
						<video
							className='userStream'
							poster='loading.png'
							playsInline
							ref={userVideo}
							autoPlay
						/>
					) : null}
				</div>

				<div className='myId'>
					<CopyToClipboard text={me}>
						<button className='copyButton'>Copy ID</button>
					</CopyToClipboard>

					<input
						aria-label='nameinput'
						type={'text'}
						className='nameInput'
						placeholder='Enter your name'
						value={idToCall}
						onChange={(e) => setIdToCall(e.target.value)}
					/>
					<div className='call-button' style={{ margin: 'auto' }}>
						{callAccepted && !callEnded ? (
							<button variant='contained' color='primary' onClick={leaveCall}>
								End Call
							</button>
						) : (
							<button
								color='secondary'
								aria-label='call'
								onClick={() => callUser(idToCall)}
							>
								call
							</button>
						)}
						{idToCall}
					</div>
				</div>
				<div>
					{receivingCall && !callAccepted ? (
						<div className='caller'>
							<h1>{name} is calling...</h1>
							<button variant='contained' color='primary' onClick={answerCall}>
								Answer
							</button>
						</div>
					) : null}
				</div>
				<button className='logoutButton' onClick={logout}>
					Logout
				</button>
				<p className='myIdText'>Session ID: {sessionId}</p>
			</div>
		</>
	);
}
