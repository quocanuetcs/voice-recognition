import librosa
import preprocessing
import numpy as np

N_MFCC = 13
TIME_LENGTH = 1000

def load_audio(file):
    return librosa.load(file)[0]

def load_npy(file):
    return np.load(file)

def process_mfcc(waveform, fixed_length=True):
    mfcc = preprocessing.mfcc(waveform)
    if fixed_length:
        if len(mfcc) <= TIME_LENGTH:
            fixed_mfcc = np.zeros((TIME_LENGTH, N_MFCC), dtype=np.float32)
            fixed_mfcc[-len(mfcc):] = mfcc[:TIME_LENGTH]
        else:
            dif = len(mfcc) - TIME_LENGTH
            fixed_mfcc = mfcc[dif // 2: dif // 2 + TIME_LENGTH]
        mfcc = fixed_mfcc
    return mfcc

def process(audio_file_1, audio_file_2, fixed_length=True, file_type="wav"):
    if file_type == "wav":
        waveform_1 = load_audio(audio_file_1)
        waveform_2 = load_audio(audio_file_2)
    else:
        waveform_1 = load_npy(audio_file_1)
        waveform_2 = load_npy(audio_file_2)
    mfcc_1 = process_mfcc(waveform_1, fixed_length)
    mfcc_2 = process_mfcc(waveform_2, fixed_length)
    if len(mfcc_1) != len(mfcc_2):
        l = min(len(mfcc_1), len(mfcc_2))
        mfcc_1 = mfcc_1[:l]
        mfcc_2 = mfcc_2[:l]
    data = np.array([[mfcc_1, mfcc_2]])
    return data