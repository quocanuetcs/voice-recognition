import os
import tensorflow as tf
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, GRU, Dense, Dropout, concatenate
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping

class GRU_GRU:
    def __init__(self, num_features, encoder_shape=64, learning_rate=0.001):
        self.num_features = num_features
        self.encoder_shape = encoder_shape
        self.learning_rate = learning_rate
        
        self.classifier = self.build_classifier()
    
    def build_classifier(self):
        input_1 = Input(shape = (None, self.num_features))
        input_2 = Input(shape = (None, self.num_features))
        
        encoder_1 = GRU(self.encoder_shape, return_sequences=True)(input_1)
        encoder_11 = GRU(self.encoder_shape)(encoder_1)
            
        encoder_2 = GRU(self.encoder_shape, return_sequences=True)(input_2)
        encoder_22 = GRU(self.encoder_shape)(encoder_2)
            
        merge = concatenate([encoder_11, encoder_22], axis = 1)
        
        dense_1 = Dense(64, activation = "relu", kernel_initializer='glorot_uniform')(merge)
        dropout_1 = Dropout(0.3)(dense_1)
        dense_2 = Dense(1, activation ="sigmoid", kernel_initializer='glorot_uniform')(dropout_1)

        model = Model(inputs = [input_1, input_2], outputs = dense_2)
        model.compile(optimizer = Adam(self.learning_rate), loss = "binary_crossentropy", metrics = ["acc"])

        model.summary()
        return model
    
    def save_weights(self):
        self.classifier.save_weights('saved_model/gru_gru_weights.h5')
        
    def load_weights(self):
        self.classifier.load_weights('saved_model/gru_gru_weights.h5')
            
    def fit(self, X, y, epochs=50, early_stopping_rounds=7):
        X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.1, random_state=42)
        
        model_dir = './checkpoints/'
        callbacks = [
            tf.keras.callbacks.EarlyStopping(patience=early_stopping_rounds,
                                             monitor='val_acc',
                                             restore_best_weights=True),
            tf.keras.callbacks.ModelCheckpoint(filepath = os.path.join(model_dir, "weights-epoch{epoch:02d}-loss{val_loss:.2f}-acc{val_acc:.2f}.h5"),
                                              save_weights_only=True,
                                              monitor='val_acc',
                                              mode='max',
                                              save_best_only=True)
            ]
        
        history = self.classifier.fit(x=[X_train[:,0], X_train[:,1]],
                                      y=y_train,
                                      batch_size=32,
                                      epochs=epochs,
                                      verbose=1,
                                      callbacks=callbacks,
                                      validation_data=([X_val[:,0], X_val[:,1]], y_val)
                                     )
        return history
    
    def predict(self, X):
        return self.predict_proba(X) >= 0.5
    
    def predict_proba(self, X):
        y = self.classifier.predict([X[:,0], X[:,1]])
        return y