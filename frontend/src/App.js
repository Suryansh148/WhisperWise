
import './App.css';
import {Route, Routes,Router} from "react-router-dom"
import { LoginPage } from './Pages/LoginPage';
import {ChatPage} from './Pages/ChatPage'
import {SignupPage} from './Pages/SignupPage'

function App() {
  return (
    <div className="App">
    
    <Routes>
      <Route path="/" element={<LoginPage/>}/>
      <Route path="/chats" element={<ChatPage/>} />
      <Route path='/signup' element={<SignupPage/>}/>
    </Routes>
      
    </div>
  );
}

export default App;
