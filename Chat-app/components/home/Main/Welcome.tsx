import { Example } from "./Example"
import { ModelSelect } from "./ModelSelect"

export const Welcome = () => {
  return (
    <div className='w-full max-w-4xl mx-auto flex flex-col items-center px-4 py-5'>
      <ModelSelect/>
      <h1 className="mt-20 text-4xl font-bold">
        DeepSeek免费使用 —— DeepSeek-R1
      </h1>
      <Example/>
    </div>
  )
}