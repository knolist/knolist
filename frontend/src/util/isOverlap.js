export default function isOverlap(rectA, rectB) {
    return (rectA.left < rectB.right && rectA.right > rectB.left &&
        rectA.bottom > rectB.top && rectA.top < rectB.bottom)
}