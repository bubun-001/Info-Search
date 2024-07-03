import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateFormData } from '../redux/querySlice';
import { updateChunksData } from '../redux/responseSlice';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AcademicsTab = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    language: '',
    grade: '',
    bookType: '',
    book: '',
    topic: '',
    query: '',
    model: 'openAi' // Default value for query type
  });

  const [languages, setLanguages] = useState([]);
  const [grades, setGrades] = useState([]);
  const [bookTypes, setBookTypes] = useState([]);
  const [books, setBooks] = useState([]);
  const [topics, setTopics] = useState([]);
  const [queryInput, setQueryInput] = useState(false); // State to track if query has been input
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set base URL for Axios
  axios.defaults.baseURL = process.env.REACT_APP_SERVER_BASE_URL;

  useEffect(() => {
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
    // Fetch grades if language is selected
    if (formData.language) {
      axios.get('/grades')
        .then(response => {
          setGrades(response.data);
        })
        .catch(error => {
          console.error('Error fetching grades:', error);
        });
    } else {
      setGrades([]);
      setFormData(prevState => ({
        ...prevState,
        grade: '',
        bookType: '',
        book: '',
        topic: '',
        query: ''
      }));
    }
  }, [formData.language]);

  useEffect(() => {
    // Fetch book types if grade is selected
    if (formData.grade) {
      axios.get('/book_types')
        .then(response => {
          setBookTypes(response.data);
        })
        .catch(error => {
          console.error('Error fetching book types:', error);
        });
    } else {
      setBookTypes([]);
      setFormData(prevState => ({
        ...prevState,
        bookType: '',
        book: '',
        topic: '',
        query: ''
      }));
    }
  }, [formData.grade]);

  useEffect(() => {
    // Fetch books
    axios.get('/books')
      .then(response => {
        // Filter books based on selected grade, book type, and language
        const filteredBooks = response.data.filter(book => (
          (formData.grade === '' || book.grade_name === formData.grade) &&
          (formData.bookType === '' || book.book_type_name === formData.bookType) &&
          (formData.language === '' || book.language_name === formData.language)
        ));
        // Set the filtered books
        setBooks(filteredBooks);
      })
      .catch(error => {
        console.error('Error fetching books:', error);
      });
  }, [formData.grade, formData.bookType, formData.language]);

  useEffect(() => {
    // Fetch topics
    axios.get('/topics')
      .then(response => {
        // Filter topics based on selected grade, book type, language, and book
        const filteredTopics = response.data.filter(topic => (
          (formData.grade === '' || topic.book_details.grade_name === formData.grade) &&
          (formData.bookType === '' || topic.book_details.book_type_name === formData.bookType) &&
          (formData.language === '' || topic.book_details.language_name === formData.language) &&
          (formData.book === '' || topic.book_name === formData.book)
        ));
        // Set the filtered topics
        setTopics(filteredTopics);
      })
      .catch(error => {
        console.error('Error fetching topics:', error);
      });
  }, [formData.grade, formData.bookType, formData.language, formData.book]);

  const handleChange = e => {
    const { name, value } = e.target;
    // Update the form data
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    dispatch(updateFormData({ [name]: value }));

    // Reset subsequent options if the current option is deselected
    if (value === '') {
      switch (name) {
        case 'language':
          setFormData(prevState => ({
            ...prevState,
            grade: '',
            bookType: '',
            book: '',
            topic: '',
            query: '',
          }));
          break;
        case 'grade':
          setFormData(prevState => ({
            ...prevState,
            bookType: '',
            book: '',
            topic: '',
            query: '',
          }));
          break;
        case 'bookType':
          setFormData(prevState => ({
            ...prevState,
            book: '',
            topic: '',
            query: '',
          }));
          break;
        case 'book':
          setFormData(prevState => ({
            ...prevState,
            topic: '',
            query: '',
          }));
          break;
        case 'topic':
          setFormData(prevState => ({
            ...prevState,
            query: '',
          }));
          break;
        default:
          break;
      }
    }

    if (name === 'query' && value.trim() !== '') {
      setQueryInput(true);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent multiple submissions
    try {
      setIsSubmitting(true);
      // Dispatch action to update Redux store with form data
      dispatch(updateFormData(formData));
      
      console.log(formData)

      // Perform API call to get response data
      const response = await axios.post('/embedding_details/llm_search', formData);
      
      console.log(response)

      // Dispatch action to update Redux store with response data
      dispatch(updateChunksData(response.data));
      

      console.log(response.data)
      // Navigate to the chatbot page (/query)
      navigate('/query');
    } catch (err) {
      console.error('Error submitting query:', err);
      // Handle errors
    }
  };

  return (
    <div className="flex justify-center mt-10">
      <div className="w-1/2">
        <div className='justify-center items-center'>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <label htmlFor="language" className="">Choose your Language</label>
            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              className='p-2 bg-transparent border-2 rounded-md text-black focus:outline-none'>
              <option value="">Select Language</option>
              {languages.map(language => (
                <option key={language.lang_id} value={language.lang_name}>{language.lang_name}</option>
              ))}
            </select>
            {formData.language && (
              <>
                <label htmlFor="grade" className="">Choose your Grade</label>
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className='p-2 bg-transparent border-2 rounded-md text-black focus:outline-none'>
                  <option value="">Select Grade</option>
                  {grades.map(grade => (
                    <option key={grade.grade_id} value={grade.grade_name}>{grade.grade_name}</option>
                  ))}
                </select>
              </>
            )}
            {formData.grade && (
              <>
                <label htmlFor="bookType" className="">Choose your Book Type</label>
                <select
                  name="bookType"
                  value={formData.bookType}
                  onChange={handleChange}
                  className='p-2 bg-transparent border-2 rounded-md text-black focus:outline-none'>
                  <option value="">Select Book Type</option>
                  {bookTypes.map(bookType => (
                    <option key={bookType.book_type_id} value={bookType.book_type_name}>{bookType.book_type_name}</option>
                  ))
                  }
                </select>
              </>
            )}
            {formData.bookType && (
              <>
                <label htmlFor="book" className="">Choose your Book</label>
                {books.length === 0 ? (
                  <p className="text-red-500">No such book under the selected category is available for search. Please give us your feedback and suggestion for any books to be added.</p>
                ) : (
                  <select
                    name="book"
                    value={formData.book}
                    onChange={handleChange}
                    className='p-2 bg-transparent border-2 rounded-md text-black focus:outline-none'>
                    <option value="">Select Book</option>
                    {books.map(book => (
                      <option key={book.book_id} value={book.book_name}>{book.book_name}</option>
                    ))}
                  </select>
                )}
              </>
            )}

            {formData.book && (
              <>
                {topics.length > 0 && (
                  <>
                    <label htmlFor="topic" className="">Choose your Topic</label>
                    <select
                      name="topic"
                      value={formData.topic}
                      onChange={handleChange}
                      className='p-2 bg-transparent border-2 rounded-md text-black focus:outline-none'
                    >
                      <option value="">Select Topic</option>
                      {topics.map(topic => (
                        <option key={topic.topic_id} value={topic.topic_name}>{topic.topic_name}</option>
                      ))}
                    </select>
                  </>
                )}
                {topics.length === 0 && books.length > 0 && (
                  <p className="text-red-500">No topics for the selected book is available for search. Please give us your feedback and suggestion for any topics to be added.</p>
                )}
              </>
            )}

            <textarea
              name="query"
              placeholder='Enter your Query'
              value={formData.query}
              onChange={handleChange}
              className='p-2 bg-transparent border-2 rounded-md text-black focus:outline-none'
              disabled={books.length === 0 || topics.length === 0} // Disable the textarea when no books are available
            />

            {queryInput && (
              <div>
                <label htmlFor="model" className="">Choose Model:</label>
                <div>
                  <input
                    type="radio"
                    id="llama"
                    name="model"
                    value="llama"
                    defaultChecked={false}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="llama" className="mr-4">llama</label>
                  <input
                    type="radio"
                    id="openAi"
                    name="model"
                    value="openAi"
                    defaultChecked={true} // Default select openai
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="openAi">openAi</label>
                </div>
              </div>
            )}

            <button
              type="submit"
              className='text-white bg-gradient-to-b from-cyan-500
              to-blue-500 px-6 py-3 my-8 mx-auto flex items-center rounded-md
              hover:scale-110 duration-300'
              disabled={books.length === 0 || topics.length === 0}
              style={{
                backgroundColor: (books.length === 0 || topics.length === 0) ? '#f4f4f4' : 'linear-gradient(to bottom, #00b4d8, #0096c7)',
                color: (books.length === 0 || topics.length === 0) ? '#ccc' : 'white',
                cursor: (books.length === 0 || topics.length === 0) ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AcademicsTab;