import numpy as np
from typing import Tuple


def LocA(pred: Tuple[float, float, float], gt: Tuple[float, float, float], threshold: float = 0.3):
    pred_x, pred_y, pred_r = pred
    gt_x, gt_y, gt_r = gt

    distance = np.sqrt((pred_x - gt_x) ** 2 + (pred_y - gt_y) ** 2 + (pred_r - gt_r) ** 2)

    acc = 0
    if distance < threshold:
        acc = 1
    return acc, distance


def MRA(pred: float, gt: float, threshold: float = 0.15):
    threshold_list = np.arange(0.5, 1.0, 0.05)

    acc = 0
    for t in threshold_list:
        if (abs(pred - gt) - threshold) / (gt + 1e-8) < (1 - t):
            acc += 1
    return acc / len(threshold_list)


def MA(pred: str, gt: str):
    return float(pred == gt)