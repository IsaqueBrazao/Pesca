import os
import math
import subprocess

def create_cast_video():
    width = 1280
    height = 720
    fps = 24
    total_seconds = 4.2
    total_frames = int(fps * total_seconds)

    # 1. Read the base background image PPM
    subprocess.run(['ffmpeg', '-y', '-i', 'public/backgrounds/pixel_night_fishing.jpg', '-vf', f'scale={width}:{height}', '/tmp/bg_base.ppm'], check=True)

    with open('/tmp/bg_base.ppm', 'rb') as f:
        # Read PPM header
        header = b''
        while len(header.split()) < 4:
            line = f.readline()
            if not line.startswith(b'#'):
                header += line
        base_pixels = bytearray(f.read())

    # Start ffmpeg process to encode PPM frames directly to MP4
    ffmpeg_cmd = [
        'ffmpeg', '-y',
        '-f', 'image2pipe',
        '-vcodec', 'ppm',
        '-r', str(fps),
        '-i', '-',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-preset', 'fast',
        '-crf', '18',
        'public/videos/cast_night_fishing.mp4'
    ]

    p = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE)

    def set_pixel(buf, x, y, r, g, b):
        if 0 <= x < width and 0 <= y < height:
            idx = (int(y) * width + int(x)) * 3
            buf[idx] = r
            buf[idx+1] = g
            buf[idx+2] = b

    def blend_pixel(buf, x, y, r, g, b, alpha):
        if 0 <= x < width and 0 <= y < height:
            idx = (int(y) * width + int(x)) * 3
            buf[idx] = int(buf[idx] * (1 - alpha) + r * alpha)
            buf[idx+1] = int(buf[idx+1] * (1 - alpha) + g * alpha)
            buf[idx+2] = int(buf[idx+2] * (1 - alpha) + b * alpha)

    def draw_thick_line(buf, x0, y0, x1, y1, r, g, b, thickness=2, alpha=1.0):
        dx = abs(x1 - x0)
        dy = abs(y1 - y0)
        sx = 1 if x0 < x1 else -1
        sy = 1 if y0 < y1 else -1
        err = dx - dy
        cx, cy = x0, y0
        while True:
            for tx in range(-thickness//2, thickness//2 + 1):
                for ty in range(-thickness//2, thickness//2 + 1):
                    if alpha < 1.0:
                        blend_pixel(buf, cx + tx, cy + ty, r, g, b, alpha)
                    else:
                        set_pixel(buf, cx + tx, cy + ty, r, g, b)
            if cx == x1 and cy == y1:
                break
            e2 = 2 * err
            if e2 > -dy:
                err -= dy
                cx += sx
            if e2 < dx:
                err += dx
                cy += sy

    def draw_curve(buf, p0, p1, p2, r, g, b, steps=40, thickness=2, alpha=1.0):
        prev = p0
        for i in range(1, steps + 1):
            t = i / steps
            x = int((1-t)**2 * p0[0] + 2*(1-t)*t * p1[0] + t**2 * p2[0])
            y = int((1-t)**2 * p0[1] + 2*(1-t)*t * p1[1] + t**2 * p2[1])
            draw_thick_line(buf, prev[0], prev[1], x, y, r, g, b, thickness, alpha)
            prev = (x, y)

    # Key positions in 1280x720 space
    # Boat center is around x=440, y=550
    # Fisherman hand is at x=440, y=520
    # Bobber landing point is at x=780, y=540

    hand_x, hand_y = 440, 520
    landing_x, landing_y = 780, 545

    for frame_idx in range(total_frames):
        t = frame_idx / fps
        frame_buf = bytearray(base_pixels)

        # Subtle star twinkle & water shimmer
        twinkle_phase = t * 4.0
        for s in range(15):
            sx = int(120 + s * 70 + (s%3)*15)
            sy = int(80 + (s%5) * 35)
            brightness = int(180 + 75 * math.sin(twinkle_phase + s * 1.3))
            set_pixel(frame_buf, sx, sy, brightness, brightness, min(255, brightness + 20))
            set_pixel(frame_buf, sx+1, sy, brightness//2, brightness//2, brightness//2)
            set_pixel(frame_buf, sx, sy+1, brightness//2, brightness//2, brightness//2)

        # Animation states:
        if t < 0.6:
            # Phase 1: Ready pose (rod pulled back)
            tip_x = hand_x - 110
            tip_y = hand_y - 85
            # Draw fishing rod (dark brown/carbon with highlight)
            draw_thick_line(frame_buf, hand_x, hand_y, tip_x, tip_y, 40, 30, 25, 4)
            draw_thick_line(frame_buf, hand_x, hand_y, tip_x, tip_y, 140, 110, 80, 2)
            # Hanging line from tip down
            draw_thick_line(frame_buf, tip_x, tip_y, tip_x - 15, tip_y + 60, 200, 235, 255, 1, 0.8)

        elif t < 1.4:
            # Phase 2: Swing forward arc (0.6s to 1.4s)
            prog = (t - 0.6) / 0.8
            # Smooth ease-in-out swing
            angle = -math.pi * 0.75 + prog * (math.pi * 1.05) # From back to forward
            rod_len = 135
            tip_x = int(hand_x + math.cos(angle) * rod_len)
            tip_y = int(hand_y + math.sin(angle) * rod_len)

            # Draw curved flexing rod
            mid_bend_x = int(hand_x + math.cos(angle - 0.2) * (rod_len * 0.6))
            mid_bend_y = int(hand_y + math.sin(angle - 0.2) * (rod_len * 0.6))
            draw_curve(frame_buf, (hand_x, hand_y), (mid_bend_x, mid_bend_y), (tip_x, tip_y), 50, 40, 30, 30, 4)
            draw_curve(frame_buf, (hand_x, hand_y), (mid_bend_x, mid_bend_y), (tip_x, tip_y), 160, 130, 95, 30, 2)

            # Fishing line flying out in an arc
            if prog > 0.3:
                line_prog = (prog - 0.3) / 0.7
                lead_x = int(tip_x + (landing_x - tip_x) * line_prog)
                lead_y = int(tip_y + (landing_y - tip_y) * line_prog - math.sin(line_prog * math.pi) * 90)
                mid_line_x = int((tip_x + lead_x) / 2)
                mid_line_y = int(min(tip_y, lead_y) - 60 * (1 - line_prog))
                draw_curve(frame_buf, (tip_x, tip_y), (mid_line_x, mid_line_y), (lead_x, lead_y), 190, 230, 255, 30, 1, 0.9)
                # Bobber pixel at lead
                set_pixel(frame_buf, lead_x, lead_y, 240, 50, 50)
                set_pixel(frame_buf, lead_x, lead_y-1, 255, 255, 255)

        else:
            # Phase 3 & 4: Resting rod in hand + water splash ripples (1.4s to 4.2s)
            tip_x = hand_x + 95
            tip_y = hand_y - 25

            # Resting rod
            draw_thick_line(frame_buf, hand_x, hand_y, tip_x, tip_y, 40, 30, 25, 4)
            draw_thick_line(frame_buf, hand_x, hand_y, tip_x, tip_y, 140, 110, 80, 2)

            # Fishing line going from rod tip into landing spot
            line_ctrl_x = int((tip_x + landing_x) / 2)
            line_ctrl_y = int(landing_y + 15)
            draw_curve(frame_buf, (tip_x, tip_y), (line_ctrl_x, line_ctrl_y), (landing_x, landing_y), 180, 220, 255, 30, 1, 0.85)

            # Red/white bobber floating at landing spot
            bob_y = landing_y + int(math.sin(t * 3.5) * 2)
            for bx in range(-2, 3):
                set_pixel(frame_buf, landing_x + bx, bob_y - 2, 239, 68, 68)
                set_pixel(frame_buf, landing_x + bx, bob_y - 1, 255, 255, 255)
                set_pixel(frame_buf, landing_x + bx, bob_y, 239, 68, 68)

            # Water splash and concentric expanding ripples
            splash_time = t - 1.4
            # Concentric ripples expanding
            for r_idx in range(4):
                ripple_age = splash_time - r_idx * 0.45
                if ripple_age > 0 and ripple_age < 2.5:
                    rad_x = int(ripple_age * 48)
                    rad_y = int(ripple_age * 16)
                    alpha = max(0.0, 1.0 - (ripple_age / 2.5))
                    # Draw pixel ellipse for water ripple
                    num_pts = max(16, rad_x * 2)
                    for pt in range(num_pts):
                        ang = pt * (2 * math.pi / num_pts)
                        rx = int(landing_x + math.cos(ang) * rad_x)
                        ry = int(landing_y + math.sin(ang) * rad_y)
                        blend_pixel(frame_buf, rx, ry, 165, 243, 252, alpha * 0.75)
                        # Pixel reflection highlight
                        if ry > landing_y:
                            blend_pixel(frame_buf, rx, ry + 1, 103, 232, 249, alpha * 0.45)

            # Splash water droplets during the first 0.6s of impact
            if splash_time < 0.6:
                splash_prog = splash_time / 0.6
                for drop in range(8):
                    ang = -math.pi * 0.85 + drop * (math.pi * 0.7 / 7)
                    dist = splash_prog * (28 + (drop%3)*8)
                    dx = int(landing_x + math.cos(ang) * dist)
                    dy = int(landing_y + math.sin(ang) * dist + (splash_prog**2)*18)
                    blend_pixel(frame_buf, dx, dy, 255, 255, 255, 1.0 - splash_prog)
                    blend_pixel(frame_buf, dx+1, dy, 186, 230, 253, 0.8 * (1.0 - splash_prog))

        # Write PPM frame to ffmpeg stdin
        ppm_header = f"P6\n{width} {height}\n255\n".encode('ascii')
        p.stdin.write(ppm_header + frame_buf)

    p.stdin.close()
    p.wait()
    print("Video generation completed: public/videos/cast_night_fishing.mp4")

if __name__ == '__main__':
    create_cast_video()
