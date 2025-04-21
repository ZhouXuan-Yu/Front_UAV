const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
let scale = 1;
let translateX = 0;
let translateY = 0;
let previousMousePosition = { x: 0, y: 0 };

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(translateX, translateY);
    ctx.scale(scale, scale);
    // 在这里绘制你的图形，例如一个简单的矩形：
    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0, 100, 100);
    ctx.restore();
}

canvas.addEventListener('wheel', function (event) {
    event.preventDefault();
    const delta = Math.sign(event.deltaY); // 判断滚轮滚动的方向
    if (delta < 0) {
        // 放大
        scale *= 1.1;
    } else {
        // 缩小
        scale /= 1.1;
    }
    draw();
}, { passive: false });

canvas.addEventListener('mousemove', function (event) {
    previousMousePosition = { x: event.clientX, y: event.clientY };
});

// 初始化绘制
draw();
