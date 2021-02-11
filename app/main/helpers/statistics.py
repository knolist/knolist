# Knolist
# Conner Delahanty
# Spring 2020
#
# File contains helper methods for computing relevant
# database statistics. Principally an organizational
# construct to keep helper methods out of endpoint file.

"""
Computes max depth of a cluster. Performed using
a recursive approach, where on each push to the
call stack, statistics are updated and returned
to earlier calls.
"""
def compute_cluster_stats(clusters, depth, n_items, n_clusters, sum_item_depth):
    depths = [depth] # Depths holds the depths of all clusters below this
    for c in clusters:
        n_clusters += 1
        n_items += len(c.child_items)
        sum_item_depth += len(c.child_items) * (depth + 1) # Record the number of items * how deep it is nested
        d, n_items, n_clusters, sum_item_depth = compute_cluster_stats(
                c.child_clusters, depth + 1, n_items, n_clusters, sum_item_depth)
        depths.append(d)
    return max(depths), n_items, n_clusters, sum_item_depth


"""
Compute source type breakdown. Sources are considered
unique up to the .com, .org, or .edu. Returns
distribution in a dictionary.
"""
def compute_source_dist(sources):
    dist = {}
    for src in sources:
        # Find first occurrence of .edu, .com, .org
        com_ind = src.url.find('.com')
        org_ind = src.url.find('.org')
        edu_ind = src.url.find('.edu')
        ind = max(com_ind, org_ind, edu_ind)
        # If none of above types, just skip
        if (ind == -1):
            continue
        url_front = src.url[: ind + 4]
        if (url_front in dist):
           dist[url_front] += 1
        else:
            dist[url_front] = 1

    return dist
