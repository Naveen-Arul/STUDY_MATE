import os
from dotenv import load_dotenv
from groq import Groq

# Load API key from .env file
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found in environment variables. Please check your .env file.")

# Initialize Groq client
client = Groq(api_key=GROQ_API_KEY)

def generate_answer(question, context_chunks, model="llama-3.1-8b-instant"):
    """
    Generate an answer using Groq LLaMA model based on retrieved chunks + user question
    """
    context_text = "\n".join([f"- {chunk}" for chunk in context_chunks])
    prompt = f"""
Answer the question based strictly on the following context:
{context_text}

Question: {question}
Answer:
"""

    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
        max_tokens=300,
    )

    return response.choices[0].message.content

if __name__ == "__main__":
    # Demo with dummy chunks
    dummy_chunks = [
        "Machine learning is used to make predictions based on data.",
        "Overfitting happens when a model memorizes training data instead of learning patterns."
    ]
    question = "What is overfitting in machine learning?"
    print("Q:", question)
    print("A:", generate_answer(question, dummy_chunks))
