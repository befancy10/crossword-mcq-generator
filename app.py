from flask import Flask, request, jsonify
from transformers import T5Tokenizer, T5ForConditionalGeneration
from sense2vec import Sense2Vec
from similarity.normalized_levenshtein import NormalizedLevenshtein
import torch
import nltk
import string
import pke
import traceback
import spacy
from flask_cors import CORS
from nltk.corpus import stopwords
import nltk
nltk.download('stopwords')

#Membuat objek aplikasi Flask dengan nama app.
app = Flask(__name__)
CORS(app)

#Menentukan path ke model dan tokenizer yang telah dilatih sebelumnya, dan memuatnya ke dalam variabel model dan tokenizer.
trained_model_path = 'model/'
trained_tokenizer_path = 'tokenizer/'

model = T5ForConditionalGeneration.from_pretrained(trained_model_path)
tokenizer = T5Tokenizer.from_pretrained(trained_tokenizer_path)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

nlp = spacy.load('en_core_web_sm')

s2v = Sense2Vec().from_disk("model/sense2vec/")

#Mengambil teks sebagai input dan mengembalikan daftar kata benda yang diekstraksi dari teks menggunakan metode MultipartiteRank yang diambil dari pke.
def get_nouns_multipartite(content):
    out = []
    try:
        extractor = pke.unsupervised.MultipartiteRank()
        extractor.load_document(input=content, language='en', spacy_model=nlp)
        pos = {'NOUN', 'PROPN', 'ADJ'}

        stoplist = list(string.punctuation)
        stoplist += ['-lrb-', '-rrb-', '-lcb-', '-rcb-', '-lsb-', '-rsb-']
        stoplist += stopwords.words('english')

        extractor.candidate_selection(pos=pos)
        extractor.candidate_weighting(alpha=1.1, threshold=0.74, method='average')
        keyphrases = extractor.get_n_best(n=15)

        for val in keyphrases:
            out.append(val[0])
    except:
        out = []
        traceback.print_exc()
    return out

#Menerima teks inputan dan menggunakan fungsi get_nouns_multipartite untuk mendapatkan kata kunci dari teks.
def get_keywords(originaltext):
    keywords = get_nouns_multipartite(originaltext)
    return keywords

#Mengambil konteks (text) dan jawaban sebagai input, dan menggunakan model T5 dan tokenizer untuk menghasilkan pertanyaan yang relevan berdasarkan konteks dan jawaban.
def get_question(context, answer, model, tokenizer):
    text = "context: {} answer: {}".format(context, answer)
    encoding = tokenizer.encode_plus(text, max_length=384, pad_to_max_length=False, truncation=True, return_tensors="pt")
    input_ids, attention_mask = encoding["input_ids"].to(device), encoding["attention_mask"].to(device)

    outs = model.generate(input_ids=input_ids,
                          attention_mask=attention_mask,
                          early_stopping=True,
                          num_beams=5,
                          num_return_sequences=1,
                          no_repeat_ngram_size=2,
                          max_length=72)

    dec = [tokenizer.decode(ids, skip_special_tokens=True) for ids in outs]
    if dec:
        question = dec[0].replace("question:", "").strip()
        return question
    else:
        return None
    
# Fungsi untuk edit distance
def edits(word):
    letters = 'abcdefghijklmnopqrstuvwxyz ' + string.punctuation
    splits = [(word[:i], word[i:]) for i in range(len(word) + 1)]
    deletes = [L + R[1:] for L, R in splits if R]
    transposes = [L + R[1] + R[0] + R[2:] for L, R in splits if len(R) > 1]
    replaces = [L + c + R[1:] for L, R in splits if R for c in letters]
    inserts = [L + c + R for L, R in splits for c in letters]
    
    return set(deletes + transposes + replaces + inserts)
    
