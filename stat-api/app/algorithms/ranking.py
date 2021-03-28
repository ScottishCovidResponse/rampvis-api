import sys
import logging as log
import numpy as np
from sklearn.metrics import jaccard_score
from sklearn.feature_extraction import text
from sklearn.metrics.pairwise import cosine_similarity, euclidean_distances
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.cluster import SpectralClustering
from sklearn.cluster import AgglomerativeClustering
from sklearn.cluster import Birch
from sklearn.cluster import MiniBatchKMeans

class Ranking():

    @staticmethod
    def pairwise_boolean_similarity(X, Y):
        '''
        Compute pairwise boolean (using euclidean distance) between X and Y
        X & Y are Bag of Words
        '''
        log.info(f'Ranking:pairwise_boolean_similarity: ')

        sim = 1 - euclidean_distances(X, Y)
        sim = sim.clip(min=0)
        return sim

    @staticmethod
    def pairwise_jaccard_similarity(X, Y):
        '''
        Compute pair-wise jaccard similarity between X and Y.
        X & Y are Bag of Words
        '''
        log.info(f'Ranking:pairwise_jaccard_similarity: len(X) = {len(X)}, len(Y) = {len(Y)}')
  
        sim = np.zeros(shape=(len(X), len(Y)))
        i = 0
        j = 0

        for item_x in X:
            for item_y in Y:
                sim[i][j] = jaccard_score(item_x, item_y)
                j += 1

            j = 0
            i += 1

        log.info(f'Ranking:pairwise_jaccard_similarity: complete')
        return sim

    @staticmethod
    def pairwise_cosine_similarity(X, Y):
        '''
        Compute pairwise cosine between X and Y
        X & Y are Bag of Words
        '''
        log.info(f'Ranking:pairwise_cosine_similarity: ')

        sim = cosine_similarity(X, Y)
        return sim

    @staticmethod
    def weighted_average(T, K, D=None, alpha=1, beta=0):
        '''
        '''
        log.info(f'Ranking:weighted_average: ')

        if D is not None:
            return T * (alpha * K + beta * D)
        else:
            return T * K

    @staticmethod
    def weighted_average2(K, D=None, alpha=1, beta=0):
        '''
        '''
        log.info(f'Ranking:weighted_average2: ')

        if D is not None:
            return alpha * K + beta * D
        else:
            return K
            

    @staticmethod
    def M1(examples, searched, must_keys=[], alpha=1, beta=0):
        '''
        a: Example data as array of OntoData object
        b: Search results as array of OntoData object
        Return:
        C: pair-wise similarity matrix
        '''
        # TODO: type and empty check

        log.info(f'Ranking:M1: alpha = {alpha}, beta = {beta}')

        data = np.concatenate((examples, searched))
        rows = len(examples)
        cols = len(searched)

        log.info(f'No. of example data streams: {rows}')
        log.info(f'No. of searched data streams: {cols} ')
        
        # log.info(f'Shape of concatinated data: {c.shape}')

        # For data-type field compute pair-wise similarity matrix
        datatype = [d['dataType'] for d in data]

        count_vectorizer = CountVectorizer(lowercase=True)
        bow = count_vectorizer.fit_transform(datatype)
        T = Ranking.pairwise_boolean_similarity(bow[0: rows], bow[rows:])

        # For keywords field compute pair-wise similarity matrix
        keywords = [d['keywords'] for d in data]

        count_vectorizer = CountVectorizer(
            lowercase=True, stop_words=text.ENGLISH_STOP_WORDS.union(must_keys))
        bow = count_vectorizer.fit_transform(keywords)
        K = Ranking.pairwise_jaccard_similarity(
            bow[0: rows].toarray(), bow[rows:].toarray())

        # For description field compute pair-wise similarity matrix
        D = None
        log.debug(f'beta = {beta}, type = {type(beta)}')
        if beta != 0:
            description = [d['description'] for d in data]
    
            tfidf_vectorizer = TfidfVectorizer(min_df=1, stop_words='english')
            bow = tfidf_vectorizer.fit_transform(description)
            D = Ranking.pairwise_cosine_similarity(bow[0: rows], bow[rows:])
            # TODO: to send possible error when description field is not empty

        # Weighted average
        M1 = Ranking.weighted_average(T, K, D, alpha, beta)
        return M1

    @staticmethod
    def M2(searched, stop_keys=[], alpha=1, beta=0):
        '''
        a: Example data as array of OntoData object
        b: Search results as array of OntoData object
        Return:
        C: pair-wise similarity matrix
        '''
        log.info(f'Ranking:M2: ')

        keywords = [d['keywords'] for d in searched]

        count_vectorizer = CountVectorizer(
            lowercase=True, stop_words=text.ENGLISH_STOP_WORDS.union(stop_keys))
        bow = count_vectorizer.fit_transform(keywords)
        #K = Ranking.pairwise_jaccard_similarity(bow.toarray(), bow.toarray())
        K = Ranking.pairwise_cosine_similarity(bow, bow)
        
        D = None
        if beta != 0:
            description = [d['description'] for d in searched]

            tfidf_vectorizer = TfidfVectorizer(min_df=1, stop_words='english')
            bow = tfidf_vectorizer.fit_transform(description)
            D = Ranking.pairwise_cosine_similarity(bow, bow)

        M2 = Ranking.weighted_average2(K, D, 1, 0)
        return M2

    @staticmethod
    def cluster(M2, n_clusters):
        log.info(f'Ranking:cluster: ')

        clustering = SpectralClustering(n_clusters=n_clusters).fit(M2)
        # clustering = AgglomerativeClustering(n_clusters=n_clusters, linkage='complete').fit(M2)
        # clustering = MiniBatchKMeans(n_clusters=n_clusters).fit(M2)
        return clustering.labels_

    @staticmethod
    def group_data_streams(M, streams, clusters):
        '''
        '''
        np.set_printoptions(threshold=sys.maxsize)
        log.info(f'Ranking:group_data_streams: clusters = {clusters}')
        log.info(f'Ranking:group_data_streams: len(M1) = {len(M)}')
        log.info(f'Ranking:group_data_streams: len(streams) = {len(streams)}')

        group_dict = dict()
        
        for i, d in enumerate(streams): 
            # ...
            vec = M[:,i]
            # The indices of the maximum values along an axis.
            idx = np.argmax(vec, axis=None, out=None) 
            score = vec[idx]
            
            #print(vec, idx, score)
            
            try:
                group_dict.get(clusters[i]).append({ **d, 'score': round(score, 3), 'idx': idx})
            except:
                group_dict.setdefault(clusters[i], [{ **d, 'score': round(score, 3), 'idx': idx}])
        
        groups = []
        for k in group_dict:
            group = group_dict[k]
            group = sorted(group, key=lambda k: k['idx']) 
            group_score = sum(d['score'] for d in group)
            groups.append({ 'score': round(group_score, 3), 'group': group })

        groups.sort(key=lambda x: x['score'], reverse=True)
        log.info(f'Ranking:group_data_streams: len(groups) = {len(groups)}')   
        return groups
