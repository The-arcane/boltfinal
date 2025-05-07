import requests

print("💬 Welcome to Healthcare Chatbot (Powered by LLaMA 2)")
print("Type 'exit' to quit.\n")

while True:
    question = input("👤 You: ").strip()
    
    if question.lower() in ["exit", "quit"]:
        print("👋 Chatbot session ended.")
        break

    # Send request to llama2 running via Ollama
    response = requests.post("http://localhost:11434/api/generate", json={
        "model": "llama2",
        "prompt": question,
        "stream": False
    })

    # Show AI response
    print("\n🤖 AI:", response.json()["response"].strip(), "\n")
