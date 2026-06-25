import json

transcript_path = "/Users/lucassouto/.gemini/antigravity/brain/88570213-3033-4d62-937d-025d84ad0d56/.system_generated/logs/transcript_full.jsonl"
output_path = "/Users/lucassouto/Documents/MATERRAELO-ANTIGRAVITY/scratch/page_edits_log.txt"

with open(transcript_path, "r", encoding="utf-8") as f, open(output_path, "w", encoding="utf-8") as out:
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
                            out.write(f"### STEP {step_idx}: {tc['name']} ###\n")
                            out.write(f"StartLine: {args.get('StartLine')} | EndLine: {args.get('EndLine')}\n")
                            out.write("--- TARGET CONTENT ---\n")
                            out.write(str(args.get("TargetContent")) + "\n")
                            out.write("--- REPLACEMENT CONTENT ---\n")
                            out.write(str(args.get("ReplacementContent")) + "\n")
                            out.write("############################\n\n")
        except Exception as e:
            pass

print("Successfully wrote page_edits_log.txt")
