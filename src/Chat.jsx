/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Peer from 'simple-peer';
import io from 'socket.io-client';
// import { useNavigate } from 'react-router-dom';
import './App.css';
import './loading.png';
import { motion, useDragControls } from 'framer-motion';
import phoneIcon from './phoneIcon.svg';

const socket = io.connect('process.env.PORT');

// io.on('connection', (server) => {
// 	server.on('disconnect', () => {
// 		window.location.reload();
// 	});
// });

const Chat = () => {
	// const navigate = useNavigate();
	const [me, setMe] = useState('');
	const [stream, setStream] = useState();
	const [receivingCall, setReceivingCall] = useState(false);
	const [caller, setCaller] = useState('');
	const [callerSignal, setCallerSignal] = useState();
	const [callAccepted, setCallAccepted] = useState(false);
	const [idToCall, setIdToCall] = useState('');
	const [callEnded, setCallEnded] = useState(false);
	const [name, setName] = useState('');
	const myVideo = useRef(null);
	const userVideo = useRef();
	const connectionRef = useRef();
	// trim session id to 7 characters
	const [sessionId, setSessionId] = useState('');
	const [inACall, setInACall] = useState(false);
	const [yOffset, setYOffset] = useState(0);

	useEffect(() => {
		const getUserMedia = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: true,
					audio: true,
				});
				setStream(stream);
				if (myVideo.current) {
					myVideo.current.srcObject = stream;
				}
			} catch (err) {
				console.log(err);
			}
		};
		getUserMedia();
		// navigator.mediaDevices
		// 	.getUserMedia({ video: true, audio: true })
		// 	.then((stream) => {
		// 		setStream(stream);
		// 		myVideo.current.srcObject = stream;
		// 	});

		socket.on('callUser', (data) => {
			setReceivingCall(true);
			setCaller(data.from);
			setName(data.name);
			setCallerSignal(data.signal);
		});
	}, []);

	socket.on('me', (id) => {
		setMe(id);
		setSessionId(id);
	});

	const callUser = (id) => {
		setInACall(true);
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
		setInACall(true);
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
		setInACall(false);
		connectionRef.current.destroy();
		window.location.reload();
	};

	const offsetSetter = () => {
		if (window.innerWidth < 500) {
			setYOffset('118%');
		} else {
			setYOffset('170%');
		}
	};

	if (sessionId.length > 7) {
		setSessionId(sessionId.slice(0, 7));
	}

	const controls = useDragControls();

	const startDrag = (event) => {
		controls.start(event, { snapToCursor: false });
	};

	const DragBounds = () => {
		const halfheight = window.innerHeight * 0.38;
		const halfWidth = window.innerWidth * 0.35;
		return {
			right: halfWidth,
			left: -halfWidth,
			top: -halfheight - 270,
			bottom: halfheight - 250,
		};
	};

	let sessionIdexists = false;

	const obtainCallId = () => {
		if (sessionId === '') {
			sessionIdexists = false;
			return 'Obtain Call ID';
		} else {
			sessionIdexists = true;
			return 'Share Call ID';
		}
	};

	const reloadIfNoSessionId = () => {
		if (sessionIdexists === false) {
			window.location.reload();
		}
	};

	const hideDuringCall = () => {
		//&& nameinput length = 20
		if (inACall) {
			return 'hidden';
		} else if (!inACall) {
			return 'visible';
		}
	};

	return (
		<>
			<div className='container' id='bgGradient' onLoad={offsetSetter}>
				<div className='headerDiv'>
					<h1 className='titleHeader'>Quick Chat</h1>
				</div>
				<p className='nameText'>{name}</p>
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
					style={{ translateY: yOffset }}
					onPointerDown={startDrag}
					drag
					dragControls={controls}
					dragElastic={0.5}
					dragConstraints={{
						left: DragBounds().left,
						right: DragBounds().right,
						top: DragBounds().top,
						bottom: DragBounds().bottom,
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
					<div
						className='ShareEnterId'
						style={{ visibility: hideDuringCall() }}
					>
						<CopyToClipboard text={me}>
							<button onClick={reloadIfNoSessionId} className='copyButton'>
								{obtainCallId()}
							</button>
						</CopyToClipboard>

						<input
							maxLength={20}
							aria-label='nameinput'
							type={'text'}
							className='nameInput'
							placeholder='Enter Call ID'
							value={idToCall}
							onChange={(e) => setIdToCall(e.target.value)}
						/>
					</div>

					<div className='call-button-container'>
						{callAccepted && !callEnded ? (
							<button className='end-call-button' onClick={leaveCall}>
								End Call
							</button>
						) : (
							<button
								className='call-button'
								aria-label='call'
								onClick={() => callUser(idToCall)}
							>
								<img src={phoneIcon} alt='phone' />
							</button>
						)}
					</div>
				</div>
				<div>
					{receivingCall && !callAccepted ? (
						<div className='caller'>
							<h1>{name} is calling...</h1>
							<button onClick={answerCall}>Answer</button>
						</div>
					) : null}
				</div>

				<p className='myIdText'>Session ID: {sessionId}</p>
			</div>
		</>
	);
};

export default Chat;
