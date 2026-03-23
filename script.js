/* 1. THEME TOGGLE LOGIC */
const themesColors = {
  light: { bg: [248/255, 249/255, 250/255], noise: [225/255, 230/255, 235/255] },
  dark: { bg: [18/255, 18/255, 18/255], noise: [35/255, 38/255, 42/255] }
};

const toggleBtn = document.getElementById('themeToggle');
const icon = toggleBtn.querySelector('.icon');
const html = document.documentElement;

const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

let currentThemeCols = themesColors.light;

if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
  html.setAttribute('data-theme', 'dark');
  icon.textContent = '🌜';
  currentThemeCols = themesColors.dark;
} else {
  html.setAttribute('data-theme', 'light');
  icon.textContent = '🌞';
  currentThemeCols = themesColors.light;
}

toggleBtn.addEventListener('click', () => {
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', newTheme);
  icon.textContent = newTheme === 'light' ? '🌞' : '🌜';
  localStorage.setItem('theme', newTheme);
  currentThemeCols = themesColors[newTheme];
});


/* 2. ENTRANCE ANIMATIONS (Observer) */
const observerOptions = {
  root: null,
  threshold: 0.15,
  rootMargin: "0px"
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    } else {
      entry.target.classList.remove('active'); 
    }
  });
}, observerOptions);

const revealElements = document.querySelectorAll('.reveal-left, .reveal-right, .reveal-bottom');
revealElements.forEach(el => observer.observe(el));


/* 4. LOGO REPEL EFFECT */
/* 3. LOGO REPEL EFFECT */
const logo = document.getElementById('repelLogo');

if (logo) {
  logo.addEventListener('mousemove', (e) => {
    // 1. Get the dimensions of the image
    const rect = logo.getBoundingClientRect();
    
    // 2. Calculate mouse position relative to the image's center
    // (0,0) becomes the center of the image
    const x = e.clientX - rect.left - (rect.width / 2);
    const y = e.clientY - rect.top - (rect.height / 2);

    // 3. The "Repel" Math
    // We multiply by a negative number to move in the opposite direction.
    // -0.025 means "Move 2.5% of the distance away from the mouse"
    const moveX = x * -0.025;
    const moveY = y * -0.025;

    // 4. Apply the transform
    logo.style.transform = `translate(${moveX}px, ${moveY}px)`;
  });

  // 5. Reset when mouse leaves
  logo.addEventListener('mouseleave', () => {
    logo.style.transform = 'translate(0px, 0px)';
  });
}

// Start the engine

/* 4. WEBGL LIQUID GLASS & PROCEDURAL BACKGROUND ENGINE */
const glCanvas = document.getElementById('glCanvas');
let gl, prog, U = {};
let startTime = performance.now();
const glassNodes = [...document.querySelectorAll('.glass-node')];
const isDesktop = window.matchMedia("(min-width: 992px)");

