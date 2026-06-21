# src/data_preprocessing.py

import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder


def load_data(filepath):

    df = pd.read_csv(filepath)

    X = df.drop("math score", axis=1)

    y = df["math score"]

    return X, y


def create_preprocessor(X):

    categorical_features = X.select_dtypes(
        include=["object"]
    ).columns

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "cat",
                OneHotEncoder(handle_unknown="ignore"),
                categorical_features
            )
        ],
        remainder="passthrough"
    )

    return preprocessor