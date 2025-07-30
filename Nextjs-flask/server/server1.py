from flask import Flask, jsonify
from flask_cors import CORS
import matplotlib.pyplot as plt
import numpy as np


app = Flask(__name__)
CORS(app)

@app.route("/api/home", methods=['GET'])
def return_home():
    return jsonify({
        "message": "Welcome",
        "people": ["himanshu", "kulsum", "uday"]
    })

if __name__ == "__main__":
    app.run(debug=True, port=8080)
