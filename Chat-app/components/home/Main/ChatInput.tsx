import Button from "@/components/common/Button"
import { MdRefresh } from "react-icons/md"
import { PiLightningFill, PiStopBold } from "react-icons/pi"
import { FiSend } from "react-icons/fi"
import TextareaAutoSize from "react-textarea-autosize"
import { useRef, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { Message, MessageRequestBody } from "@/types/chat"
import { useAppContext } from "@/components/AppContext"
import { ActionType } from "@/reducers/AppReducer"

export default function ChatInput() {
  const [messageText, setMessageText] = useState("")
  const stopRef = useRef(false)
  const {
    state: { messageList, currentModel, streamingID },
    dispatch
  } = useAppContext()

  async function createOrUpdateMessage(message: Message) {
    const response = await fetch("/api/message/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(message)
    });
    if (!response.ok) {
      console.log(response.statusText)
      return
    }
    const { data } = await response.json()
    return data.message
  }

  async function send() {
    try {
      const message = await createOrUpdateMessage({
        id: "",
        role: "user",
        content: messageText,
        chatId: ""
      });

      if (message) {
        dispatch({ type: ActionType.ADD_MESSAGE, message });
        const messages = messageList.concat([message]);
        await doSend(messages);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // You might want to show an error message to the user here
    }
  }

  async function resend() {
    const messages = [...messageList]
    if (
      messages.length !== 0 &&
      messages[messages.length - 1].role === "assistant"
    ) {
      dispatch({
        type: ActionType.REMOVE_MESSAGE,
        message: messages[messages.length - 1]
      })
      messages.splice(messages.length - 1, 1)
    }
    doSend(messages)
  }

  async function doSend(messages: Message[]) {
    try {
      const body: MessageRequestBody = { messages, model: currentModel }
      setMessageText("")
      const controller = new AbortController()

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        signal: controller.signal,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        console.log(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("Response body is empty");
      }

      const responseMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: "",
        chatId:"" // Use the same chatId as the user message
      }

      dispatch({ type: ActionType.ADD_MESSAGE, message: responseMessage })
      dispatch({
        type: ActionType.UPDATE,
        field: "streamingID",
        value: responseMessage.id
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      let content = ""

      try {
        while (!done) {
          if (stopRef.current) {
            stopRef.current = false
            controller.abort()
            break
          }
          const result = await reader.read()
          done = result.done
          const chunk = decoder.decode(result.value)
          content += chunk
          dispatch({
            type: ActionType.UPDATE_MESSAGE,
            message: { ...responseMessage, content }
          })
        }
      } catch (error: any) {
        if (error?.name === 'AbortError') {
          console.log('Stream was stopped by user');
        } else {
          throw error;
        }
      } finally {
        dispatch({
          type: ActionType.UPDATE,
          field: "streamingID",
          value: ""
        })
      }
    } catch (error) {
      console.error('Error in streaming chat:', error);
      // You might want to show an error message to the user here
    }
  }

  return (
    <div className='absolute bottom-0 inset-x-0 bg-gradient-to-b from-[rgba(255,255,255,0)] from-[13.94%] to-[#fff] to-[54.73%] pt-10 dark:from-[rgba(53,55,64,0)] dark:to-[#353740] dark:to-[58.85%]'>
      <div className='w-full max-w-4xl mx-auto flex flex-col items-center px-4 space-y-4'>
        {messageList.length !== 0 &&
          (streamingID !== "" ? (
            <Button
              icon={PiStopBold}
              variant='primary'
              onClick={() => {
                stopRef.current = true
              }}
              className='font-medium bg-green-400'
            >
              停止生成
            </Button>
          ) : (
            <Button
              icon={MdRefresh}
              variant='primary'
              onClick={() => {
                resend()
              }}
              className='font-medium bg-green-400'
            >
              重新生成
            </Button>
          ))}
        <div className='flex items-end w-full border border-black/10 dark:border-gray-800/50 bg-white dark:bg-gray-700 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.1)] py-4'>
          <div className='mx-3 mb-2.5 text-primary-500'>
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
            disabled={
              messageText.trim() === "" || streamingID !== ""
            }
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
