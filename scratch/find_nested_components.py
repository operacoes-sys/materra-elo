with open('/Users/lucassouto/Documents/MATERRAELO-ANTIGRAVITY/src/app/page.tsx', 'r') as f:
    lines = f.readlines()

in_home = False
brace_depth = 0
nested_components = []

for idx, line in enumerate(lines):
    stripped = line.strip()
    if 'export default function Home(' in line:
        in_home = True
        brace_depth = line.count('{') - line.count('}')
        print(f"Home starts at line {idx+1} (initial depth: {brace_depth})")
        continue
    
    if in_home:
        # Track brace depth to know when Home ends
        brace_depth += line.count('{')
        brace_depth -= line.count('}')
        
        if brace_depth <= 0:
            print(f"Home ends at line {idx+1}")
            in_home = False
            continue
        
        # Look for nested components
        if stripped.startswith('const ') or stripped.startswith('function '):
            match = None
            if stripped.startswith('const '):
                parts = stripped.split()
                if len(parts) > 1 and parts[1][0].isupper() and '(' in stripped:
                    match = parts[1]
            elif stripped.startswith('function '):
                parts = stripped.split()
                if len(parts) > 1 and parts[1][0].isupper():
                    match = parts[1].split('(')[0]
            
            if match:
                nested_components.append((idx+1, stripped))

print(f"Found {len(nested_components)} nested components inside Home:")
for line_num, text in nested_components:
    print(f"Line {line_num}: {text}")
