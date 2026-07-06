import os
import glob

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove old script
    content = content.replace('<script src="js/bg-animation.js"></script>', '')
    
    # Add new background elements if not present
    if 'id="premium-bg-mesh"' not in content:
        replacement = '  <div id="premium-bg-mesh"></div>\n  <div id="grain-overlay"></div>\n</body>'
        content = content.replace('</body>', replacement)

    # Add specific scripts
    filename = os.path.basename(filepath)
    script_str = ""
    # Clear out any old tags if switching
    content = content.replace('<script src="js/letter-glitch.js"></script>', '')
    content = content.replace('<script src="js/data-stream.js"></script>', '')
    content = content.replace('<script src="js/lightfall.js"></script>', '')
    content = content.replace('<script src="js/aurora.js"></script>', '')
    content = content.replace('<script src="js/data-tunnel.js"></script>', '')
    content = content.replace('<script src="js/matrix-world.js"></script>', '')
    
    if filename == "index.html":
        script_str = '<script src="js/hyperspeed.js"></script>'
    elif filename == "client.html":
        script_str = '<script src="js/matrix-world.js"></script>'
    elif filename == "enterprise.html":
        script_str = '<script src="js/letter-glitch.js"></script>'

    if script_str and script_str not in content:
        content = content.replace('</body>', f'  {script_str}\n</body>')

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
