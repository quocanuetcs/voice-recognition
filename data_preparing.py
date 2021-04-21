import librosa
import preprocessing
import numpy as np

DEFAULT_SR = 22050
TIME_LIM = 10
DURATION_LIM = 60
N_MFCC = 13
MFCC_LEN_LIM = 700

def load_audio_pair(file_1, file_2):
    audio_1 = librosa.load(file_1, duration=DURATION_LIM)[0]
    audio_2 = librosa.load(file_2, duration=DURATION_LIM)[0]
    t1 = len(audio_1) / DEFAULT_SR
    t2 = len(audio_2) / DEFAULT_SR
    n = max(int(min(t1 / TIME_LIM, t2 / TIME_LIM)), 1)
    offset_1 = int(max(t1 - n * TIME_LIM, 0) / 2 * DEFAULT_SR)
    offset_2 = int(max(t2 - n * TIME_LIM, 0) / 2 * DEFAULT_SR)
    waveforms_1 = []
    waveforms_2 = []
    for i in range(n):
        waveforms_1.append(audio_1[offset_1+i*TIME_LIM*DEFAULT_SR:offset_1+(i+1)*TIME_LIM*DEFAULT_SR])
        waveforms_2.append(audio_2[offset_2+i*TIME_LIM*DEFAULT_SR:offset_2+(i+1)*TIME_LIM*DEFAULT_SR])
    return waveforms_1, waveforms_2

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

def process(audio_file_1, audio_file_2, file_type="wav"):
    if file_type == "wav":
        waveforms_1, waveforms_2 = load_audio_pair(audio_file_1, audio_file_2)
    else:
        waveforms_1 = load_npy(audio_file_1)
        waveforms_2 = load_npy(audio_file_2)
    mfccs_1 = []
    mfccs_2 = []
    for waveform in waveforms_1:
        mfccs_1.append(process_mfcc(waveform))
    for waveform in waveforms_2:
        mfccs_2.append(process_mfcc(waveform))
    data = np.hstack((np.expand_dims(mfccs_1, axis=1), np.expand_dims(mfccs_2, axis=1)))
    return data