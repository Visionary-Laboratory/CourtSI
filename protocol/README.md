## CourtSI
We follow [LLaMA Factory](https://github.com/hiyouga/LlamaFactory) for dataset management.
Specifically, each QA pair is stored in `sharegpt` format:
```json
[
  {
    "messages": [
      {
        "role": "user",
        "content": "<image> Question"
      },
      {
        "role": "assistant",
        "content": "Answer"
      }
    ],
    "images": [
        "CourtSI-1M/images/<sport_info>.jpg"
    ]
  }
]
```

Place the dataset files in `data/CourtSI-1M` of LLaMA Factory, and run the LLaMA Factory script for fine-tuning.

We provide a training recipe in `protocol/CourtSI`, including the dataset configuration and training hyperparameters.

## CourtSI-Bench

The CourtSI-Bench (also CourtSI-Ext) data is formatted as below:
```json
[
  {
    "image_id": "images/<sport_info>.jpg",
    "question": "Question",
    "answer": "Answer",
    "category": "Category"
  },
  ...
]
```

You can run following script with the predicted QA json file to get the evaluation results.
```
python vlm_evaluate.py --file_path <path_to_predicted_qa>.json --output_folder <path_to_save_results> --save_per_qa_output
```
Here, we require the predicted QA json file to be in the format of `example/example_output.json`, which includes "category", "answer", and "vlm_answer" for each QA pair.