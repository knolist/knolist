# Knolist
# Conner Delahanty
# Spring 2020
#
# File contains logic for determining coordinates for new items
import random
from .statistics import similarity

"""
Take an array of x, y coordinates and
width and heights and return true if
the coordinate avoids overlaps.
xi, yi are coordinates of other items in
the project, and ws, hs are widths and
heights
"""


def verify_good_coordinates(xi, yi, xs, ys, ws, hs, wi=50, hi=50):
    assert (len(xs) == len(ys) == len(ws) == len(hs))
    for i in range(len(xs)):
        if 2.0 * abs(xs[i] - xi) < wi + ws[i] and 2.0 * abs(ys[i] - yi) < hi + hs[i]:
            return False
    return True


"""
Take project and convert sources, items
and clusters to barriers
"""


def project_barriers(project):
    xs = []
    ys = []
    ws = []
    hs = []
    for i in project.items:
        xs.append(i.x_position) if i.x_position else xs.append(0)
        ys.append(i.y_position) if i.y_position else ys.append(0)
        if i.content:
            # Very rough approximations
            ws.append(200 + len(i.content))
            hs.append(50 + 50 * len(i.content) / 100)
        else:
            ws.append(150)
            hs.append(100)
    """
    for s in project.sources:
        xs.append(s.x_position) if s.x_position else xs.append(0)
        ys.append(s.y_position) if s.y_position else ys.append(0)
        ws.append(300)
        hs.append(100)
    """

    for c in project.clusters:
        xs.append(c.x_position) if c.x_position else xs.append(0)
        ys.append(c.y_position) if c.y_position else ys.append(0)
        ws.append(500)
        hs.append(500)

    return xs, ys, ws, hs


"""
Take ideal coordinates and randomized try points
in a range until one doesn't overlap with others
"""


def randomized_coords(ideal_x, ideal_y, project, num_tries=10, box=700):
    xs, ys, ws, hs = project_barriers(project)
    # print(xs, ys, ws, hs)
    for i in range(num_tries):
        xi = random.randrange(ideal_x - box / 2, ideal_x + box / 2)
        yi = random.randrange(ideal_y - box / 2, ideal_y + box / 2)

        if verify_good_coordinates(xi, yi, xs, ys, ws, hs):
            return xi, yi

    return xi + box / 2, yi + box / 2


"""
Get ideal coordinates based off similarity
"""


def get_ideal_coords(project, text):
    opt_similarity = 0
    ideal_x = 0
    ideal_y = 0
    print(text)
    if not text or text == "":
        if project.items and len(project.items) > 0:
            ideal_x = project.items[0].x_position
            ideal_y = project.items[0].y_position
        else:
            ideal_x = 0
            ideal_y = 0
    else:
        """
        for s in project.sources:
            # Compare similarity across sources
            sim = similarity(s.content, text)
            if sim > opt_similarity:
                opt_similarity = sim
                ideal_x = s.x_position
                ideal_y = s.y_position
        """
        for i in project.items:
            # Compare similarity across items
            sim = similarity(i.content, text)
            if sim >= opt_similarity:
                opt_similarity = sim
                ideal_x = i.x_position
                ideal_y = i.y_position
    # print(opt_similarity, ideal_x, ideal_y)

    return randomized_coords(ideal_x, ideal_y, project)
