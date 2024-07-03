import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProcessFileComponent = () => {
    const [formData, setFormData] = useState({
        language: '',
        grade: '',
        bookType: '',
        book: '',
        topic: '',
    });
    const [file, setFile] = useState(null);
    const [books, setBooks] = useState([]);
    const [topics, setTopics] = useState([]);

    const [languages, setLanguages] = useState([]);
    const [grades, setGrades] = useState([]);
    const [bookTypes, setBookTypes] = useState([]);

    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('');
    const [selectedBookType, setSelectedBookType] = useState('');

    // Set base URL for Axios
    axios.defaults.baseURL = process.env.REACT_APP_SERVER_BASE_URL;

    // Fetch languages, grades, and book types
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

    // Fetch books based on selected language, grade, and book type
    useEffect(() => {
        if (selectedLanguage && selectedGrade && selectedBookType) {
            axios.get('/books', {
                params: {
                    language: selectedLanguage,
                    grade: selectedGrade,
                    book_type: selectedBookType
                }
            })
                .then(response => {
                    setBooks(response.data);
                })
                .catch(error => {
                    console.error('Error fetching books:', error);
                });
        }
    }, [selectedLanguage, selectedGrade, selectedBookType]);

    useEffect(() => {
        // Fetch topics if book is selected
        if (formData.book) {
            axios.get('/topics')
                .then(response => {
                    const filteredTopics = response.data.filter(topic => (
                        (formData.book === '' || topic.book_name === formData.book)
                    ));
                    setTopics(filteredTopics);
                })
                .catch(error => {
                    console.error('Error fetching topics:', error);
                });
        } else {
            setTopics([]);
            setFormData(prevState => ({
                ...prevState,
                topic: '',
            }));
        }
    }, [formData.book]);

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleFileChange = e => {
        const file = e.target.files[0];
        setFile(file);
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        try {
            if (file) {
                const formDataUpload = new FormData();
                formDataUpload.append('book_name', formData.book);
                formDataUpload.append('topic_name', formData.topic);
                formDataUpload.append('topic_file', file);

                const response = await axios.post(
                    '/embedding_details/process_file',
                    formDataUpload,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        }
                    }
                );

                const { message } = response.data;

                toast.success(message);
            } else {
                toast.error("Please select a file.");
            }
        } catch (error) {
            console.error('Error processing file:', error);
            toast.error('Failed to process file.');
        }
    };

    return (
        <div className="flex justify-center mt-10">
            <div className="w-1/2">
                <div className='justify-center items-center'>
                    <form className="flex flex-col space-y-4">
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

                        <label htmlFor="book">Choose Book</label>
                        <select
                            name="book"
                            value={formData.book}
                            onChange={handleChange}
                            className='p-2 bg-transparent border-2 rounded-md text-black focus:outline-none'>
                            <option key="" value="">Select Book</option>
                            {books
                                .filter(book =>
                                    (!selectedLanguage || book.language_name === selectedLanguage) &&
                                    (!selectedGrade || book.grade_name === selectedGrade) &&
                                    (!selectedBookType || book.book_type_name === selectedBookType)
                                )
                                .map(book => (
                                    <option key={book.book_id} value={book.book_name}>{book.book_name}</option>
                                ))}
                        </select>
                        {formData.book && (
                            <>
                                <label htmlFor="topic">Choose Topic</label>
                                <select
                                    name="topic"
                                    value={formData.topic}
                                    onChange={handleChange}
                                    className='p-2 bg-transparent border-2 rounded-md text-black focus:outline-none'>
                                    <option key="" value="">Select Topic</option>
                                    {topics.map(topic => (
                                        <option key={topic.topic_id} value={topic.topic_name}>{topic.topic_name}</option>
                                    ))}
                                </select>
                            </>
                        )}


                        <label htmlFor="file">Upload File</label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className='p-2 bg-transparent border-2 rounded-md text-black focus:outline-none'
                            disabled={formData.topic === ''} />

                        <button
                            onClick={handleFileUpload}
                            className='text-white bg-gradient-to-b from-cyan-500
              to-blue-500 px-6 py-3 my-8 mx-auto flex items-center rounded-md
              hover:scale-110 duration-300'
                        >
                            Upload and Process File
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProcessFileComponent;
