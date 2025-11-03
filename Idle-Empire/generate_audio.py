import wave
import struct
import math
import os

os.makedirs('assets/audio', exist_ok=True)

def generate_wave(filename, frequency_func, duration, volume=0.5, envelope=None):
    sample_rate = 44100
    num_samples = int(sample_rate * duration)
    
    with wave.open(f'assets/audio/{filename}', 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        
        for i in range(num_samples):
            t = float(i) / sample_rate
            freq = frequency_func(t)
            
            # Use sine wave
            value = math.sin(2.0 * math.pi * freq * t)
            
            # Apply envelope if provided
            env_mult = 1.0
            if envelope:
                env_mult = envelope(t, duration)
                
            # Scale to 16-bit integer
            sample = int(value * volume * env_mult * 32767.0)
            
            # Clip
            if sample > 32767: sample = 32767
            if sample < -32768: sample = -32768
            
            wav_file.writeframesraw(struct.pack('<h', sample))

# 1. Click (Soft short pop)
generate_wave('click.wav', 
              lambda t: 800, 
              0.05, 
              0.3, 
              lambda t, d: 1.0 - (t/d))

# 2. Cash (Coin register ding - fast arpeggio)
generate_wave('cash.wav', 
              lambda t: 1200 if t < 0.1 else 1600, 
              0.2, 
              0.4, 
              lambda t, d: math.exp(-t*15))

# 3. Match (Gem crafter clear - ascending sweep)
generate_wave('match.wav', 
              lambda t: 400 + (t*1000), 
              0.15, 
              0.4, 
              lambda t, d: math.sin(math.pi * (t/d)))

# 4. Pop (Aura Blast pop - quick descending sweep)
generate_wave('pop.wav', 
              lambda t: 1000 - (t*2000), 
              0.1, 
              0.3, 
              lambda t, d: 1.0 - (t/d))

# 5. Success/Win (Level up / Game complete - major chord arpeggio)
generate_wave('win.wav', 
              lambda t: 440 * (2 ** ((int(t*10)%4 * 4)/12)), 
              0.6, 
              0.4, 
              lambda t, d: 1.0 - (t/d))

# 6. Error (Deep buzz)
generate_wave('error.wav', 
              lambda t: 150 + math.sin(t*100)*20, 
              0.3, 
              0.5, 
              lambda t, d: 1.0 - (t/d))

print("Awesome retro sound effects generated in assets/audio/!")
