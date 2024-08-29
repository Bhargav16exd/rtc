import './App.css'
import {  Route, Routes } from 'react-router-dom'
import Sender from './pages/Sender'
import Reciever from './pages/Reciever'

function App() {


  return (
    <Routes>

     <Route path='/sender' element={<Sender/>}></Route>
     <Route path='/reciever' element={<Reciever/>}></Route>

    </Routes>
  )
}

export default App
