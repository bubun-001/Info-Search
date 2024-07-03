import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { logoutRedux } from '../redux/userSlice';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const NavBar = () => {
  const [showAuthLinks, setShowAuthLinks] = useState(false);
  const node = useRef();

  const navigate = useNavigate();

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const userData = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const handleClickOutside = (e) => {
    if (node.current && !node.current.contains(e.target)) {
      setShowAuthLinks(false);
    }
  };

  const toggleAuthLinks = () => {
    setShowAuthLinks(!showAuthLinks);
  };

  const handleSignOut = () => {
    dispatch(logoutRedux());
    navigate('/academics');
    toast("Logged out successfully");
  };

  // Check if user is logged in
  const isLoggedIn = !!userData.email;
  
  // Check if user is admin based on email
  const isAdmin = userData.email === process.env.REACT_APP_ADMIN_EMAIL;
  console.log(process.env.REACT_APP_ADMIN_EMAIL);
  console.log(userData.email, isLoggedIn ,isAdmin);

  return (
    <header className="bg-gray-800 text-white py-4 px-8 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className="mr-4 text-xl"><Link to="/">Info Search</Link></h1>
        <ul className="flex space-x-4">
          <li><Link to="/academics">Academics</Link></li>
          {//<li><Link to="/documentation">Documentation</Link></li>
          }
          {isLoggedIn && isAdmin && <li><Link to="/admin">Admin Control</Link></li>}
        </ul>
      </div>
      <div className="flex items-center" ref={node}>
        <Link to="/contact" className="mr-4">Contact</Link>
        {isLoggedIn ? (
          <div className="relative" onClick={toggleAuthLinks}>
            {isAdmin ? (<p className="mr-4">Hello Admin</p>) : (<p className="mr-4">Hello User</p>)}
            {showAuthLinks && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-black shadow-md rounded-md">
                <ul className="list-none p-0">
                  <li><button onClick={handleSignOut} className="block px-4 py-2">Sign Out</button></li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="relative" onClick={toggleAuthLinks}>
            <FaUserCircle size={24} className="cursor-pointer" />
            {showAuthLinks && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-black shadow-md rounded-md">
                <ul className="list-none p-0">
                  <li><Link to="/login" className="block px-4 py-2">Login</Link></li>
                  <li><Link to="/signup" className="block px-4 py-2">Signup</Link></li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default NavBar;
