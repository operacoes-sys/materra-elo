import json

transcript_path = "/Users/lucassouto/.gemini/antigravity/brain/88570213-3033-4d62-937d-025d84ad0d56/.system_generated/logs/transcript_full.jsonl"

targets = [12409]

with open(transcript_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        try:
            data = json.loads(line)
            step_idx = data.get("step_index")
            if step_idx in targets and data.get("type") == "PLANNER_RESPONSE":
                print(f"=== STEP {step_idx} ===")
                for tc in data.get("tool_calls", []):
                    args = tc.get("args", {})
                    print(f"Tool: {tc['name']}")
                    print(f"StartLine: {args.get('StartLine')}")
                    print(f"EndLine: {args.get('EndLine')}")
                    print("--- TARGET CONTENT ---")
                    print(args.get("TargetContent"))
                    print("--- REPLACEMENT CONTENT ---")
                    print(args.get("ReplacementContent"))
                    print("======================")
        except Exception as e:
            pass
