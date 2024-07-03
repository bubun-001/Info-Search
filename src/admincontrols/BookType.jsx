import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function BookType() {
    const [bookTypes, setBookTypes] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [newBookTypeName, setNewBookTypeName] = useState('');
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [bookTypeToDelete, setBookTypeToDelete] = useState(null);
    const [bookTypeToEdit, setBookTypeToEdit] = useState(null);

    useEffect(() => {
        fetchBookTypes();
    }, []);

    axios.defaults.baseURL = process.env.REACT_APP_SERVER_BASE_URL;

    const fetchBookTypes = async () => {
        try {
            const response = await axios.get('/book_types');
            setBookTypes(response.data);
        } catch (error) {
            console.error('Error fetching book types:', error);
        }
    };

    const handleEdit = (bookTypeId, newName) => {
        setBookTypeToEdit({ id: bookTypeId, name: newName });
        setShowEditPopup(true);
    };

    const handleDelete = (bookTypeId) => {
        setBookTypeToDelete(bookTypeId);
        setShowDeletePopup(true);
    };

    const handleAddBookType = async () => {
        try {
            await axios.post('/book_types', { book_type_name: newBookTypeName });
            // Refresh book types after adding
            fetchBookTypes();
            // Close the popup
            setShowPopup(false);
            // Reset newBookTypeName
            setNewBookTypeName('');
            toast.success('Book type added successfully');
        } catch (error) {
            console.error('Error adding book type:', error);
            toast.error('Book type already exists');
        }
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`/book_types/${bookTypeToDelete}`);
            // Refresh book types after delete
            fetchBookTypes();
            // Close the popup
            setShowDeletePopup(false);
            toast.success('Book type deleted successfully');
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data.error === 'Cannot delete the book type as there are associated books') {
                toast.error('Cannot delete the book type because there are associated books');
            } else {
                console.error('Error deleting book type:', error);
            }
        }
    };
    
    const confirmEdit = async () => {
        try {
            await axios.put(`/book_types/${bookTypeToEdit.id}`, { book_type_name: bookTypeToEdit.name });
            // Refresh book types after edit
            fetchBookTypes();
            // Close the popup
            setShowEditPopup(false);
            toast.success('Book type updated successfully');
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data.error === 'Cannot update the book type as there are associated books') {
                toast.error('Cannot update the book type because there are associated books');
            } else {
                console.error('Error editing book type:', error);
            }
        }
    };
    

    const [sortOrder, setSortOrder] = useState('asc');

    // Function to toggle sort order
    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    // Function to sort book types by book type name
    const sortBookTypesByName = () => {
        const sortedBookTypes = [...bookTypes].sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.book_type_name.localeCompare(b.book_type_name);
            } else {
                return b.book_type_name.localeCompare(a.book_type_name);
            }
        });
        setBookTypes(sortedBookTypes);
    };

    const handleSortByName = () => {
        toggleSortOrder();
        sortBookTypesByName();
    };

    return (
        <div className="book-type-list">
            <div name='login' className="flex justify-center">
                <div className="w-1/2">
                    <div className='flex flex-col pb-8 pt-20 justify-center items-center'>
                        <h2 className='text-4xl font-bold inline border-b-4 border-gray-500'>
                            Book Types
                        </h2>
                    </div>
                    {bookTypes.length === 0 ? (
                        <p className='flex justify-center items-center text-lg'>No book type in the system</p>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" onClick={handleSortByName}>
                                        Book type Name
                                        {sortOrder === 'asc' ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-1" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 3a1 1 0 0 1 1 1v11.293l2.146-2.147a1 1 0 1 1 1.415 1.414l-3.5 3.5a1 1 0 0 1-1.414 0l-3.5-3.5a1 1 0 1 1 1.414-1.414L9 15.293V4a1 1 0 0 1 1-1z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-1" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 3a1 1 0 0 0-1 1v11.293l-2.146-2.147a1 1 0 1 0-1.415 1.414l3.5 3.5a1 1 0 0 0 1.414 0l3.5-3.5a1 1 0 1 0-1.414-1.414L11 15.293V4a1 1 0 0 0-1-1z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Edit</span>
                                    </th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Delete</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {bookTypes.map((bookType) => (
                                    <tr key={bookType.book_type_id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{bookType.book_type_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleEdit(bookType.book_type_id, bookType.book_type_name)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleDelete(bookType.book_type_id)} className="text-red-600 hover:text-red-900">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    <div>
                        <button onClick={() => setShowPopup(true)} className='text-white bg-gradient-to-b from-cyan-500
              to-blue-500 px-6 py-3 my-8 mx-auto flex items-center rounded-md
              hover:scale-110 duration-300'>
                            Add New Book Type
                        </button>
                    </div>
                    {showPopup && (
                        <div className="fixed z-10 inset-0 overflow-y-auto">
                            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                                </div>
                                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <div className="sm:flex sm:flex-col sm:justify-center sm:items-center">
                                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                                <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Book Type</h3>
                                                <div className="mt-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Book Type Name"
                                                        value={newBookTypeName}
                                                        onChange={(e) => setNewBookTypeName(e.target.value)}
                                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='sm:flex sm:flex-col sm:justify-center sm:items-center'>
                                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row">
                                            <button onClick={handleAddBookType} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                                                Add
                                            </button>
                                            <button onClick={() => setShowPopup(false)} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {showEditPopup && (
                        <div className="fixed z-10 inset-0 overflow-y-auto">
                            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                                </div>
                                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <div className="sm:flex sm:flex-col sm:justify-center sm:items-center">
                                            <div className="mt-3 text-center sm:mt-0 sm:ml-4">
                                                <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Book Type</h3>
                                                <div className="mt-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Book Type Name"
                                                        value={bookTypeToEdit?.name}
                                                        onChange={(e) => setBookTypeToEdit({ ...bookTypeToEdit, name: e.target.value })}
                                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='sm:flex sm:flex-col sm:justify-center sm:items-center'>
                                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row">
                                            <button onClick={confirmEdit} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                                                Save
                                            </button>
                                            <button onClick={() => setShowEditPopup(false)} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {showDeletePopup && (
                        <div className="fixed z-10 inset-0 overflow-y-auto">
                            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                                </div>
                                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <div className="sm:flex sm:flex-col sm:justify-center sm:items-center">
                                            <div className="mt-3 text-center sm:mt-0 sm:ml-4">
                                                <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Book Type</h3>
                                                <p className="text-sm text-gray-500 mt-2">Are you sure you want to delete this book type?</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='sm:flex sm:flex-col sm:justify-center sm:items-center'>
                                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row">
                                            <button onClick={confirmDelete} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
                                                Delete
                                            </button>
                                            <button onClick={() => setShowDeletePopup(false)} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BookType