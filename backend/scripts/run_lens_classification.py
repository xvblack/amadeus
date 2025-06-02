LLM_LENS = {
    "training": {
        "architecture": {
            "autoregressive": {},
            "diffusion": {},
            "other": {},
        },
        "optimizer": {
            "hparams": {},
        },
        "pretraining": {
            "_description": "LLM pretraining",
            "tech_report": {},
            "data": {
                "dataset": {},
                "data_engineering": {},
            },
        },
        "posttraining": {
            "sft": {},
            "rlhf": {},
            "rlvr": {},
        },
        "evaluation": {
            "general_chat": {},
            "math": {},
            "coding": {},
        },
        "infra": {
            "kernel": {},
            "framework": {},
        },
    },
    "inference": {
        "algorithm": {
            "speculative_decoding": {},
            "caching": {},
        },
        "infra": {
            "kernel": {},
            "framework": {},
        }
    },
    "hardware": {
        "gpu": {},
        "tpu": {},
        "sram": {},
        "other_asic": {},
    },
}