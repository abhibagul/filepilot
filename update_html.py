import os
import glob

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add bg-animation.js if not present
    if 'bg-animation.js' not in content:
        content = content.replace('</body>', '  <script src="js/bg-animation.js"></script>\n</body>')
    
    # 2. Add reveal-on-scroll to sections (that don't already have it)
    # We will just replace '<section>' with '<section class="reveal-on-scroll">'
    content = content.replace('<section>', '<section class="reveal-on-scroll">')
    # And replace '<section class="' with '<section class="reveal-on-scroll '
    # But only if it doesn't already have it
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if '<section class="' in line and 'reveal-on-scroll' not in line:
            lines[i] = line.replace('<section class="', '<section class="reveal-on-scroll ')
        if '<div class="card"' in line and 'reveal-on-scroll' not in line:
            lines[i] = line.replace('<div class="card"', '<div class="card reveal-on-scroll"')
        if '<div class="card ' in line and 'reveal-on-scroll' not in line:
            lines[i] = line.replace('<div class="card ', '<div class="card reveal-on-scroll ')
    
    content = '\n'.join(lines)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    directory = 'd:/personalproj/web/'
    html_files = glob.glob(os.path.join(directory, '*.html'))
    for file in html_files:
        process_file(file)
        print(f"Processed {file}")

if __name__ == '__main__':
    main()
