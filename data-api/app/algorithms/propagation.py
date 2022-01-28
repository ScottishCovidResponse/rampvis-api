import sys
from loguru import logger
import numpy as np
from sklearn.metrics import jaccard_score
from sklearn.feature_extraction import text
from sklearn.metrics.pairwise import cosine_similarity, euclidean_distances
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.cluster import SpectralClustering
from sklearn.cluster import MiniBatchKMeans
from sklearn.cluster import KMeans


class Propagation:
    @staticmethod
    def pairwise_boolean_similarity(X, Y):
        """
        Compute pairwise boolean (using euclidean distance) between X and Y
        X & Y are Bag of Words
        """
        logger.info(
            f"Propagation: compute boolean similarity, shape(X) = {X.shape}, shape(Y) = {Y.shape}"
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
            f"Propagation: compute jaccard similarity, shape(X) = {X.shape}, shape(Y) = {Y.shape}"
        )

        sim = np.zeros(shape=(len(X), len(Y)))
        i = 0
        j = 0

        for item_x in X:
            for item_y in Y:
                sim[i][j] = jaccard_score(item_x, item_y, average="micro")
                j += 1

            j = 0
            i += 1

        return sim

    @staticmethod
    def pairwise_cosine_similarity(X, Y):
        """
        Compute pairwise cosine between X and Y
        X & Y are Bag of Words
        """
        logger.info(
            f"Propagation: compute cosine similarity shape(X) = {X.shape}, shape(Y) = {Y.shape}"
        )

        sim = cosine_similarity(X, Y)
        return sim

    @staticmethod
    def weighted_average(T, K, D=None, alpha=1, beta=0, theta=0):
        """ """
        logger.info(
            f"Propagation: compute weighted average for Srd, len(T) = {len(T)}, len(K) = {len(K)}, alpha={alpha}, beta={beta}, theta={theta}"
        )

        if D is not None:
            logger.info(
                f"Propagation: compute weighted average for Srd, len(D) = {len(D)}"
            )
            return T * (alpha * K + beta * D)
        else:
            return T * K

    @staticmethod
    def weighted_average2(K, D=None, alpha=1, beta=0, theta=0):
        """ """
        logger.info(
            f"Propagation: compute weighted average for Sdd, len(K) = {len(K)}, alpha={alpha}, beta={beta}, theta={theta}"
        )

        if D is not None:
            logger.info(
                f"Propagation: compute weighted average for Sdd, len(D) = {len(D)}"
            )
            return alpha * K + beta * D
        else:
            return K

    @staticmethod
    def Srd(reference, discovered, must_keys=[], alpha=1, beta=0, theta=0):
        """
        a: Example data as array of OntoData object
        b: Search results as array of OntoData object
        Return:
        C: pair-wise similarity matrix
        """
        # TODO: type and empty check

        logger.info(
            f"Propagation: compute Srd, alpha = {alpha}, beta = {beta}, theta={theta}"
        )

        data = np.concatenate((reference, discovered))
        rows = len(reference)
        cols = len(discovered)

        logger.info(f"Propagation: compute Srd, num. examples = {rows}")
        logger.info(f"Propagation: compute Srd, num. discovered = {cols} ")

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
        Srd = Propagation.weighted_average(T, K, D, alpha=alpha, beta=beta, theta=theta)

        logger.info(f"Propagation: computed Srd, len(Srd) = {len(Srd)}")
        return Srd

    @staticmethod
    def Sdd(discovered, stop_keys=[], alpha=1, beta=0, theta=0):
        """
        a: Example data as array of OntoData object
        b: Search results as array of OntoData object
        Return:
        C: pair-wise similarity matrix
        """
        logger.info(
            f"Propagation: compute Sdd, alpha = {alpha}, beta = {beta}, theta={theta}"
        )

        keywords = [d["keywords"] for d in discovered]
        count_vectorizer = CountVectorizer(
            lowercase=True, stop_words=text.ENGLISH_STOP_WORDS.union(stop_keys)
        )
        bow = count_vectorizer.fit_transform(keywords)

        K = Propagation.pairwise_jaccard_similarity(bow.toarray(), bow.toarray())

        D = None
        if beta != 0:
            description = [d["description"] for d in discovered]

            tfidf_vectorizer = TfidfVectorizer(min_df=1, stop_words="english")
            bow = tfidf_vectorizer.fit_transform(description)
            D = Propagation.pairwise_cosine_similarity(bow, bow)

        Sdd = Propagation.weighted_average2(K, D, alpha=alpha, beta=beta, theta=theta)
        logger.info(f"Propagation: computed Sdd, len(Sdd) = {len(Sdd)}")

        return Sdd

    @staticmethod
    def cluster(Sdd, n_clusters):
        logger.info(
            f"Propagation: compute clusters from Sdd, n_clusters = {n_clusters}"
        )

        # When only a single data stream discovered
        if len(Sdd) == 1:
            return [0]

        clustering = SpectralClustering(n_clusters=n_clusters).fit(Sdd)
        # clustering = AgglomerativeClustering(n_clusters=n_clusters, linkage='complete').fit(Sdd)
        # clustering = MiniBatchKMeans(n_clusters=n_clusters, random_state=0, batch_size=10, max_iter=10).fit(Sdd)
        # clustering = KMeans(n_clusters=n_clusters, random_state=0).fit(Sdd)

        logger.info(
            f"Propagation: computed clusters from Sdd, len(clustering.labels_) = {len(clustering.labels_)}"
        )
        return clustering.labels_

    @staticmethod
    def group_data_streams(Srd, discovered, clusters):
        """ """
        np.set_printoptions(threshold=sys.maxsize)
        logger.info(
            f"Propagation: group data streams len(Srd) = {len(Srd)}, len(discovered) = {len(discovered)}, len(clusters) = {len(clusters)}"
        )

        group_dict = dict()

        for i, d in enumerate(discovered):
            # ...
            vec = Srd[:, i]
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
        logger.info(f"Propagation: grouped data streams, len(groups) = {len(groups)}")

        return groups