if (glCanvas) {
  gl = glCanvas.getContext('webgl', { antialias: true, alpha: false });
  
  const VERT_SRC = `
    attribute vec2 a_pos;
    varying vec2 v_uv;
    void main() {
      v_uv = a_pos * 0.5 + 0.5;
      gl_Position = vec4(a_pos, 0.0, 1.0);
    }
  `;

  const FRAG_SRC = `
    precision highp float;
    varying vec2 v_uv;

    uniform vec2 u_res;
    uniform float u_time;
    uniform float u_scrollY;

    uniform vec3 u_bgColor;
    uniform vec3 u_noiseColor;

    uniform float u_ior;
    uniform float u_thickness;
    uniform float u_feather;
    uniform float u_normalStr;
    uniform float u_frostBlur;
    uniform float u_grain;
    uniform float u_fisheye;
    uniform float u_zoom;
    uniform float u_ca;
    uniform float u_caFalloff;
    uniform float u_gloss;
    uniform float u_specInt;
    uniform float u_rim;
    uniform float u_tintAlpha;
    uniform float u_opacity;

    #define MAX_NODES 8
    uniform vec4 u_nodes[MAX_NODES];
    uniform float u_nodeThick[MAX_NODES];
    uniform int u_nodeCount;

    float sdfRoundedRect(vec2 p, vec2 b, float r) {
      vec2 q = abs(p) - b + r;
      return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
    }

    float rand(vec2 co) { return fract(sin(dot(co, vec2(127.1, 311.7))) * 43758.5453); }

    float vnoise(vec2 p) {
      vec2 i = floor(p); vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = rand(i); float b = rand(i + vec2(1.0, 0.0));
      float c = rand(i + vec2(0.0, 1.0)); float d = rand(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    // Generates the fractal background blobs mathematically
    float fbm(vec2 p) {
      float f = 0.0; float amp = 0.5;
      for(int i = 0; i < 3; i++) {
        f += amp * vnoise(p); p *= 2.0; amp *= 0.5;
      }
      return f;
    }

    vec3 getBackground(vec2 uv) {
      vec2 scroll = vec2(u_time * 0.01, u_scrollY * 0.0005);
      float n1 = fbm(uv * 3.0 + scroll);
      float n2 = fbm(uv * 5.0 - scroll * 1.5 + vec2(10.0));
      float noiseMask = smoothstep(0.2, 0.8, n1 * 0.6 + n2 * 0.4);
      return mix(u_bgColor, u_noiseColor, noiseMask);
    }

    vec2 surfaceNormal(vec2 uv, float scale) {
      float eps = 0.01;
      float h0 = fbm(uv * scale);
      float hx = fbm(uv * scale + vec2(eps, 0.0));
      float hy = fbm(uv * scale + vec2(0.0, eps));
      return vec2(hx - h0, hy - h0) / eps * u_normalStr;
    }

    vec2 fisheyeWarp(vec2 uv, float k) {
      vec2 centered = uv * 2.0 - 1.0;
      float r2 = dot(centered, centered);
      vec2 warped = centered * (1.0 + k * r2);
      return warped * 0.5 + 0.5;
    }

    vec3 sampleCA(vec2 uv, vec2 aberrDir, float strength, float falloff, float edgeFactor) {
      float ca = strength * mix(1.0, edgeFactor, falloff);
      float r = getBackground(uv + aberrDir * ca * 2.0).r;
      float g = getBackground(uv + aberrDir * ca * 0.5).g;
      float b = getBackground(uv - aberrDir * ca * 1.5).b;
      return vec3(r, g, b);
    }

    vec4 computeGlass(vec2 fragUV, vec2 localUV, float mask, float edgeFactor, float nodeThick) {
      float thick = u_thickness * nodeThick;
      vec2 normal = surfaceNormal(fragUV * 5.0 + u_time * 0.1, 3.0) * 0.01;
      
      float iorBend = (1.0 - 1.0 / u_ior) * thick * 0.1;
      vec2 refrOffset = localUV * iorBend + normal;
      
      vec2 feyUV = fisheyeWarp(localUV * 0.5 + 0.5, u_fisheye) * 2.0 - 1.0;
      vec2 zoomedUV = feyUV / u_zoom;
      vec2 sampleUV = fragUV + zoomedUV * 0.08 * thick + refrOffset;
      
      vec2 caDir = normalize(localUV + 0.001);
      
      // Fast frosted effect mapped to u_frostBlur
      vec2 frostOffset = (vec2(rand(fragUV * 10.0), rand(fragUV * 10.0 + 1.0)) - 0.5) * (u_frostBlur * 0.05);
      sampleUV += frostOffset;

      vec3 sceneColor = sampleCA(sampleUV, caDir, u_ca, u_caFalloff, edgeFactor);
      
      if (u_grain > 0.001) sceneColor += (rand(fragUV * 512.0 + u_time) - 0.5) * u_grain;
      
      // Theme tint
      sceneColor = mix(sceneColor, u_bgColor, u_tintAlpha);
      
      // Surface Highlights
      vec3 lightDir = normalize(vec3(-0.6, -0.8, 1.0));
      vec3 surfNorm = normalize(vec3(normal * u_normalStr * 5.0, 1.0));
      vec3 viewDir  = vec3(0.0, 0.0, 1.0);
      vec3 halfVec  = normalize(lightDir + viewDir);
      float spec    = pow(max(dot(surfNorm, halfVec), 0.0), u_gloss);
      
      vec3 highlight = vec3(1.0) * spec * u_specInt;
      highlight += vec3(1.0) * (pow(edgeFactor, 3.0) * u_rim);
      highlight += vec3(1.0) * (pow(1.0 - abs(dot(surfNorm, viewDir)), 4.0) * 0.1); // Fresnel
      
      return vec4(sceneColor + highlight, mask * u_opacity);
    }

    void main() {
      vec2 uv = v_uv;
      uv.y = 1.0 - uv.y; 
      
      vec4 baseColor = vec4(getBackground(uv), 1.0);
      vec4 glassColor = vec4(0.0);
      
      for(int i = 0; i < MAX_NODES; i++) {
        if (i >= u_nodeCount) break;
        vec4 node = u_nodes[i];
        float nx = node.x, ny = node.y, nw = node.z, nh = node.w;
        vec2 nodeCenter = vec2(nx + nw * 0.5, ny + nh * 0.5);
        vec2 localUV = (uv - nodeCenter) / vec2(nw, nh) * 2.0;
        
        vec2 aspect = vec2(u_res.x / u_res.y, 1.0);
        vec2 pLocal = (uv - nodeCenter) * aspect;
        vec2 halfSz = vec2(nw * 0.5, nh * 0.5) * aspect;
        
        float cornerRadius = 0.04; 
        float sdf = sdfRoundedRect(pLocal, halfSz - cornerRadius, cornerRadius);
        
        float featherPx = u_feather * 0.05;
        float mask = 1.0 - smoothstep(-featherPx, featherPx, sdf);
        if (mask < 0.001) continue;
        
        float edgeFactor = clamp(1.0 - (-sdf / (min(nw, nh) * 0.5 + 0.0001)), 0.0, 1.0);
        vec4 gc = computeGlass(uv, localUV, mask, edgeFactor, u_nodeThick[i]);
        glassColor = glassColor + gc * (1.0 - glassColor.a);
      }
      
      gl_FragColor = vec4(mix(baseColor.rgb, glassColor.rgb, glassColor.a), 1.0);
    }
  `;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
    return s;
  }

  prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT_SRC));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG_SRC));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const quadBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
  const aPOS = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPOS);
  gl.vertexAttribPointer(aPOS, 2, gl.FLOAT, false, 0, 0);

  ['u_res','u_time','u_scrollY','u_bgColor','u_noiseColor','u_ior','u_thickness',
   'u_feather','u_normalStr','u_frostBlur','u_grain','u_fisheye','u_zoom','u_ca',
   'u_caFalloff','u_gloss','u_specInt','u_rim','u_tintAlpha','u_opacity','u_nodeCount'].forEach(n => U[n] = gl.getUniformLocation(prog, n));
  
  U.u_nodes = Array.from({length:8}, (_,i) => gl.getUniformLocation(prog, `u_nodes[${i}]`));
  U.u_nodeThick = Array.from({length:8}, (_,i) => gl.getUniformLocation(prog, `u_nodeThick[${i}]`));

  window.addEventListener('resize', () => {
    glCanvas.width = window.innerWidth;
    glCanvas.height = window.innerHeight;
  });
  glCanvas.width = window.innerWidth;
  glCanvas.height = window.innerHeight;
}

