import Button from '@/components/common/Button'
import { MdRefresh } from "react-icons/md"
import { PiLightningFill } from "react-icons/pi"
import { FiSend } from 'react-icons/fi'
import TextareaAutoSize from 'react-textarea-autosize'
import { useState } from 'react'

export const ChatInput = () => {
  const [messageText, setMessageText] = useState('')

  async function send(){
    const body = JSON.stringify({messageText})
    const response = await fetch("api/chat",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body
    })
    if(!response.ok){
      console.log(response.statusText)
      return
    }
    if(!response.body){
      console.log("body error")
      return
    }
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let done= false
    while(!done){
      const result =await reader.read()
      done=result.done
      const chunk =decoder.decode(result.value)
      console.log(chunk)
    }
    setMessageText("")
  }

  return (
    <div className='absolute bottom-0 inset-x-0 bg-gradient-to-b from-[rgba(255,255,255,0)] from-[13.94%] to-[#fff] to-[54.73%] pt-10 dark:from-[rgba(53,55,64,0)] dark:to-[#353740] dark:to-[58.85%]'>
      <div className='w-full max-w-4xl mx-auto flex flex-col items-center px-4 space-y-4'>
        <Button
          icon={MdRefresh}
          variant='primary'
          className='font-medium bg-green-400'
        >
          重新生成
        </Button>
        <div className='flex items-end w-full border border-black/10 dark:border-gray-800/50 bg-white dark:bg-gray-700 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.1)] py-4'>
          <div className='mx-3 mb-2.5'>
            <PiLightningFill />
          </div>
          <TextareaAutoSize
            className='outline-none flex-1 max-h-64 mb-1.5 bg-transparent text-black dark:text-white resize-none border-0'
            placeholder='输入一条消息...'
            rows={1}
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value)
            }}
          />
          <Button
            className='mx-3 !rounded-lg bg-green-400'
            icon={FiSend}
            variant='primary'
            onClick={send}
          />
        </div>
        <footer className='text-center text-sm text-gray-700 dark:text-gray-300 px-4 pb-6'>
          ©{new Date().getFullYear()}&nbsp;
          <a
            className='font-medium py-[1px] border-b border-dotted border-black/60 hover:border-black/0 dark:border-gray-200 dark:hover:border-gray-200/0'
            href='https://chat.deepseek.com/'
            target="_blank"
          >
            deepseek
          </a>
          .&nbsp;基于第三方提供的接口
        </footer>
      </div>
    </div>
  )
}
