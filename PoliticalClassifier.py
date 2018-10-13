from __future__ import print_function
import numpy as np
import os
import sys
from keras.preprocessing import sequence
from keras.models import model_from_json
from six.moves import cPickle

class PoliticalClassifier():
	def __init__(
			self,
			tokenizerFileName = 'tokenizer_data.pkl',
			maxFeatures = 40000,
			skipTopFeatures = 0,
			inputPath = os.path.dirname(os.path.abspath(__file__)),
			architectureFileName = 'architecture.json',
			weightsFileName = 'model_weights.pkl',
			reverse = True):
		self.tokenizerFileName = tokenizerFileName
		self.maxFeatures = maxFeatures
		self.skipTopFeatures = skipTopFeatures
		self.inputPath = inputPath
		self.architectureFileName = architectureFileName
		self.weightsFileName = weightsFileName
		self.reverse = reverse
		self.model, self.tokenizer = self.load_model_tokenizer()



	def oov_data(self, x_data, oov_char=2):
		if self.reverse:
			for x in x_data:
				x.reverse()

		# by convention, use 2 as OOV word
		# reserve 'index_from' (=3 by default) characters: 0 (padding), 1 (start), 2 (OOV)
		if oov_char is not None:
			return [[oov_char if (w >= self.maxFeatures or w <= self.skipTopFeatures) else w for w in x] for x in x_data]
		else:
			nX = []
			for x in x_data:
				nx = []
				for w in x:
					if w <= self.maxFeatures or w > self.skipTopFeatures:
						nx.append(w)
				nX.append(nx)
			return nX

	def load_model(self):
		# Load architecture
		architecture_path = os.path.join(self.inputPath, self.architectureFileName)
		if not os.path.exists(architecture_path):
			return None
		model = model_from_json(open(architecture_path).read())

		weights_path = os.path.join(self.inputPath, self.weightsFileName)
		if not os.path.exists(weights_path):
			return None
		model.load_weights(weights_path)
		return model

	def load_tokenizer(self):
		tokenizer_path = os.path.join(self.inputPath, self.tokenizerFileName)
		if not os.path.exists(tokenizer_path):
			return None
		return cPickle.load(open(tokenizer_path, 'rb'), encoding='latin1')

	def load_model_tokenizer(self):
		model_folder = self.inputPath
		if not os.path.isdir(model_folder):
			exit(1)
		model = self.load_model()
		tokenizer = self.load_tokenizer()
		return model, tokenizer

	def predict(self, text):
		tokenized_data = self.tokenizer.texts_to_sequences([text])
		x_oov = self.oov_data(tokenized_data)

		input_len = self.model.input_shape[1]
		x_pad = sequence.pad_sequences(x_oov, maxlen=input_len)

		prediction = self.model.predict_classes(x_pad, batch_size=32)
		proba = self.model.predict_proba(x_pad, batch_size=32)
		return float(proba)

if __name__ == '__main__':
	text = '@bradycanoe @48ONIRAM @TheSixFinger @jdotsett I started with "The Wild, The innocent" cause Spotify has their listing backwards & its good!'
	cfr = PoliticalClassifier()
	while True:
		print(cfr.predict(input("Tweet: ")))
