import React, { useState } from 'react';

const DocumentationTab = () => {
  const [formData, setFormData] = useState({
    document: 'Oracle',
    query: ''
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  return (
    <div className="flex justify-center mt-10">
      <div className="w-1/2">
        <div className='justify-center items-center'>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4 ">
            <label htmlFor="document" className="">Choose Document</label>
            <div className="flex items-center space-x-4">
              <label>
                <input 
                  type="radio" 
                  name="document" 
                  value="Oracle" 
                  checked={formData.document === 'Oracle'} 
                  onChange={handleChange} 
                />
                Oracle
              </label>
              <label>
                <input 
                  type="radio" 
                  name="document" 
                  value="C++" 
                  checked={formData.document === 'C++'} 
                  onChange={handleChange} 
                />
                C++
              </label>
            </div>
            <textarea 
              name="query" 
              value={formData.query} 
              onChange={handleChange} 
              className='p-2 bg-transparent border-2 rounded-md text-black focus:outline-none'
              placeholder="Enter your query here"
            />
            <button 
              type="submit" 
              className='text-white bg-gradient-to-b from-cyan-500
              to-blue-500 px-6 py-3 my-8 mx-auto flex items-center rounded-md
              hover:scale-110 duration-300'
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default DocumentationTab;
