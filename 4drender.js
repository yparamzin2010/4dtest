

//const canvas = document.getElementById("canvas");
//const ctx = canvas.getContext("2d");

zoomdepth = 1
const SCALE = 100;
const FADE_DISTANCE = 4;
let velocityX=0, velocityY=0;
let angleX=0, angleY=0;

let vx=0, vy=0, vz=0, vw=0;
let cameraW = 5

function resize(ctx){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize(); window.addEventListener("resize", resize);



resize(); window.addEventListener("resize", resize);





function modMinus2PiTo2Pi(angle){
  const fourPi = 4*Math.PI, twoPi = 2*Math.PI;
  if(angle>twoPi) angle -= fourPi;
  if(angle<-twoPi) angle += fourPi;
  return angle;
}

function project4Dto3D(p){
    let x1=p.x, x2=p.y, x3=p.z, x4=p.w;

    

const x1x1 = x1 * x1;
const x2x2 = x2 * x2;
const x3x3 = x3 * x3;
const x4x4 = x4 * x4;

const r = Math.sqrt(x1x1 + x2x2 + x3x3 + x4x4);


  return {
    x: x1,// * scale,
    y: x2,// * scale,
    z: x3// * scale
  };
}





function modc(value, n=Math.PI) {
  const m = value % (2 * n);
  return m > n ? m - 2 * n : m < -n ? m + 2 * n : m;
}





function rotate3D(v) {


    const cosX = Math.cos(angleX), sinX = Math.sin(angleX);
    const cosY = Math.cos(angleY), sinY = Math.sin(angleY);

    let x = v.x * cosY - v.z * sinY;
    let z = v.x * sinY + v.z * cosY;

    let y = v.y * cosX - z * sinX;
    z = v.y * sinX + z * cosX;


    const perspective = 1 / (1 + z * 0.1); 
    return {
        x: x * perspective * zoomdepth,
        y: y * perspective * zoomdepth,
        z: z
    };
}


function scaleOrtho(p, vx,vy,vz,vw, k = 0.1) {
  const factor = 1 / (1 + (-p.w + cameraW) * 0.1);
  return {
    x: (p.x-vx) * factor,
    y: (p.y-vy) * factor,
    z: (p.z-vz) * factor,
    w: p.w-vw
  };
}



function interpolateHyperplane(point, tetra) {
    const [p0, p1, p2, p3] = tetra;

    const det = 
        (p1.x - p0.x) * ((p2.y - p0.y)*(p3.z - p0.z) - (p3.y - p0.y)*(p2.z - p0.z)) -
        (p2.x - p0.x) * ((p1.y - p0.y)*(p3.z - p0.z) - (p3.y - p0.y)*(p1.z - p0.z)) +
        (p3.x - p0.x) * ((p1.y - p0.y)*(p2.z - p0.z) - (p2.y - p0.y)*(p1.z - p0.z));

    const l0 = (
        ((p1.x - point.x) * ((p2.y - point.y)*(p3.z - point.z) - (p3.y - point.y)*(p2.z - point.z)) -
         (p2.x - point.x) * ((p1.y - point.y)*(p3.z - point.z) - (p3.y - point.y)*(p1.z - point.z)) +
         (p3.x - point.x) * ((p1.y - point.y)*(p2.z - point.z) - (p2.y - point.y)*(p1.z - point.z)))
    ) / det;

    const l1 = (
        ((point.x - p0.x) * ((p2.y - p0.y)*(p3.z - p0.z) - (p3.y - p0.y)*(p2.z - p0.z)) -
         (p2.x - p0.x) * ((point.y - p0.y)*(p3.z - p0.z) - (p3.y - p0.y)*(point.z - p0.z)) +
         (p3.x - p0.x) * ((point.y - p0.y)*(p2.z - p0.z) - (p2.y - p0.y)*(point.z - p0.z)))
    ) / det;

    const l2 = (
        ((p1.x - p0.x) * ((point.y - p0.y)*(p3.z - p0.z) - (p3.y - p0.y)*(point.z - p0.z)) -
         (point.x - p0.x) * ((p1.y - p0.y)*(p3.z - p0.z) - (p3.y - p0.y)*(p1.z - p0.z)) +
         (p3.x - p0.x) * ((p1.y - p0.y)*(point.z - p0.z) - (point.y - p0.y)*(p1.z - p0.z)))
    ) / det;

    const l3 = 1 - l0 - l1 - l2;

    return l0 * p0.w + l1 * p1.w + l2 * p2.w + l3 * p3.w;
}


function interpolateTetra(point, tetra) {
    const [A, B, C, D] = tetra;
    //
    const AB = { x: B.x - A.x, y: B.y - A.y, z: B.z - A.z };
    const AC = { x: C.x - A.x, y: C.y - A.y, z: C.z - A.z };
    const AD = { x: D.x - A.x, y: D.y - A.y, z: D.z - A.z };
    const AP = { x: point.x - A.x, y: point.y - A.y, z: point.z - A.z };

    function dot(u, v) { return u.x * v.x + u.y * v.y + u.z * v.z; }
    function cross(u, v) {
        return {
            x: u.y * v.z - u.z * v.y,
            y: u.z * v.x - u.x * v.z,
            z: u.x * v.y - u.y * v.x
        };
    }

    const det = dot(AB, cross(AC, AD));

    const u = dot(AP, cross(AC, AD)) / det;
    const v = dot(AB, cross(AP, AD)) / det;
    const w = dot(AB, cross(AC, AP)) / det;
    const t = 1 - u - v - w;

    if (u >= 0 && v >= 0 && w >= 0 && t >= 0) {return point.w<interpolateHyperplane(point,tetra)}
}




     
    let scene = [];

      

    

function pentachoronv2() {

  // Helper: create 4D point
  const pt = (x, y, z, w) => ({ x, y, z, w });


  const pentachoronVerts = [
    pt(-4, 0, 0, -1/Math.sqrt(2)),
    pt(-6, 0, 0, -1/Math.sqrt(2)),
    pt(-5, 1, 0, 1/Math.sqrt(2)),
    pt(-5, -1, 0, 1/Math.sqrt(2)),
    pt(-5, 0, 1, 0)
  ];

  const comb4 = (arr) => {
    const result = [];
    const n = arr.length;
    for (let i = 0; i < n; i++) {
      for (let j = i+1; j < n; j++) {
        for (let k = j+1; k < n; k++) {
          for (let l = k+1; l < n; l++) {
            result.push([arr[i], arr[j], arr[k], arr[l]]);
          }
        }
      }
    }
    return result;
  };

  scene.push(...comb4(pentachoronVerts));

  return scene;
}



pentachoronv2();


scene = scene.map(tet => ({tetra:tet,mat2:{r:0,g:255,b:0,n:25},mat1:{r:255,g:255,b:255,n:10}}))


const p1 = { x:0*Math.sqrt(2), y:0, z:0, w:3}
//tets.forEach(tetra => console.log({tet:tetra,hit:RIT(p1, tetra).hit}));






function drawLabel3D(text, p3) {
    const rotated = rotate3D({ x: p3.x, y: p3.y, z: p3.z });

    const sx = canvas.width / 2 + rotated.x * SCALE;
    const sy = canvas.height / 2 + rotated.y * SCALE;

    if (sx < 0 || sx > canvas.width || sy < 0 || sy > canvas.height) return;

    ctx.font = "14px monospace";
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillText(text, sx + 4, sy - 4);
}





function drawViewingBox(){
  const cx0 = canvas.width / 2;
  const cy0 = canvas.height / 2;

  const r = 0.1;

  const axes = [
    [{ x: -r, y:  0, z:  0 }, { x:  r, y:  0, z:  0 }],
    [{ x:  0, y: -r, z:  0 }, { x:  0, y:  r, z:  0 }],
    [{ x:  0, y:  0, z: -r }, { x:  0, y:  0, z:  r }]
  ];

  ctx.strokeStyle = "rgba(0,255,0,0.6)";
  ctx.lineWidth = 1;
  ctx.beginPath();

  axes.forEach(([a0, a1]) => {
    const a = rotate3D({ ...a0 });
    const b = rotate3D({ ...a1 });

    ctx.moveTo(cx0 + a.x * SCALE, cy0 + a.y * SCALE);
    ctx.lineTo(cx0 + b.x * SCALE, cy0 + b.y * SCALE);
  });

  ctx.stroke();
}


function dot(a,b){ return a.x*b.x + a.y*b.y + a.z*b.z; }
function cross(a,b){
  return {
    x: a.y*b.z - a.z*b.y,
    y: a.z*b.x - a.x*b.z,
    z: a.x*b.y - a.y*b.x
  };
}

function insideTet(p, cell){
  for (const pl of cell._planes){
    if ((pl.n.x*p.x + pl.n.y*p.y + pl.n.z*p.z + pl.d) * pl.s < 0){
      return false;
    }
  }
  return true;
}


function prepareTetra(cell){
  const v = cell._scaled;

  cell._cz = (v[0].z + v[1].z + v[2].z + v[3].z) * 0.25;

  let minX=Infinity,minY=Infinity,minZ=Infinity;
  let maxX=-Infinity,maxY=-Infinity,maxZ=-Infinity;

  for (const p of v){
    if (p.x<minX) minX=p.x;
    if (p.y<minY) minY=p.y;
    if (p.z<minZ) minZ=p.z;
    if (p.x>maxX) maxX=p.x;
    if (p.y>maxY) maxY=p.y;
    if (p.z>maxZ) maxZ=p.z;
  }
  cell._aabb = {minX,minY,minZ,maxX,maxY,maxZ};

  // plane tests
  const [A,B,C,D] = v;
  function plane(a,b,c,d){
    const n = cross(
      {x:b.x-a.x,y:b.y-a.y,z:b.z-a.z},
      {x:c.x-a.x,y:c.y-a.y,z:c.z-a.z}
    );
    const s = dot(n,{x:d.x-a.x,y:d.y-a.y,z:d.z-a.z}) > 0 ? 1 : -1;
    return {n,d:-dot(n,a),s};
  }

  cell._planes = [
    plane(B,C,D,A),
    plane(A,C,D,B),
    plane(A,B,D,C),
    plane(A,B,C,D)
  ];
}
function draw(tets, ctx){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  cameraW = vw + 5;
  const cx = canvas.width >> 1;
  const cy = canvas.height >> 1;
  
  // Access the actual scenes - handle the nested structure
  const scenes = tets.tets || tets;
  
  for (const scene of Object.values(scenes)){
    for (const cell of scene){
      cell._scaled = cell.tetra.map(v =>
        scaleOrtho(v, vx, vy, vz, vw)
      );
      prepareTetra(cell);
    }
    scene.sort((a,b)=> b._cz - a._cz);
  }

  for (const scene of Object.values(scenes)){
    for (const cell of scene){
      const verts = cell._scaled;
      
      // Draw the 4 triangular faces of each tetrahedron
      const F = [[0,1,2],[0,1,3],[0,2,3],[1,2,3]];
      
      for (const [i,j,k] of F){
        const a = verts[i];
        const b = verts[j];
        const c = verts[k];
        
        // Rotate each vertex to screen space
        const r0 = rotate3D(a);
        const r1 = rotate3D(b);
        const r2 = rotate3D(c);
        
        // Convert to screen coordinates
        const sx0 = cx + r0.x * SCALE;
        const sy0 = cy + r0.y * SCALE;
        const sx1 = cx + r1.x * SCALE;
        const sy1 = cy + r1.y * SCALE;
        const sx2 = cx + r2.x * SCALE;
        const sy2 = cy + r2.y * SCALE;

        const p = {
          x: (a.x + b.x + c.x) / 3,
          y: (a.y + b.y + c.y) / 3,
          z: (a.z + b.z + c.z) / 3,
          w: (a.w + b.w + c.w) / 3
        };
        
        const dx = p.x - vx;
        const dy = p.y - vy;
        const dz = p.z - vz;
        const dw = Math.abs(p.w - cameraW);
        ctx.fillStyle = `rgba(${cell.col.r}, ${cell.col.g}, ${cell.col.b}, ${cell.col.a*(1 - Math.min(Math.abs(Math.sqrt(dx*dx + dy*dy + dz*dz)) / (dw+2), 1))})`;
      //  console.log(cell.col)
        ctx.beginPath();
        ctx.moveTo(sx0, sy0);
        ctx.lineTo(sx1, sy1);
        ctx.lineTo(sx2, sy2);
        ctx.closePath();
        ctx.fill();
        

      }
    }
  }

  drawViewingBox();
  drawLabel3D("Z", { x: 0, y: 2, z: 0 });
  drawLabel3D("Q", { x: 0, y: -2, z: 0 });    
  drawLabel3D("A", { x: -2, y: 0, z: 0 });
  drawLabel3D("D", { x: 2, y: 0, z: 0 });
  drawLabel3D("W", { x: 0, y: 0, z: -2 });
  drawLabel3D("S", { x: 0, y: 0, z: 2 });
}











//draw(tets);

