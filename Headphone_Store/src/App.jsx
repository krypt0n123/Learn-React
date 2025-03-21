import React from 'react'
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import { UpdateFollower } from 'react-mouse-follower';
import { Services } from './components/Services/Services';
import { Banner } from './components/Banner/Banner';
import { BannerText } from './components/Banner/BannerText';
import Blogs from './components/Blogs/Blogs';
import Footer from './components/Footer/Footer';

export const App = () => {
  return (
      <main className='overflow-x-hidden'>
        <UpdateFollower
        //鼠标跟随样式 
          mouseOptions={{
            backgroundColor:"white",
            zIndex:999,
            followSpeed:1.5,
          }}
        >
          <Navbar />{/*导入导航栏组件 */}
          <Hero />
        </UpdateFollower>
        <UpdateFollower
        //鼠标跟随样式 
          mouseOptions={{
            backgroundColor:"black",
            zIndex:999,
            followSpeed:1.5,
          }}
        >
          <Services/>
          <Banner/>
          <BannerText/>
          <Blogs/>
          <Footer/>
        </UpdateFollower>
      </main>
  )
};

export default App;
