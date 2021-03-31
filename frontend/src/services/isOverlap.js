export default function isOverlap(rectA, rectB) {
    // return (rectA.left < rectB.right && rectA.right > rectB.left &&
    //     rectA.bottom > rectB.top && rectA.top < rectB.bottom)
    if (typeof rectA === 'undefined' || typeof rectB === 'undefined') {
        console.log("here");
        return false;
    }
    else return (rectB.right > rectA.left && rectB.left < rectA.right &&
        rectB.top < rectA.bottom && rectB.bottom > rectA.top);
}