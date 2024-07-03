import React from 'react'

const Contact = () => {
  return (
    <div name='contact' className='w-full h-fit p4 text-black'>
        <div className='flex flex-col p-4 max-w-screen-lg
        mx-auto h-full'>
            <div className='flex flex-col pb-8 pt-20 justify-center items-center'>
                <p className='text-4xl font-bold inline border-b-4
                border-gray-500'>
                    Contact
                </p>
                <p className='py-6'>Submit the form below to contact us</p>
            </div>

            <div className='flex justify-center items-center'>
                <form action="https://getform.io/f/9a76785a-3de9-4f09-b6b0-c958ccc86a8b"
                 method='POST'
                 className='flex flex-col w-full md:w-1/2'>
                    <input
                     type='text'
                     name='name'
                     placeholder='Enter your name'
                     className='p-2 bg-transparent border-2 rounded-md text-white
                    focus:outline-none'
                    />
                    <input
                     type='text'
                     name='email' 
                     placeholder='Enter your email'
                     className='my-4 p-2 bg-transparent border-2 rounded-md text-white
                    focus:outline-none'
                    />
                    <textarea 
                     name='message' 
                     placeholder='Enter your message'
                     rows='10' 
                     className='p-2 bg-transparent border-2 rounded-md text-white
                    focus:outline-none'
                    >
                    </textarea>

                    <button className='text-white bg-gradient-to-b from-cyan-500
                    to-blue-500 px-6 py-3 my-8 mx-auto flex items-center rounded-md
                    hover:scale-110 duration-300'> 
                        Send message
                    </button>
                </form>
            </div>
        </div>

    </div>
  )
}

export default Contact