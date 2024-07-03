#generate_embeddings has to be made!!
import chardet
from flask import Blueprint, request, jsonify
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core.node_parser import SemanticSplitterNodeParser
from llama_index.core import SimpleDirectoryReader
import numpy as np
# from my_flask_app.models import Book, Topic, EmbeddingDetail
from sqlalchemy.exc import IntegrityError
from sqlalchemy.sql import text
import requests
# from my_flask_app import db
"""
    Scraper Function Description:
    This function is responsible for processing the uploaded topic file. It should be implemented
    to handle specific formats and structures based on the book's attributes.

    Input:
    - topic_file: The uploaded file containing the topic's content.
    - book_id: ID of the book to which the topic belongs.
    - topic_id: ID of the topic being processed.

    Output:
    - A list of dictionaries, where each dictionary contains:
        * 'sub_topic_name': Name of the subtopic extracted from the file.
        * 'embed_type': The type of content (e.g., 'question', 'information', etc.).
        * 'chunks': A list of text chunks associated with the subtopic and embed type.
"""


# blueprints/embedding_details.py
from flask import Blueprint, request, jsonify
from models import db, EmbeddingDetail, Book, Topic, SubTopic, EmbeddingType,Scraper
from sqlalchemy.exc import IntegrityError
from importlib import import_module
from sentence_transformers import SentenceTransformer, util
import importlib.util
import sys
import os
from tempfile import TemporaryDirectory
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
from flask import Blueprint, request, jsonify
import ollama
from dotenv import load_dotenv
load_dotenv()
OPEN_AI1 = os.getenv("OPEN_AI1")
OPEN_AI = os.getenv("OPEN_AI")

# Initialize the model and tokenizer
# torch.random.manual_seed(0)
# model = AutoModelForCausalLM.from_pretrained(
#     "microsoft/Phi-3-mini-4k-instruct", 
#     device_map="auto", 
#     torch_dtype="auto", 
#     trust_remote_code=True, 
# )
# tokenizer = AutoTokenizer.from_pretrained("microsoft/Phi-3-mini-4k-instruct")
# pipe = pipeline("text-generation", model=model, tokenizer=tokenizer)

# This example is the new way to use the OpenAI lib for python 
from openai import OpenAI 
client1 = OpenAI( api_key = OPEN_AI1, base_url = "https://api.llama-api.com" ) 
#print(response) 
# print(response.model_dump_json(indent=2)) 
# print(response.choices[0].message.content)

def load_module_from_path(module_name, file_path):
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    return module

embedding_details_blueprint = Blueprint('embedding_details', __name__)

# 2. Embeddings Generation
model = SentenceTransformer('Alibaba-NLP/gte-large-en-v1.5',trust_remote_code=True)


from openai import OpenAI
client = OpenAI(api_key=OPEN_AI)

from FlagEmbedding import FlagReranker

# Initialize the re-ranker model
reranker = FlagReranker('BAAI/bge-reranker-large', use_fp16=True)

def generate_embeddings(texts):
    embeddings = model.encode(texts)
    return embeddings  # This will be a numpy array

def process_documents(file_content):
    """
    Processes the given file content to generate chunks using the semantic chunking strategy.
    """
    # Initialize embedding model (using HuggingFace as an example)
    embedding_model_name = "Alibaba-NLP/gte-large-en-v1.5"
    embed_model = HuggingFaceEmbedding(model_name=embedding_model_name,trust_remote_code=True)
    
    # Initialize the document splitter
    splitter = SemanticSplitterNodeParser(
        buffer_size=1,
        breakpoint_percentile_threshold=95,
        embed_model=embed_model
    )

    with TemporaryDirectory() as temp_dir:
    # Create a temporary file in the temp directory
        temp_file_path = os.path.join(temp_dir, "temp_file.txt")

        with open(temp_file_path, "w", encoding="utf-8") as temp_file:
            temp_file.write(file_content)

        # Use SimpleDirectoryReader to read from the temporary directory
        print("getting the documents")
        documents = SimpleDirectoryReader(temp_dir).load_data()
        print("got the documents")
        nodes = splitter.get_nodes_from_documents(documents)
        print("got the nodes")
        chunks = [node.get_content() for node in nodes]
        print(chunks)
    return chunks

import pdfplumber

# def process_pdf_file(file_path):
#     """
#     Extracts text from a PDF file.
#     """
#     text_content = ''
#     with pdfplumber.open(file_path) as pdf:
#         for page in pdf.pages:
#             text_content += page.extract_text() + ' '  # Adding a space after each page's text
#     return text_content


