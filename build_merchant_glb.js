const fs = require('fs');
const path = require('path');

// Procedural low-poly, articulated merchant. Coordinates use glTF's Y-up convention.
const root = process.cwd();
const bin = [];
const views = [], accessors = [], meshes = [], nodes = [], materials = [];
function align4(){ while(bin.length % 4) bin.push(0); }
function addAccessor(data, componentType, type, target, min, max) {
  align4(); const offset=bin.length;
  const bytes=Buffer.from(data.buffer, data.byteOffset, data.byteLength); bin.push(...bytes);
  const view=views.push({buffer:0,byteOffset:offset,byteLength:bytes.length,...(target?{target}:{})})-1;
  return accessors.push({bufferView:view,componentType,count:data.length/({SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[type]),type,...(min?{min}:{}),...(max?{max}:{})})-1;
}
function material(name,color,metal=0,rough=.8){materials.push({name,pbrMetallicRoughness:{baseColorFactor:[...color,1],metallicFactor:metal,roughnessFactor:rough},doubleSided:true});return materials.length-1;}
const cloth=material('Natural undyed linen',[.78,.68,.49]), edge=material('Woven rust red',[.43,.15,.075]), skin=material('Sun-warmed skin',[.44,.235,.12]), skinLight=material('Face highlights',[.60,.35,.19]), hair=material('Silver hair',[.53,.52,.48]), hairDark=material('Hair shadow',[.24,.23,.21]), leather=material('Oiled dark leather',[.22,.105,.055]), bronze=material('Aged bronze',[.43,.29,.12],.62,.42), eye=material('Eyes',[.12,.075,.045]), white=material('Eye whites',[.82,.70,.5]);
function sphereGeom(rx=1,ry=1,rz=1,lat=20,lon=28){
 const v=[],n=[],ix=[]; for(let a=0;a<=lat;a++){let t=Math.PI*a/lat;for(let b=0;b<=lon;b++){let q=2*Math.PI*b/lon,x=Math.sin(t)*Math.cos(q),y=Math.cos(t),z=Math.sin(t)*Math.sin(q);v.push(x*rx,y*ry,z*rz);n.push(x,y,z);}}
 for(let a=0;a<lat;a++)for(let b=0;b<lon;b++){let i=a*(lon+1)+b,j=i+lon+1;ix.push(i,j,i+1,i+1,j,j+1);} return {v,n,ix};
}
function cylinderGeom(rt,rb,h,segments=12){const v=[],n=[],ix=[];for(let y=0;y<2;y++){let r=y?rb:rt,Y=y?h/2:-h/2;for(let i=0;i<=segments;i++){let a=i*2*Math.PI/segments,x=Math.cos(a),z=Math.sin(a);v.push(x*r,Y,z*r);n.push(x,0,z);}}for(let i=0;i<segments;i++){let j=i+segments+1;ix.push(i,j,i+1,i+1,j,j+1);}return {v,n,ix};}
function mesh(g,mat,name){let pos=new Float32Array(g.v),nor=new Float32Array(g.n),ind=new Uint16Array(g.ix);let pa=addAccessor(pos,5126,'VEC3',34962,[-2,-2,-2],[2,2,2]),na=addAccessor(nor,5126,'VEC3',34962),ia=addAccessor(ind,5123,'SCALAR',34963);return meshes.push({name,primitives:[{attributes:{POSITION:pa,NORMAL:na},indices:ia,material:mat,mode:4}]})-1;}
const sphereMesh=mesh(sphereGeom(),skin,'sphere'), clothSphere=mesh(sphereGeom(),cloth,'cloth'), redSphere=mesh(sphereGeom(),edge,'rust trim'), hairSphere=mesh(sphereGeom(),hair,'silver hair'), darkSphere=mesh(sphereGeom(),hairDark,'dark hair'), bronzeSphere=mesh(sphereGeom(),bronze,'bronze'), leatherSphere=mesh(sphereGeom(),leather,'leather'), skinLightSphere=mesh(sphereGeom(),skinLight,'face'), eyeSphere=mesh(sphereGeom(),eye,'eyes'), whiteSphere=mesh(sphereGeom(),white,'eye white');
const limbSkin=mesh(cylinderGeom(.12,.16,.65),skin,'limb'), clothLimb=mesh(cylinderGeom(.20,.26,.72),cloth,'robe'), rustLimb=mesh(cylinderGeom(.12,.13,.52),edge,'sash'), sandalMesh=mesh(cylinderGeom(.13,.11,.42),leather,'sandal');
function node(name,translation=[0,0,0],rotation=[0,0,0,1],scale=[1,1,1],meshId=null,parent=null){let n={name,translation,rotation,scale,...(meshId!==null?{mesh:meshId}:{})};let id=nodes.push(n)-1;if(parent!==null){nodes[parent].children??=[];nodes[parent].children.push(id);}return id;}
function part(parent,name,meshId,pos,scale){return node(name,pos,[0,0,0,1],scale,meshId,parent);}
const sceneRoot=node('Merchant Root',[0,0,0]);
const pelvis=node('Pelvis',[0,.92,0],[0,0,0,1],[1,1,1],null,sceneRoot);
part(pelvis,'Wrapped waist',clothSphere,[0,0,0],[.29,.31,.19]);
// Long overlapping robe panels and decorative rust borders
part(pelvis,'Ivory long robe',clothSphere,[0,-.49,0],[.34,.57,.22]);
part(pelvis,'Front woven panel',redSphere,[.04,-.49,.215],[.09,.52,.025]);
part(pelvis,'Left robe hem',clothSphere,[-.18,-.96,.03],[.17,.10,.22]);part(pelvis,'Right robe hem',clothSphere,[.17,-.96,.03],[.17,.10,.22]);
part(pelvis,'Woven hem border',redSphere,[0,-.88,.214],[.32,.045,.025]);
for(let i=0;i<7;i++){let x=-.24+i*.08;part(pelvis,'Linen fold',clothSphere,[x,-.48,.19],[.018,.38,.025]);}
part(pelvis,'Sash',rustLimb,[0,.12,.0],[1.95,.67,1.35]);
const torso=node('Torso',[0,.35,0],[0,0,0,1],[1,1,1],null,pelvis);
part(torso,'Chest',sphereMesh,[0,.06,0],[.36,.40,.22]);
part(torso,'Draped mantle',clothSphere,[0,.02,.01],[.41,.43,.24]);
part(torso,'Left mantle edge',redSphere,[-.27,-.02,.18],[.065,.40,.045]);part(torso,'Right mantle edge',redSphere,[.27,-.02,.18],[.065,.40,.045]);
for(let i=0;i<5;i++){let y=.25-i*.13;part(torso,'Mantle fold',clothSphere,[.30,y,.11],[.045,.16,.12]);}
part(torso,'Neck',limbSkin,[0,.45,0],[.72,.65,.70]);
const head=node('Head',[0,.61,0],[0,0,0,1],[1,1,1],null,torso);
part(head,'Face',sphereMesh,[0,.06,0],[.22,.29,.20]);
part(head,'Silver swept-back hair',hairSphere,[0,.24,-.035],[.24,.22,.22]);
part(head,'Topknot',hairSphere,[0,.40,-.08],[.11,.15,.11]);
part(head,'Beard',hairSphere,[0,-.17,.075],[.15,.20,.15]);part(head,'Moustache',hairSphere,[0,-.025,.18],[.16,.055,.07]);
for(let i=0;i<5;i++){let x=-.10+i*.05;part(head,'Beard strand',hairSphere,[x,-.20,.17],[.024,.15,.032]);}
for(const s of [-1,1]){part(head,'Ear',skinLightSphere,[s*.215,.03,0],[.07,.09,.055]);}
// Facial features, earrings and brows
for(const s of [-1,1]){part(head,'Eye white',whiteSphere,[s*.082,.10,.174],[.043,.027,.022]);part(head,'Pupil',eyeSphere,[s*.082,.10,.194],[.018,.020,.012]);part(head,'Brow',hairSphere,[s*.082,.148,.178],[.060,.022,.035]);part(head,'Bronze earring',bronzeSphere,[s*.225,-.02,.025],[.035,.065,.025]);}
part(head,'Nose',skinLightSphere,[0,.045,.205],[.045,.09,.05]);
part(head,'Lower lip',hairDark,[0,-.075,.185],[.052,.018,.018]);
for(const s of [-1,1]){part(head,'Forehead crease',hairDark,[s*.075,.205,.16],[.055,.008,.012]);}
// Medallion and necklace rest on chest
part(torso,'Pendant cord',hairDark,[0,.04,.225],[.19,.24,.018]);part(torso,'Bronze medallion',bronzeSphere,[0,-.19,.25],[.12,.12,.035]);part(torso,'Medallion center',hairDark,[0,-.19,.282],[.055,.055,.012]);
// Shoulder/arm pivots; arms angle naturally down at rest.
const armPivots=[];
for(const s of [-1,1]){let sh=node(s<0?'Left Shoulder':'Right Shoulder',[s*.36,.25,0],[0,0,0,1],[1,1,1],null,torso);armPivots.push(sh);part(sh,'Upper arm',limbSkin,[0,-.27,0],[.72,.48,.72]);let elbow=node(s<0?'Left Elbow':'Right Elbow',[0,-.53,0],[0,0,0,1],[1,1,1],null,sh);part(elbow,'Forearm',limbSkin,[0,-.25,0],[.61,.40,.62]);part(elbow,'Hand',skinLightSphere,[0,-.53,.025],[.085,.13,.07]);if(s<0)part(sh,'Armlet',bronzeSphere,[0,-.14,.01],[.14,.045,.14]);}
const legPivots=[], kneePivots=[], footPivots=[];
for(const s of [-1,1]){let hip=node(s<0?'Left Hip':'Right Hip',[s*.16,-.06,0],[0,0,0,1],[1,1,1],null,pelvis);legPivots.push(hip);part(hip,'Robe leg',clothSphere,[0,-.28,0],[.19,.42,.20]);let knee=node(s<0?'Left Knee':'Right Knee',[0,-.55,0],[0,0,0,1],[1,1,1],null,hip);kneePivots.push(knee);part(knee,'Lower leg',limbSkin,[0,-.22,0],[.68,.39,.68]);part(knee,'Ankle wrap',redSphere,[0,-.44,0],[.11,.07,.12]);let foot=node(s<0?'Left Foot':'Right Foot',[0,-.47,.03],[0,0,0,1],[1,1,1],null,knee);footPivots.push(foot);part(foot,'Leather sandal',sandalMesh,[0,-.02,.08],[1,.5,1]);part(foot,'Sandal strap',bronzeSphere,[0,.02,.10],[.12,.025,.08]);}
// Side-view profile preserved; model faces +Z.
function quatX(a){return [Math.sin(a/2),0,0,Math.cos(a/2)];}
function quatZ(a){return [0,0,Math.sin(a/2),Math.cos(a/2)];}
const anims=[];
function animation(name,duration,keys,kind){let samplers=[],channels=[];function track(n,values,type,rotation=false){let input=addAccessor(new Float32Array(keys),5126,'SCALAR',null,[0],[duration]);let flat=rotation?values.flat():values.flat();let output=addAccessor(new Float32Array(flat),5126,type,null);let si=samplers.push({input,output,interpolation:'LINEAR'})-1;channels.push({sampler:si,target:{node:n,path:rotation?'rotation':'translation'}});}
 for(let i=0;i<2;i++){let swing=kind==='Walk'?.38:.72, phase=i?Math.PI:0;let cycle=t=>t/duration*2*Math.PI+phase;track(legPivots[i],keys.map(t=>quatX(Math.sin(cycle(t))*swing)),'VEC4',true);track(kneePivots[i],keys.map(t=>quatX(Math.max(0,Math.sin(cycle(t)+.45))*(kind==='Walk'?.14:.46))),'VEC4',true);track(footPivots[i],keys.map(t=>quatX(-Math.sin(cycle(t))*.10)),'VEC4',true);track(armPivots[i],keys.map(t=>quatX(Math.sin(cycle(t)+Math.PI)*swing*.70)),'VEC4',true);}
 track(torso,keys.map(t=>[0,Math.sin(t/duration*2*Math.PI)* (kind==='Walk'?.025:.045),0]),'VEC3');
 anims.push({name,samplers,channels});}
animation('Walk',1.25,[0,.3125,.625,.9375,1.25],'Walk');animation('Sprint',.68,[0,.17,.34,.51,.68],'Sprint');
const gltf={asset:{version:'2.0',generator:'Codex Procedural Merchant Builder'},scene:0,scenes:[{nodes:[sceneRoot]}],nodes,meshes,materials,accessors,bufferViews:views,buffers:[{byteLength:bin.length}],animations:anims};
let json=Buffer.from(JSON.stringify(gltf));while(json.length%4)json=Buffer.concat([json,Buffer.from(' ')]);let binary=Buffer.from(bin);while(binary.length%4)binary=Buffer.concat([binary,Buffer.from([0])]);
const total=12+8+json.length+8+binary.length;const glb=Buffer.alloc(total);glb.write('glTF',0);glb.writeUInt32LE(2,4);glb.writeUInt32LE(total,8);glb.writeUInt32LE(json.length,12);glb.writeUInt32LE(0x4E4F534A,16);json.copy(glb,20);let off=20+json.length;glb.writeUInt32LE(binary.length,off);glb.writeUInt32LE(0x004E4942,off+4);binary.copy(glb,off+8);
const out=path.join(root,'elderly_merchant_animated.glb');fs.writeFileSync(out,glb);console.log(`Wrote ${out} (${glb.length} bytes)`);
