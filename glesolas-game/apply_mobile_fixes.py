import re

# Read the file
with open('src/components/CompactStatsHeader.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Apply mobile responsiveness fixes
fixes = [
    # Responsive gaps and text sizing
    (r'gap-3 flex-1 min-w-0', 'gap-2 sm:gap-3 flex-1 min-w-0'),
    (r'text-lg font-bold text-gradient-solar truncate', 'text-base sm:text-lg font-bold text-gradient-solar truncate'),
    (r'gap-2 text-sm', 'gap-1.5 text-sm'),
    
    # Better touch targets
    (r'h-8 w-8 p-0"', 'h-9 w-9 sm:h-8 sm:w-8 p-0 touch-manipulation"'),
    
    # Prevent text wrapping
    (r'min-w-fit">', 'min-w-fit flex-shrink-0">'),
    (r'w-3 h-3 text-yellow-500"', 'w-3 h-3 text-yellow-500 flex-shrink-0"'),
    (r'<span>{currentLevel\.name}</span>', '<span className="whitespace-nowrap">{currentLevel.name}</span>'),
    
    # Better flex sizing
    (r'className="flex-1">\s*<Progress', 'className="flex-1 min-w-[60px]">\n            <Progress'),
    
    # Shorter mobile text
    (r'MAX LEVEL', 'MAX'),
]

for pattern, replacement in fixes:
    content = re.sub(pattern, replacement, content)

# Add responsive level text (more complex replacement)
# Find the nextLevel section and replace
next_level_pattern = r'{nextLevel && \(\s*<span className="text-xs text-muted-foreground min-w-fit flex-shrink-0">\s*{gloryToNext} to {nextLevel\.name}\s*</span>\s*\)}'
next_level_replacement = '''{nextLevel && (
            <>
              <span className="text-xs text-muted-foreground min-w-fit flex-shrink-0 whitespace-nowrap hidden sm:inline">
                {gloryToNext} to {nextLevel.name}
              </span>
              <span className="text-xs text-muted-foreground min-w-fit flex-shrink-0 whitespace-nowrap sm:hidden">
                {gloryToNext}
              </span>
            </>
          )}'''

content = re.sub(next_level_pattern, next_level_replacement, content, flags=re.DOTALL)

# Fix the MAX LEVEL section
max_level_pattern = r'{!nextLevel && \(\s*<span className="text-xs text-yellow-500 min-w-fit font-semibold flex-shrink-0">\s*MAX\s*</span>\s*\)}'
max_level_replacement = '''{!nextLevel && (
            <span className="text-xs text-yellow-500 min-w-fit font-semibold flex-shrink-0 whitespace-nowrap">
              MAX
            </span>
          )}'''

content = re.sub(max_level_pattern, max_level_replacement, content, flags=re.DOTALL)

# Write back
with open('src/components/CompactStatsHeader.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Mobile responsiveness fixes applied to CompactStatsHeader.tsx")
