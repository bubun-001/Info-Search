import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function EmbeddingType() {
    const [embeddingTypes, setEmbeddingTypes] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [newEmbeddingTypeName, setNewEmbeddingTypeName] = useState('');
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [embeddingTypeToDelete, setEmbeddingTypeToDelete] = useState(null);
    const [embeddingTypeToEdit, setEmbeddingTypeToEdit] = useState(null);

    useEffect(() => {
        fetchEmbeddingTypes();
    }, []);

    axios.defaults.baseURL = process.env.REACT_APP_SERVER_BASE_URL;

    const fetchEmbeddingTypes = async () => {
        try {
            const response = await axios.get('/embedding_types');
            setEmbeddingTypes(response.data);
        } catch (error) {
            console.error('Error fetching embedding types:', error);
        }
    };

    const handleEdit = (embeddingTypeId, newName) => {
        setEmbeddingTypeToEdit({ id: embeddingTypeId, name: newName });
        setShowEditPopup(true);
    };

    const handleDelete = (embeddingTypeId) => {
        setEmbeddingTypeToDelete(embeddingTypeId);
        setShowDeletePopup(true);
    };

    const handleAddEmbeddingType = async () => {
        try {
            await axios.post('/embedding_types', { embed_type: newEmbeddingTypeName });
            // Refresh embedding types after adding
            fetchEmbeddingTypes();
            // Close the popup
            setShowPopup(false);
            // Reset newEmbeddingTypeName
            setNewEmbeddingTypeName('');
            toast.success('Embedding type added successfully');
        } catch (error) {
            console.error('Error adding embedding type:', error);
            toast.error('Embedding type already exists');
        }
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`/embedding_types/${embeddingTypeToDelete}`);
            // Refresh embedding types after delete
            fetchEmbeddingTypes();
            // Close the popup
            setShowDeletePopup(false);
            toast.success('Embedding type deleted successfully');
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data.error === 'Cannot delete the embedding type as there are associated embedding details') {
                toast.error('Cannot delete the embedding type because there are associated embedding details');
            } else {
                console.error('Error deleting embedding type:', error);
            }
        }
    };
    
    const confirmEdit = async () => {
        try {
            await axios.put(`/embedding_types/${embeddingTypeToEdit.id}`, { embed_type: embeddingTypeToEdit.name });
            // Refresh embedding types after edit
            fetchEmbeddingTypes();
            // Close the popup
            setShowEditPopup(false);
            toast.success('Embedding type updated successfully');
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data.error === 'Cannot update the embedding type as there are associated embedding details') {
                toast.error('Cannot update the embedding type because there are associated embedding details');
            } else {
                console.error('Error editing embedding type:', error);
            }
        }
    };
    

    const [sortOrder, setSortOrder] = useState('asc');

    // Function to toggle sort order
    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    // Function to sort embedding types by embed type
    const sortEmbeddingTypesByName = () => {
        const sortedEmbeddingTypes = [...embeddingTypes].sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.embed_type.localeCompare(b.embed_type);
            } else {
                return b.embed_type.localeCompare(a.embed_type);
            }
        });
        setEmbeddingTypes(sortedEmbeddingTypes);
    };

    const handleSortByName = () => {
        toggleSortOrder();
        sortEmbeddingTypesByName();
    };

    return (
        <div className="embedding-type-list">
            <div name='login' className="flex justify-center">
                <div className="w-1/2">
                    <div className='flex flex-col pb-8 pt-20 justify-center items-center'>
                        <h2 className='text-4xl font-bold inline border-b-4 border-gray-500'>
                            Embedding Types
                        </h2>
                    </div>
                    {embeddingTypes.length === 0 ? (
                        <p className='flex justify-center items-center text-lg'>No embedding type in the system</p>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" onClick={handleSortByName}>
                                        Embedding type Name
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
                                {embeddingTypes.map((embeddingType) => (
                                    <tr key={embeddingType.embed_type_id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{embeddingType.embed_type}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleEdit(embeddingType.embed_type_id, embeddingType.embed_type)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleDelete(embeddingType.embed_type_id)} className="text-red-600 hover:text-red-900">Delete</button>
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
                            Add New Embedding Type
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
                                                <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Embedding Type</h3>
                                                <div className="mt-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Embedding Type Name"
                                                        value={newEmbeddingTypeName}
                                                        onChange={(e) => setNewEmbeddingTypeName(e.target.value)}
                                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='sm:flex sm:flex-col sm:justify-center sm:items-center'>
                                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row">
                                            <button onClick={handleAddEmbeddingType} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
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
                                                <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Embedding Type</h3>
                                                <div className="mt-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Embedding Type Name"
                                                        value={embeddingTypeToEdit?.name}
                                                        onChange={(e) => setEmbeddingTypeToEdit({ ...embeddingTypeToEdit, name: e.target.value })}
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
                                                <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Embedding Type</h3>
                                                <p className="text-sm text-gray-500 mt-2">Are you sure you want to delete this embedding type?</p>
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

export default EmbeddingType