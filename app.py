from flask import Flask, request, jsonify
import requests as req

app = Flask(__name__)

@app.route('/ask', methods=['POST'])
def ask():
    data = request.json
    question = data.get("prompt", "")

    response = req.post("http://localhost:11434/api/generate", json={
        "model": "llama2",
        "prompt": question,
        "stream": False
    })

    return jsonify({"response": response.json()["response"]})

if __name__ == '__main__':
    app.run(port=5000)
