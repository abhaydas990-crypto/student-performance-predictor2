from flask import Flask, render_template, request, jsonify

import sys
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR  = os.path.join(BASE_DIR, "src")
sys.path.append(SRC_DIR)

from predict import predict_math_score, model_name

app = Flask(
    __name__,
    template_folder="templates",
    static_folder="static"
)


@app.route("/")
def home():
    return render_template("index.html", model_name=model_name)


@app.route("/predict", methods=["POST"])
def predict():

    prediction = predict_math_score(
        gender=request.form["gender"],
        race_ethnicity=request.form["race_ethnicity"],
        parental_level_of_education=request.form["parental_level_of_education"],
        lunch=request.form["lunch"],
        test_preparation_course=request.form["test_preparation_course"],
        reading_score=int(request.form["reading_score"]),
        writing_score=int(request.form["writing_score"]),
    )

    return jsonify({
        "prediction": prediction,
        "model_name": model_name
    })


if __name__ == "__main__":
    app.run(debug=True)