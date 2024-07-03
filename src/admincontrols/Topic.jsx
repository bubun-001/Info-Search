import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function Topic() {
    const [topics, setTopics] = useState([]);
    const [books, setBooks] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [newTopicData, setNewTopicData] = useState({
        book_name: '',
        topic_name: '',
        topic_url_pdf: '',
        topic_url_doc: ''
    });
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [topicToDelete, setTopicToDelete] = useState(null);
    const [topicToEdit, setTopicToEdit] = useState(null);

    const [grades, setGrades] = useState([]);
    const [bookTypes, setBookTypes] = useState([]);
    const [languages, setLanguages] = useState([]);

    const [selectedBook, setSelectedBook] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('');
    const [selectedBookType, setSelectedBookType] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');

    useEffect(() => {
        // Fetch grades
        axios.get('/grades')
            .then(response => {
                setGrades(response.data);
            })
            .catch(error => {
                console.error('Error fetching grades:', error);
            });

        // Fetch book types
        axios.get('/book_types')
            .then(response => {
                setBookTypes(response.data);
            })
            .catch(error => {
                console.error('Error fetching book types:', error);
            });

        // Fetch languages
        axios.get('/languages')
            .then(response => {
                setLanguages(response.data);
            })
            .catch(error => {
                console.error('Error fetching languages:', error);
            });

        // Fetch books
        axios.get('/books')
            .then(response => {
                setBooks(response.data);
            })
            .catch(error => {
                console.error('Error fetching books:', error);
            });
    }, []);

    useEffect(() => {
        fetchTopics();
    }, []);

    axios.defaults.baseURL = process.env.REACT_APP_SERVER_BASE_URL;

    const fetchTopics = async () => {
        try {
            const response = await axios.get('/topics');
            setTopics(response.data);
        } catch (error) {
            console.error('Error fetching topics:', error);
        }
    };

    const handleEdit = (topicId, newData) => {
        setTopicToEdit({ id: topicId, data: newData });
        setShowEditPopup(true);
    };

    const handleDelete = (topicId) => {
        setTopicToDelete(topicId);
        setShowDeletePopup(true);
    };

    const handleAddTopic = async () => {
        try {
            await axios.post('/topics', newTopicData);
            // Refresh topics after adding
            fetchTopics();
            // Close the popup
            setShowPopup(false);
            // Reset newTopicData
            setNewTopicData({
                book_name: '',
                topic_name: '',
                topic_url_pdf: '',
                topic_url_doc: ''
            });
            toast.success('Topic added successfully');
        } catch (error) {
            console.error('Error adding topic:', error);
            toast.error('Failed to add topic');
        }
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`/topics/${topicToDelete}`);
            // Refresh topics after delete
            fetchTopics();
            // Close the popup
            setShowDeletePopup(false);
            toast.success('Topic deleted successfully');
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data.error === 'Cannot delete the topic as it has associated embedding details') {
                toast.error('Cannot delete the topic because there are associated embedding details');
            } else {
                console.error('Error deleting topic:', error);
            }
        }
    };

    const confirmEdit = async () => {
        try {
            // Extract topic data from topicToEdit
            const { id, data } = topicToEdit;
            await axios.put(`/topics/${id}`, data);
            // Refresh topics after edit
            fetchTopics();
            // Close the popup
            setShowEditPopup(false);
            toast.success('Topic updated successfully');
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data.error === 'Cannot update the topic as it has associated embedding details') {
                toast.error('Cannot update the topic because there are associated embedding details');
            } else {
                console.error('Error editing topic:', error);
            }
        }
    };

    const handleAddPDFFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setNewTopicData({ ...newTopicData, topic_url_pdf: url });
        }
    };
    
    const handleAddDOCFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setNewTopicData({ ...newTopicData, topic_url_doc: url });
        }
    };
    
    const handleEditPDFFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setTopicToEdit(prevState => ({
                ...prevState,
                data: { ...prevState.data, topic_url_pdf: url }
            }));
        }
    };
    
    const handleEditDOCFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setTopicToEdit(prevState => ({
                ...prevState,
                data: { ...prevState.data, topic_url_doc: url }
            }));
        }
    };    
    

    const filterTopics = (topic) => {
        // Check if the book matches the selected filters
        return (
            (selectedGrade === '' || topic.book_details.grade_name === selectedGrade) &&
            (selectedBookType === '' || topic.book_details.book_type_name === selectedBookType) &&
            (selectedLanguage === '' || topic.book_details.language_name === selectedLanguage) &&
            (selectedBook === '' || topic.book_name === selectedBook)
        );
    };

    return (
        <div className="topic-list">
            <div className="flex justify-center">
                <div className="w-1/2">
                    <div className="flex flex-col pb-8 pt-20 justify-center items-center">
                        <h2 className="text-4xl font-bold inline border-b-4 border-gray-500">
                            Topics
                        </h2>
                    </div>
                    {topics.length === 0 ? (
                        <p className="flex justify-center items-center text-lg">No topics in the system</p>
                    ) : (
                        <div>
                            <div className="flex justify-center items-center mt-4">
                                <select
                                    value={selectedGrade}
                                    onChange={(e) => setSelectedGrade(e.target.value)}
                                    className="mx-2 p-2 border border-gray-300 rounded-md focus:outline-none"
                                >
                                    <option value="">All Grades</option>
                                    {grades.map(grade => (
                                        <option key={grade.grade_id} value={grade.grade_name}>{grade.grade_name}</option>
                                    ))}
                                </select>

                                <select
                                    value={selectedBookType}
                                    onChange={(e) => setSelectedBookType(e.target.value)}
                                    className="mx-2 p-2 border border-gray-300 rounded-md focus:outline-none"
                                >
                                    <option value="">All Book Types</option>
                                    {bookTypes.map(bookType => (
                                        <option key={bookType.book_type_id} value={bookType.book_type_name}>{bookType.book_type_name}</option>
                                    ))}
                                </select>

                                <select
                                    value={selectedLanguage}
                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                    className="mx-2 p-2 border border-gray-300 rounded-md focus:outline-none"
                                >
                                    <option value="">All Languages</option>
                                    {languages.map(language => (
                                        <option key={language.lang_id} value={language.lang_name}>{language.lang_name}</option>
                                    ))}
                                </select>

                                <select
                                    value={selectedBook}
                                    onChange={(e) => setSelectedBook(e.target.value)}
                                    className="mx-2 p-2 border border-gray-300 rounded-md focus:outline-none"
                                >
                                    <option value="">All Books</option>
                                    {books.map(book => (
                                        <option key={book.book_id} value={book.book_name}>{book.book_name}</option>
                                    ))}
                                </select>
                            </div>

                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Topic Name
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Book Name
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
                                    {topics.filter(filterTopics).map((topic) => (
                                        <tr key={topic.topic_id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{topic.topic_name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{topic.book_name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEdit(topic.topic_id, topic)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleDelete(topic.topic_id)} className="text-red-600 hover:text-red-900">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div>
                        <button onClick={() => setShowPopup(true)} className="text-white bg-gradient-to-b from-cyan-500
              to-blue-500 px-6 py-3 my-8 mx-auto flex items-center rounded-md
              hover:scale-110 duration-300">
                            Add New Topic
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
                                                <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Topic</h3>
                                                <div>
                                                    {/* Book dropdown */}
                                                    <div className="mt-2">
                                                        <select
                                                            value={newTopicData.book_name}
                                                            onChange={(e) => setNewTopicData({ ...newTopicData, book_name: e.target.value })}
                                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                        >
                                                            <option value="">Select Book</option>
                                                            {books.map(book => (
                                                                <option key={book.book_id} value={book.book_name}>{book.book_name}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Topic Name and URL inputs */}
                                                    <div className="mt-2">
                                                        {/* Topic Name input */}
                                                        <input
                                                            type="text"
                                                            placeholder="Topic Name"
                                                            value={newTopicData.topic_name}
                                                            onChange={(e) => setNewTopicData({ ...newTopicData, topic_name: e.target.value })}
                                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                        />

                                                        {/* PDF URL input */}
                                                        <input
                                                            type="file"
                                                            accept=".pdf"
                                                            onChange={handleAddPDFFileChange}
                                                            className="mt-2"
                                                        />

                                                        {/* DOC URL input */}
                                                        <input
                                                            type="file"
                                                            accept=".doc, .docx"
                                                            onChange={handleAddDOCFileChange}
                                                            className="mt-2"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row">
                                        <button onClick={handleAddTopic} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                                            Add
                                        </button>
                                        <button onClick={() => setShowPopup(false)} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                            Cancel
                                        </button>
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
                                                <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Topic</h3>
                                                <div>
                                                    {/* Grade dropdown */}
                                                    <div className="mt-2">
                                                        <select
                                                            value={topicToEdit.data.grade_name}
                                                            onChange={(e) => setTopicToEdit({ ...topicToEdit, data: { ...topicToEdit.data, book_name: e.target.value } })}
                                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                        >
                                                            <option value="">Select Book</option>
                                                            {books.map(book => (
                                                                <option key={book.book_id} value={book.book_name}>{book.book_name}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Topic Name and URL inputs */}
                                                    <div className="mt-2">
                                                        {/* Topic Name input */}
                                                        <input
                                                            type="text"
                                                            placeholder="Topic Name"
                                                            value={topicToEdit.data.topic_name}
                                                            onChange={(e) => setTopicToEdit({ ...topicToEdit, data: { ...topicToEdit.data, topic_name: e.target.value } })}
                                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                        />

                                                        {/* PDF file input */}
                                                        <input
                                                            type="file"
                                                            accept=".pdf"
                                                            onChange={handleEditPDFFileChange}
                                                            className="mt-2"
                                                        />

                                                        {/* DOC file input */}
                                                        <input
                                                            type="file"
                                                            accept=".doc, .docx"
                                                            onChange={handleEditDOCFileChange}
                                                            className="mt-2"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
                                                <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Topic</h3>
                                                <p className="text-sm text-gray-500 mt-2">Are you sure you want to delete this topic?</p>
                                            </div>
                                        </div>
                                    </div>
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
                    )}
                </div>
            </div>
        </div>
    );
}

export default Topic