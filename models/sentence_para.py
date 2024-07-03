import faiss
from sentence_transformers import SentenceTransformer
import re
import fitz #PyMuPDF
import nltk
nltk.download('punkt')  # Download the required model

def load_and_preprocess_content(content):
    # Improved paragraph splitting (Example: Splitting on two newlines or a newline followed by a capital letter)
    paragraphs = re.split(r'\n\n|\n(?=[A-Z])', content)

    # Sentence Tokenization using NLTK
    sentences = []
    for paragraph in paragraphs:
        sentences.extend(nltk.tokenize.sent_tokenize(paragraph))
    
    return paragraphs, sentences

def save_text_to_file(text, file_path):
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(text)


def convert_pdf_to_text(pdf_filepath):
    document = fitz.open(pdf_filepath)
    text = ""
    for page in document:
        text += page.get_text()
    return text


# # 1. Data Collection & Preprocessing
# def load_and_preprocess_content(content):
#     paragraphs = content.split('\n\n')  # Splitting by two newlines to assume paragraphs are separated this way.
#     sentences = re.split(r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s', content)
#     return paragraphs, sentences

# 2. Embeddings Generation
model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

def generate_embeddings(texts):
    embeddings = model.encode(texts)
    return embeddings  # This will be a numpy array

# 3. Indexing with Faiss
def build_faiss_index(embeddings):
    print(f"shape is {embeddings.shape}")
    d = embeddings.shape[1]
    index = faiss.IndexFlatL2(d)
    index.add(embeddings)
    return index

# 4. Query Processing & Retrieval
def search_in_content(question, index, content_texts, top_k=5):
    question_embedding = model.encode(question)  # This will be a numpy array
    distances, indices = index.search(question_embedding.reshape(1, -1), top_k)  # Reshape to 2D array
    return [content_texts[i] for i in indices[0]]

# # Tool execution
# if __name__ == "__main__":
#     content_filepath = r"C:\Users\Sailesh\Downloads\Chapter.txt"
#     ncert_paragraphs, ncert_sentences = load_and_preprocess_content(content_filepath)

#     # Indexing paragraphs and sentences separately
#     paragraph_embeddings = generate_embeddings(ncert_paragraphs)
#     sentence_embeddings = generate_embeddings(ncert_sentences)
#     paragraph_index = build_faiss_index(paragraph_embeddings)
#     sentence_index = build_faiss_index(sentence_embeddings)

#     while True:
#         user_question = input("Ask a question (or type 'exit' to quit): ")
#         if user_question.strip().lower() == 'exit':
#             break

#         # First search for relevant paragraphs
#         top_paragraphs = search_in_content(user_question, paragraph_index, ncert_paragraphs, top_k=3)  # Retrieving top 3 paragraphs

#         # Next, within those paragraphs, search for relevant sentences
#         relevant_sentences = []
#         for para in top_paragraphs:
#             para_sentences = re.split(r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s', para)
#             para_sentence_embeddings = generate_embeddings(para_sentences)
#             para_sentence_index = build_faiss_index(para_sentence_embeddings)
#             relevant_sentences.extend(search_in_content(user_question, para_sentence_index, para_sentences))

#         print("\nPotential answers from NCERT content:")
#         for ans in relevant_sentences:
#             print("=>", ans)
#         print("\n")

if __name__ == "__main__":
    # content_filepath = r"C:\Users\Sailesh\Downloads\Chapter.txt"
    # ncert_paragraphs, ncert_sentences = load_and_preprocess_content(content_filepath)
    pdf_filepath = r"C:\Users\Sailesh\Downloads\Physics book.pdf"
    text_output_path = r"C:\Users\Sailesh\Downloads\Physics book.txt"  # Specify the path for the output text file

    print("processing pdf")
    text_content = convert_pdf_to_text(pdf_filepath)
    print("pdf processing done")

    # Save the extracted text content to a file
    save_text_to_file(text_content, text_output_path)
    print(f"Text content saved to {text_output_path}")

    #Now use the extracted text content for further processing
    ncert_paragraphs, ncert_sentences = load_and_preprocess_content(text_content)

    # Indexing paragraphs and sentences separately
    paragraph_embeddings = generate_embeddings(ncert_paragraphs)
    sentence_embeddings = generate_embeddings(ncert_sentences)
    paragraph_index = build_faiss_index(paragraph_embeddings)
    sentence_index = build_faiss_index(sentence_embeddings)

    while True:
        user_question = input("Ask a question (or type 'exit' to quit): ")
        if user_question.strip().lower() == 'exit':
            break

        # First search for relevant paragraphs
        top_paragraphs = search_in_content(user_question, paragraph_index, ncert_paragraphs, top_k=5)  # Retrieving the top paragraph

        print("\nMost relevant paragraph:")
        for para in top_paragraphs:
            print(para)
            print("\nRelated sentences:")

            # Within the top paragraph, search for relevant sentences
            para_sentences = re.split(r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s', para)
            para_sentence_embeddings = generate_embeddings(para_sentences)
            para_sentence_index = build_faiss_index(para_sentence_embeddings)
            relevant_sentences = search_in_content(user_question, para_sentence_index, para_sentences)

            for ans in relevant_sentences:
                print("=>", ans)
        print("\n")
