"""Helpers shared by pipeline scripts.

Resolves the path to the raw SME dataset without hardcoding any
machine-specific absolute path. Override with the DADOSCRECHE_DIR
env var if the dataset lives somewhere else.
"""

import os
from pathlib import Path

APP_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = APP_DIR.parent
PROCESSED_DIR = APP_DIR / "data" / "processed"


def get_dataset_dir() -> Path:
    override = os.environ.get("DADOSCRECHE_DIR")
    dataset_dir = Path(override) if override else REPO_ROOT / "dadoscreche"
    if not dataset_dir.is_dir():
        raise FileNotFoundError(
            f"Dataset directory not found: {dataset_dir}\n"
            "Set DADOSCRECHE_DIR to point at the dadoscreche checkout, "
            "or place it as a sibling of the app/ directory."
        )
    return dataset_dir


def query_a_path() -> Path:
    return (
        get_dataset_dir()
        / "Bases IC_ ClassificadoseFila"
        / "01_QueryA_InscricoesPorAno.csv.gz"
    )


def query_c_path() -> Path:
    return (
        get_dataset_dir()
        / "Bases IC_ ClassificadoseFila"
        / "03_QueryC_PerguntasComDescricao.csv"
    )
