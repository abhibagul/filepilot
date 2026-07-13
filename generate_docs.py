import re
import os

def parse_features():
    features = []
    current_feature = None
    
    with open('features.md', 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    for line in lines:
        line = line.strip()
        if line.startswith('### '):
            if current_feature:
                features.append(current_feature)
            title_full = line[4:]
            match = re.match(r'^(\d+)\.\s*(.*)', title_full)
            if match:
                num = match.group(1)
                title = title_full
            else:
                num = str(len(features) + 1)
                title = title_full
            
            # Simple ID generation
            fid = f"section-{num}"
                
            current_feature = {
                'num': num,
                'title': title,
                'id': fid,
                'rows': []
            }
        elif line.startswith('|') and current_feature:
            parts = [p.strip() for p in line.split('|')]
            if len(parts) >= 3:
                name = parts[1]
                desc = parts[2]
                if name.replace('*', '') != 'Feature' and name != '---':
                    current_feature['rows'].append((name, desc))
                    
    if current_feature:
        features.append(current_feature)
        
    return features

def render_table(f, bg_class):
    html = []
    html.append(f'  <section id="{f["id"]}" class="marketing-section {bg_class} reveal-on-scroll" style="padding: 6rem 0;">')
    html.append('    <div class="container">')
    html.append('      <div class="section-header">')
    clean_title = re.sub(r'^\d+\.\s*', '', f["title"])
    html.append(f'        <h2 class="marketing-title">{clean_title}</h2>')
    html.append('        <div class="marketing-accent-line"></div>')
    html.append('      </div>')
    html.append('      <div class="table-container" style="max-width: 800px; margin: 0 auto;">')
    html.append('        <table>')
    html.append('          <thead>')
    html.append('            <tr><th>Feature</th><th>Description</th></tr>')
    html.append('          </thead>')
    html.append('          <tbody>')
    for name, desc in f['rows']:
        display_name = name.replace('*', '')
        html.append(f'            <tr><td><strong>{display_name}</strong></td><td>{desc}</td></tr>')
    html.append('          </tbody>')
    html.append('        </table>')
    html.append('      </div>')
    html.append('    </div>')
    html.append('  </section>')
    return html

def render_z_pattern(f, bg_class, screenshots, reverse=False):
    html = []
    html.append(f'  <section id="{f["id"]}" class="story-section {bg_class}" style="padding: 6rem 0;">')
    html.append('    <div class="story-timeline-node reveal-on-scroll"></div>')
    html.append('    <div class="container" style="position: relative; z-index: 2;">')
    
    rev_class = "reverse" if reverse else ""
    html.append(f'      <div class="story-grid {rev_class}">')
    
    # Image half
    cap, src = screenshots.get(f['num'], ("Feature Screenshot", "client/pasted-1783311139724-0.png"))
    html.append('        <div class="story-image reveal-on-scroll">')
    html.append(f'          <div class="screenshot-showcase" data-caption="{cap}">')
    html.append(f'            <img src="{src}" alt="{cap}">')
    html.append('            <div class="screenshot-overlay"><span class="zoom-icon">[ ZOOM ]</span></div>')
    html.append('          </div>')
    html.append('        </div>')
    
    # Text half
    html.append('        <div class="story-content reveal-on-scroll">')
    clean_title = re.sub(r'^\d+\.\s*', '', f["title"])
    html.append(f'          <h2 class="marketing-title" style="text-align: left; font-size: 2.2rem;">{clean_title}</h2>')
    html.append('          <div class="marketing-accent-line" style="margin: 0 0 2rem 0;"></div>')
    
    # Render features as a 2-column checklist using the bento-grid class
    html.append('          <div class="bento-grid">')
    for name, desc in f['rows']:
        display_name = name.replace('*', '')
        html.append('            <div class="bento-card" style="padding: 1rem;">')
        html.append(f'              <div class="bento-card-header" style="margin-bottom: 0.25rem;"><i data-lucide="check" class="bento-icon"></i> <strong>{display_name}</strong></div>')
        html.append(f'              <div class="bento-desc" style="font-size: 0.8rem;">{desc}</div>')
        html.append('            </div>')
    html.append('          </div>')
    html.append('        </div>')
    
    html.append('      </div>')
    html.append('    </div>')
    html.append('  </section>')
    return html

def render_grid_3(f, bg_class):
    html = []
    html.append(f'  <section id="{f["id"]}" class="marketing-section {bg_class} reveal-on-scroll" style="padding: 6rem 0;">')
    html.append('    <div class="story-timeline-node reveal-on-scroll"></div>')
    html.append('    <div class="container" style="position: relative; z-index: 2;">')
    html.append('      <div class="section-header">')
    clean_title = re.sub(r'^\d+\.\s*', '', f["title"])
    html.append(f'        <h2 class="marketing-title">{clean_title}</h2>')
    html.append('        <div class="marketing-accent-line"></div>')
    html.append('      </div>')
    
    html.append('      <div class="grid-3" style="gap: 1.5rem;">')
    for name, desc in f['rows']:
        display_name = name.replace('*', '')
        html.append('        <div class="marketing-card" style="padding: 1.5rem; text-align: left;">')
        html.append(f'          <h3 style="margin-bottom: 0.5rem; color: var(--accent); font-family: var(--font-mono); font-size: 1.1rem;">{display_name}</h3>')
        html.append(f'          <p style="color: var(--text-secondary); font-size: 0.9rem;">{desc}</p>')
        html.append('        </div>')
    html.append('      </div>')
    
    html.append('    </div>')
    html.append('  </section>')
    return html

def render_bento(f, bg_class):
    html = []
    html.append(f'  <section id="{f["id"]}" class="marketing-section {bg_class} reveal-on-scroll" style="padding: 6rem 0;">')
    html.append('    <div class="story-timeline-node reveal-on-scroll"></div>')
    html.append('    <div class="container" style="position: relative; z-index: 2;">')
    html.append('      <div class="section-header">')
    clean_title = re.sub(r'^\d+\.\s*', '', f["title"])
    html.append(f'        <h2 class="marketing-title">{clean_title}</h2>')
    html.append('        <div class="marketing-accent-line"></div>')
    html.append('      </div>')
    
    html.append('      <div class="marketing-bento">')
    for i, (name, desc) in enumerate(f['rows']):
        display_name = name.replace('*', '')
        extra_class = ""
        if i == 0:
            extra_class = " highlight"
        elif i == 3 or i == 8:
            extra_class = " wide"
            
        html.append(f'        <div class="bento-feature{extra_class}">')
        html.append(f'          <h3>{display_name}</h3>')
        html.append(f'          <p>{desc}</p>')
        if extra_class == " highlight":
            html.append('          <div class="bento-visual"><i data-lucide="sparkles"></i></div>')
        html.append('        </div>')
    html.append('      </div>')
    
    html.append('    </div>')
    html.append('  </section>')
    return html

def render_banner(f, bg_class):
    html = []
    html.append(f'  <section id="{f["id"]}" class="marketing-section {bg_class} reveal-on-scroll" style="padding: 4rem 0;">')
    html.append('    <div class="container">')
    html.append('      <div style="background: linear-gradient(135deg, rgba(0,230,96,0.1) 0%, rgba(20,24,32,1) 100%); border: 1px solid rgba(0,230,96,0.3); border-radius: var(--radius-lg); padding: 3rem; text-align: center;">')
    clean_title = re.sub(r'^\d+\.\s*', '', f["title"])
    html.append(f'        <h2 style="font-size: 2.2rem; margin-bottom: 1.5rem; color: #fff;">{clean_title}</h2>')
    html.append('        <div class="grid-3" style="text-align: left; gap: 1.5rem; margin-top: 2rem;">')
    for name, desc in f['rows']:
        display_name = name.replace('*', '')
        html.append(f'          <div><strong style="color:var(--accent);">{display_name}:</strong> <span style="color:var(--text-secondary); font-size: 0.9rem;">{desc}</span></div>')
    html.append('        </div>')
    html.append('      </div>')
    html.append('    </div>')
    html.append('  </section>')
    return html

def generate_html(features, title_html, side_title, screenshots):
    html = []
    
    is_client = "Client" in side_title or "Client" in title_html
    z_pattern_count = 0
    
    for idx, f in enumerate(features):
        bg_class = 'bg-secondary' if idx % 2 != 0 else ''
        num = f['num']
        
        # Decide layout based on context and feature number
        if is_client:
            if num == "1":
                html.extend(render_table(f, bg_class))
            elif num == "2" or num == "5" or num == "7":
                z_pattern_count += 1
                html.extend(render_z_pattern(f, bg_class, screenshots, reverse=(z_pattern_count % 2 == 0)))
            elif num == "3":
                html.extend(render_grid_3(f, bg_class))
            elif num == "4":
                html.extend(render_bento(f, bg_class))
            elif num == "6":
                html.extend(render_banner(f, bg_class))
            else:
                html.extend(render_grid_3(f, bg_class))
        else:
            # Enterprise
            if num == "1":
                html.extend(render_bento(f, bg_class))
            elif num == "2" or num == "3" or num == "5":
                z_pattern_count += 1
                html.extend(render_z_pattern(f, bg_class, screenshots, reverse=(z_pattern_count % 2 == 0)))
            elif num == "4":
                html.extend(render_table(f, bg_class))
            else:
                html.extend(render_grid_3(f, bg_class))
    
    return '\n'.join(html)

def update_file(filename, features, title_html, side_title, screenshots):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
        
    html = generate_html(features, title_html, side_title, screenshots)
    
    # We replace everything from <!-- The Core Pillars to <!-- FAQ Section -->
    pattern = re.compile(r'(<!-- The Core Pillars.*?)(?=<!-- FAQ Section -->)', re.DOTALL | re.IGNORECASE)
    if pattern.search(content):
        new_content = pattern.sub(html + '\n\n  ', content)
    else:
        # fallback
        pattern_old = re.compile(r'(</section>\s*(?:<!--.*?-->\s*)*)(<section.*?</main>\s*</div>\s*</section>|<section id="section-1".*?)(?=\s*<!-- Footer -->|\s*<footer>|\s*<!-- FAQ Section -->)', re.DOTALL | re.IGNORECASE)
        if pattern_old.search(content):
            new_content = pattern_old.sub(r'\g<1>' + html + '\n\n  ', content)
        else:
            print(f"Could not find any hooks in {filename}")
            return
            
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Updated {filename}")

def main():
    features = parse_features()
    
    # Split features
    client_features = features[:7]
    ent_features = features[7:]
    
    # Screenshots
    client_screens = {
        '2': ('FilePilot Desktop Client Split Pane Workspace', 'client/pasted-1783311139724-0.png'),
        '3': ('Advanced File Search', 'client/detailed search.jpg'),
        '5': ('Folder Synchronization', 'client/sync.png'),
        '7': ('JavaScript Macro Editor', 'client/macros.jpg')
    }
    
    ent_screens = {
        '1': ('Enterprise Vault Dashboard', 'enterprise/dashboard.jpg'), # Using 1 for ent dashboard
        '2': ('Enterprise Vault Dashboard', 'enterprise/dashboard.jpg'),
        '3': ('User Access Management', 'enterprise/users.jpg'),
        '5': ('Compliance Audit Logs', 'enterprise/audit.jpg')
    }
    
    # Update Client
    update_file('client.html', client_features, 'Desktop Client', 'Client', client_screens)
    
    # Update Enterprise
    update_file('enterprise.html', ent_features, 'Enterprise Vault', 'Enterprise', ent_screens)

if __name__ == '__main__':
    main()
