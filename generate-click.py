import numpy as np
import wave

def create_tone(filename, freq, duration, volume=0.5, sample_rate=44100):
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    tone = np.sin(freq * t * 2 * np.pi)
    audio = (tone * volume * 32767).astype(np.int16)
    with wave.open(filename, 'w') as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(sample_rate)
        f.writeframes(audio.tobytes())

# Bip: 880 Hz, 0.1s
create_tone('bip.wav', 880, 0.1)

# Click: 2000 Hz, 0.03s
create_tone('click.wav', 2000, 0.03)