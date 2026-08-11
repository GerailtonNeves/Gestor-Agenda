// Utilitário de Som de Campainha (Ding-Dong / Doorbell) com Web Audio API Sintetizada

export function playNotificationSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Função para gerar uma nota de sino/campainha com harmônicos metálicos
    const playBellTone = (freq, duration, delay, volume = 0.4) => {
      const startTime = ctx.currentTime + delay;

      // Nota fundamental (Senoidal pura da campainha)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, startTime);

      gain1.gain.setValueAtTime(volume, startTime);
      gain1.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(startTime);
      osc1.stop(startTime + duration);

      // Harmônico superior metálico (Dá o tom cristalino de campainha de porta)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2.4, startTime);

      gain2.gain.setValueAtTime(volume * 0.25, startTime);
      gain2.gain.exponentialRampToValueAtTime(0.0001, startTime + (duration * 0.5));

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(startTime);
      osc2.stop(startTime + (duration * 0.5));
    };

    // SOM DE CAMPAINHA REALISTA ("DING - DONG"):
    // 1. "DING" -> Mi 5 (659.25 Hz)
    playBellTone(659.25, 0.7, 0, 0.45);

    // 2. "DONG" -> Dó 5 (523.25 Hz) com ressonância longa
    playBellTone(523.25, 1.2, 0.38, 0.5);

  } catch (e) {
    console.warn("Áudio de campainha não pôde ser reproduzido automaticamente:", e);
  }
}
