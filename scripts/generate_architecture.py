import matplotlib.pyplot as plt
import numpy as np
import matplotlib.patches as patches

# Configuration for high-end aesthetic (Structural Cartography)
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['Helvetica', 'Arial']

# Canvas setup
fig, ax = plt.subplots(figsize=(16, 12), facecolor='#0B0C10')
ax.set_facecolor('#0B0C10')
ax.set_aspect('equal')
ax.axis('off')

# Colors
COLOR_BG = '#0B0C10'
COLOR_LINE = '#1F2833'
COLOR_ACCENT1 = '#66FCF1'
COLOR_ACCENT2 = '#45A29E'
COLOR_TEXT = '#C5C6C7'

# Draw grid background
for i in range(0, 160, 2):
    ax.axvline(i/10, color=COLOR_LINE, linewidth=0.3, alpha=0.5)
    ax.axhline(i/10, color=COLOR_LINE, linewidth=0.3, alpha=0.5)
    
# Draw concentric circles to represent core system (Database & Auth)
core_x, core_y = 8, 6
for r in np.linspace(0.5, 4, 12):
    circle = patches.Circle((core_x, core_y), r, fill=False, edgecolor=COLOR_LINE, linewidth=1, alpha=0.7)
    ax.add_patch(circle)

# Draw central node
center_glow = patches.Circle((core_x, core_y), 0.8, fill=True, facecolor=COLOR_ACCENT1, alpha=0.1)
ax.add_patch(center_glow)
center_core = patches.Circle((core_x, core_y), 0.4, fill=True, facecolor=COLOR_ACCENT1, alpha=0.8)
ax.add_patch(center_core)
ax.text(core_x, core_y, 'POSTGRESQL\nPRISMA ORM', color=COLOR_BG, ha='center', va='center', fontsize=6, fontweight='bold')

# Draw orbital nodes (Microservices / Next.js modules)
nodes = [
    ('AUTH.TS', 4, 8),
    ('KNOWLEDGE\nAPI', 5, 3),
    ('INTERVIEW\nENGINE', 12, 7),
    ('CODE EDITOR', 11, 3),
    ('COZE AI', 13, 9),
    ('CAPABILITY\nRADAR', 3, 5),
    ('LEARN PATH', 8, 10.5),
    ('DASHBOARD', 8, 1.5)
]

for name, nx, ny in nodes:
    # Connecting lines
    ax.plot([core_x, nx], [core_y, ny], color=COLOR_ACCENT2, linewidth=0.6, alpha=0.6, linestyle='--')
    
    # Outer ring
    node_ring = patches.Circle((nx, ny), 0.6, fill=False, edgecolor=COLOR_ACCENT1, linewidth=1, alpha=0.5)
    ax.add_patch(node_ring)
    
    # Inner dot
    node_dot = patches.Circle((nx, ny), 0.1, fill=True, facecolor=COLOR_ACCENT1, alpha=0.8)
    ax.add_patch(node_dot)
    
    # Label
    ax.text(nx, ny - 0.8, name, color=COLOR_TEXT, ha='center', va='top', fontsize=6)

# Add abstract data flow lines (curved)
theta = np.linspace(0, 2*np.pi, 100)
for radius in [1.5, 2.8, 3.5]:
    x_flow = core_x + radius * np.cos(theta)
    y_flow = core_y + radius * np.sin(theta)
    ax.plot(x_flow, y_flow, color=COLOR_ACCENT2, linewidth=0.5, alpha=0.3)

# Add some geometric accents
for _ in range(30):
    rx, ry = np.random.uniform(1, 15), np.random.uniform(1, 11)
    ax.plot([rx, rx+0.1], [ry, ry], color=COLOR_TEXT, linewidth=1, alpha=0.4)
    ax.plot([rx, rx], [ry, ry+0.1], color=COLOR_TEXT, linewidth=1, alpha=0.4)

# Title / Metadata
ax.text(0.5, 11.5, 'SYSTEM ARCHITECTURE: MALLOC MENTOR', color=COLOR_TEXT, fontsize=10, fontweight='bold')
ax.text(0.5, 11.2, 'STRUCTURAL CARTOGRAPHY. FIG 01.', color=COLOR_ACCENT2, fontsize=6)
ax.text(0.5, 0.5, '01001101 01001101 00101101 01000001 01010010 01000011 01001000', color=COLOR_LINE, fontsize=5)

# Save high-res
plt.savefig('d:/Code/MallocMentor/figures/architecture.pdf', format='pdf', dpi=300, bbox_inches='tight', pad_inches=0.5)
plt.savefig('d:/Code/MallocMentor/figures/architecture.png', format='png', dpi=300, bbox_inches='tight', pad_inches=0.5)

print("Canvas successfully generated: architecture.pdf and architecture.png")
