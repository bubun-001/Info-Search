import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { CiCircleInfo } from "react-icons/ci";


import { selectFormData } from '../redux/querySlice';
import { selectChunksData } from '../redux/responseSlice';

const Chatbot = () => {
    const formData = useSelector(selectFormData);
    const firstResponse = useSelector(selectChunksData);
    const [selectedModel, setSelectedModel] = useState('');
    const [newQuery, setNewQuery] = useState('');
    const [conversations, setConversations] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [popupVisible, setPopupVisible] = useState(false);
    const [embedTexts, setEmbedTexts] = useState([]); // State to store embed texts


    axios.defaults.baseURL = 'http://localhost:5000/api';

    useEffect(() => {
        const fetchData = async () => {
            if (!firstResponse) return;

            try {
                const { llm_response, retrieved_details } = firstResponse;
                const embedTexts = retrieved_details.map(item => item.embed_text);

                const { topic_id, book_id } = retrieved_details[0];
                const topicResponse = await axios.get(`/topics/${topic_id}`);
                const bookResponse = await axios.get(`/books/${book_id}`);
                const { book_name } = bookResponse.data;
                const { topic_name } = topicResponse.data;

                const secondBotResponse = `Learn More in '${topic_name}', '${book_name}'.`;

                const firstConversation = {
                    query: firstResponse.query,
                    response: llm_response,
                    secondResponse: secondBotResponse,
                    embedTexts: embedTexts,
                };

                setConversations([firstConversation]);
                setSelectedModel(formData.model);
            } catch (error) {
                console.error('Error fetching data:', error);
                // Handle errors
            }
        };

        fetchData();
    }, [firstResponse, formData]);

    const handleChange = (e) => {
        setNewQuery(e.target.value);
    };

    const handleModelChange = (e) => {
        setSelectedModel(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return; // Prevent multiple submissions
        try {
            setIsSubmitting(true);
            const updatedFormData = {
                ...formData,
                query: newQuery,
                model: selectedModel,
            };

            // Perform API call to get response data
            const response = await axios.post(
                '/embedding_details/llm_search',
                updatedFormData
            );

            const { llm_response, retrieved_details } = response.data;

            // Extract embed texts from retrieved_details
            const embedTexts = retrieved_details.map(item => item.embed_text);

            const { topic_id, book_id } = retrieved_details[0];
            const topicResponse = await axios.get(`/topics/${topic_id}`);
            const bookResponse = await axios.get(`/books/${book_id}`);
            const { book_name } = bookResponse.data;
            const { topic_name } = topicResponse.data;

            // Construct second bot response with all embed texts
            const secondBotResponse = `Learn more in '${topic_name}', '${book_name}'.`;

            // Add new conversation to the list along with previous conversations
            const newConversation = {
                query: newQuery,
                response: llm_response,
                secondResponse: secondBotResponse,
                embedTexts: embedTexts,
            };

            // Update the conversation list with the new conversation
            setConversations([...conversations, newConversation]);

            // Reset new query input
            setNewQuery('');
        } catch (error) {
            console.error('Error submitting query:', error);
            // Handle errors
            const newConversation = {
                query: newQuery,
                response: "Cannot connect to server",
                secondResponse: "",
            };
            // Add new conversation to the list along with previous conversations
            setConversations([...conversations, newConversation]);
        } finally {
            setIsSubmitting(false); // Ensure isSubmitting is always set to false, even in case of errors
        }
    };



    return (
        <div className="flex justify-center mt-10">
    <div className="w-1/2">
        <div className="justify-center items-center flex flex-col">
            {/* Display previous conversations */}
            <div style={{ border: '1px solid #ccc', borderRadius: '10px', padding: '10px', width: '1000px', marginBottom: '20px', backgroundColor: 'black' }}>
                {conversations.map((conversation, index) => (
                    <div key={index} className="conversation">
                        <div
                            className="user-message"
                            style={{
                                marginBottom: '10px',
                                display: 'flex',
                                justifyContent: 'flex-end',
                            }}
                        >
                            <p
                                style={{
                                    padding: '10px',
                                    borderRadius: '5px',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    maxWidth: '70%',
                                    wordWrap: 'break-word',
                                }}
                            >
                                {conversation.query}
                            </p>
                        </div>
                        <div
                            className="bot-message"
                            style={{
                                marginBottom: '10px',
                                display: 'flex',
                                justifyContent: 'flex-start',
                            }}
                        >
                            <p
                                style={{
                                    padding: '10px',
                                    borderRadius: '5px',
                                    backgroundColor: '#333', // Changed background color
                                    color: 'white', // Changed text color
                                    maxWidth: '70%',
                                    wordWrap: 'break-word',
                                }}
                            >
                                {conversation.response}
                            </p>
                        </div>
                        {conversation.response !== "Please ask questions related to your academics." && conversation.secondResponse !== "" && (
                            <div
                                className="bot-message"
                                style={{
                                    marginBottom: '10px',
                                    display: 'flex',
                                    justifyContent: 'flex-start',
                                    borderRadius: '10px'
                                }}
                            >
                                <p
                                    style={{
                                        padding: '10px',
                                        borderRadius: '10px',
                                        backgroundColor: '#000000', // Changed background color
                                        color: 'white',
                                        wordWrap: 'break-word',
                                        textAlign: 'right',
                                        width: '700px',
                                        //marginLeft: 'auto', // Align to the right by pushing to the left
                                    }}
                                >
                                    <button
                                        style={{
                                            border: 'none',
                                            backgroundColor: 'transparent',
                                            cursor: 'pointer',
                                            marginRight: '5px', // Add some spacing between the icon and the text
                                        }}
                                        onClick={() => {
                                            setEmbedTexts(conversation.embedTexts); // Set embedTexts from conversation
                                            setPopupVisible(prevVisible => !prevVisible); // Toggle visibility
                                        }}
                                    >
                                        <CiCircleInfo />
                                    </button>
                                    <span style={{ backgroundColor: '#666', borderRadius: '5px', }}>{conversation.secondResponse}</span>
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Display embed text */}
            {popupVisible &&
                <div className="embed-text-container" style={{ marginBottom: '20px' }}>
                    {embedTexts.map((text, index) => (
                        <div key={index} style={{ marginBottom: '10px' }}>
                            <p style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '5px', wordWrap: 'break-word' }}>{text}</p>
                        </div>
                    ))}
                </div>
            }

            {/* Form for new query */}
            <form onSubmit={handleSubmit} className="justify-center items-center flex flex-col">
                {/* Radio buttons for selecting model */}
                <div className="radio-buttons">
                    <label className="px-20">
                        <input
                            type="radio"
                            value="llama"
                            checked={selectedModel === 'llama'}
                            onChange={handleModelChange}
                        />
                        Llama
                    </label>
                    <label className="px-20">
                        <input
                            type="radio"
                            value="openAi"
                            checked={selectedModel === 'openAi'}
                            onChange={handleModelChange}
                        />
                        OpenAI
                    </label>
                </div>

                {/* Input for new query */}
                <textarea
                    name="query"
                    placeholder="Enter your Query"
                    value={newQuery}
                    onChange={handleChange}
                    className="p-2 bg-transparent border-2 rounded-md text-black focus:outline-none"
                    style={{ width: '800px', height: '50px' }}
                />
                {/* Submit button */}
                <button
                    type="submit"
                    className="text-white bg-gradient-to-b from-cyan-500
                    to-blue-500 px-6 py-3 my-8 mx-auto flex items-center rounded-md
                    hover:scale-110 duration-300"
                    disabled={!newQuery.trim()} // Disable if newQuery is empty or contains only whitespace
                >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
            </form>
        </div>
    </div>
</div>

    );
};

export default Chatbot;