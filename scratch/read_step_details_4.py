import json

transcript_path = "/Users/lucassouto/.gemini/antigravity/brain/88570213-3033-4d62-937d-025d84ad0d56/.system_generated/logs/transcript_full.jsonl"

with open(transcript_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        try:
            data = json.loads(line)
            step_idx = data.get("step_index")
            if step_idx is not None and 12460 <= step_idx <= 12515:
                if data.get("type") == "PLANNER_RESPONSE":
                    for tc in data.get("tool_calls", []):
                        args = tc.get("args", {})
                        target = args.get("TargetFile", "") or args.get("Target", "")
                        if "page.tsx" in target:
                            print(f"### STEP {step_idx}: {tc['name']} ###")
                            print(f"StartLine: {args.get('StartLine')} | EndLine: {args.get('EndLine')}")
                            print("--- TARGET CONTENT ---")
                            print(args.get("TargetContent"))
                            print("--- REPLACEMENT CONTENT ---")
                            print(args.get("ReplacementContent"))
                            print("############################\n")
        except Exception as e:
            pass
