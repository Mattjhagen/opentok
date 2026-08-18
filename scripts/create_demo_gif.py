#!/usr/bin/env python3
import os
import math
from PIL import Image, ImageDraw, ImageFont

# Set up output paths
ARTIFACT_DIR = "/Users/matt/.gemini/antigravity-ide/brain/7e1fe791-4151-4127-b7e2-35dbecfdb1d4"
PUBLIC_GIF_PATH = "/Users/matt/Git_Projects/opentok/public/opentok-demo.gif"
ARTIFACT_GIF_PATH = os.path.join(ARTIFACT_DIR, "opentok-demo.gif")

WIDTH, HEIGHT = 900, 600
FONT_PATH = "/System/Library/Fonts/Supplemental/Arial.ttf"

def get_font(size, bold=False):
    try:
        if bold and os.path.exists("/System/Library/Fonts/Supplemental/Arial Bold.ttf"):
            return ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", size)
        return ImageFont.truetype(FONT_PATH, size)
    except:
        return ImageFont.load_default()

font_logo = get_font(20, True)
font_title = get_font(16, True)
font_body = get_font(13, False)
font_body_bold = get_font(13, True)
font_small = get_font(11, False)
font_large = get_font(24, True)

def draw_rounded_rect(draw, bbox, radius, fill=None, outline=None, width=1):
    draw.rounded_rectangle(bbox, radius=radius, fill=fill, outline=outline, width=width)

def draw_header(draw, active_nav=None):
    # Header bar
    draw.rectangle([0, 0, WIDTH, 54], fill=(13, 17, 28))
    draw.line([0, 54, WIDTH, 54], fill=(28, 38, 58), width=1)
    
    # Logo
    # Glowing logo icon
    draw.ellipse([24, 15, 48, 39], fill=(147, 51, 234))
    draw.ellipse([28, 19, 44, 35], fill=(6, 182, 212))
    draw.text((56, 16), "OpenTok", fill=(255, 255, 255), font=font_logo)
    
    # Search bar
    draw_rounded_rect(draw, [280, 11, 600, 43], radius=16, fill=(20, 27, 45), outline=(38, 50, 78))
    draw.text((310, 18), "Search videos, creators, or topics...", fill=(120, 135, 165), font=font_body)
    # Search magnifying glass icon
    draw.ellipse([292, 21, 302, 31], outline=(120, 135, 165), width=2)
    draw.line([300, 29, 306, 35], fill=(120, 135, 165), width=2)
    
    # Upload button
    btn_fill = (147, 51, 234) if active_nav != 'upload' else (168, 85, 247)
    draw_rounded_rect(draw, [630, 11, 730, 43], radius=16, fill=btn_fill)
    draw.text((648, 18), "+ Upload", fill=(255, 255, 255), font=font_body_bold)
    
    # Nav Icons (Chat, Bell, Settings, Profile)
    # Chat
    draw_rounded_rect(draw, [745, 13, 773, 41], radius=8, fill=(22, 30, 50))
    draw.ellipse([752, 20, 766, 34], outline=(180, 195, 220), width=2)
    
    # Bell
    draw_rounded_rect(draw, [785, 13, 813, 41], radius=8, fill=(22, 30, 50))
    draw.polygon([(799, 20), (791, 32), (807, 32)], outline=(180, 195, 220))
    # Red notification dot
    draw.ellipse([806, 16, 812, 22], fill=(239, 68, 68))
    
    # Settings Gear
    gear_bg = (35, 48, 80) if active_nav == 'settings' else (22, 30, 50)
    draw_rounded_rect(draw, [825, 13, 853, 41], radius=8, fill=gear_bg)
    draw.ellipse([834, 22, 844, 32], outline=(180, 195, 220), width=2)
    
    # User Profile Avatar
    draw.ellipse([865, 13, 893, 41], fill=(126, 34, 206), outline=(6, 182, 212), width=2)
    draw.text((875, 18), "M", fill=(255, 255, 255), font=font_body_bold)

