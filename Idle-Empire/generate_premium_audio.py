import wave
import struct
import math
import os
import random

os.makedirs('assets/audio', exist_ok=True)
sample_rate = 44100

def generate_dsp_wave(filename, duration, osc_func, volume=0.5, attack_ms=10, decay_ms=50, sustain_vol=0.5, release_ms=100, lp_cutoff=20000):
    num_samples = int(sample_rate * duration)
    
    # Simple one-pole IIR lowpass filter
    dt = 1.0 / sample_rate
    rc = 1.0 / (2 * math.pi * lp_cutoff)
    alpha = dt / (rc + dt)
    last_sample = 0.0
    
    attack_samples = int(sample_rate * (attack_ms / 1000.0))
    decay_samples = int(sample_rate * (decay_ms / 1000.0))
    release_samples = int(sample_rate * (release_ms / 1000.0))
    sustain_samples = num_samples - attack_samples - decay_samples - release_samples
    if sustain_samples < 0:
        sustain_samples = 0
        
    with wave.open(f'assets/audio/{filename}', 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        
        for i in range(num_samples):
            t = float(i) / sample_rate
            
            # ADSR Envelope
            env_vol = 0.0
            if i < attack_samples:
                # Attack phase (linear ramp up)
                env_vol = i / attack_samples if attack_samples > 0 else 1.0
            elif i < attack_samples + decay_samples:
                # Decay phase (exponential decay down to sustain volume)
                progress = (i - attack_samples) / decay_samples
                env_vol = 1.0 - (1.0 - sustain_vol) * (1.0 - math.exp(-3 * progress))
            elif i < attack_samples + decay_samples + sustain_samples:
                # Sustain phase
                env_vol = sustain_vol
            else:
                # Release phase (exponential decay to 0)
                release_idx = i - (attack_samples + decay_samples + sustain_samples)
                if release_samples > 0:
                    progress = release_idx / release_samples
                    env_vol = sustain_vol * math.exp(-4 * progress)
                else:
                    env_vol = 0
            
            # Generate raw oscillator sample
            raw_sample = osc_func(t)
            
            # Apply low pass filter (reduces digital harshness)
            filtered_sample = last_sample + alpha * (raw_sample - last_sample)
            last_sample = filtered_sample
            
            # Apply envelope and master volume
            final_sample = filtered_sample * env_vol * volume
            
            # Scale to 16-bit int
            int_sample = int(final_sample * 32767.0)
            
            # Clip
            if int_sample > 32767: int_sample = 32767
            if int_sample < -32768: int_sample = -32768
            
            wav_file.writeframesraw(struct.pack('<h', int_sample))

# --- Oscillator Generators ---

# 1. Premium Click: A modern, thick pluk using FM synthesis (Sine carrier + Sine modulator)
def click_osc(t):
    carrier_freq = 600
    modulator_freq = 1200
    modulator_index = 2.0 * math.exp(-t * 30) # sharp FM sweep
    modulator = math.sin(2.0 * math.pi * modulator_freq * t)
    return math.sin(2.0 * math.pi * carrier_freq * t + modulator_index * modulator)

generate_dsp_wave('click.wav', 0.1, click_osc, volume=0.4, attack_ms=1, decay_ms=30, sustain_vol=0, release_ms=0, lp_cutoff=4000)

# 2. Premium Cash: Bright, sparkling arpeggio. Uses a mix of Square and Sine for harmonics.
def cash_osc(t):
    # Arpeggio sequence: C5, E5, G5, C6
    notes = [523.25, 659.25, 783.99, 1046.50]
    note_idx = int(t * 30) % len(notes)
    freq = notes[note_idx]
    
    # Mix sine (body) and square (sparkle)
    sine = math.sin(2.0 * math.pi * freq * t)
    square = 1.0 if math.sin(2.0 * math.pi * freq * t) > 0 else -1.0
    return (sine * 0.7) + (square * 0.3)

generate_dsp_wave('cash.wav', 0.25, cash_osc, volume=0.3, attack_ms=5, decay_ms=100, sustain_vol=0.2, release_ms=100, lp_cutoff=8000)

# 3. Premium Match: Rich glassy synth for combo clears. Uses Detuned Sawtooths.
def match_osc(t):
    # Ascending sweep
    base_freq = 400 + (t * 800)
    
    # Three detuned saws
    saw1 = 2.0 * (t * base_freq - math.floor(t * base_freq + 0.5))
    saw2 = 2.0 * (t * (base_freq * 1.01) - math.floor(t * (base_freq * 1.01) + 0.5))
    saw3 = 2.0 * (t * (base_freq * 0.99) - math.floor(t * (base_freq * 0.99) + 0.5))
    return (saw1 + saw2 + saw3) / 3.0

generate_dsp_wave('match.wav', 0.3, match_osc, volume=0.25, attack_ms=10, decay_ms=100, sustain_vol=0.4, release_ms=150, lp_cutoff=5000)

# 4. Premium Pop: Punchy, low-end heavy impact for shooting. (Noise + pitch-dropped sine)
def pop_osc(t):
    noise = random.uniform(-1.0, 1.0) * math.exp(-t * 50)
    
    freq = 800 * math.exp(-t * 20) # rapid drop
    sub = math.sin(2.0 * math.pi * freq * t)
    
    return (noise * 0.3) + (sub * 0.7)

generate_dsp_wave('pop.wav', 0.15, pop_osc, volume=0.4, attack_ms=1, decay_ms=50, sustain_vol=0, release_ms=0, lp_cutoff=3000)

# 5. Premium Win: Epic, wide chord with simulated reverb tail.
def win_osc(t):
    # Major 9th chord
    freqs = [440.0, 554.37, 659.25, 830.61]
    mix = 0.0
    for f in freqs:
        mix += math.sin(2.0 * math.pi * f * t)
        
    return mix / len(freqs)

generate_dsp_wave('win.wav', 1.0, win_osc, volume=0.3, attack_ms=30, decay_ms=400, sustain_vol=0.6, release_ms=500, lp_cutoff=6000)


# 6. Premium Error: Soft, muted interface thud instead of harsh buzzer.
def error_osc(t):
    freq = 150 * math.exp(-t * 10)
    # Triangle wave for softer tone
    tri = 2.0 * abs(2.0 * (t * freq - math.floor(t * freq + 0.5))) - 1.0
    return tri

generate_dsp_wave('error.wav', 0.2, error_osc, volume=0.4, attack_ms=5, decay_ms=50, sustain_vol=0.1, release_ms=100, lp_cutoff=800)

print("Premium DSP synthesis completed. Extracted 6 High-Fidelity .wav assets.")
