import re
import os

def parse_features(filepath, section_start, section_end):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract the block
    start_idx = content.find(section_start)
    end_idx = content.find(section_end) if section_end else len(content)
    block = content[start_idx:end_idx]
    
    # Split into features (H3 tags)
    features = []
    parts = re.split(r'### (\d+)\.\s+(.*)', block)
    
    for i in range(1, len(parts), 3):
        num = parts[i]
        title = parts[i+1].strip()
        body = parts[i+2]
        
        # Parse table
        table_rows = []
        for line in body.split('\n'):
            if line.startswith('|') and not line.startswith('| Feature') and not line.startswith('|---'):
                cols = [c.strip() for c in line.split('|')[1:-1]]
                if len(cols) >= 2:
                    table_rows.append((cols[0], cols[1]))
        
        features.append({
            'id': f'section-{num}',
            'num': num,
            'title': title,
            'rows': table_rows
        })
        
    return features

def generate_html(features, title_html, side_title, screenshots):
    html = []
    html.append('  <section style="padding: 4rem 0;">')
    html.append('    <div class="docs-layout">')
    
    # Sidebar
    html.append('      <aside class="docs-sidebar">')
    html.append(f'        <h3>{side_title}</h3>')
    html.append('        <ul class="docs-nav">')
    for idx, f in enumerate(features):
        active = ' active' if idx == 0 else ''
        html.append(f'          <li><a href="#{f["id"]}" class="docs-nav-link{active}">{f["num"]}. {f["title"]}</a></li>')
    html.append('        </ul>')
    html.append('      </aside>')
    
    # Main Content
    html.append('      <main class="docs-content">')
    for f in features:
        html.append(f'        <div id="{f["id"]}" class="docs-section reveal-on-scroll">')
        html.append(f'          <h2>{f["num"]}. {f["title"]}</h2>')
        
        # Inject screenshots if mapped
        if f['num'] in screenshots:
            cap, src = screenshots[f['num']]
            html.append(f'''
            <div class="screenshot-container mb-2 reveal-on-scroll" data-caption="{cap}">
              <img src="{src}" alt="{cap}">
              <div class="screenshot-overlay"><span class="zoom-icon">[ ZOOM ]</span></div>
            </div>
            ''')
            
        html.append('          <div class="feature-grid">')
        for name, desc in f['rows']:
            html.append(f'            <div class="feature-item-card reveal-on-scroll">')
            html.append(f'              <h4>{name}</h4>')
            html.append(f'              <p>{desc}</p>')
            html.append(f'            </div>')
        html.append('          </div>')
        html.append('        </div>')
    html.append('      </main>')
    html.append('    </div>')
    html.append('  </section>')
    
    return '\n'.join(html)

def update_file(filename, new_section_html):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    start_idx = content.find('<section style="padding: 4rem 0;">')
    end_idx = content.find('<footer>')
    
    if start_idx == -1 or end_idx == -1:
        print(f"Could not find markers in {filename}")
        return
        
    new_content = content[:start_idx] + new_section_html + '\n\n  <!-- Footer -->\n  ' + content[end_idx:]
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(new_content)

def main():
    features_md = 'd:/personalproj/web/features.md'
    client_html = 'd:/personalproj/web/client.html'
    enterprise_html = 'd:/personalproj/web/enterprise.html'
    
    # Client Features
    client_features = parse_features(features_md, '## 🖥️ FilePilot Client', '## 🏢 FilePilot Enterprise')
    client_screens = {
        '1': ('Multi-Protocol Workspace', 'client/pasted-1783311139724-0.png'),
        '2': ('Advanced Search', 'client/detailed search.jpg'),
        '3': ('Permission Editor', 'client/filepermission.jpg'),
        '9': ('JS Macros', 'client/macros.jpg'),
        '12': ('Command Palette', 'client/command pallet.jpg'),
    }
    client_html_str = generate_html(client_features, 'Client Features', 'Client Features', client_screens)
    update_file(client_html, client_html_str)
    
    # Enterprise Features
    ent_features = parse_features(features_md, '## 🏢 FilePilot Enterprise', None)
    ent_screens = {
        '1': ('Setup Wizard', 'enterprise/setup.jpg'),
        '3': ('RBAC Policies', 'enterprise/rbac.jpg'),
        '6': ('Token Management', 'enterprise/tokenmangement.jpg'),
        '8': ('Audit Viewer', 'enterprise/auditviewer.jpg'),
        '13': ('Compliance Posture', 'enterprise/compliance.jpg'),
        '16': ('Admin Dashboard', 'enterprise/pasted-1783312015509-1.png'),
    }
    ent_html_str = generate_html(ent_features, 'Enterprise Features', 'Vault Features', ent_screens)
    update_file(enterprise_html, ent_html_str)

if __name__ == '__main__':
    main()