/* 5. THE COMBINED ENGINE LOOP */
function renderLoop() {
  const scrollPos = window.scrollY;

  // HTML Parallax updates
  if (isDesktop.matches) {
    const screenCenter = window.innerHeight / 2;
    document.querySelectorAll('.project-row').forEach(row => {
      const imgWrapper = row.querySelector('.img-wrapper');
      if (!imgWrapper) return;
      const rect = row.getBoundingClientRect();
      imgWrapper.style.transform = `translateY(${((rect.top + (rect.height / 2)) - screenCenter) * 0.15}px)`;
    });
  }

  // WebGL Updates
  if (gl) {
    const W = glCanvas.width, H = glCanvas.height;
    gl.viewport(0, 0, W, H);
    
    gl.uniform2f(U.u_res, W, H);
    gl.uniform1f(U.u_time, (performance.now() - startTime) / 1000.0);
    gl.uniform1f(U.u_scrollY, scrollPos);
    
    // Dynamically update colors based on the current theme
    gl.uniform3f(U.u_bgColor, currentThemeCols.bg[0], currentThemeCols.bg[1], currentThemeCols.bg[2]);
    gl.uniform3f(U.u_noiseColor, currentThemeCols.noise[0], currentThemeCols.noise[1], currentThemeCols.noise[2]);
    
    // Updated Custom Glass Parameters
    gl.uniform1f(U.u_ior, 1.6);
    gl.uniform1f(U.u_thickness, 0.85);
    gl.uniform1f(U.u_feather, 0.03);
    gl.uniform1f(U.u_normalStr, 0.24);
    gl.uniform1f(U.u_frostBlur, 0.31);
    gl.uniform1f(U.u_grain, 0.005);
    gl.uniform1f(U.u_fisheye, 0.24);
    gl.uniform1f(U.u_zoom, 3.0);
    gl.uniform1f(U.u_ca, 0.004);
    gl.uniform1f(U.u_caFalloff, 1.0);
    gl.uniform1f(U.u_gloss, 95.0);
    gl.uniform1f(U.u_specInt, 0.03);
    gl.uniform1f(U.u_rim, 0.03);
    gl.uniform1f(U.u_tintAlpha, 0.0);
    gl.uniform1f(U.u_opacity, 1.0);
    
    gl.uniform1i(U.u_nodeCount, glassNodes.length);

    // Pass the scrolling DOM BoundingClientRect to the shader
    glassNodes.forEach((el, i) => {
      if (i >= 8) return;
      const rect = el.getBoundingClientRect();
      gl.uniform4f(U.u_nodes[i], rect.left / W, rect.top / H, rect.width / W, rect.height / H);
      gl.uniform1f(U.u_nodeThick[i], parseFloat(el.dataset.thickness ?? '1.0'));
    });

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  requestAnimationFrame(renderLoop);
}

renderLoop();