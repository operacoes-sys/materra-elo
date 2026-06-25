import json

transcript_path = "/Users/lucassouto/.gemini/antigravity/brain/88570213-3033-4d62-937d-025d84ad0d56/.system_generated/logs/transcript_full.jsonl"
output_path = "/Users/lucassouto/Documents/MATERRAELO-ANTIGRAVITY/scratch/all_page_modifications.txt"

modifications = []
with open(transcript_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if "replace_file_content" in line or "multi_replace_file_content" in line or "write_to_file" in line:
            try:
                data = json.loads(line)
                if "tool_calls" in data:
                    for tc in data["tool_calls"]:
                        args = tc.get("args", {})
                        target = args.get("TargetFile", "") or args.get("Target", "")
                        if "page.tsx" in target:
                            modifications.append({
                                "step_index": data.get("step_index"),
                                "created_at": data.get("created_at"),
                                "tool": tc["name"],
                                "args": args
                            })
                elif "content" in data and "The following changes were made" in data["content"]:
                    modifications.append({
                        "step_index": data.get("step_index"),
                        "created_at": data.get("created_at"),
                        "type": "result",
                        "content": data["content"]
                    })
            except Exception as e:
                pass

with open(output_path, "w", encoding="utf-8") as out:
    for idx, mod in enumerate(modifications):
        out.write(f"[{idx}] Step {mod.get('step_index')} ({mod.get('created_at')}): {mod.get('tool') or mod.get('type')}\n")
        if "args" in mod:
            out.write(f"  Description: {mod['args'].get('Description')}\n")
            out.write(f"  StartLine: {mod['args'].get('StartLine')} | EndLine: {mod['args'].get('EndLine')}\n")
            out.write(f"  Target: {str(mod['args'].get('TargetContent'))[:100].replace(chr(10), ' ')}...\n")
        elif "content" in mod:
            out.write(f"  Content: {mod['content'][:150].replace(chr(10), ' ')}...\n")
        out.write("\n")

print(f"Successfully wrote {len(modifications)} modifications to all_page_modifications.txt")
