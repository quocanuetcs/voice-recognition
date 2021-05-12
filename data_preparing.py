import librosa
import preprocessing
import numpy as np

DEFAULT_SR = 22050
TIME_LIM = 10
DURATION_LIM = 60
N_MFCC = 13
MFCC_LEN_LIM = 700

def load_wav(file):
    audio = librosa.load(file, duration=DURATION_LIM)[0]
    t = len(audio) / DEFAULT_SR
    n = max(int(t / TIME_LIM), 1)
    offset = int(max(t - n * TIME_LIM, 0) / 2 * DEFAULT_SR)
    waveforms = []
    for i in range(n):
        waveforms.append(audio[offset+i*TIME_LIM*DEFAULT_SR:offset+(i+1)*TIME_LIM*DEFAULT_SR])
    return waveforms

def load_npy(file):
    return [np.load(file)]

def process_mfcc(waveform, fixed_length=True):
    mfcc = preprocessing.mfcc(waveform)
    if fixed_length:
        if len(mfcc) <= MFCC_LEN_LIM:
            fixed_mfcc = np.zeros((MFCC_LEN_LIM, N_MFCC), dtype=np.float32)
            fixed_mfcc[-len(mfcc):] = mfcc[:MFCC_LEN_LIM]
        else:
            dif = len(mfcc) - MFCC_LEN_LIM
            fixed_mfcc = mfcc[-MFCC_LEN_LIM:]
        mfcc = fixed_mfcc
    return mfcc

def process(audio_file):
    waveforms = []
    if audio_file.filename.endswith(".wav"):
        waveforms = load_wav(audio_file.file)
    elif audio_file.filename.endswith(".npy"):
        waveforms = load_npy(audio_file.file)
    mfccs = []
    for waveform in waveforms:
        mfccs.append(process_mfcc(waveform))
    return mfccs

def make_model_input(mfccs_1, mfccs_2):
    len_1 = len(mfccs_1)
    len_2 = len(mfccs_2)
    if len_1 < len_2:
        mfccs_2 = mfccs_2[(len_2 - len_1) // 2: (len_2 - len_1) // 2 + len_1]
    else:
        mfccs_1 = mfccs_1[(len_1 - len_2) // 2: (len_1 - len_2) // 2 + len_2]
    data = np.hstack((np.expand_dims(mfccs_1, axis=1), np.expand_dims(mfccs_2, axis=1)))
    return data