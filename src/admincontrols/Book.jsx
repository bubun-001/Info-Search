import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function Book() {
    const [books, setBooks] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [newBookData, setNewBookData] = useState({
        grade_name: '',
        book_type_name: '',
        lang_name: '',
        book_name: '',
        book_url: ''
    });
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [bookToDelete, setBookToDelete] = useState(null);
    const [bookToEdit, setBookToEdit] = useState(null);

    const [grades, setGrades] = useState([]);
    const [bookTypes, setBookTypes] = useState([]);
    const [languages, setLanguages] = useState([]);

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
    }, []);

    useEffect(() => {
        fetchBooks();
    }, []);

    axios.defaults.baseURL = process.env.REACT_APP_SERVER_BASE_URL;

    const fetchBooks = async () => {
        try {
            const response = await axios.get('/books');
            setBooks(response.data);
        } catch (error) {
            console.error('Error fetching books:', error);
        }
    };

    const handleEdit = (bookId, newData) => {
        setBookToEdit({ id: bookId, data: newData });
        setShowEditPopup(true);
    };

    const handleDelete = (bookId) => {
        setBookToDelete(bookId);
        setShowDeletePopup(true);
    };

    const handleAddBook = async () => {
        try {
            await axios.post('/books', newBookData);
            // Refresh books after adding
            fetchBooks();
            // Close the popup
            setShowPopup(false);
            // Reset newBookData
            setNewBookData({
                grade_name: '',
                book_type_name: '',
                lang_name: '',
                book_name: '',
                book_url: ''
            });
            toast.success('Book added successfully');
        } catch (error) {
            console.error('Error adding book:', error);
            toast.error('Failed to add book');
        }
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`/books/${bookToDelete}`);
            // Refresh books after delete
            fetchBooks();
            // Close the popup
            setShowDeletePopup(false);
            toast.success('Book deleted successfully');
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data.error === 'Cannot delete the book as it has associated topics') {
                toast.error('Cannot delete the book because there are associated topics');
            } else {
                console.error('Error deleting book:', error);
            }
        }
    };
    
    const confirmEdit = async () => {
        try {
            // Extract book data from bookToEdit
            const { id, data } = bookToEdit;
            await axios.put(`/books/${id}`, data);
            // Refresh books after edit
            fetchBooks();
            // Close the popup
            setShowEditPopup(false);
            toast.success('Book updated successfully');
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data.error === 'Cannot update the book as it has associated topics') {
                toast.error('Cannot update the book because there are associated topics');
            } else {
                console.error('Error editing book:', error);
            }
        }
    };
    

    // Filter function to apply selected filters to books
    const filterBooks = (book) => {
        // Check if the book matches the selected filters
        return (
            (selectedGrade === '' || book.grade_name === selectedGrade) &&
            (selectedBookType === '' || book.book_type_name === selectedBookType) &&
            (selectedLanguage === '' || book.language_name === selectedLanguage)
        );
    };


    return (
        <div className="book-list">
            <div className="flex justify-center">
                <div className="w-1/2">
                    <div className="flex flex-col pb-8 pt-20 justify-center items-center">
                        <h2 className="text-4xl font-bold inline border-b-4 border-gray-500">
                            Books
                        </h2>
                    </div>
                    {books.length === 0 ? (
                        <p className="flex justify-center items-center text-lg">No books in the system</p>
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
                            </div>

                            <table className="min-w-full divide-y divide-gray-200 mt-3">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Book Name
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Grade
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Book Type
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Language
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
                                    {books.filter(filterBooks).map((book) => (
                                        <tr key={book.book_id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{book.book_name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{book.grade_name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{book.book_type_name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{book.language_name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEdit(book.book_id, book)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleDelete(book.book_id)} className="text-red-600 hover:text-red-900">Delete</button>
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
                            Add New Book
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
                                                <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Book</h3>
                                                <div>
                                                    {/* Grade dropdown */}
                                                    <div className="mt-2">
                                                        <select
                                                            value={newBookData.grade_name}
                                                            onChange={(e) => setNewBookData({ ...newBookData, grade_name: e.target.value })}
                                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                        >
                                                            <option value="">Select Grade</option>
                                                            {grades.map(grade => (
                                                                <option key={grade.grade_id} value={grade.grade_name}>{grade.grade_name}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Book type dropdown */}
                                                    <div className="mt-2">
                                                        <select
                                                            value={newBookData.book_type_name}
                                                            onChange={(e) => setNewBookData({ ...newBookData, book_type_name: e.target.value })}
                                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                        >
                                                            <option value="">Select Book Type</option>
                                                            {bookTypes.map(bookType => (
                                                                <option key={bookType.book_type_id} value={bookType.book_type_name}>{bookType.book_type_name}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Language dropdown */}
                                                    <div className="mt-2">
                                                        <select
                                                            value={newBookData.lang_name}
                                                            onChange={(e) => setNewBookData({ ...newBookData, lang_name: e.target.value })}
                                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                        >
                                                            <option value="">Select Language</option>
                                                            {languages.map(language => (
                                                                <option key={language.lang_id} value={language.lang_name}>{language.lang_name}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Book Name and URL inputs */}
                                                    <div className="mt-2">
                                                        {/* Book Name input */}
                                                        <input
                                                            type="text"
                                                            placeholder="Book Name"
                                                            value={newBookData.book_name}
                                                            onChange={(e) => setNewBookData({ ...newBookData, book_name: e.target.value })}
                                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                        />

                                                        {/* Book URL input */}
                                                        <input
                                                            type="text"
                                                            placeholder="Book URL"
                                                            value={newBookData.book_url}
                                                            onChange={(e) => setNewBookData({ ...newBookData, book_url: e.target.value })}
                                                            className="shadow appearance-none border rounded w-full mt-2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row">
                                        <button onClick={handleAddBook} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
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
                                                <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Book</h3>
                                                <div>
                                                    {/* Grade dropdown */}
                                                    <div className="mt-2">
                                                        <select
                                                            value={bookToEdit.data.grade_name}
                                                            onChange={(e) => setBookToEdit({ ...bookToEdit, data: { ...bookToEdit.data, grade_name: e.target.value } })}
                                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                        >
                                                            <option value="">Select Grade</option>
                                                            {grades.map(grade => (
                                                                <option key={grade.grade_id} value={grade.grade_name}>{grade.grade_name}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Book type dropdown */}
                                                    <div className="mt-2">
                                                        <select
                                                            value={bookToEdit.data.book_type_name}
                                                            onChange={(e) => setBookToEdit({ ...bookToEdit, data: { ...bookToEdit.data, book_type_name: e.target.value } })}
                                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                        >
                                                            <option value="">Select Book Type</option>
                                                            {bookTypes.map(bookType => (
                                                                <option key={bookType.book_type_id} value={bookType.book_type_name}>{bookType.book_type_name}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Language dropdown */}
                                                    <div className="mt-2">
                                                        <select
                                                            value={bookToEdit.data.lang_name}
                                                            onChange={(e) => setBookToEdit({ ...bookToEdit, data: { ...bookToEdit.data, lang_name: e.target.value } })}
                                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                        >
                                                            <option value="">Select Language</option>
                                                            {languages.map(language => (
                                                                <option key={language.lang_id} value={language.lang_name}>{language.lang_name}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Book Name and URL inputs */}
                                                    <div className="mt-2">
                                                        {/* Book Name input */}
                                                        <input
                                                            type="text"
                                                            placeholder="Book Name"
                                                            value={bookToEdit.data.book_name}
                                                            onChange={(e) => setBookToEdit({ ...bookToEdit, data: { ...bookToEdit.data, book_name: e.target.value } })}
                                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                        />

                                                        {/* Book URL input */}
                                                        <input
                                                            type="text"
                                                            placeholder="Book URL"
                                                            value={bookToEdit.data.book_url}
                                                            onChange={(e) => setBookToEdit({ ...bookToEdit, data: { ...bookToEdit.data, book_url: e.target.value } })}
                                                            className="shadow appearance-none border rounded w-full mt-2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                                                <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Book</h3>
                                                <p className="text-sm text-gray-500 mt-2">Are you sure you want to delete this book?</p>
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
        </div >
    );
}

export default Book;
