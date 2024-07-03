import React, { useState, useEffect } from 'react';
import axios from 'axios';

function EmbeddedChunks() {
    const [embeddedChunks, setEmbeddedChunks] = useState([]);
    const [topics, setTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState('');

    const [languages, setLanguages] = useState([]);
    const [grades, setGrades] = useState([]);
    const [bookTypes, setBookTypes] = useState([]);
    const [books, setBooks] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('');
    const [selectedBookType, setSelectedBookType] = useState('');
    const [selectedBook, setSelectedBook] = useState('');

    // Set base URL for Axios
    axios.defaults.baseURL = process.env.REACT_APP_SERVER_BASE_URL;

    // Fetch languages, grades, and book types on component mount
    useEffect(() => {
        // Fetch languages
        axios.get('/languages')
            .then(response => {
                setLanguages(response.data);
            })
            .catch(error => {
                console.error('Error fetching languages:', error);
            });

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

    // Fetch topics based on selected book
    useEffect(() => {
        if (selectedBook) {
            axios.get('/topics')
                .then(response => {
                    const filteredTopics = response.data.filter(topic => (
                        (selectedBook === '' || topic.book_name === selectedBook)
                    ));
                    setTopics(filteredTopics);
                })
                .catch(error => {
                    console.error('Error fetching topics:', error);
                });
        }
    }, [selectedBook]);

    // Reset topic selection when other selections change
    useEffect(() => {
        setSelectedTopic('');
    }, [selectedLanguage, selectedGrade, selectedBookType, selectedBook]);

    // Fetch embedded chunks based on selected topic
    useEffect(() => {
        if (selectedTopic) {
            axios.get(`/embedding_details/chunks/by_topic?topic_name=${selectedTopic}`)
                .then(response => {
                    setEmbeddedChunks(response.data);
                })
                .catch(error => {
                    console.error('Error fetching embedded chunks by topic:', error);
                });
        } else if (!selectedLanguage && !selectedGrade && !selectedBookType && !selectedBook) {
            axios.get(`/embedding_details/chunks`)
                .then(response => {
                    setEmbeddedChunks(response.data);
                })
                .catch(error => {
                    console.error('Error fetching all embedded chunks:', error);
                });
        } else {
            setEmbeddedChunks([]);
        }
    }, [selectedLanguage, selectedGrade, selectedBookType, selectedBook, selectedTopic]);

    // Handle language change
    const handleLanguageChange = (e) => {
        setSelectedLanguage(e.target.value);
    };

    // Handle grade change
    const handleGradeChange = (e) => {
        setSelectedGrade(e.target.value);
    };

    // Handle book type change
    const handleBookTypeChange = (e) => {
        setSelectedBookType(e.target.value);
    };

    // Handle book change
    const handleBookChange = (e) => {
        setSelectedBook(e.target.value);
    };

    // Handle topic change
    const handleTopicChange = (e) => {
        setSelectedTopic(e.target.value);
    };

    return (
        <div className="flex flec-col justify-center mt-10">
            <div className="w-1/2">
                <div className='justify-center items-center'>
                    <div className="flex justify-center items-center mt-4">
                        <select
                            value={selectedLanguage}
                            onChange={handleLanguageChange}
                            className="mx-2 p-2 border border-gray-300 rounded-md focus:outline-none"
                        >
                            <option value="">All Languages</option>
                            {languages.map(language => (
                                <option key={language.lang_id} value={language.lang_name}>{language.lang_name}</option>
                            ))}
                        </select>

                        <select
                            value={selectedGrade}
                            onChange={handleGradeChange}
                            className="mx-2 p-2 border border-gray-300 rounded-md focus:outline-none"
                        >
                            <option value="">All Grades</option>
                            {grades.map(grade => (
                                <option key={grade.grade_id} value={grade.grade_name}>{grade.grade_name}</option>
                            ))}
                        </select>

                        <select
                            value={selectedBookType}
                            onChange={handleBookTypeChange}
                            className="mx-2 p-2 border border-gray-300 rounded-md focus:outline-none"
                        >
                            <option value="">All Book Types</option>
                            {bookTypes.map(bookType => (
                                <option key={bookType.book_type_id} value={bookType.book_type_name}>{bookType.book_type_name}</option>
                            ))}
                        </select>

                        <select
                            value={selectedBook}
                            onChange={handleBookChange}
                            className="mx-2 p-2 border border-gray-300 rounded-md focus:outline-none"
                        >
                            <option value="">All Books</option>
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

                        <select
                            value={selectedTopic}
                            onChange={handleTopicChange}
                            className="mx-2 p-2 border border-gray-300 rounded-md focus:outline-none"
                        >
                            <option value="">All Topics</option>
                            {topics.map(topic => (
                                <option key={topic.topic_id} value={topic.topic_name}>{topic.topic_name}</option>
                            ))}
                        </select>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200 mt-10">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Embedding ID
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Book ID
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Topic ID
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Subtopic ID
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Embed ID
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Embedded Text
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Reviewed
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {embeddedChunks.map(chunk => (
                                <tr key={chunk.embedding_id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{chunk.embedding_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{chunk.book_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{chunk.topic_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{chunk.sub_topic_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{chunk.embed_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{chunk.embed_text}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{chunk.reviewed ? 'Yes' : 'No'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EmbeddedChunks;
