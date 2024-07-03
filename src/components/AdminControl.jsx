import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminControl = () => {

  const [showNav, setShowNav] = useState(false);
    const navigate = useNavigate(); // Import useNavigate hook

    const toggleNav = () => {
        setShowNav(!showNav);
    };

  const handleAdminControlsClick = () => {
    navigate('/'); // Navigate to /admin route
};

  return (
    <nav className="bg-gray-800 text-white py-4 px-8 flex justify-between items-center">
            {/* Modify "Admin Controls" text to use navigate */}
            <h1 className="text-xl cursor-pointer" onClick={handleAdminControlsClick}>Admin Controls</h1>
            <button onClick={toggleNav} className="block md:hidden">
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d={showNav ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
                    ></path>
                </svg>
            </button>
            <div className={showNav ? "flex flex-col md:flex-row md:items-center" : "hidden md:flex md:items-center"}>
                <Link to="/admin/language" className="px-4 py-2 text-white hover:bg-gray-700">Languages</Link>
                <Link to="/admin/grade" className="px-4 py-2 text-white hover:bg-gray-700">Grades</Link>
                <Link to="/admin/book_type" className="px-4 py-2 text-white hover:bg-gray-700">Book Types</Link>
                <Link to="/admin/book" className="px-4 py-2 text-white hover:bg-gray-700">Books</Link>
                <Link to="/admin/topic" className="px-4 py-2 text-white hover:bg-gray-700">Topics</Link>
                <Link to="/admin/embedding_type" className="px-4 py-2 text-white hover:bg-gray-700">Embedding Types</Link>
                <Link to="/admin/embedding_details" className="px-4 py-2 text-white hover:bg-gray-700">Embedding Details</Link>
            </div>
        </nav>
  )
}

export default AdminControl