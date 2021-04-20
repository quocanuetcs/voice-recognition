import librosa

FRAME_SIZE = 512
HOP_LENGTH = 256

def mfcc(waveform):
    MFCCs = librosa.feature.mfcc(waveform, n_fft=FRAME_SIZE, hop_length=HOP_LENGTH, n_mfcc=13)
    return MFCCs.T