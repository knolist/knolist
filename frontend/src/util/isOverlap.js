export default function isOverlap(rectA, rectB) {
    if (rectA === undefined || rectB === undefined) {
        return false
    }
    return (rectA.left < rectB.right && rectA.right > rectB.left &&
        rectA.bottom > rectB.top && rectA.top < rectB.bottom)
}