def render_phone_player(draw, video_type, t, is_liked=False, like_count=124):
    # Player bounding box (centered 9:16 vertical player)
    px1, py1, px2, py2 = 300, 68, 600, 584
    
    # Player background shadow & border
    draw_rounded_rect(draw, [px1-2, py1-2, px2+2, py2+2], radius=20, outline=(40, 55, 85), width=2)
    draw_rounded_rect(draw, [px1, py1, px2, py2], radius=18, fill=(8, 10, 18))
    
    # Draw Video Content inside phone
    video_img = Image.new("RGBA", (300, 516), (8, 10, 18, 255))
    vdraw = ImageDraw.Draw(video_img)
    vw, vh = 300, 516
    
    if video_type == 'cyber':
        # CyberTok Neon Animation
        for y in range(0, vh, 30):
            yy = int((y + t * 40) % vh)
            alpha = int(100 + 40 * math.sin(t*3 + y*0.05))
            vdraw.line([0, yy, vw, yy], fill=(0, 242, 254, alpha), width=1)
        for x in range(0, vw, 30):
            vdraw.line([x, 0, x, vh], fill=(0, 242, 254, 40), width=1)
        
        # Center pulsing cyber rings
        cx, cy = vw // 2, vh // 2 - 30
        r1 = int(70 + 8 * math.sin(t * 4))
        r2 = int(50 + 6 * math.cos(t * 3))
        vdraw.ellipse([cx-r1, cy-r1, cx+r1, cy+r1], outline=(0, 242, 254, 220), width=3)
        vdraw.ellipse([cx-r2, cy-r2, cx+r2, cy+r2], outline=(255, 0, 128, 200), width=2)
        
        # Core text
        vdraw.text((cx - 65, cy - 14), "OPENTOK", fill=(255, 255, 255), font=font_title)
        vdraw.text((cx - 75, cy + 120), "⚡ Donations, Not Data", fill=(0, 242, 254), font=font_body_bold)
        
    elif video_type == 'matrix':
        # Matrix Code Stream
        chars = ["01", "<>", "{}", "[]", "const", "tok", "open", "true", "void", "=>"]
        for col in range(12):
            x = col * 25 + 10
            speed = (col % 4 + 2) * 50
            y_head = int((t * speed + col * 70) % (vh + 80)) - 40
            for j in range(8):
                y = y_head - j * 20
                if 0 <= y < vh:
                    c = chars[(col + j + int(t*5)) % len(chars)]
                    color = (255, 255, 255) if j == 0 else (0, 255, 128, max(40, 255 - j*30))
                    vdraw.text((x, y), c, fill=color, font=font_small)
        
        # Tech box
        draw_rounded_rect(vdraw, [30, 200, 270, 310], radius=10, fill=(10, 25, 20, 220), outline=(0, 255, 128), width=2)
        vdraw.text((80, 220), "< OPENTOK />", fill=(255, 255, 255), font=font_title)
        vdraw.text((65, 250), "100% Open Source", fill=(0, 255, 128), font=font_body_bold)
        vdraw.text((55, 275), "Zero Tracking Algorithm", fill=(160, 255, 200), font=font_small)
        
    elif video_type == 'visualizer':
        # Neon Sound Wave Visualizer
        cx, cy = vw // 2, vh // 2 - 40
        bars = 24
        for i in range(bars):
            angle = i * (2 * math.pi / bars) + t
            h_bar = int(25 + 25 * math.sin(i * 0.8 + t * 6) + 15 * math.cos(i * 1.5 - t * 4))
            r_in = 45
            x1 = cx + math.cos(angle) * r_in
            y1 = cy + math.sin(angle) * r_in
            x2 = cx + math.cos(angle) * (r_in + h_bar)
            y2 = cy + math.sin(angle) * (r_in + h_bar)
            col = (236, 72, 153) if i % 2 == 0 else (56, 189, 248)
            vdraw.line([x1, y1, x2, y2], fill=col, width=4)
        
        vdraw.ellipse([cx-35, cy-35, cx+35, cy+35], fill=(168, 85, 247, 180))
        vdraw.text((cx - 45, cy - 10), "VIBE CHECK", fill=(255, 255, 255), font=font_title)
        vdraw.text((cx - 70, cy + 120), "🎵 Creator First Feed", fill=(56, 189, 248), font=font_body_bold)

    elif video_type == 'synthwave':
        # Synthwave Retro Sunset
        # Sky gradient
        for y in range(0, int(vh * 0.65)):
            r = int(15 + (225 - 15) * (y / (vh * 0.65)))
            g = int(5 + (60 - 5) * (y / (vh * 0.65)))
            b = int(29 + (24 - 29) * (y / (vh * 0.65)))
            vdraw.line([0, y, vw, y], fill=(r, g, b))
        
        # Sun
        sun_cy = int(vh * 0.45)
        vdraw.ellipse([vw//2 - 60, sun_cy - 60, vw//2 + 60, sun_cy + 60], fill=(254, 240, 138))
        for i in range(4):
            sy = sun_cy + i * 10
            vdraw.line([vw//2 - 60, sy, vw//2 + 60, sy], fill=(20, 5, 30), width=2 + i)
        
        # Ground
        vdraw.rectangle([0, int(vh * 0.65), vw, vh], fill=(9, 1, 20))
        for x in range(-50, vw + 50, 35):
            vdraw.line([vw//2, int(vh * 0.65), x, vh], fill=(6, 182, 212), width=1)
        
        offset = int((t * 60) % 25)
        for y in range(int(vh * 0.65), vh, 16):
            vdraw.line([0, y + offset, vw, y + offset], fill=(6, 182, 212), width=1)
        
        vdraw.text((vw//2 - 50, 40), "OPENTOK", fill=(255, 255, 255), font=font_title)
        vdraw.text((vw//2 - 68, 65), "The Privacy App", fill=(254, 240, 138), font=font_small)

    # Paste video onto main draw image
    # Note: caller will paste video_img at (px1, py1)
    
    # Overlay Info on Video Bottom
    # User info
    vdraw.text((16, vh - 90), "@matt", fill=(255, 255, 255), font=font_body_bold)
    vdraw.ellipse([64, vh - 88, 74, vh - 78], fill=(6, 182, 212)) # verified badge
    vdraw.text((67, vh - 90), "✓", fill=(0, 0, 0), font=font_small)
    
    titles = {
        'cyber': "⚡ CyberTok: The Future of Privacy",
        'matrix': "💻 Code in Motion: 100% Open Source",
        'visualizer': "🎵 Pulse Wave: Creator Driven Vibes",
        'synthwave': "🌅 Retro Horizon: Clean Social Feed"
    }
    vdraw.text((16, vh - 68), titles.get(video_type, "OpenTok Video"), fill=(240, 240, 240), font=font_body)
    vdraw.text((16, vh - 46), "#privacy #opensource #creators", fill=(147, 197, 253), font=font_small)
    vdraw.text((16, vh - 26), "♫ OpenTok Original Sound - No Ads", fill=(180, 180, 180), font=font_small)

    # Right Action Buttons
    # Avatar
    vdraw.ellipse([vw - 46, vh - 230, vw - 14, vh - 198], fill=(147, 51, 234), outline=(255, 255, 255), width=2)
    vdraw.text((vw - 35, vh - 222), "M", fill=(255, 255, 255), font=font_body_bold)
    
    # Heart
    heart_color = (244, 63, 94) if is_liked else (255, 255, 255)
    vdraw.ellipse([vw - 44, vh - 180, vw - 16, vh - 152], fill=(20, 25, 35, 180))
    vdraw.polygon([(vw-30, vh-160), (vw-38, vh-172), (vw-22, vh-172)], fill=heart_color)
    vdraw.text((vw - 38, vh - 148), str(like_count), fill=(255, 255, 255), font=font_small)
    
    # Comment
    vdraw.ellipse([vw - 44, vh - 130, vw - 16, vh - 102], fill=(20, 25, 35, 180))
    vdraw.ellipse([vw - 38, vh - 124, vw - 22, vh - 108], outline=(255, 255, 255), width=2)
    vdraw.text((vw - 34, vh - 98), "42", fill=(255, 255, 255), font=font_small)
    
    # Share
    vdraw.ellipse([vw - 44, vh - 80, vw - 16, vh - 52], fill=(20, 25, 35, 180))
    vdraw.polygon([(vw-24, vh-68), (vw-36, vh-76), (vw-36, vh-60)], fill=(255, 255, 255))
    vdraw.text((vw - 34, vh - 48), "18", fill=(255, 255, 255), font=font_small)

    return video_img

def draw_algorithm_panel(draw):
    # Slide-over algorithm transparency modal
    draw_rounded_rect(draw, [40, 320, 270, 560], radius=16, fill=(16, 22, 38), outline=(6, 182, 212), width=2)
    draw.text((56, 335), "⚡ Algorithm Transparency", fill=(0, 242, 254), font=font_title)
    draw.line([56, 360, 254, 360], fill=(30, 42, 68), width=1)
    
    draw.text((56, 375), "Recommendation Score", fill=(180, 195, 220), font=font_small)
    draw.text((56, 392), "94% Match", fill=(52, 211, 153), font=font_large)
    
    # Progress bars
    metrics = [
        ("User Privacy Protection", 1.0, (52, 211, 153)),
        ("Content Quality Metric", 0.95, (6, 182, 212)),
        ("Chronological Recency", 0.90, (168, 85, 247)),
        ("Ad Tracker Bias", 0.0, (239, 68, 68)),
    ]
    
    y = 430
    for label, val, color in metrics:
        draw.text((56, y), label, fill=(200, 210, 230), font=font_small)
        # Bar BG
        draw_rounded_rect(draw, [56, y+16, 254, y+22], radius=3, fill=(30, 40, 60))
        if val > 0:
            draw_rounded_rect(draw, [56, y+16, 56 + int(198 * val), y+22], radius=3, fill=color)
        draw.text((220, y), f"{int(val*100)}%", fill=color, font=font_small)
        y += 30

def draw_comments_modal(draw):
    # Comments modal overlaid on player
    draw_rounded_rect(draw, [320, 280, 580, 570], radius=14, fill=(13, 17, 28), outline=(45, 60, 90), width=2)
    draw.text((340, 295), "Comments (42)", fill=(255, 255, 255), font=font_title)
    draw.text((555, 295), "✕", fill=(150, 160, 180), font=font_title)
    draw.line([320, 320, 580, 320], fill=(30, 40, 60), width=1)
    
    comments = [
        ("Alice", "@alice", "Finally a video app with ZERO trackers! 🔥"),
        ("Dev Guru", "@dev_guru", "UI animations are so clean 👌"),
        ("Matty", "@matt", "We live off donations, not data! 🙌"),
    ]
    
    cy = 330
    for name, handle, text in comments:
        draw.ellipse([335, cy, 355, cy+20], fill=(147, 51, 234))
        draw.text((342, cy+3), name[0], fill=(255, 255, 255), font=font_small)
        draw.text((362, cy), name, fill=(255, 255, 255), font=font_body_bold)
        draw.text((410, cy+1), handle, fill=(120, 135, 160), font=font_small)
        draw.text((362, cy+18), text, fill=(220, 230, 245), font=font_small)
        cy += 48
        
    # Input bar
    draw_rounded_rect(draw, [335, 525, 565, 555], radius=15, fill=(22, 30, 50), outline=(40, 55, 85))
    draw.text((350, 532), "Add a comment...", fill=(120, 135, 165), font=font_small)
    draw_rounded_rect(draw, [530, 528, 560, 552], radius=12, fill=(147, 51, 234))
    draw.text((540, 532), "↑", fill=(255, 255, 255), font=font_body_bold)

def draw_settings_modal(draw):
    draw_rounded_rect(draw, [250, 100, 650, 520], radius=16, fill=(15, 20, 34), outline=(147, 51, 234), width=2)
    draw.text((280, 125), "⚙️ User Settings & Privacy", fill=(255, 255, 255), font=font_title)
    draw.line([250, 155, 650, 155], fill=(35, 48, 75), width=1)
    
    settings = [
        ("🌙 AMOLED Dark Theme", "Maximum contrast & battery saving", True),
        ("🛡️ Zero-Knowledge Data Vault", "No advertiser trackers or pixel beacons", True),
        ("🔐 Two-Factor Authentication (2FA)", "Enhanced security for account protection", True),
        ("📲 PWA Offline Caching", "Watch downloaded videos without internet", True),
        ("🔔 Realtime Push Notifications", "Instant updates when creators upload", True)
    ]
    
    sy = 175
    for title, sub, toggle in settings:
        draw.text((280, sy), title, fill=(255, 255, 255), font=font_body_bold)
        draw.text((280, sy+18), sub, fill=(130, 145, 175), font=font_small)
        
        # Toggle Switch
        tx = 590
        draw_rounded_rect(draw, [tx, sy+4, tx+36, sy+22], radius=9, fill=(16, 185, 129) if toggle else (50, 60, 80))
        draw.ellipse([tx+18 if toggle else tx+2, sy+6, tx+34 if toggle else tx+18, sy+20], fill=(255, 255, 255))
        sy += 55
        
    draw_rounded_rect(draw, [520, 465, 625, 498], radius=8, fill=(147, 51, 234))
    draw.text((545, 474), "Save & Close", fill=(255, 255, 255), font=font_body_bold)

def draw_upload_modal(draw, is_uploading=False):
    draw_rounded_rect(draw, [250, 90, 650, 530], radius=16, fill=(15, 20, 34), outline=(6, 182, 212), width=2)
    draw.text((280, 115), "📹 Upload Video", fill=(255, 255, 255), font=font_title)
    draw.text((280, 138), "Upload a video or generate our creative demo presets.", fill=(130, 145, 175), font=font_small)
    
    # 1-Click Auto Upload Banner
    draw_rounded_rect(draw, [280, 160, 620, 200], radius=10, fill=(147, 51, 234))
    btn_text = "⏳ Uploading 4/4 Demos to Supabase..." if is_uploading else "🚀 Auto-Upload All 4 Demos (1-Click)"
    draw.text((310, 172), btn_text, fill=(255, 255, 255), font=font_body_bold)
    
    # Preset Grid
    presets = ["⚡ CyberTok Neon", "💻 Code Stream", "🎵 Neon Pulse", "🌅 Synthwave Sunset"]
    for i, p in enumerate(presets):
        bx = 280 + (i % 2) * 175
        by = 215 + (i // 2) * 40
        draw_rounded_rect(draw, [bx, by, bx+165, by+32], radius=6, fill=(25, 34, 55), outline=(45, 60, 90))
        draw.text((bx+12, by+8), p, fill=(200, 220, 250), font=font_small)
        
    # File Dropzone Box
    draw_rounded_rect(draw, [280, 305, 620, 385], radius=10, fill=(20, 28, 48), outline=(6, 182, 212), width=1)
    draw.text((370, 325), "📁 opentok-demo-video.webm (4.2 MB)", fill=(0, 242, 254), font=font_body_bold)
    draw.text((390, 348), "Ready to publish to OpenTok feed", fill=(140, 155, 185), font=font_small)
    
    # Title & Desc inputs
    draw_rounded_rect(draw, [280, 400, 620, 430], radius=6, fill=(22, 30, 50), outline=(40, 55, 85))
    draw.text((290, 408), "⚡ CyberTok: The Future of Privacy", fill=(255, 255, 255), font=font_small)
    
    draw_rounded_rect(draw, [280, 440, 620, 480], radius=6, fill=(22, 30, 50), outline=(40, 55, 85))
    draw.text((290, 448), "We live off donations, not data. Welcome to OpenTok!", fill=(180, 190, 210), font=font_small)
    
    # Upload Button
    draw_rounded_rect(draw, [510, 490, 620, 520], radius=8, fill=(6, 182, 212))
    draw.text((535, 498), "Upload Video", fill=(0, 0, 0), font=font_body_bold)

def create_frame(scene_type, t, is_liked=False, like_count=124, active_nav=None):
    # Main Canvas Background
    img = Image.new("RGB", (WIDTH, HEIGHT), (10, 13, 22))
    draw = ImageDraw.Draw(img)
    
    # Draw Background Glow Elements
    draw.ellipse([-100, 100, 300, 500], fill=(20, 15, 45))
    draw.ellipse([700, 200, 1050, 600], fill=(10, 35, 55))
    
    # Render Video Player inside Phone
    video_map = {
        'feed1': 'cyber',
        'algo': 'cyber',
        'feed2': 'matrix',
        'comments': 'matrix',
        'feed3': 'visualizer',
        'feed4': 'synthwave',
        'settings': 'synthwave',
        'upload': 'cyber'
    }
    vtype = video_map.get(scene_type, 'cyber')
    video_img = render_phone_player(draw, vtype, t, is_liked, like_count)
    img.paste(video_img, (300, 68))
    
    # Floating Algorithm Button (Bottom Left)
    draw_rounded_rect(draw, [40, 520, 165, 565], radius=22, fill=(147, 51, 234), outline=(0, 242, 254), width=1)
    draw.text((58, 533), "⚡ Algorithm", fill=(255, 255, 255), font=font_body_bold)
    
    # Left Sidebar Info Card
    draw_rounded_rect(draw, [40, 90, 250, 240], radius=14, fill=(15, 20, 34), outline=(35, 48, 75))
    draw.text((58, 105), "🌟 OpenTok Feed", fill=(255, 255, 255), font=font_title)
    draw.text((58, 132), "• 100% Privacy Focused", fill=(52, 211, 153), font=font_small)
    draw.text((58, 152), "• Zero Tracking / No Ads", fill=(52, 211, 153), font=font_small)
    draw.text((58, 172), "• Supabase Realtime Sync", fill=(6, 182, 212), font=font_small)
    draw.text((58, 192), "• PWA Offline Support", fill=(168, 85, 247), font=font_small)
    draw.text((58, 212), "• Community Funded", fill=(254, 240, 138), font=font_small)
    
    # Render Special Scene Modals
    if scene_type == 'algo':
        draw_algorithm_panel(draw)
    elif scene_type == 'comments':
        draw_comments_modal(draw)
    elif scene_type == 'settings':
        draw_settings_modal(draw)
    elif scene_type == 'upload':
        draw_upload_modal(draw, is_uploading=(t > 1.0))
        
    # Draw Header over everything
    draw_header(draw, active_nav)
    
    return img

def main():
    print("🎬 Generating OpenTok Walkthrough Animated GIF...")
    frames = []
    
    # Scene 1: Video 1 (CyberTok Neon) - 10 frames
    print("Rendering Scene 1: Video 1 (CyberTok Neon)...")
    for i in range(10):
        t = i * 0.15
        frames.append(create_frame('feed1', t))
        
    # Scene 2: Algorithm Transparency Panel - 8 frames
    print("Rendering Scene 2: Algorithm Transparency Panel...")
    for i in range(8):
        t = i * 0.15
        frames.append(create_frame('algo', t))
        
    # Scene 3: Scroll to Video 2 (Code Matrix) & Like Interaction - 10 frames
    print("Rendering Scene 3: Video 2 (Code Matrix) & Like Click...")
    for i in range(10):
        t = i * 0.15
        liked = i >= 4
        count = 125 if liked else 124
        frames.append(create_frame('feed2', t, is_liked=liked, like_count=count))
        
    # Scene 4: Comments Modal Open - 8 frames
    print("Rendering Scene 4: Comments Modal...")
    for i in range(8):
        t = i * 0.15
        frames.append(create_frame('comments', t, is_liked=True, like_count=125))
        
    # Scene 5: Scroll to Video 3 (Neon Visualizer) - 8 frames
    print("Rendering Scene 5: Video 3 (Neon Visualizer)...")
    for i in range(8):
        t = i * 0.15
        frames.append(create_frame('feed3', t, is_liked=False, like_count=89))
        
    # Scene 6: Scroll to Video 4 (Synthwave Sunset) - 8 frames
    print("Rendering Scene 6: Video 4 (Synthwave Sunset)...")
    for i in range(8):
        t = i * 0.15
        frames.append(create_frame('feed4', t, is_liked=False, like_count=210))
        
    # Scene 7: Settings & Privacy Controls - 8 frames
    print("Rendering Scene 7: Settings & Privacy...")
    for i in range(8):
        t = i * 0.15
        frames.append(create_frame('settings', t, active_nav='settings'))
        
    # Scene 8: 1-Click Upload & Demo Generator Modal - 10 frames
    print("Rendering Scene 8: 1-Click Upload & Demo Generator...")
    for i in range(10):
        t = i * 0.15
        frames.append(create_frame('upload', t, active_nav='upload'))
        
    print(f"Total frames created: {len(frames)}")
    
    # Save optimized GIF
    os.makedirs(os.path.dirname(PUBLIC_GIF_PATH), exist_ok=True)
    os.makedirs(ARTIFACT_DIR, exist_ok=True)
    
    print(f"Saving GIF to {PUBLIC_GIF_PATH}...")
    frames[0].save(
        PUBLIC_GIF_PATH,
        save_all=True,
        append_images=frames[1:],
        duration=180,  # 180ms per frame = smooth pace
        loop=0,
        optimize=True
    )
    
    print(f"Saving GIF copy to {ARTIFACT_GIF_PATH}...")
    frames[0].save(
        ARTIFACT_GIF_PATH,
        save_all=True,
        append_images=frames[1:],
        duration=180,
        loop=0,
        optimize=True
    )
    
    print("✅ GIF successfully generated!")

if __name__ == "__main__":
    main()
