// --- 1. SETUP 3D SCENE ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Safety Check: Ensure container exists before adding canvas
const container = document.getElementById('canvas-container');
if (container) {
    container.appendChild(renderer.domElement);
}

// Crystal Object
const geometry = new THREE.IcosahedronGeometry(10, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true, transparent: true, opacity: 0.3 });
const crystal = new THREE.Mesh(geometry, material);
scene.add(crystal);

// Core Object
const coreGeo = new THREE.IcosahedronGeometry(4, 0);
const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const core = new THREE.Mesh(coreGeo, coreMat);
scene.add(core);

// Starfield
const starsGeometry = new THREE.BufferGeometry();
const starsCount = 2000;
const posArray = new Float32Array(starsCount * 3);
for(let i = 0; i < starsCount * 3; i++) { posArray[i] = (Math.random() - 0.5) * 100; }
starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const starsMaterial = new THREE.PointsMaterial({ size: 0.05, color: 0xffffff });
const starMesh = new THREE.Points(starsGeometry, starsMaterial);
scene.add(starMesh);

camera.position.z = 30;
crystal.position.x = 10;

// Mouse Movement
let mouseX = 0, mouseY = 0;
const windowHalfX = window.innerWidth / 2, windowHalfY = window.innerHeight / 2;
document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
});

// Animation Loop
const clock = new THREE.Clock();
let animationId;

function animate() {
    const elapsedTime = clock.getElapsedTime();
    crystal.rotation.y += .005; crystal.rotation.x += .002;
    core.rotation.y -= .01; core.rotation.x -= .01;
    crystal.rotation.y += 0.05 * ((mouseX * 0.001) - crystal.rotation.y);
    crystal.rotation.x += 0.05 * ((mouseY * 0.001) - crystal.rotation.x);
    starMesh.rotation.y = -0.1 * elapsedTime;
    starMesh.rotation.x = 0.05 * elapsedTime;
    
    renderer.render(scene, camera);
    animationId = requestAnimationFrame(animate);
}
animate();

// --- 2. TRANSITION LOGIC (THE FIX) ---
// We wrap this in an event listener to make sure HTML is ready
document.addEventListener('DOMContentLoaded', () => {
    
    // Initial Text Reveal
    gsap.to(".intro-h1", { duration: 1, opacity: 1, y: 0, delay: 0.8, ease: "power3.out" });
    gsap.to(".intro-subtitle", { duration: 1, opacity: 1, y: 0, delay: 1, ease: "power3.out" });
    gsap.to(".btn-warp", { duration: 1, opacity: 1, y: 0, delay: 1.2, ease: "back.out(1.7)" });

    const btn = document.getElementById('warpBtn');
    
    // Check if button exists
    if(btn) {
        console.log("Button Found! Adding Click Listener...");
        
        btn.addEventListener('click', () => {
            console.log("Button Clicked! Starting Warp...");

            // 1. Zoom Camera
            gsap.to(camera.position, { z: 5, duration: 1.5, ease: "power2.inOut" });
            
            // 2. Spin Crystal
            gsap.to(crystal.rotation, { y: crystal.rotation.y + 10, duration: 1.5 });

            // 3. Fade out Intro Layer
            gsap.to("#intro-layer", { 
                opacity: 0, 
                duration: 1, 
                delay: 0.5,
                onComplete: () => {
                    console.log("Transition Complete. Switching views...");
                    
                    // Stop 3D Animation
                    cancelAnimationFrame(animationId);
                    
                    // Hide Intro
                    document.getElementById('intro-layer').style.display = 'none';

                    // SHOW PORTFOLIO
                    const portfolio = document.getElementById('main-portfolio');
                    if(portfolio) {
                        portfolio.style.display = 'block';
                        
                        // Small delay to allow CSS to register display:block
                        setTimeout(() => {
                            portfolio.style.opacity = '1';
                        }, 50);
                    } else {
                        console.error("Error: Element #main-portfolio not found!");
                    }
                }
            });
        });
    } else {
        console.error("Error: Button #warpBtn not found in HTML!");
    }
});

// --- 3. CUSTOM CURSOR LOGIC ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

if(cursorDot && cursorOutline) {
    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;
        cursorOutline.style.left = `${posX}px`;
        cursorOutline.style.top = `${posY}px`;
        cursorOutline.animate({ left: `${posX}px`, top: `${posY}px` }, { duration: 500, fill: "forwards" });
    });
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});