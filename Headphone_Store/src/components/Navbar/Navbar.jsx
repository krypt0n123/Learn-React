import React from 'react'
import { MdMenu } from "react-icons/md";
import { SlEarphones } from "react-icons/sl";
import { UpdateFollower } from 'react-mouse-follower';
import {motion} from "framer-motion";

const NavbarMenu=[
    {
        id:1,
        title:"Home",
        link:"#",
    },
    {
        id:2,
        title:"Categories",
        link:"#",
    },
    {
        id:3,
        title:"Blog",
        link:"#",
    },
    {
        id:4,
        title:"About",
        link:"#",
    },
    {
        id:5,
        title:"Contact",
        link:"#",
    },
]/*导航栏的一些按钮 */
export const Navbar = () => {
  return (
    <>
        <div className='bg-brandDark text-white py-8 font-varela'>
        <motion.nav initial={{opacity:0}} animate={{opacity:1}} transition={{duration:1,delay:0.5}}
        // motion组件将该区块动化
        className='container flex justify-between items-center'>
            {/*____logo section____*/}
            <div>
                <a href='#' className='text-xl font-bold uppercase' >
                    Playing /{" "}
                    <span className='font-extralight text-white 70'>Market</span>
                </a>
            </div>
            {/*____Menu section____*/}
            <div className='hidden md:block'>
                <ul className='flex items-center gap-4'>
                    {NavbarMenu.map((item) =>(
                        <li key={item.id}>
                            <UpdateFollower
                            mouseOptions={{
                                backgroundColor:"white",
                                zIndex:999,
                                followSpeed:1.5,
                                scale:4,
                                mixBlendMode:"difference",
                            }}>
                                <a 
                                    href={item.link}
                                    className='inline-block text-sm
                                    py-2 px-3 uppercase'>{item.title}
                                    {/* 将按钮放入导航栏 */}
                                </a>
                            </UpdateFollower>
                        </li>
                    ))}
                    <UpdateFollower
                        mouseOptions={{
                            backgroundColor:"white",
                            zIndex:999,
                            followSpeed:1.5,
                            scale:4,
                            mixBlendMode:"difference",
                        }}>
                        <button className='text-xl ps-14'>
                            <SlEarphones/>
                            {/* 插入耳机icon */}
                        </button>
                    </UpdateFollower>
                </ul>
            </div>
            {/*____Movile Hamburger section____*/}
            <div className='md:hidden'>
                <MdMenu className='text-4xl'/>
            </div>
        </motion.nav>
        </div>
    </>
    
  )
}

export default Navbar;