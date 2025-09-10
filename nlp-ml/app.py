from flask import Flask, request, jsonify
from flask_cors import CORS
import csv
from datetime import datetime
import logging
import subprocess

from symptom_specialist import recommend_specialist

app = Flask(__name__)
CORS(app)

# Logging setup
logging.basicConfig(
    filename='nlp_service.log',
    level=logging.INFO,
    format='%(asctime)s %(levelname)s: %(message)s'
)

CSV_FILE = 'symptom_logs.csv'


# Endpoint: Analyze symptoms and recommend a specialist
@app.route('/nlp/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    symptoms = data.get('symptoms', '').strip()
    disease = data.get('disease', '').strip()

    if not symptoms:
        logging.error("No symptoms provided in request")
        return jsonify({'error': 'No symptoms provided'}), 400

    try:
        # Predict the specialist category
        specialist_category = recommend_specialist(symptoms, disease)

        # Log to file
        logging.info(f"Symptoms: {symptoms}, Disease: {disease}, Recommended Specialist: {specialist_category}")

        # Save to CSV
        with open(CSV_FILE, mode='a', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow([datetime.now().isoformat(), symptoms, disease, specialist_category])

        return jsonify({
            'symptoms': symptoms,
            'disease': disease,
            'recommended_specialist_category': specialist_category,
            'message': 'Specialist recommendation generated successfully.'
        })

    except Exception as e:
        logging.error(f"Error processing symptoms: {symptoms}, disease: {disease}, error: {str(e)}")
        return jsonify({'error': 'Failed to process symptoms', 'details': str(e)}), 500


# Endpoint: Retrain the model (now SVM)
@app.route('/nlp/retrain', methods=['POST'])
def retrain_model():
    try:
        training_script = "train_model.py"
        result = subprocess.run(["python", training_script], capture_output=True, text=True)

        if result.returncode != 0:
            raise Exception(result.stderr)

        logging.info("Model retrained successfully")
        return jsonify({'message': 'Model retrained successfully'})

    except Exception as e:
        logging.error(f"Error retraining model: {str(e)}")
        return jsonify({'error': 'Failed to retrain model', 'details': str(e)}), 500


# Server entry point
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)