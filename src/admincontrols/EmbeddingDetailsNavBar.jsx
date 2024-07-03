import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const EmbeddingDetailsNavBar = () => {
    const [showNav, setShowNav] = useState(false);
    const navigate = useNavigate(); // Import useNavigate hook

    const toggleNav = () => {
        setShowNav(!showNav);
    };

    // Function to handle click on "Embedding Details" text
    const handleEmbeddingDetailsClick = () => {
        navigate('/admin'); // Navigate to /admin route
    };

    return (
        <nav className="bg-gray-800 text-white py-4 px-8 flex justify-between items-center">
            {/* Modify "Embedding Details" text to use navigate */}
            <h1 className="text-xl cursor-pointer" onClick={handleEmbeddingDetailsClick}>Embedding Details</h1>
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
                <Link to="/admin/embedding_details/process_file_component" className="px-4 py-2 text-white hover:bg-gray-700">Process File</Link>
                <Link to="/admin/embedding_details/generate_embeddings_component" className="px-4 py-2 text-white hover:bg-gray-700">Generate Embeddings</Link>
                <Link to="/admin/embedding_details/embedded_chunks" className="px-4 py-2 text-white hover:bg-gray-700">Embedded Chunks</Link>
            </div>
        </nav>
    );
};

export default EmbeddingDetailsNavBar;
