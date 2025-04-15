"use client"
import Navagation from "@/components/home/Navigation"
import Main from "@/components/home/Main"
import { useState } from "react"

export default function Home() {
  const [counter,setCounter]=useState(0)
  const list=[
    {id:1, value:"1212"},
    {id:2, value:"1232"},
    {id:3, value:"1214"},
    {id:4, value:"1215"}
  ]
  function handleClick(){
    setCounter(counter+1)
  }

  return (
    <div className="bg-yellow-400 p-10">
      <button onClick={handleClick}>button</button>
      <Navagation/>
      <Main counter={counter}/>
      counter:{counter}
      {counter===0?<p>计数器未启动</p>:<p>{counter}</p>}

      <ul>
        {list.map((item)=>{
          return <li key={item.id}>{item.value}</li>
        })}
      </ul>
    </div>
  )
}
