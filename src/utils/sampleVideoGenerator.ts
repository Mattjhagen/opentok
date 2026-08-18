// Utility to generate synthetic vertical 9:16 demo videos directly in the browser

export interface DemoPreset {
  name: string;
  title: string;
  description: string;
  render: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void;
}

export const DEMO_PRESETS: Record<string, DemoPreset> = {
  cyberNeon: {
    name: '⚡ CyberTok Neon',
    title: '⚡ CyberTok: The Future of Privacy',
    description: 'We live off donations, not data. Welcome to OpenTok — transparent, open source, and creator-driven.',
    render: (ctx, w, h, t) => {
      ctx.fillStyle = '#050713';
      ctx.fillRect(0, 0, w, h);

      // Glowing grid
      ctx.strokeStyle = `rgba(0, 242, 254, ${0.2 + Math.sin(t * 3) * 0.08})`;
      ctx.lineWidth = 2;
      for (let y = 0; y < h; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y + (t * 50 % 60));
        ctx.lineTo(w, y + (t * 50 % 60));
        ctx.stroke();
      }
      for (let x = 0; x < w; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Center glowing orb
      const grad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, 260);
      grad.addColorStop(0, '#00f2fe');
      grad.addColorStop(0.4, '#9055ff');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 220 + Math.sin(t * 4) * 20, 0, Math.PI * 2);
      ctx.fill();

      // Rotating cyber rings
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(t * 1.5);
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 6;
      ctx.setLineDash([40, 20]);
      ctx.beginPath();
      ctx.arc(0, 0, 160, 0, Math.PI * 2);
      ctx.stroke();

      ctx.rotate(-t * 2.5);
      ctx.strokeStyle = '#ff007f';
      ctx.setLineDash([20, 15]);
      ctx.beginPath();
      ctx.arc(0, 0, 120, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Floating particles
      for (let i = 0; i < 30; i++) {
        const px = (Math.sin(i * 99 + t) * 0.5 + 0.5) * w;
        const py = ((i * 45 - t * 120) % h + h) % h;
        ctx.fillStyle = i % 2 === 0 ? '#00f2fe' : '#ff007f';
        ctx.beginPath();
        ctx.arc(px, py, (i % 4) + 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Typography
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 50px system-ui';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 20;
      ctx.fillText('OPENTOK', w / 2, h / 2 - 340);
      ctx.font = '28px system-ui';
      ctx.fillStyle = '#00f2fe';
      ctx.fillText('Privacy First Video Sharing', w / 2, h / 2 - 290);

      ctx.font = 'bold 34px system-ui';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ff007f';
      ctx.shadowBlur = 15;
      ctx.fillText('⚡ Donations, Not Data', w / 2, h / 2 + 380);
      ctx.shadowBlur = 0;
    }
  },

  codeMatrix: {
    name: '💻 Code Stream',
    title: '💻 Code in Motion: 100% Open Source',
    description: 'Built with React, Vite, TailwindCSS, and Supabase. No tracker cookies, no ad profiling.',
    render: (ctx, w, h, t) => {
      ctx.fillStyle = 'rgba(5, 12, 10, 0.3)';
      ctx.fillRect(0, 0, w, h);

      const matrixChars = '01OPENTOK<>{}[]!@#$%^&*=+~:;|';
      ctx.font = 'bold 24px monospace';
      const cols = 24;
      const colWidth = w / cols;
      for (let i = 0; i < cols; i++) {
        const speed = (i % 5 + 3) * 35;
        const yHead = ((t * speed + i * 180) % (h + 200)) - 100;
        for (let j = 0; j < 15; j++) {
          const y = yHead - j * 26;
          if (y > 0 && y < h) {
            const char = matrixChars[Math.floor(Math.abs(Math.sin(i * 77 + j + t * 10)) * matrixChars.length) % matrixChars.length];
            if (j === 0) {
              ctx.fillStyle = '#ffffff';
            } else {
              ctx.fillStyle = `rgba(0, 255, 128, ${1 - j / 15})`;
            }
            ctx.fillText(char, i * colWidth + 10, y);
          }
        }
      }

      ctx.fillStyle = 'rgba(10, 25, 20, 0.85)';
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 25;
      ctx.strokeRect(w / 2 - 260, h / 2 - 140, 520, 280);
      ctx.fillRect(w / 2 - 260, h / 2 - 140, 520, 280);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('<OPENTOK />', w / 2, h / 2 - 50);
      ctx.font = '26px monospace';
      ctx.fillStyle = '#00ff88';
      ctx.fillText('100% OPEN SOURCE', w / 2, h / 2 + 10);
      ctx.fillStyle = '#88ffbb';
      ctx.font = '20px monospace';
      ctx.fillText('ZERO TRACKING ALGORITHM', w / 2, h / 2 + 70);
      ctx.shadowBlur = 0;
    }
  },

  soundWave: {
    name: '🎵 Neon Pulse',
    title: '🎵 Pulse Wave: Creator Driven Vibes',
    description: 'An open algorithmic feed where transparency is front and center. Check your algorithm metrics anytime!',
    render: (ctx, w, h, t) => {
      ctx.fillStyle = '#0a0818';
      ctx.fillRect(0, 0, w, h);

      const grad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, 400);
      grad.addColorStop(0, `rgba(168, 85, 247, ${0.4 + Math.sin(t * 5) * 0.2})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      const bars = 48;
      ctx.save();
      ctx.translate(w / 2, h / 2);
      for (let i = 0; i < bars; i++) {
        const barHeight = 40 + Math.sin(i * 0.8 + t * 8) * 80 + Math.cos(i * 1.5 - t * 4) * 60;
        ctx.rotate(Math.PI * 2 / bars);
        const barGrad = ctx.createLinearGradient(0, 120, 0, 120 + barHeight);
        barGrad.addColorStop(0, '#ec4899');
        barGrad.addColorStop(0.5, '#a855f7');
        barGrad.addColorStop(1, '#38bdf8');
        ctx.fillStyle = barGrad;
        ctx.fillRect(-6, 120, 12, Math.max(10, barHeight));
      }
      ctx.restore();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 50px system-ui';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 20;
      ctx.fillText('VIBE CHECK', w / 2, h / 2 - 320);
      ctx.font = '28px system-ui';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('Creators First Platform', w / 2, h / 2 + 360);
      ctx.shadowBlur = 0;
    }
  },

  synthSunset: {
    name: '🌅 Synthwave Sunset',
    title: '🌅 Retro Horizon: Clean Social Feed',
    description: 'Throwing it back to the golden age of creative video sharing. Fast, lightweight, and community funded.',
    render: (ctx, w, h, t) => {
      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.65);
      sky.addColorStop(0, '#0f051d');
      sky.addColorStop(0.5, '#3b0764');
      sky.addColorStop(0.85, '#e11d48');
      sky.addColorStop(1, '#fbbf24');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h * 0.65);

      const sunGrad = ctx.createLinearGradient(w / 2, h * 0.35, w / 2, h * 0.65);
      sunGrad.addColorStop(0, '#fef08a');
      sunGrad.addColorStop(0.6, '#f43f5e');
      sunGrad.addColorStop(1, '#881337');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.5, 180, 0, Math.PI, true);
      ctx.fill();

      ctx.fillStyle = '#0f051d';
      for (let i = 0; i < 6; i++) {
        const y = h * 0.48 + i * 18;
        ctx.fillRect(w / 2 - 180, y, 360, 4 + i * 2);
      }

      ctx.fillStyle = '#180728';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.65);
      ctx.lineTo(120, h * 0.56);
      ctx.lineTo(260, h * 0.63);
      ctx.lineTo(420, h * 0.54);
      ctx.lineTo(580, h * 0.62);
      ctx.lineTo(w, h * 0.57);
      ctx.lineTo(w, h * 0.65);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#090114';
      ctx.fillRect(0, h * 0.65, w, h * 0.35);

      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;

      for (let x = -w * 0.5; x <= w * 1.5; x += 100) {
        ctx.beginPath();
        ctx.moveTo(w / 2, h * 0.65);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      const gridOffset = (t * 80) % 50;
      for (let y = h * 0.65; y < h; y += Math.pow((y - h * 0.65) / 4, 1.2) + 15) {
        ctx.beginPath();
        ctx.moveTo(0, y + gridOffset * ((y - h * 0.65) / 150));
        ctx.lineTo(w, y + gridOffset * ((y - h * 0.65) / 150));
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#ffffff';
      ctx.font = 'italic bold 52px system-ui';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 25;
      ctx.fillText('OPENTOK', w / 2, 140);
      ctx.font = '24px system-ui';
      ctx.fillStyle = '#fef08a';
      ctx.fillText('The Transparent Video App', w / 2, 190);
      ctx.shadowBlur = 0;
    }
  }
};

/**
 * Synthesizes a vertical WebM video file in the browser using HTML5 Canvas & MediaRecorder
 */
export async function generateDemoVideoFile(
  presetKey: keyof typeof DEMO_PRESETS = 'cyberNeon',
  durationSeconds: number = 4
): Promise<{ file: File; title: string; description: string }> {
  const preset = DEMO_PRESETS[presetKey] || DEMO_PRESETS.cyberNeon;
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 1280;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not supported');

  const stream = canvas.captureStream(30);
  let mimeType = 'video/webm;codecs=vp9';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm;codecs=vp8';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }
  }

  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2500000 });
  const chunks: BlobPart[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  return new Promise((resolve, reject) => {
    recorder.onerror = (err) => reject(err);

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const filename = `opentok-${presetKey}-${Date.now()}.webm`;
      const file = new File([blob], filename, { type: 'video/webm' });
      resolve({
        file,
        title: preset.title,
        description: preset.description,
      });
    };

    recorder.start();
    const startTime = performance.now();
    const durationMs = durationSeconds * 1000;

    function render(now: number) {
      const elapsed = now - startTime;
      const t = elapsed / 1000;
      preset.render(ctx!, 720, 1280, t);

      if (elapsed < durationMs) {
        requestAnimationFrame(render);
      } else {
        recorder.stop();
      }
    }

    requestAnimationFrame(render);
  });
}
