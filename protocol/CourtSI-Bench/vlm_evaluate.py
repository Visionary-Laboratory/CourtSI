import argparse
import json
import os

from collections import defaultdict
from typing import Any, Dict, List, Tuple, Union

from metrics import MRA, MA, LocA


CAT_ORDER: List[str] = [
    "distance_measurement_camera_object",
    "distance_measurement_height",
    "distance_measurement_object_line",
    "distance_measurement_object_object",
    "spatial_counting_ball",
    "spatial_counting_player",
    "localization",
    "relational_reasoning_ball_zone",
    "relational_reasoning_ball_player",
    "relational_reasoning_camera_player",
    "relational_reasoning_player_zone",
    "relational_reasoning_player_player",
    "relational_reasoning_player_line"
]


def to_single_choice(s: str, choices: Tuple[str, ...] = ("A", "B", "C", "D")) -> str:
    # delete () and spaces
    s = s.strip("()").strip()
    if s in choices:
        return s
    else:
        raise ValueError(f"Invalid choice: {s}")


def to_float_tuple(s: str, n: int = 3, check_space: bool = False) -> Tuple[float, ...]:
    s = s.strip("()")
    parts = s.split(",")

    if check_space:
        for idx, part in enumerate(parts):
            if " " not in part and idx != 0:
                raise ValueError(f"Expected a space in parts: {s}")

    if len(parts) != n:
        raise ValueError(f"Expected {n} values, got {len(parts)}: {s}")
    return tuple(float(p) for p in parts)


def parse_text(text: str, check_space: bool = False) -> Union[float, str, Tuple[float, ...]]:
    try:
        return float(text)
    except ValueError:
        pass

    try:
        return to_single_choice(text)
    except ValueError:
        pass

    try:
        return to_float_tuple(text, n=3, check_space=check_space)
    except ValueError:
        pass

    raise ValueError(f"Unable to parse answer: {text}")


def evaluate(pred_qa: List[Dict[str, Any]]) -> Tuple[Dict[str, float], float, List[Dict[str, Any]]]:
    accuracy_count = defaultdict(int)
    accuracy_total = defaultdict(float)

    distance_count = 0
    distance_total = 0

    for idx, item in enumerate(pred_qa):
        answer = item["answer"]
        pred_answer = item["vlm_answer"]
        category = item["category"]
        parsed_answer = parse_text(answer, check_space=True)
        try:
            parsed_pred_answer = parse_text(pred_answer, check_space=True)
        except:
            parsed_pred_answer = None
        if parsed_pred_answer is None or type(parsed_pred_answer) != type(parsed_answer):
            score = 0.0
        elif isinstance(parsed_answer, float) and isinstance(parsed_pred_answer, float):
            if "counting" not in category:
                score = MRA(parsed_pred_answer, parsed_answer, threshold=0.15)
            else:
                score = MA(parsed_pred_answer, parsed_answer)
        elif isinstance(parsed_answer, str) and isinstance(parsed_pred_answer, str):
            score = MA(parsed_pred_answer, parsed_answer)
        elif isinstance(parsed_answer, tuple) and isinstance(parsed_pred_answer, tuple):
            if len(parsed_answer) != len(parsed_pred_answer):
                score = 0.0
            else:
                score, distance = LocA(parsed_pred_answer, parsed_answer, threshold=0.3)
                distance_count += 1
                distance_total += distance
        else:
            raise ValueError(f"Unsupported answer types: {type(parsed_answer)} vs {type(parsed_pred_answer)}")

        accuracy_total[category] += score
        accuracy_count[category] += 1

        item["score"] = score

    res = {cat: accuracy_total[cat] / accuracy_count[cat] if accuracy_count[cat] > 0 else 0.0 for cat in accuracy_total}

    overall = sum(accuracy_total.values()) / sum(accuracy_count.values()) if sum(accuracy_count.values()) > 0 else 0.0
    return res, overall, pred_qa


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate VLM QA results")
    parser.add_argument("--file_path", type=str, default="CourtSI-Bench/example/example_output.json", help="Path to the predicted QA json file")
    parser.add_argument("--save_per_qa_output", action="store_true", help="Whether to save the per-QA output")
    parser.add_argument("--output_folder", type=str, default="example/evaluation_results", help="Folder to save the evaluation results")
    args = parser.parse_args()

    os.makedirs(args.output_folder, exist_ok=True)

    print(f"Evaluating {os.path.basename(args.file_path)}...")
    with open(args.file_path, "r") as f:
        pred_qa = json.load(f)

    res, overall_acc, pred_qa = evaluate(pred_qa)

    output_file_path = os.path.join(args.output_folder, os.path.basename(args.file_path).split('_output')[0] + "_evaluation.json")
    if args.save_per_qa_output:
        output_pred_qa_path = os.path.join(args.output_folder, os.path.basename(args.file_path).split('_output')[0] + "_pred_qa.json")
    os.makedirs(os.path.dirname(output_file_path), exist_ok=True)

    res = dict(sorted(res.items(), key=lambda x: CAT_ORDER.index(x[0]) if x[0] in CAT_ORDER else len(CAT_ORDER)))
    res["overall"] = overall_acc

    # convert to percentage
    for key in res:
        res[key] = res[key] * 100

    print(f"Evaluation results saved to {args.output_folder}")
    with open(output_file_path, "w") as f:
        json.dump(res, f, indent=4)

    if args.save_per_qa_output:
        with open(output_pred_qa_path, "w") as f:
            json.dump(pred_qa, f, indent=4)