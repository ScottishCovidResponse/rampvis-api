import sys
from loguru import logger
import numpy as np
from sklearn.metrics import jaccard_score
from sklearn.feature_extraction import text
from sklearn.metrics.pairwise import cosine_similarity, euclidean_distances
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.cluster import SpectralClustering


class Propagation:
    @staticmethod
    def pairwise_boolean_similarity(X, Y):
        """
        Compute pairwise boolean (using euclidean distance) between X and Y
        X & Y are Bag of Words
        """
        logger.info(
            f"Computing pairwise boolean similarity; shape of X: {X.shape}, Y: {Y.shape}"
        )

        sim = 1 - euclidean_distances(X, Y)
        sim = sim.clip(min=0)
        return sim

    @staticmethod
    def pairwise_jaccard_similarity(X, Y):
        """
        Compute pair-wise jaccard similarity between X and Y.
        X & Y are Bag of Words
        """
        logger.info(
            f"Computing pairwise jaccard similarity; shape of X: {X.shape}, Y: {Y.shape}"
        )

        result = np.zeros(shape=(len(X), len(Y)))
        i = 0
        j = 0

        for item_x in X:
            for item_y in Y:
                result[i][j] = jaccard_score(item_x, item_y, average="micro")
                j += 1

            j = 0
            i += 1

        logger.info(f"Computed pairwise jaccard similarity; len(sim) = {len(result)}")
        return result

    @staticmethod
    def pairwise_cosine_similarity(X, Y):
        """
        Compute pairwise cosine between X and Y
        X & Y are Bag of Words
        """
        logger.info(
            f"Computing pairwise cosine similarity; shape of X: {X.shape}, Y: {Y.shape}"
        )

        sim = cosine_similarity(X, Y)
        return sim

    @staticmethod
    def weighted_average(T, K, D=None, alpha=1, beta=0):
        """ """
        logger.info(
            f"Computing weighted average (1); len(T) = {len(T)}, len(K) = {len(K)}, len(D) = {len(D)}, alpha={alpha}, beta={beta}"
        )

        if D is not None:
            return T * (alpha * K + beta * D)
        else:
            return T * K

    @staticmethod
    def weighted_average2(K, D=None, alpha=1, beta=0):
        """ """
        logger.info(
            f"Computing weighted average(2); len(K) = {len(K)}, len(D) = {len(D)}, alpha={alpha}, beta={beta}"
        )

        if D is not None:
            return alpha * K + beta * D
        else:
            return K

    @staticmethod
    def Srd(reference, discovered, must_keys=[], alpha=1, beta=0):
        """
        a: Example data as array of OntoData object
        b: Search results as array of OntoData object
        Return:
        C: pair-wise similarity matrix
        """
        # TODO: type and empty check

        logger.info(f"Computing Srd; alpha = {alpha}, beta = {beta}")

        data = np.concatenate((reference, discovered))
        rows = len(reference)
        cols = len(discovered)

        logger.info(f"No. of examples: {rows}")
        logger.info(f"No. of discovered: {cols} ")

        # logger.info(f'Shape of concatinated data: {c.shape}')

        # For data-type field compute pair-wise similarity matrix
        datatype = [d["dataType"] for d in data]

        count_vectorizer = CountVectorizer(lowercase=True)
        bow = count_vectorizer.fit_transform(datatype)
        T = Propagation.pairwise_boolean_similarity(bow[0:rows], bow[rows:])

        # For keywords field compute pair-wise similarity matrix
        keywords = [d["keywords"] for d in data]

        count_vectorizer = CountVectorizer(
            lowercase=True, stop_words=text.ENGLISH_STOP_WORDS.union(must_keys)
        )
        bow = count_vectorizer.fit_transform(keywords)
        K = Propagation.pairwise_jaccard_similarity(
            bow[0:rows].toarray(), bow[rows:].toarray()
        )

        # For description field compute pair-wise similarity matrix
        D = None
        if beta != 0:
            description = [d["description"] for d in data]

            tfidf_vectorizer = TfidfVectorizer(min_df=1, stop_words="english")
            bow = tfidf_vectorizer.fit_transform(description)
            D = Propagation.pairwise_cosine_similarity(bow[0:rows], bow[rows:])
            # TODO: to send possible error when description field is not empty

        # Weighted average
        Srd = Propagation.weighted_average(T, K, D, alpha, beta)
        return Srd

    @staticmethod
    def Sdd(discovered, stop_keys=[], alpha=1, beta=0):
        """
        a: Example data as array of OntoData object
        b: Search results as array of OntoData object
        Return:
        C: pair-wise similarity matrix
        """
        logger.info(f"Computing Sdd; alpha = {alpha}, beta = {beta}")

        keywords = [d["keywords"] for d in discovered]

        count_vectorizer = CountVectorizer(
            lowercase=True, stop_words=text.ENGLISH_STOP_WORDS.union(stop_keys)
        )
        bow = count_vectorizer.fit_transform(keywords)
        # K = Ranking.pairwise_jaccard_similarity(bow.toarray(), bow.toarray())
        K = Propagation.pairwise_cosine_similarity(bow, bow)

        D = None
        if beta != 0:
            description = [d["description"] for d in discovered]

            tfidf_vectorizer = TfidfVectorizer(min_df=1, stop_words="english")
            bow = tfidf_vectorizer.fit_transform(description)
            D = Propagation.pairwise_cosine_similarity(bow, bow)

        Sdd = Propagation.weighted_average2(K, D, 1, 0)
        return Sdd

    @staticmethod
    def cluster(Sdd, n_clusters):
        logger.info(f"Ranking:cluster: ")

        clustering = SpectralClustering(n_clusters=n_clusters).fit(Sdd)
        # clustering = AgglomerativeClustering(n_clusters=n_clusters, linkage='complete').fit(M2)
        # clustering = MiniBatchKMeans(n_clusters=n_clusters).fit(M2)
        return clustering.labels_

    @staticmethod
    def group_data_streams(M, streams, clusters):
        """ """
        np.set_printoptions(threshold=sys.maxsize)
        logger.info(f"Group data streams; No. clusters = {clusters}, len(M) = {len(M)}, len(streams) = {len(streams)}")

        group_dict = dict()

        for i, d in enumerate(streams):
            # ...
            vec = M[:, i]
            # The indices of the maximum values along an axis.
            idx = np.argmax(vec, axis=None, out=None)
            score = vec[idx]

            # print(vec, idx, score)

            try:
                group_dict.get(clusters[i]).append(
                    {**d, "score": round(score, 3), "idx": idx}
                )
            except:
                group_dict.setdefault(
                    clusters[i], [{**d, "score": round(score, 3), "idx": idx}]
                )

        groups = []
        for k in group_dict:
            group = group_dict[k]
            group = sorted(group, key=lambda k: k["idx"])
            group_score = sum(d["score"] for d in group)
            groups.append({"score": round(group_score, 3), "group": group})

        groups.sort(key=lambda x: x["score"], reverse=True)
        logger.info(f"Grouped data streams; len(groups) = {len(groups)}")

        return groups
