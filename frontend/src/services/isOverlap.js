export default function isOverlap(rectA, rectB) {
    if (typeof rectA === 'undefined' || typeof rectB === 'undefined') {
        return false;
    }
    else return (rectB.right > rectA.left && rectB.left < rectA.right &&
        rectB.top < rectA.bottom && rectB.bottom > rectA.top);
}