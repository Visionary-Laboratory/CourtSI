<div align="center" style="font-family: charter;">

<h1><img width="4%"/><i>Stepping VLMs onto the Court</i><img src="assets/logo.png" width="7%" style="margin: 0 5px; vertical-align: -0.18em;"/>:</br> Benchmarking Spatial Intelligence in Sports</h1>

<img src="assets/teaser.png" width="85%"/>
<br />
<br />

<a href="http://arxiv.org/abs/2603.09896" target="_blank"><img alt="arXiv" src="https://img.shields.io/badge/arXiv-CourtSI-red?logo=arxiv"></a>
<a href="https://visionary-laboratory.github.io/CourtSI" target="_blank">
<img alt="Website" src="https://img.shields.io/badge/🌎_Website-CourtSI-blue.svg">
</a>
<br>
<a href="https://huggingface.co/datasets/Charlie019/CourtSI-1M" target="_blank"><img alt="HF Dataset: CourtSI" src="https://img.shields.io/badge/%F0%9F%A4%97%20_Dataset-CourtSI-ffc107?color=ffc107&logoColor=white"></a>
<a href="https://huggingface.co/datasets/Charlie019/CourtSI-Bench" target="_blank"><img alt="HF Dataset: CourtSI-Bench" src="https://img.shields.io/badge/%F0%9F%A4%97%20_Benchmark-CourtSI--Bench-ffc107?color=ffc107&logoColor=white"></a>
<a href="https://huggingface.co/datasets/Charlie019/CourtSI-Ext" target="_blank"><img alt="HF Dataset: CourtSI-Ext" src="https://img.shields.io/badge/%F0%9F%A4%97%20_Benchmark-CourtSI--Ext-ffc107?color=ffc107&logoColor=white"></a>
<a href="https://huggingface.co/Charlie019/CourtSI-Qwen3-VL-8B" target="_blank"><img alt="HF Model: CourtSI-Qwen" src="https://img.shields.io/badge/%F0%9F%A4%97%20_Model-CourtSI--Qwen3--VL-ffc107?color=ffc107&logoColor=white"></a>

</div>

## News

- [2026-03-11] 🔥🔥🔥 We release the CourtSI [dataset](https://huggingface.co/datasets/Charlie019/CourtSI-1M), [benchmark](https://huggingface.co/datasets/Charlie019/CourtSI-Bench), and the [fine-tuned model](https://huggingface.co/Charlie019/CourtSI-Qwen3-VL-8B)! Check out the repository and the Hugging Face links above for more details.

## Overview

`TL;DR` We introduce CourtSI and CourtSI-Bench, the first large-scale dataset and benchmark dedicated to spatial intelligence in sports.

### 🚀 CourtSI

CourtSI contains 1M+ QA pairs built upon a holistic spatial taxonomy covering:
· (i) Spatial Counting · (ii) Distance Measurement · (iii) Localization · (iv) Relational Reasoning

### 🧪 CourtSI-Bench

CourtSI-Bench, a high-quality benchmark consisting of 3,686 human-verified QA pairs.
We evaluate 25 state-of-the-art proprietary and open-source VLMs on it.

### 🔄 Fine-Tuned Model & CourtSI-Ext

The Fine-tuned Qwen3-VL-8B on CourtSI yields a +23.5% absolute improvement on CourtSI-Bench.

CourtSI-Ext, an extended version of CourtSI-Bench, focusing on cross-sport generalization.

### 🔧 Semi-Automatic Data Engine (Not Open-sourced)

Leverage court geometry for semi-automatic sport scene reconstruction, enabling the generation of spatially grounded QA pairs at scale.

## How to use the datasets and benchmark

Please refer to the [documentation](protocol/README.md) in the `protocol` folder for detailed instructions.

## Citation

If you find our work useful, please consider citing:

```bibtex
@misc{yang2026CourtSI,
      title={Stepping VLMs onto the Court: Benchmarking Spatial Intelligence in Sports}, 
      author={Yuchen Yang and Yuqing Shao and Duxiu Huang and Linfeng Dong and Yifei Liu and Suixin Tang and Xiang Zhou and Yuanyuan Gao and Wei Wang and Yue Zhou and Xue Yang and Yanfeng Wang and Xiao Sun and Zhihang Zhong},
      year={2026},
      eprint={2603.09896},
      archivePrefix={arXiv},
      primaryClass={cs.CV},
      url={https://arxiv.org/abs/2603.09896}, 
}

@misc{dong2025racketvision,
      title={RacketVision: A Multiple Racket Sports Benchmark for Unified Ball and Racket Analysis}, 
      author={Dong, Linfeng and Yang, Yuchen and Wu, Hao and Wang, Wei and Hou, Yuenan and Zhong, Zhihang and Sun, Xiao},
      year={2025},
      eprint={2511.17045},
      archivePrefix={arXiv},
      primaryClass={cs.CV},
      url={https://arxiv.org/abs/2511.17045}, 
}
```