def process_pdf_file(file_path):
    """Reads a PDF and returns its text content."""
    text_content = ''
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text_content += page.extract_text() + '\n'
    return text_content

@embedding_details_blueprint.route('/embedding_details/process_file', methods=['POST'])
def process_file_and_store_chunks():
    """
    This endpoint processes an uploaded topic file and stores extracted text chunks in the database.
    The processing logic varies based on the book's attributes (such as book type and language) and
    is handled by dynamically selected scraper functions.

    Workflow:
    1. Retrieve book and topic details based on names provided in the request.
    2. Query the Scraper table to find the appropriate scraper function for the book.
    3. Dynamically load and execute the scraper function to process the uploaded file.
    4. The scraper function returns structured data, including subtopic names, embed types, and text chunks.
    5. Create new records in the SubTopic, EmbeddingType, and EmbeddingDetail tables based on this data.
    6. The text chunks are stored without embeddings, which will be added later after a review process.

    Input:
    - book_name: Name of the book.
    - topic_name: Name of the topic.
    - topic_file: Uploaded file containing the topic content to be processed.

    Output:
    - JSON response indicating success or failure of the file processing and data storage.
    """
    # book_name = request.form.get('book_name')
    # topic_name = request.form.get('topic_name')
    # topic_file = request.files.get('topic_file')

    # if not topic_file:
    #     return jsonify({"error": "No file provided"}), 400

    # file_content = topic_file.read().decode('utf-8', errors='replace')
    book_name = request.form.get('book_name')
    topic_name = request.form.get('topic_name')
    topic_file = request.files.get('topic_file')

    print(book_name)

    if not topic_file:
        return jsonify({"error": "No file provided"}), 400

    # Temporary save file to read PDF content
    with TemporaryDirectory() as temp_dir:
        temp_file_path = os.path.join(temp_dir, topic_file.filename)
        topic_file.save(temp_file_path)
        
        # Extract text from PDF
        file_content = process_pdf_file(temp_file_path)
        print("Extracted Content:", file_content[:500])

    # Ensure the book and topic exist
    book = Book.query.filter_by(book_name=book_name).first()
    topic = Topic.query.filter_by(topic_name=topic_name).first()
    if not book :
        return jsonify({"error": "Book not found"}), 404
    if not topic:
        return jsonify({"error": "Topic not found"}), 404

    # Check if chunks for the given book and topic already exist
    existing_chunks = EmbeddingDetail.query.filter_by(book_id=book.book_id, topic_id=topic.topic_id).first()
    if existing_chunks:
        return jsonify({"error": "Chunks for this book and topic already exist"}), 400

    # Process the file content using the new semantic chunking strategy
    chunks = process_documents(file_content)
    print("got the chunks")
    # Check and clean chunks
