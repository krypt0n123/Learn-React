import Button from "@/components/common/Button"
import { MdRefresh } from "react-icons/md"
import { PiLightningFill, PiStopBold } from "react-icons/pi"
import { FiSend } from "react-icons/fi"
import TextareaAutoSize from "react-textarea-autosize"
import { useEffect, useRef, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { Message, MessageRequestBody } from "@/types/chat"
import { useAppContext } from "@/components/AppContext"
import { ActionType } from "@/reducers/AppReducer"
import { useEventBusContext } from "@/components/EventBusContext"
import { title } from "process"

export default function ChatInput() {
  const [messageText, setMessageText] = useState("")
  const stopRef = useRef(false)
  const chatIdRef = useRef("")
  const {
    state: { messageList, currentModel, streamingID, selectedChat },
    dispatch
  } = useAppContext()
  const { publish } = useEventBusContext()

  useEffect(() => {
    if (chatIdRef.current === selectedChat?.id) {
      return
    }
    chatIdRef.current = selectedChat?.id ?? ""
    stopRef.current = true
  }, [selectedChat])

  async function createOrUpdateMessage(message: Message) {
    try {
      const response = await fetch("/api/message/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(message),
        cache: 'no-store'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.error || errorData.message || response.statusText);
      }

      const data = await response.json();
      if (data.data?.message?.chatId && !chatIdRef.current) {
        chatIdRef.current = data.data.message.chatId;
        publish("fetchChatList")
        dispatch({
          type: ActionType.UPDATE,
          field: "selectedChat",
          value: { id: chatIdRef.current }
        })
      }
      return data.data.message;
    } catch (error) {
      console.error('Error in createOrUpdateMessage:', error);
      throw error;
    }
  }

  async function deleteMessage(id: string) {
    const response = await fetch(`/api/message/delete?id=${id}`, {
      method: "POST",
      headers: {
        "Content-type": "applicarion/json"
      }
    })
    if (!response.ok) {
      console.log(response.statusText)
      return
    }
    const { code } = await response.json()
    return code === 0
  }

  // 将 updateChatTitle 函数移到 send 函数外部
  async function updateChatTitle(messages: Message[]) {
    const message: Message = {
      id: "",
      role: "user",
      content: "使用5到10个字直接返回这句话的简要主题，不要解释、不要标点、不要语气词、不要多余文本，如果没有主题，请直接返回'新对话'",
      chatId: chatIdRef.current
    }

    const chatId = chatIdRef.current
    const body: MessageRequestBody = {
      messages: [...messages, message],
      model: currentModel
    }

    const apiEndpoint = currentModel === 'deepseek-chat'
      ? '/api/chat/deepseek'
      : '/api/chat';  // 原有的 API 端点

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      console.log(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("Response body is empty");
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let buffer = "";
    let title = "";

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      buffer += decoder.decode(value);

      // 按行处理
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // 保留未完成的行

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(data);
            if (
              parsed.choices &&
              parsed.choices[0] &&
              parsed.choices[0].delta &&
              parsed.choices[0].delta.content
            ) {
              title += parsed.choices[0].delta.content;
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
    // 不能重新赋值 response，使用新变量 response2
    const response2 = await fetch("/api/chat/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: chatId,
        title,
        updateTime: Date.now()
      })
    })
    if (!response2.ok) {
      console.log(response2.statusText)
      return
    }
    const { code } = await response2.json()
    if (code === 0) {
      publish("fetchChatList")
    }
  }

  async function send() {
    try {
      if (!messageText.trim()) {
        return;
      }

      const messageData: Message = {
        id: uuidv4(),
        role: "user" as const,
        content: messageText.trim(),
        chatId: chatIdRef.current
      };

      const message = await createOrUpdateMessage(messageData);

      if (message) {
        dispatch({ type: ActionType.ADD_MESSAGE, message });
        setMessageText("");
        const messages = messageList.concat([message]);
        await doSend(messages);

        if (!selectedChat?.title || selectedChat.title === "新对话") {
          await updateChatTitle(messages)
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('发送消息失败：' + (error instanceof Error ? error.message : String(error)));
    }
  }

  async function resend() {
    const messages = [...messageList]
    if (
      messages.length !== 0 &&
      messages[messages.length - 1].role === "assistant"
    ) {
      const result = await deleteMessage(messages[messages.length - 1].id)
      if (!result) {
        console.log("delete error")
        return
      }
      dispatch({
        type: ActionType.REMOVE_MESSAGE,
        message: messages[messages.length - 1]
      })
      messages.splice(messages.length - 1, 1)
    }
    doSend(messages)
  }

  async function doSend(messages: Message[]) {
    const apiEndpoint = currentModel === 'deepseek-chat'
      ? '/api/chat/deepseek'
      : '/api/chat';  // 原有的 API 端点

    stopRef.current = false
    try {
      const body: MessageRequestBody = { messages, model: currentModel }
      setMessageText("")
      const controller = new AbortController()

      const response = await fetch(apiEndpoint, {
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
        chatId: chatIdRef.current
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
      let buffer = ""

      try {
        while (!done) {
          if (stopRef.current) {
            controller.abort()
            break
          }
          const result = await reader.read()
          done = result.done
          const chunk = decoder.decode(result.value)
          buffer += chunk

          // Parse SSE format
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6) // Remove 'data: ' prefix

              if (data === '[DONE]') {
                done = true
                break
              }

              try {
                const parsed = JSON.parse(data)
                if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
                  const delta = parsed.choices[0].delta
                  if (delta.content) {
                    content += delta.content
                    dispatch({
                      type: ActionType.UPDATE_MESSAGE,
                      message: { ...responseMessage, content }
                    })
                  }
                }
              } catch (e) {
                // Ignore parsing errors for incomplete JSON
                console.warn('Failed to parse SSE data:', data)
              }
            }
          }
        }
      } catch (error: any) {
        if (error?.name === 'AbortError') {
          console.log('Stream was stopped by user');
        } else {
          throw error;
        }
      } finally {
        if (content) {
          const savedMessage = await createOrUpdateMessage({
            id: responseMessage.id,
            role: "assistant",
            content: content,
            chatId: chatIdRef.current
          });
          dispatch({
            type: ActionType.UPDATE_MESSAGE,
            message: savedMessage
          });
        }
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
