/**
 * @param {number} min
 * @param {number} max
 */
function random(min, max) { return Math.random() * (max - min) + min }

(function () {
    let lastTime = 0
    const vendors = ['ms', 'moz', 'webkit', 'o']
    for (let x = 0; x < vendors.length && !window.requestAnimationFrame; x++) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame']
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (callback) {
            const currTime = new Date().getTime()
            const timeToCall = Math.max(0, 16 - (currTime - lastTime))
            const id = window.setTimeout(function () {
                callback(currTime + timeToCall)
            }, timeToCall)
            lastTime = currTime + timeToCall
            return id
        }
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id)
        }
    }

    /**
     * @typedef {{
     * data: {
     *   x: number;
     *   y: number;
     *   z: number;
     *   a: number;
     *   s: number;
     *   speed: number;
     * }
     * } & HTMLElement} HTMLCloudElement
     */

    /** @type {Array<HTMLCloudElement>} */
    const layers = []
    /** @type {Array<HTMLElement>} */
    const objects = []
    let world = document.getElementById('world') ?? (() => { throw null })()
    let viewport = document.getElementById('viewport') ?? (() => { throw null })()
    let d = 0
    let p = 800
    let worldXAngle = 0
    let worldYAngle = 0
    let cursorX = 0
    let cursorY = 0

    const SIZE_X = 512 * 2
    const SIZE_Y = 512 * 3
    const SIZE_Z = 512 * 2

    viewport.style.webkitPerspective = p + ''
    viewport.style.MozPerspective = p + 'px'
    viewport.style.oPerspective = p + ''
    viewport.style.perspective = p + ''

    for (let i = 0; i < 10; i++) {
        objects.push(createCloud())
    }

    function createCloud() {
        const div = document.createElement('div')
        div.className = 'cloudBase'
        div.style.webkitTransform =
            div.style.MozTransform =
            div.style.oTransform =
            div.style.transform =
            "translateX( " +
            ((SIZE_X / 2) - Math.random() * SIZE_X) +
            "px ) translateY( " +
            (-SIZE_Y / 2) +
            "px ) translateZ( " +
            ((SIZE_Z / 2) - Math.random() * SIZE_Z) +
            "px )";
        world.appendChild(div)

        for (let j = 0; j < 5 + Math.round(Math.random() * 10); j++) {
            /** @ts-ignore @type {HTMLCloudElement} */
            const cloud = document.createElement('img')
            cloud.setAttribute('src', './img/cloud.png')
            cloud.className = 'cloudLayer'

            cloud.data = {
                x: ((SIZE_X / 2) - Math.random() * SIZE_X) * 0.2,
                y: ((SIZE_Y) - Math.random() * SIZE_Y) * 0.2,
                z: random(-100, 100),
                a: random(0, 360),
                s: random(0.25, 1.25),
                speed: random(-.05, .05),
            }
            cloud.style.webkitTransform =
                cloud.style.MozTransform =
                cloud.style.oTransform =
                cloud.style.transform =
                "translateX( " +
                cloud.data.x +
                "px ) translateY( " +
                cloud.data.y +
                "px ) translateZ( " +
                cloud.data.z +
                "px ) rotateZ( " +
                cloud.data.a +
                "deg ) scale( " +
                cloud.data.s +
                " )"
            cloud.style.filter =
                `brightness(${random(.4, .5)}) ` +
                `sepia(${1}) ` +
                `hue-rotate(${160}deg) ` +
                `contrast(${3}) ` +
                `saturate(${random(.0, .1)}) ` +
                `blur(3px) `

            div.appendChild(cloud)
            layers.push(cloud)
        }

        return div
    }

    window.addEventListener('mousemove', function (e) {
        cursorX = (0.5 - e.clientX / window.innerWidth)
        cursorY = (0.5 - e.clientY / window.innerHeight)
        worldYAngle = -(0.5 - e.clientX / window.innerWidth) * 180
        worldXAngle = (0.5 - e.clientY / window.innerHeight) * 180
        updateView()
    })

    window.addEventListener('touchmove', function (e) {
        let ptr = e.changedTouches.length
        while (ptr--) {
            const touch = e.changedTouches[ptr]
            cursorX = (0.5 - touch.pageX / window.innerWidth)
            cursorY = (0.5 - touch.pageY / window.innerHeight)
            worldYAngle = -(0.5 - touch.pageX / window.innerWidth) * 180
            worldXAngle = (0.5 - touch.pageY / window.innerHeight) * 180
            updateView()
        }
        e.preventDefault()
    })

    function updateView() {
        return
        world.style.webkitTransform =
            world.style.MozTransform =
            world.style.oTransform =
            world.style.transform =
            `translateZ(${d}px) ` +
            `rotateX(${worldXAngle}deg) ` +
            `rotateY(${worldYAngle}deg)`
    }

    function orientationhandler(e) {
        if (!e.gamma && !e.beta) {
            e.gamma = -(e.x * (180 / Math.PI))
            e.beta = -(e.y * (180 / Math.PI))
        }

        worldXAngle = e.gamma
        worldYAngle = e.beta
        updateView()
    }

    function update() {
        for (const layer of layers) {
            layer.data.a += layer.data.speed
            layer.style.webkitTransform =
                layer.style.MozTransform =
                layer.style.oTransform =
                layer.style.transform =
                `translateX(${layer.data.x + (cursorX * 100)}px) ` +
                `translateY(${layer.data.y + (cursorY * 10)}px) ` +
                `translateZ(${layer.data.z}px) ` +
                // `rotateY(${-worldYAngle}deg) ` +
                // `rotateX(${-worldXAngle}deg) ` +
                `rotateZ(${layer.data.a}deg) ` +
                `scale(${layer.data.s})`
        }
        
        requestAnimationFrame(update)
    }

    update()
})();
