import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar';
import EmbeddingDetailsNavBar from './admincontrols/EmbeddingDetailsNavBar'; // Import EmbeddingDetailsNavBar
import AcademicsTab from './components/AcademicsTab';
import DocumentationTab from './components/DocumentationTab';
import Contact from './components/Contact';
import Login from './components/Login';
import Signup from './components/Signup';
import AdminControl from './components/AdminControl';
import { Toaster } from 'react-hot-toast';
import  Grade  from "./admincontrols/Grade";
import Language from './admincontrols/Language';
import BookType from './admincontrols/BookType';
import EmbeddingType from './admincontrols/EmbeddingType';
import Book from './admincontrols/Book';
import Topic from './admincontrols/Topic';
import Chatbot from './components/Chatbot';
import ProcessFileComponent from './embeddingdetails/ProcessFileComponent';
import EmbeddedChunks from './embeddingdetails/EmbeddedChunks';
import GenerateEmbeddingsComponent from './embeddingdetails/GenerateEmbeddingsComponent';

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

const AppContent = () => {
  const location = useLocation();

  return (
    <div>
      {/* Conditional rendering of NavBar */}
  {location.pathname.startsWith('/admin') ? (
    location.pathname.startsWith('/admin/embedding_details') ? (
      <EmbeddingDetailsNavBar />
    ) : (
      <AdminControl />
    )
  ) : (
    <NavBar />
  )}
      
      <Routes>
        <Route path="/academics" element={<AcademicsTab />} />
        <Route path="/documentation" element={<DocumentationTab />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<Navigate to="/admin/language" />} />
        <Route path="/" element={<Navigate to="/academics" />} />
        <Route path="/admin/grade" element={<Grade />} />
        <Route path="/admin/language" element={<Language />} />
        <Route path="/admin/book_type" element={<BookType />} />
        <Route path="/admin/embedding_type" element={<EmbeddingType />} />
        <Route path="/admin/book" element={<Book />} />
        <Route path="/admin/topic" element={<Topic />} />
        <Route path="/query" element={<Chatbot />} />
        <Route path="/admin/embedding_details" element={<Navigate to="/admin/embedding_details/process_file_component" />} />
        <Route path="/admin/embedding_details/process_file_component" element={<ProcessFileComponent />} />
        <Route path="/admin/embedding_details/embedded_chunks" element={<EmbeddedChunks />} />
        <Route path="/admin/embedding_details/generate_embeddings_component" element={<GenerateEmbeddingsComponent />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
