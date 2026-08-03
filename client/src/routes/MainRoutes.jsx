import React from 'react'
import { Route, Routes } from 'react-router-dom'
import HomePage from '../Pages/HomePage'
import ChatPage from '../Pages/ChatPage'
import ForgotPassword from '../Pages/ForgotPassword'
import ResetPassword from '../Pages/ResetPassword'

const MainRoutes = () => {
  return (
      <Routes>
          <Route path='/' element={ <HomePage/>} />
          <Route path='/forgot-password' element={ <ForgotPassword/>} />
          <Route path='/reset-password/:token' element={ <ResetPassword/>} />
          <Route path='/chats' element={ <ChatPage/>}/>
    </Routes>
  )
}

export default MainRoutes