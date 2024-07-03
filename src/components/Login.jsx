import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginRedux } from '../redux/userSlice';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  axios.defaults.baseURL = process.env.REACT_APP_SERVER_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.email && formData.password) {
        const response = await axios.post('/login', {
          useremail: formData.email,
          password: formData.password
        });

        const { message } = response.data;

        // Dispatch an action to update the user state in the Redux store with user email
        dispatch(loginRedux(formData.email)); // Pass the email as payload

        // Redirect the user to the appropriate page
        navigate('/academics');

        toast.success(message);
      } else {
        toast.error("Enter all fields");
      }
    } catch (err) {
      console.error('Error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("An error occurred. Please try again later.");
      }
    }
  };

  return (
    <div name='login' className="flex justify-center">
      <div className="w-1/2">
        <div className='flex flex-col pb-8 pt-20 justify-center items-center'>
          <h2 className='text-4xl font-bold inline border-b-4  border-gray-500'>
            Login
          </h2>
        </div>
        <div className='justify-center items-center'>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
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
            <button type="submit" 
                    className='text-white bg-gradient-to-b from-cyan-500
                    to-blue-500 px-6 py-3 my-8 mx-auto flex items-center rounded-md
                    hover:scale-110 duration-300'>
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;