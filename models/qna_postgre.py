from sentence_transformers import SentenceTransformer
import re
import nltk
import psycopg2
import data_preprocessing
import pdf_to_tex

def create_connection():
    connection = psycopg2.connect(
        host="localhost",
        database="postgres",
        user="postgres",
        password="Sailesh@1234"
    )
    return connection

def insert_embeddings(connection, texts, embeddings):
    with connection.cursor() as cursor:
        for text, embedding in zip(texts, embeddings):
            cursor.execute(
                "INSERT INTO embeddings (content, embedding) VALUES (%s, %s)",
                (text, embedding.tolist())
            )
    connection.commit()

# def search_in_content(connection, question, model, top_k=5):
#     question_embedding = model.encode([question])[0].tolist()
#     with connection.cursor() as cursor:
#         cursor.execute(
#             "SELECT content FROM embeddings ORDER BY embedding <-> %s LIMIT %s",
#             (question_embedding, top_k)
#         )
#         results = cursor.fetchall()
#     return [res[0] for res in results]

def search_in_content(connection, question, model, top_k=5):
    question_embedding = model.encode([question])[0]
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT content FROM embeddings
            ORDER BY embedding <-> CAST(%s AS vector)
            LIMIT %s
            """,
            (question_embedding.tolist(), top_k)
        )
        results = cursor.fetchall()
    return [res[0] for res in results]



nltk.download('punkt')  # Download the required model

# def load_and_preprocess_content(content):
#     # Improved paragraph splitting (Example: Splitting on two newlines or a newline followed by a capital letter)
#     paragraphs = re.split(r'\n\n|\n(?=[A-Z])', content)

#     # Sentence Tokenization using NLTK
#     sentences = []
#     for paragraph in paragraphs:
#         sentences.extend(nltk.tokenize.sent_tokenize(paragraph))
    
#     return paragraphs, sentences

def save_text_to_file(text, file_path):
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(text)


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


if __name__ == "__main__":
    connection = create_connection()
    # content_filepath = r"C:\Users\Sailesh\Downloads\Chapter.txt"
    # ncert_paragraphs, ncert_sentences = load_and_preprocess_content(content_filepath)
    pdf_filepath = r"C:\Users\Sailesh\Downloads\physics book\Physics book.pdf"
    text_output_path = r"C:\Users\Sailesh\Downloads\Physics book.txt"  # Specify the path for the output text file

    # print("processing pdf")
    # text_content = pdf_to_tex.convert_pdf(pdf_filepath)
    # print(f"Conversion successful. TeX file saved to: {text_content}")
    # print("pdf processing done")

    # # Save the extracted text content to a file
    # save_text_to_file(text_content, text_output_path)
    # print(f"Text content saved to {text_output_path}")
    text_content=r"C:\Users\Sailesh\Downloads\physics book\Physics book\2023_12_06_01ef020640a6b9ad8bb4g\2023_12_06_01ef020640a6b9ad8bb4g.tex"
     # Generate Embeddings
    model = SentenceTransformer('paraphrase-MiniLM-L6-v2')
    print("paragraphs are going to be chunked")
    ncert_paragraphs= data_preprocessing.data_preprocessing(text_content)
    print("chunking done")

    paragraph_embeddings = generate_embeddings(ncert_paragraphs)
    # sentence_embeddings = generate_embeddings(ncert_sentences)

    # Insert embeddings into database
    insert_embeddings(connection, ncert_paragraphs, paragraph_embeddings)
    # insert_embeddings(connection, ncert_sentences, sentence_embeddings)
    # Interactive search loop
    while True:
        user_question = input("Ask a question (or type 'exit' to quit): ")
        if user_question.strip().lower() == 'exit':
            break

        top_paragraphs = search_in_content(connection, user_question, model, top_k=5)
        for para in top_paragraphs:
            print("\nMost relevant paragraph:")
            print(para)
        #     print("\nRelated sentences:")

        #     # Within the top paragraph, search for relevant sentences
        #     para_sentences = re.split(r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s', para)
        #     para_sentence_embeddings = generate_embeddings(para_sentences)
        #     para_sentence_index = insert_embeddings(para_sentence_embeddings)
        #     relevant_sentences = search_in_content(user_question, para_sentence_index, para_sentences)

        #     for ans in relevant_sentences:
        #         print("=>", ans)
        # print("\n")

