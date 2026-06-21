import os
import joblib
import numpy as np

from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from data_preprocessing import load_data, create_preprocessor


DATA_PATH = "../data/StudentsPerformance.csv"
MODEL_PATH = "../models/student_score_model.pkl"


def train():

    X, y = load_data(DATA_PATH)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    candidates = {
        "Linear Regression": LinearRegression(),
        "Decision Tree": DecisionTreeRegressor(random_state=42),
        "Random Forest": RandomForestRegressor(n_estimators=100, random_state=42),
    }

    best_name = None
    best_pipeline = None
    best_r2 = -np.inf

    print("\nModel Evaluation")
    print("-" * 40)

    for name, model in candidates.items():

        pipeline = Pipeline(steps=[
            ("preprocessor", create_preprocessor(X)),
            ("model", model)
        ])

        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)

        mae  = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2   = r2_score(y_test, y_pred)

        print(f"{name}")
        print(f"  MAE:      {mae:.4f}")
        print(f"  RMSE:     {rmse:.4f}")
        print(f"  R2 Score: {r2:.4f}")
        print()

        if r2 > best_r2:
            best_r2       = r2
            best_name     = name
            best_pipeline = pipeline

    print(f"Best Model: {best_name} (R2 = {best_r2:.4f})")

    os.makedirs("../models", exist_ok=True)

    joblib.dump(
        {"pipeline": best_pipeline, "model_name": best_name},
        MODEL_PATH
    )

    print("Best model saved successfully.")


if __name__ == "__main__":
    train()