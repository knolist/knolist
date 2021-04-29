# Knolist
# Conner Delahanty
# Spring 2020
#
# File contains helper methods for computing relevant
# database statistics. Principally an organizational
# construct to keep helper methods out of endpoint file.

from urllib.parse import urlparse
from nltk import download
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import numpy as np

download('stopwords')

def get_statistics_for_project(project):
    if (len(project.clusters) == 0):
        max_depth = 0
        n_clusters = 0
        sum_item_depth = 0
    else:
        # Get statistics through tree traversal
        # Note: n_items is stored and returned for future purposes
        # If at any point all items will not be stored at the project
        # leve, n_items can be returned.
        max_depth, n_items, n_clusters, \
        sum_item_depth = compute_cluster_stats(
            project.clusters, depth=0,
            n_items=len(project.items), n_clusters=0,
            sum_item_depth=0)
    # Compute URL breakdown from helper method
    url_breakdown = compute_source_dist(project.sources)

    # note, source note, highlight, source

    n_notes = len([i for i in project.items if i.is_note])
    n_sources = len(project.sources)
    n_sourcenotes = len([i for i in project.items if i.is_note and i.source_id is not None])
    n_highlights = len([i for i in project.items if not i.is_note and
                       i.content is not None
                       and not i.content == ""])
    n_items = len(project.items)

    most_common = ""

    # Fast way to achieve maximum
    if n_notes >= n_sources and n_notes >= n_sourcenotes and n_notes >= n_highlights:
        most_common += "note, "
    if n_sources >= n_notes and n_sources >= n_sourcenotes and n_sources >= n_highlights:
        most_common += "source, "
    if n_sourcenotes >= n_sources and n_sourcenotes >= n_sources and n_sourcenotes >= n_highlights:
        most_common += "source note, "
    if n_highlights >= n_sources and n_highlights >= n_sourcenotes and n_highlights >= n_notes:
        most_common += "highlight, "

    if n_notes == n_sources == n_highlights == n_sourcenotes == 0:
        most_common = None

    if most_common:
        most_common = most_common[:-2]

    return {
        'success': True,
        'counts': {
            'num_sources': n_sources,
            'num_items': n_items,
            'num_clusters': n_clusters,
            'num_notes': n_notes,
            'num_sourcenotes': n_sourcenotes,
            'num_highlights': n_highlights
        },
        'avg_depth_per_item': sum_item_depth / len(project.items) if len(project.items) != 0 else None,
        'max_depth': max_depth + 1,
        'date_created': project.creation_date,
        'date_accessed': project.recent_access_date,
        'most_common': most_common,
        'url_breakdown': url_breakdown
    }

def compute_cluster_stats(clusters, depth, n_items, n_clusters, sum_item_depth):
    """
    Computes max depth of a cluster. Performed using
    a recursive approach, where on each push to the
    call stack, statistics are updated and returned
    to earlier calls.
    """
    depths = [depth]  # Depths holds the depths of all clusters below this
    for c in clusters:
        n_clusters += 1
        n_items += len(c.child_items)
        sum_item_depth += len(c.child_items) * (depth + 1)  # Record the number of items * how deep it is nested
        d, n_items, n_clusters, sum_item_depth = compute_cluster_stats(
            c.child_clusters, depth + 1, n_items, n_clusters, sum_item_depth)
        depths.append(d)
    return max(depths), n_items, n_clusters, sum_item_depth



def compute_source_dist(sources):
    """
    Compute source type breakdown. Sources are considered
    unique up to the .com, .org, or .edu. Returns
    distribution in a dictionary.
    """
    dist = {}
    for src in sources:
        # # Find first occurrence of .edu, .com, .org
        # com_ind = src.url.find('.com')
        # org_ind = src.url.find('.org')
        # edu_ind = src.url.find('.edu')
        # ind = max(com_ind, org_ind, edu_ind)
        # # If none of above types, just skip
        # if ind == -1:
        #     continue
        # url_front = src.url[: ind + 4]
        try:
            domain = urlparse(src.url).netloc
            if domain in dist:
                dist[domain] += 1
            else:
                dist[domain] = 1
        except Exception:
            continue

    return dist


def dictdot(x, y):
    """
    Computes the dot product of vectors x and y, represented as sparse dictionaries.
    """
    keys = list(x.keys()) if len(x) < len(y) else list(y.keys())
    return sum(x.get(key, 0) * y.get(key, 0) for key in keys)


def cosine_sim(x, y):
    """
    Computes the cosine similarity between two sparse term vectors represented as dictionaries.
    """
    num = dictdot(x, y)
    if (num == 0):
        return 0
    return num / (np.linalg.norm(list(x.values())) * np.linalg.norm(list(y.values())))


def cosine_after_stopwords(text_a, text_b):
    """
    Computes the cosine similarity between two texts, after removing stopwords,
    all words of length < 3, and accounting for case. Used frequency vector
    ( weighted by number of words in each document)
    """
    stop_words = set(stopwords.words('english'))
    text_a_tok = word_tokenize(text_a)
    text_b_tok = word_tokenize(text_b)

    a_filt = [w.upper() for w in text_a_tok if not w in stop_words and len(w) >= 3]
    b_filt = [w.upper() for w in text_b_tok if not w in stop_words and len(w) >= 3]

    total = set(a_filt).union(set(b_filt))

    word_dict_a = dict.fromkeys(total, 0)
    word_dict_b = dict.fromkeys(total, 0)

    for word in a_filt:
        word_dict_a[word] += 1. / len(a_filt) # Frequency
    for word in b_filt:
        word_dict_b[word] += 1. / len(b_filt) # Frequency
    return cosine_sim(word_dict_a, word_dict_b)


def set_intersection_after_stopwords(text_a, text_b):
    """
    Compute the set intersection to determine naive measure of
    overlap between two documents.
    """
    stop_words = set(stopwords.words('english'))
    text_a_tok = word_tokenize(text_a)
    text_b_tok = word_tokenize(text_b)

    a_filt = set([w for w in text_a_tok if not w in stop_words and len(w) >= 3])
    b_filt = set([w for w in text_b_tok if not w in stop_words and len(w) >= 3])

    intersection = a_filt.intersection(b_filt)

    return len(intersection) / min(len(a_filt), len(b_filt))


def similarity(text_a, text_b):
    """
    Compute source similarity through hybrid approach of term intersection
    and word-frequency cosine similarity. Cos similarity has been given
    a smaller weight to counteract effects of large sloppy corpi.
    text_a and text_b are large strings representing two documents
    """
    stop_words = set(stopwords.words('english'))
    text_a_tok = word_tokenize(text_a)
    text_b_tok = word_tokenize(text_b)

    a_filt = [w.upper() for w in text_a_tok if not w in stop_words and len(w) >= 3]
    b_filt = [w.upper() for w in text_b_tok if not w in stop_words and len(w) >= 3]

    a_set = set(a_filt)
    b_set = set(b_filt)

    # Set intersection score
    intersection = a_set.intersection(b_set)
    set_score = len(intersection) / min(len(a_set), len(b_set))

    # Cosine score
    total = set(a_filt).union(set(b_filt))
    word_dict_a = dict.fromkeys(total, 0)
    word_dict_b = dict.fromkeys(total, 0)
    for word in a_filt:
        word_dict_a[word] += 1. / len(a_filt) # Frequency
    for word in b_filt:
        word_dict_b[word] += 1. / len(b_filt) # Frequency

    cos_score = cosine_sim(word_dict_a, word_dict_b)

    return 0.7 * set_score + 0.3 * cos_score

