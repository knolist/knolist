export default function throttle(func, ms) {
    let lastFunc
    let lastRan
    return function () {
        const context = this
        const args = arguments
        if (!lastRan) {
            func.apply(context, args)
            lastRan = Date.now()
        } else {
            clearTimeout(lastFunc)
            lastFunc = setTimeout(function () {
                if ((Date.now() - lastRan) >= ms) {
                    func.apply(context, args)
                    lastRan = Date.now()
                }
            }, ms - (Date.now() - lastRan))
        }
    }
}