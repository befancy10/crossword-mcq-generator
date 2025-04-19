from flask import Flask, request, jsonify
from transformers import T5Tokenizer, T5ForConditionalGeneration
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

@app.route('/')
def hello():
    return 'Hello, World!'

if __name__ == '__main__':
    app.run(host='localhost', port=5000)
