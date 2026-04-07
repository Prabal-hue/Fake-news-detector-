import os
import json
import google.generativeai as genai
from flask import Flask, render_template_string, request, jsonify

# --- CONFIGURATION ---
# Replace with your actual API key from https://aistudio.google.com/
GEMINI_API_KEY = "YOUR_API_KEY_HERE"
genai.configure(api_key=GEMINI_API_KEY)

app = Flask(__name__)

# --- AI LOGIC ---
def analyze_news_logic(title, content):
    model = genai.GenerativeModel('gemini-3-flash-preview')
    prompt = f"""
    Analyze the following news article for credibility:
    Title: {title}
    Content: {content}
    
    Return a JSON object with: verdict, confidenceScore, reasoning, biasAnalysis, keyClaims, and suggestions.
    """
    try:
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text)
    except Exception as e:
        return {"error": str(e)}

# --- HTML TEMPLATE ---
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fake News Detector - Python Edition</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-slate-50 min-h-screen p-4 md:p-8">
    <div class="max-w-4xl mx-auto">
        <header class="mb-8 text-center">
            <h1 class="text-4xl font-extrabold text-slate-800 mb-2">VeriNews <span class="text-indigo-600">Python</span></h1>
            <p class="text-slate-500">AI-Powered Misinformation Detection</p>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Input -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 class="text-lg font-bold mb-4">Analyze Article</h2>
                <div class="space-y-4">
                    <input id="title" type="text" placeholder="Article Headline" class="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                    <textarea id="content" placeholder="Article Content" rows="8" class="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
                    <button onclick="analyze()" id="btn" class="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all">
                        Detect Misinformation
                    </button>
                </div>
            </div>

            <!-- Results -->
            <div id="results" class="hidden space-y-4">
                <div id="verdict-card" class="p-6 rounded-2xl border shadow-sm">
                    <div class="flex justify-between items-center mb-2">
                        <span id="verdict-text" class="text-2xl font-black uppercase"></span>
                        <span id="confidence-text" class="text-xl font-bold"></span>
                    </div>
                    <p id="reasoning-text" class="text-sm opacity-90"></p>
                </div>
                
                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 class="font-bold text-slate-500 text-xs uppercase tracking-widest mb-2">Bias Analysis</h3>
                    <p id="bias-text" class="text-sm italic text-slate-600"></p>
                </div>
            </div>
        </div>
    </div>

    <script>
        async function analyze() {
            const title = document.getElementById('title').value;
            const content = document.getElementById('content').value;
            const btn = document.getElementById('btn');
            const results = document.getElementById('results');

            if(!title || !content) return alert("Please fill both fields");

            btn.disabled = true;
            btn.innerText = "Analyzing...";

            const response = await fetch('/analyze', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({title, content})
            });

            const data = await response.json();
            btn.disabled = false;
            btn.innerText = "Detect Misinformation";

            if(data.error) return alert(data.error);

            results.classList.remove('hidden');
            document.getElementById('verdict-text').innerText = data.verdict;
            document.getElementById('confidence-text').innerText = data.confidenceScore + "%";
            document.getElementById('reasoning-text').innerText = data.reasoning;
            document.getElementById('bias-text').innerText = data.biasAnalysis;

            const card = document.getElementById('verdict-card');
            if(data.verdict === 'Real') card.className = "p-6 rounded-2xl border shadow-sm bg-emerald-50 border-emerald-200 text-emerald-700";
            else if(data.verdict === 'Fake') card.className = "p-6 rounded-2xl border shadow-sm bg-rose-50 border-rose-200 text-rose-700";
            else card.className = "p-6 rounded-2xl border shadow-sm bg-amber-50 border-amber-200 text-amber-700";
        }
    </script>
</body>
</html>
"""

# --- ROUTES ---
@app.route('/')
def index():
    return render_template_string(HTML_TEMPLATE)

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    result = analyze_news_logic(data['title'], data['content'])
    return jsonify(result)

if __name__ == '__main__':
    print("Starting Python Web App at http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
