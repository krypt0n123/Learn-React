import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {MouseFollower} from "react-mouse-follower"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MouseFollower/>
    {/* 导入鼠标跟随组件 */}
    <App />
    {/* 导入app页 */}
  </StrictMode>,
)