# Filter out chunks that contain null characters
    clean_chunks = [chunk for chunk in chunks if '\x00' not in chunk]

    # Optionally, log the number of chunks removed
    print(f"Removed {len(chunks) - len(clean_chunks)} chunks containing null characters.")

    # Store the text chunks in the database
    for chunk in clean_chunks:
        new_embedding_detail = EmbeddingDetail(
            book_id=book.book_id,#book.book_id
            topic_id=topic.topic_id,
            sub_topic_id=None,
            embed_id=1,
            embed_text=chunk,
            embed_vector=None  # Embedding will be added later
        )
        db.session.add(new_embedding_detail)

    try:
        db.session.commit()
        return jsonify({"success": True, "message": "File processed and text chunks stored successfully"}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Error during file processing and storing text chunks"}), 400

@embedding_details_blueprint.route('/embedding_details/process_folder', methods=['POST'])
def process_folder_and_store_chunks():
    """
    Processes a folder containing PDF files where the folder name is the book name and file names are topic names.
    Stores extracted text chunks in the database for each topic not already present.
    """
    book_name = request.form.get('book_name')
    folder_path = request.form.get('folder_path')

    if not folder_path or not os.path.exists(folder_path):
        return jsonify({"error": "Folder path is invalid or not provided"}), 400

    book = Book.query.filter_by(book_name=book_name).first()
    if not book:
        return jsonify({"error": "Book not found"}), 404

    files_processed = []
    errors = []

    # Iterate over files in the directory
    for filename in os.listdir(folder_path):
        if filename.endswith('.pdf'):
            topic_name = os.path.splitext(filename)[0]
            topic = Topic.query.filter_by(topic_name=topic_name, book_id=book.book_id).first()

            if topic:
                errors.append(f"Chunks for topic {topic_name} already exist.")
                continue  # Skip processing if chunks for this topic already exist

            file_path = os.path.join(folder_path, filename)
            file_content = process_pdf_file(file_path)  # Assuming process_pdf_file can handle the file path directly

            # Check if the extracted content is not empty
            if not file_content.strip():
                errors.append(f"No content extracted from {filename}.")
                continue

            chunks = process_documents(file_content)

            clean_chunks = [chunk for chunk in chunks if '\x00' not in chunk]
            # Optionally log the number of chunks removed
            print(f"Removed {len(chunks) - len(clean_chunks)} chunks containing null characters from {filename}.")

            for chunk in clean_chunks:
                new_embedding_detail = EmbeddingDetail(
                    book_id=book.book_id,
                    topic_id=topic.topic_id if topic else None,  # Handle case where topic might be None
                    sub_topic_id=None,
                    embed_id=4,
                    embed_text=chunk,
                    embed_vector=None  # Embeddings added later
                )
                db.session.add(new_embedding_detail)

            files_processed.append(filename)
            db.session.commit()

    if errors:
        return jsonify({"success": False, "errors": errors}), 400

    return jsonify({"success": True, "message": f"Processed files: {files_processed}"}), 201




# @embedding_details_blueprint.route('/embedding_details/process_file', methods=['POST'])
# def process_file_and_store_chunks():
#     """
#     This endpoint processes an uploaded topic file and stores extracted text chunks in the database.
#     The processing logic varies based on the book's attributes (such as book type and language) and
#     is handled by dynamically selected scraper functions.

#     Workflow:
#     1. Retrieve book and topic details based on names provided in the request.
#     2. Query the Scraper table to find the appropriate scraper function for the book.
#     3. Dynamically load and execute the scraper function to process the uploaded file.
#     4. The scraper function returns structured data, including subtopic names, embed types, and text chunks.
#     5. Create new records in the SubTopic, EmbeddingType, and EmbeddingDetail tables based on this data.
#     6. The text chunks are stored without embeddings, which will be added later after a review process.

#     Input:
#     - book_name: Name of the book.
#     - topic_name: Name of the topic.
#     - topic_file: Uploaded file containing the topic content to be processed.

#     Output:
#     - JSON response indicating success or failure of the file processing and data storage.
#     """
#     book_name = request.form.get('book_name')
#     topic_name = request.form.get('topic_name')
#     topic_file = request.files.get('topic_file')

#     # Check if the file is not present
#     if not topic_file:
#         return jsonify({"error": "No file provided"}), 400

#     # Ensure the book and topic exist
#     book = Book.query.filter_by(book_name=book_name).first()
#     topic = Topic.query.filter_by(topic_name=topic_name).first()
#     if not book or not topic:
#         return jsonify({"error": "Book or Topic not found"}), 404
    
    
#     # raw_data = topic_file.read()
#     # result = chardet.detect(raw_data)
#     # file_content = raw_data.decode(result['encoding'])
#      # Read content directly from the FileStorage object
#     file_content = topic_file.read().decode('utf-8', errors='replace')

#     # # Retrieve the appropriate scraper function
#     # scraper_record = Scraper.query.filter_by(book_id=book.book_id).first()
#     # if scraper_record:
#     #     # Dynamically load the scraper module from the given file path
#     #     scraper_module = load_module_from_path('scraper_module', scraper_record.scrapper_function_path)
#     #     process_function = getattr(scraper_module, 'process_latex_file')
#     # else:
#     #     return jsonify({"error": "Appropriate scraper function not found"}), 404
#     process_function=""
#     # Check if chunks for the given book and topic already exist
#     existing_chunks = EmbeddingDetail.query.filter_by(book_id=book.book_id, topic_id=topic.topic_id).first()
#     if existing_chunks:
#         # Chunks for this book and topic already exist, you can decide to skip or handle it differently
#         return jsonify({"error": "Chunks for this book and topic already exist"}), 400

#     # Process the uploaded file to get subtopics and their text chunks
#     processing_result = process_function(file_content)
#     # Save results in the database
#     # This function should return a list of dictionaries with subtopic and chunk information
#     for result in processing_result:
#         # sub_topic_name = result['sub_topic_name']
#         # print(sub_topic_name)
#         # sub_topic = SubTopic.query.filter_by(topic_id=topic.topic_id, sub_topic_name=sub_topic_name).first()
#         # if not sub_topic:
#         #     sub_topic = SubTopic(topic_id=topic.topic_id, sub_topic_name=sub_topic_name)
#         #     db.session.add(sub_topic)
#         #     db.session.flush()

#         # embed_type_name = result['embed_type']
#         # embedding_type = EmbeddingType.query.filter_by(embed_type=embed_type_name).first()
#         # if not embedding_type:
#         #     embedding_type = EmbeddingType(embed_type=embed_type_name)
#         #     db.session.add(embedding_type)
#         #     db.session.flush()

#         # Assuming 'chunks' is a list of text chunks
#         for chunk in result['chunks']:
#             new_embedding_detail = EmbeddingDetail(
#                 book_id=book.book_id,
#                 topic_id=topic.topic_id,
#                 sub_topic_id=None,#sub_topic.sub_topic_id
#                 embed_id=None,#embedding_type.embed_type_id
#                 embed_text=chunk,  # Text chunk without the embedding
#                 embed_vector=None  # Embedding will be added later after review
#             )
#             db.session.add(new_embedding_detail)

#     try:
#         db.session.commit()
#         return jsonify({"success": True, "message": "File processed and text chunks stored successfully"}), 201
#     except IntegrityError:
#         db.session.rollback()
#         return jsonify({"error": "Error during file processing and storing text chunks"}), 400
    

# @embedding_details_blueprint.route('/embedding_details/generate_embeddings', methods=['POST'])
# def generate_and_store_embeddings():
#     """
#     For the generate_and_store_embeddings function:

#     It accepts a list of embedding_detail IDs that have been reviewed.
#     It then generates embeddings only for those chunks that have been marked as reviewed.
#     The generated embeddings are stored in the embed_vector field for each EmbeddingDetail
#     """
    
#     reviewed_chunk_ids = request.get_json()  # List of embedding detail IDs that have been reviewed

#     for embedding_detail_id in reviewed_chunk_ids:
#         embedding_detail = EmbeddingDetail.query.get(embedding_detail_id)
#         if embedding_detail and embedding_detail.reviewed:
#             # Only generate embeddings for reviewed text chunks
#             embedding_vector = generate_embeddings(embedding_detail.embed_text)
#             embedding_detail.embed_vector = embedding_vector
#             db.session.add(embedding_detail)
#         else:
#             return jsonify({"error": f"Embedding detail with ID {embedding_detail_id} not found or not reviewed"}), 404

#     try:
#         db.session.commit()
#         return jsonify({"success": True, "message": "Embeddings generated for reviewed chunks and stored successfully"}), 201
#     except IntegrityError:
#         db.session.rollback()
#         return jsonify({"error": "Error during embedding generation and storage"}), 400

@embedding_details_blueprint.route('/embedding_details/generate_embeddings_by_topic', methods=['POST'])
def generate_embeddings_by_topic():
    """
    Generates embeddings for all reviewed text chunks for a given topic.
    """
    data = request.get_json()
    topic_name = data.get('topic_name')

    # Retrieve the topic by name
    topic = Topic.query.filter_by(topic_name=topic_name).first()
    if not topic:
        return jsonify({"error": "Topic not found"}), 404

    # Retrieve all embedding details for this topic
    embedding_details = EmbeddingDetail.query.filter_by(topic_id=topic.topic_id).all()

    if not embedding_details:
        return jsonify({"error": "No reviewed chunks available for this topic"}), 404

    # Generate and store embeddings
    for embedding_detail in embedding_details:
        embedding_vector = generate_embeddings([embedding_detail.embed_text])[0]
        embedding_detail.embed_vector = embedding_vector
        print(embedding_vector)
        db.session.add(embedding_detail)

    try:
        db.session.commit()
        return jsonify({"success": True, "message": "Embeddings generated and stored successfully for topic: " + topic_name}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Error during embedding generation and storage"}), 400

    
@embedding_details_blueprint.route('/embedding_details/review', methods=['PUT'])
def review_text_chunks():
    """
    For the review_text_chunks function:

    The PUT method allows a reviewer to submit updates to a text chunk.
    The function looks up the EmbeddingDetail by embedding_id.
    If found, it updates the embed_text field with the updated_text provided by the reviewer and marks the chunk as reviewed.
    """
    
    data = request.get_json()
    embedding_id = data.get('embedding_id')
    updated_text = data.get('updated_text')
    embedding_detail = EmbeddingDetail.query.get(embedding_id)

    if not embedding_detail:
        return jsonify({"error": "Embedding detail not found"}), 404

    # Update the text chunk with the corrected text
    embedding_detail.embed_text = updated_text
    embedding_detail.reviewed = True  # Mark the chunk as reviewed

    try:
        db.session.commit()
        return jsonify({"success": True, "message": "Text chunk reviewed and updated successfully"}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Error updating the text chunk"}), 400
    
@embedding_details_blueprint.route('/embedding_details/chunks', methods=['GET'])
def get_text_chunks():
    """
    Endpoint to retrieve stored text chunks in a tabular format.

    Output:
    - JSON response containing a list of text chunks with associated details.
    """
    chunks = EmbeddingDetail.query.all()
    chunk_data = [{
        "embedding_id": chunk.embedding_id,
        "book_id": chunk.book_id,
        "topic_id": chunk.topic_id,
        "sub_topic_id": chunk.sub_topic_id,
        "embed_id": chunk.embed_id,
        "embed_text": chunk.embed_text,
        "reviewed": chunk.reviewed
    } for chunk in chunks]

    return jsonify(chunk_data), 200

@embedding_details_blueprint.route('/embedding_details/chunks/by_topic', methods=['GET'])
def get_text_chunks_by_topic():
    #http://localhost:5000/embedding_details/chunks/by_topic?topic_name=YourTopicName

    """
    Endpoint to retrieve stored text chunks by topic name.

    Input:
    - topic_name (query parameter): Name of the topic.

    Output:
    - JSON response containing a list of text chunks associated with the given topic.
    """
    topic_name = request.args.get('topic_name')
    
    # Fetch the topic by name
    topic = Topic.query.filter_by(topic_name=topic_name).first()

    if not topic:
        return jsonify({"error": "Topic not found"}), 404

    # Fetch chunks related to the topic
    chunks = EmbeddingDetail.query.filter_by(topic_id=topic.topic_id).all()
    chunk_data = [{
        "embedding_id": chunk.embedding_id,
        "book_id": chunk.book_id,
        "topic_id": chunk.topic_id,
        "sub_topic_id": chunk.sub_topic_id,
        "embed_id": chunk.embed_id,
        "embed_text": chunk.embed_text,
        "reviewed": chunk.reviewed
    } for chunk in chunks]

    return jsonify(chunk_data), 200


#Don't use this
@embedding_details_blueprint.route('/embedding_details/search', methods=['POST'])
def search_text_chunks():
    data = request.get_json()
    search_query = data.get('query')
    
    if not search_query:
        return jsonify({"error": "Search query is required"}), 400

    # Generate embedding for the query
        # Generate embedding for the query, ensuring it's a vector compatible with pgvector
    query_vector = generate_embeddings([search_query])[0]
    formatted_vector = "[" + ",".join(map(str, query_vector)) + "]" 

    sql_query = text("""
            SELECT embedding_id, book_id, topic_id, embed_text, embed_vector <-> :query_vector AS similarity
            FROM embedding_detail
            ORDER BY similarity
            LIMIT 5
        """)
    result = db.session.execute(sql_query, {'query_vector': formatted_vector}).fetchall()

# Prepare data for re-ranking
    candidate_texts = [item[3] for item in result]
    query_passage_pairs = [[search_query, text] for text in candidate_texts]

    # Compute scores for each query-passage pair
    scores = reranker.compute_score(query_passage_pairs)

    # Combine candidate details with their new scores
    ranked_results = sorted(zip(result, scores), key=lambda x: x[1], reverse=True)

    # Format results for JSON output
    chunks_data = [{
        "embedding_id": item[0][0],
        "book_id": item[0][1],
        "topic_id": item[0][2],
        "embed_text": item[0][3],
        "similarity": float(item[1])
    } for item in ranked_results]

    # # Format results for JSON output
    # chunks_data = [{
    #     "embedding_id": item[0],
    #     "book_id": item[1],
    #     "topic_id": item[2],
    #     "embed_text": item[3],
    #     "similarity": float(item[4])
    # } for item in result]

    return jsonify(chunks_data), 200

@embedding_details_blueprint.route('/embedding_details/llm_search', methods=['POST'])
def llm_generation():
    data = request.get_json()
    search_query = data.get('query')
    llm_choice = data.get('model')
    
    print(llm_choice)

    if not search_query:
        return jsonify({"error": "Search query is required"}), 400

    # Generate embedding for the query
        # Generate embedding for the query, ensuring it's a vector compatible with pgvector
    query_vector = generate_embeddings([search_query])[0]
    formatted_vector = "[" + ",".join(map(str, query_vector)) + "]" 

    sql_query = text("""
            SELECT embedding_id, book_id, topic_id, embed_text, embed_vector <-> :query_vector AS similarity
            FROM embedding_detail
            ORDER BY similarity
            LIMIT 5
        """)
    result = db.session.execute(sql_query, {'query_vector': formatted_vector}).fetchall()

# Prepare data for re-ranking
    candidate_texts = [item[3] for item in result]
    query_passage_pairs = [[search_query, text] for text in candidate_texts]

    # Compute scores for each query-passage pair
    scores = reranker.compute_score(query_passage_pairs)

    # Combine candidate details with their new scores
    ranked_results = sorted(zip(result, scores), key=lambda x: x[1], reverse=True)
    # Prepare the context from the top 5 retrieved documents
    contexts = [item[0][3] for item in ranked_results]
    print(contexts)

    llm_response = ""

    if llm_choice == 'openAi':
        completion = client.chat.completions.create(
        model="gpt-4",
        messages=[
        {"role": "system", "content": """You are an expert AI model in generating correct answer for a question from given context. Keep the following things in mind:
         1. The generated answer should strictly be from the provided context.
         2. Never provide answer which is not present in the given context.
         3. Do not provide any extra conversational fluff except the answer.
         4. If no answer found in the context, just say "Please ask questions related to your academics.".
         """},
        {"role": "user", "content": f"what is the answer for the Question:[{search_query}], given the context:\ncontext: {contexts}"}
        ]
        )
        llm_response = completion.choices[0].message.content
        print(completion.choices[0].message.content)

    elif llm_choice == 'llama':
    #     API_URL = "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct"
    #     headers = {"Authorization": "Bearer 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"}

    #     def query(payload):
    #         response = requests.post(API_URL, headers=headers, json=payload)
    #         return response.json()
        
    #     prompt=f"""You are an expert AI model. Given the Question: [{search_query}], provide me the answer only from the context provided below. Do not halucinate or make up any answer from your own \ncontext: {contexts}\n DO NOT PROVIDE ANY OTHER CONVERSATIONAL FLUFF."""
    #     output = query({
    #     "inputs": prompt,
    # })
    #     llm_response = output[0]['generated_text'].replace(prompt,"")
        print("getting the generation done")
        response = client1.chat.completions.create(
            model="llama-7b-chat", 
            messages=[ {"role": "system", "content": """You are an expert AI model in generating correct answer for a question from given context. Keep the following things in mind:
         1. The generated answer should strictly be from the provided context.
         2. Never provide answer which is not present in the given context.
         3. Do not provide any extra conversational fluff except the answer.
         4. If no answer found in the context, only say "Please ask questions related to your academics."."""},
            {"role": "user", "content": f"For the question: {search_query}, provide me answer from the context below.\nContext: {contexts}"}] ) 
        # print(output[0]["generated_text"].replace(prompt,""))
        print(response.choices[0].message.content)
        llm_response=response.choices[0].message.content

    # response = ollama.chat(model='phi3', messages=[
    #     {"role": "user", "content": f""" You are an expert AI model. Given the Question: "{search_query}" provide me the answer only from the context provided below. Do not halucinate or make up any answer from your own \ncontext: {contexts}"""}
    #         ])
    # print(response['message']['content'])

    # Setup the dialogue history format expected by the model
    # messages = [
    #     {"role":"system","content": """
    #     You are an expert assistant that answers questions about Academics from class 1 to 10.
    #     You are given some extracted parts from Academic book with the user question.
    #     If you don't know the answer, just say "I don't know." Don't try to make up an answer.
    #     It is very important that you ALWAYS answer the question from the given context only!!
    #         """},
    #     {"role": "user", "content": f"""content: {' '.join(contexts)}\nQuestion: {search_query}"""}
    #         ]
    
    # print(messages)

    # # Generate response using the LLM
    # generation_args = {
    #     "max_new_tokens": 500,
    #     "return_full_text": False,
    #     "do_sample": False,
    # }
    # output = pipe(messages, **generation_args)

    # Format results for JSON output

    chunks_data = {
        "query": search_query,
        "llm_response": llm_response,#output[0]['generated_text'],
        "retrieved_details": [
            {
         "embedding_id": item[0][0],
        "book_id": item[0][1],
        "topic_id": item[0][2],
        "embed_text": item[0][3],
        "similarity": float(item[1])
    } for item in ranked_results]
        
    }

    return jsonify(chunks_data), 200

