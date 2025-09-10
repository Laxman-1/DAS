import re
import joblib
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
import nltk
import os

nltk.download('stopwords', quiet=True)

stop_words = set(stopwords.words('english'))
stemmer = PorterStemmer()

def preprocess_text(text):
    text = re.sub(r'[^a-zA-Z\s]', '', text.lower())
    words = text.split()
    words = [stemmer.stem(w) for w in words if w not in stop_words]
    return ' '.join(words)

# Lazy load models
vectorizer = None
model = None
label_encoder = None

def load_models():
    global vectorizer, model, label_encoder
    try:
        if vectorizer is None:
            vectorizer = joblib.load('model/tfidf_vectorizer.joblib')
        if model is None:
            model = joblib.load('model/svm_model.joblib')
        if label_encoder is None:
            label_encoder = joblib.load('model/label_encoder.joblib')
    except FileNotFoundError as e:
        print(f"Error: Model file not found - {e}")
        print("Please run train_model.py first to generate model files.")
        raise

def rule_based_override(symptoms: str) -> str:
    """
    Return a specialist if rule-based match is found, else None.
    """
    text_lower = symptoms.lower()

    # Genital swelling (male)
    if re.search(r'\b(genital|penis|scrotum|testicle|groin)\b', text_lower):
        return "Urologist"

    # Female genital swelling
    if re.search(r'\b(vagina|labia|vulva)\b', text_lower):
        return "Gynecologist"

    # Example extra rules:
    if "eye" in text_lower or "vision" in text_lower:
        return "Ophthalmologist"
    if "skin rash" in text_lower or "itchy skin" in text_lower:
        return "Dermatologist"

    return None

def recommend_specialist(symptoms, disease=None):
    # 1️⃣ Check rule-based overrides first
    specialist_override = rule_based_override(symptoms)
    if specialist_override:
        return specialist_override

    # 2️⃣ Fall back to ML model
    load_models()
    input_text = (disease + " " + symptoms) if disease else symptoms
    processed_text = preprocess_text(input_text)
    tfidf_features = vectorizer.transform([processed_text])
    prediction = model.predict(tfidf_features)
    specialist = label_encoder.inverse_transform(prediction)[0]
    return specialist

# Example usage
if __name__ == "__main__":
    try:
        symptoms = "i have leg pain"
        disease = ""
        specialist = recommend_specialist(symptoms, disease)
        print(f"Recommended specialist: {specialist}")
    except Exception as e:
        print(f"Error during prediction: {e}")
