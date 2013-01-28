import nltk
text1 = nltk.Text(nltk.word_tokenize(text.lower().replace('.', ' ')))

freq = FreqDist(text1)
keys = freq.keys()[:200]
str = ""
for k in keys:
	str = str + k +'\n'

open('stopwords', 'r+').write(str)