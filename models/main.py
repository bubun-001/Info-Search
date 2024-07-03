import faiss
from sentence_transformers import SentenceTransformer

# 1. Data Collection & Preprocessing
def load_and_preprocess_content(filepath):
    with open(filepath, 'r', encoding='utf-8') as file:
        content = file.read()
    return content.split('.')

# 2. Embeddings Generation
model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')

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

# Tool execution
if __name__ == "__main__":
    content_filepath = r"C:\Users\Sailesh\Downloads\Chapter.txt"
    ncert_content = load_and_preprocess_content(content_filepath)
    embeddings = generate_embeddings(ncert_content)
    faiss_index = build_faiss_index(embeddings)

    while True:
        user_question = input("Ask a question (or type 'exit' to quit): ")
        if user_question.strip().lower() == 'exit':
            break
        answers = search_in_content(user_question, faiss_index, ncert_content)
        print("\nPotential answers from NCERT content:")
        for ans in answers:
            print("=>", ans)
        print("\n")
