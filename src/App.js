import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Chat from './Chat';
import Login from './Login';
import './App.css';

function App() {
	return (
		<div className='App'>
			<Router>
				<Routes>
					<Route path='/' element={<Login />} />
					<Route path='/QuickChat' element={<Chat />} />
				</Routes>
			</Router>
		</div>
	);
}

export default App;
