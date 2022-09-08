/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Peer from 'simple-peer';
import io from 'socket.io-client';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, logout, db } from './firebase';
import { query, collection, getDocs, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './App.css';
import './loading.png';
import { motion, useDragControls } from 'framer-motion';

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
	// trim session id to 6 characters
	const [sessionId, setSessionId] = useState('');

	const fetchUserName = async () => {
		try {
			const q = query(collection(db, 'users'), where('uid', '==', user?.uid));
			const doc = await getDocs(q);
			const data = doc.docs[0].data();
			setName(data.name);
		} catch (err) {
			console.error(err);
			alert('An error occured while fetching user data');
		}
	};
	useEffect(() => {
		if (loading) return;
		if (!user) return navigate('/');
		fetchUserName();
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

	if (sessionId.length > 7) {
		setSessionId(sessionId.slice(0, 7));
	}

	const controls = useDragControls();

	function startDrag(event) {
		controls.start(event, { snapToCursor: false });
	}

	function xDragBounds() {
		const halfheight = window.innerHeight * 0.5;
		const halfWidth = window.innerWidth * 0.5;
		return {
			right: halfWidth,
			left: -halfWidth,
			top: -halfheight,
			bottom: halfheight,
		};
	}

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

				<motion.div
					className='userWindow'
					onPointerDown={startDrag}
					drag
					dragControls={controls}
					dragElastic={0.5}
					dragConstraints={{
						left: xDragBounds().left,
						right: xDragBounds().right,
						top: xDragBounds().top,
						bottom: xDragBounds().bottom,
					}}
				>
					{callAccepted && !callEnded ? (
						<video
							className='userStream'
							poster='loading.png'
							playsInline
							ref={userVideo}
							autoPlay
						/>
					) : null}
				</motion.div>
				<div className='myId'>
					<div className='ShareEnterId'>
						<CopyToClipboard text={me}>
							<button className='copyButton'>Share Call ID</button>
						</CopyToClipboard>

						<input
							aria-label='nameinput'
							type={'text'}
							className='nameInput'
							placeholder='Enter Call ID'
							value={idToCall}
							onChange={(e) => setIdToCall(e.target.value)}
						/>
					</div>

					<p className='nameText'>{name}</p>
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