def get_distractors_sense2vec_old(correct_answer):
    distractors = []
    seen = set()

    for pos in ["|NOUN", "|ADJ", "|VERB"]:
        word = correct_answer.lower().replace(" ", "_") + pos
        if word in s2v:
            try:
                most_similar = s2v.most_similar(word, n=20)
                for suggestion_word, score in most_similar:
                    if score < 0.4:
                        continue
                    suggestion = suggestion_word.split("|")[0].replace("_", " ")

                    # Filter duplikat, bentuk plural, atau bentuk terlalu mirip
                    # if suggestion.lower() in seen:
                    #     continue
                    # if suggestion.lower() == correct_answer.lower():
                    #     continue
                    # if suggestion.lower().startswith(correct_answer.lower()):
                    #     continue
                    # if suggestion.lower().endswith(correct_answer.lower()):
                    #     continue

                    seen.add(suggestion.lower())
                    distractors.append(suggestion)

                    if len(distractors) >= 3:
                        return distractors
            except Exception as e:
                print(f"Sense2Vec error for '{word}': {e}")
            break  # berhenti jika sudah ketemu POS yang cocok

    return distractors

def get_distractors_sense2vec(correct_answer, top_n=20, sim_threshold=0.4):
    from similarity.normalized_levenshtein import NormalizedLevenshtein
    normalized_levenshtein = NormalizedLevenshtein()
    
    distractors = []
    seen = set()
    original_word = correct_answer.lower()

    # Pre-generate all edit distance variations for filtering
    all_edits = edits(original_word)

    for pos in ["|NOUN", "|ADJ", "|VERB"]:
        word = correct_answer.lower().replace(" ", "_") + pos
        if word in s2v:
            try:
                most_similar = s2v.most_similar(word, n=top_n)
                for suggestion_word, score in most_similar:
                    # Basic score filtering
                    if score < 0.4:
                        continue
                        
                    suggestion = suggestion_word.split("|")[0].replace("_", " ")
                    suggestion_lower = suggestion.lower()

                    # Basic filtering like in the old function
                    if suggestion_lower in seen:
                        continue
                    if suggestion_lower == original_word:
                        continue
                    # if suggestion_lower.startswith(original_word):
                    #     continue
                    # if suggestion_lower.endswith(original_word):
                    #     continue
                    
                    # Step 3: Filter based on edit distance from the new function
                    if suggestion_lower in all_edits:
                        continue
                        
                    # Step 4: Filter using Levenshtein distance from the new function
                    if normalized_levenshtein.distance(suggestion_lower, original_word) <= sim_threshold:
                        continue

                    # If passed all filters, add to distractors
                    seen.add(suggestion_lower)
                    distractors.append(suggestion.title())  # Use title case for consistency

                    if len(distractors) >= 3:
                        return distractors
                        
            except Exception as e:
                print(f"Sense2Vec error for '{word}': {e}")
            
            # Break once we've found a working POS (part of speech)
            break  

    return distractors

@app.route('/generate', methods=['POST'])
def generate():
    input_data = request.json
    if 'context' not in input_data:
        return jsonify({"error": " 'context' must be provided"}), 400

    context = input_data['context']

    imp_keywords = get_keywords(context)

    questions_answer = []
    for answer in imp_keywords:
        question = get_question(context, answer, model, tokenizer)
        if question:
            questions_answer.append({"question": question, "answer": answer})

    return jsonify({"question_answer": questions_answer})

@app.route('/generate-distractors', methods=['POST'])
def generate_distractors():
    data = request.get_json()
    correct_answer = data.get("answer", "").lower()

    try:
        if not correct_answer:
            return jsonify({"error": "Answer is required"}), 400

        distractors = get_distractors_sense2vec_old(correct_answer)
        return jsonify({"distractors": distractors[:3]})
    except Exception as e:
        traceback.print_exc()  # Print full traceback for debugging
        return jsonify({"error": str(e)}), 500

@app.route('/')
def hello():
    return 'Hello, World!'

if __name__ == '__main__':
    app.run(host='localhost', port=5000)
