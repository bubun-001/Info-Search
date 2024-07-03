import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmpassword: ''
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  axios.defaults.baseURL = process.env.REACT_APP_SERVER_BASE_URL;

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if(formData.email && formData.password && formData.confirmpassword) {
        // Check if the passwords match
        if (formData.password !== formData.confirmpassword) {
          console.log('Passwords do not match');
          toast("Passwords do not match!");
          return;
        }

        const response = await axios.post('/register', {
          useremail: formData.email,
          password: formData.password
        });

        console.log(response.data);

        toast.success("Signed up successfully!");

        navigate('/login');
      }
      else{
        console.log('Incomplete fields');
        toast("Enter all fields");
        return;
      }
    } 
    catch (err) {
      console.error('Error:', err.response.data.message);
      toast.error(err.response.data.message); // Display the error message from the backend
    }
  };

  return (
    <div name='signup' className="flex justify-center">
      <div className="w-1/2">
        <div className='flex flex-col pb-8 pt-20 justify-center items-center'>
            <h2 className='text-4xl font-bold inline border-b-4  border-gray-500'>
              Signup
            </h2>
        </div>
        <div className='justify-center items-center'>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full">
            <input 
              type="email" 
              name="email" 
              placeholder="Enter Email" 
              value={formData.email} 
              onChange={handleChange} 
              className='p-2 bg-transparent border-2 rounded-md text-black focus:outline-none'/>
            <input 
             type="password" 
              name="password" 
              placeholder="Enter Password" 
              value={formData.password} 
              onChange={handleChange} 
              className='p-2 bg-transparent border-2 rounded-md text-black focus:outline-none'/>
            <input 
              type="password"
              name="confirmpassword" 
              placeholder="Enter same Password" 
              value={formData.confirmpassword} 
              onChange={handleChange} 
              className='p-2 bg-transparent border-2 rounded-md text-black focus:outline-none'/>
            <button type="submit" 
                    className='text-white bg-gradient-to-b from-cyan-500
                    to-blue-500 px-6 py-3 my-8 mx-auto flex items-center rounded-md
                    hover:scale-110 duration-300'>
              Signup
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
