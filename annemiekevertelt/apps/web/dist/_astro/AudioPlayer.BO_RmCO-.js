import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as a}from"./index.DiEladB3.js";/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=s=>s.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),k=(...s)=>s.filter((r,n,o)=>!!r&&r.trim()!==""&&o.indexOf(r)===n).join(" ").trim();/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var M={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const P=a.forwardRef(({color:s="currentColor",size:r=24,strokeWidth:n=2,absoluteStrokeWidth:o,className:l="",children:c,iconNode:x,...h},u)=>a.createElement("svg",{ref:u,...M,width:r,height:r,stroke:s,strokeWidth:o?Number(n)*24/Number(r):n,className:k("lucide",l),...h},[...x.map(([w,f])=>a.createElement(w,f)),...Array.isArray(c)?c:[c]]));/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=(s,r)=>{const n=a.forwardRef(({className:o,...l},c)=>a.createElement(P,{ref:c,iconNode:r,className:k(`lucide-${E(s)}`,o),...l}));return n.displayName=`${s}`,n};/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=m("Pause",[["rect",{x:"14",y:"4",width:"4",height:"16",rx:"1",key:"zuxfzm"}],["rect",{x:"6",y:"4",width:"4",height:"16",rx:"1",key:"1okwgv"}]]);/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const V=m("Play",[["polygon",{points:"6 3 20 12 6 21 6 3",key:"1oa8hb"}]]);/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T=m("SkipBack",[["polygon",{points:"19 20 9 12 19 4 19 20",key:"o2sva"}],["line",{x1:"5",x2:"5",y1:"19",y2:"5",key:"1ocqjk"}]]);/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=m("SkipForward",[["polygon",{points:"5 4 15 12 5 20 5 4",key:"16p6eg"}],["line",{x1:"19",x2:"19",y1:"5",y2:"19",key:"futhcm"}]]);/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const B=m("Volume2",[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["path",{d:"M16 9a5 5 0 0 1 0 6",key:"1q6k2b"}],["path",{d:"M19.364 18.364a9 9 0 0 0 0-12.728",key:"ijwkga"}]]);/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z=m("VolumeX",[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["line",{x1:"22",x2:"16",y1:"9",y2:"15",key:"1ewh16"}],["line",{x1:"16",x2:"22",y1:"9",y2:"15",key:"5ykzw1"}]]);function R({title:s,audioUrl:r,coverImage:n,duration:o}){const[l,c]=a.useState(!1),[x,h]=a.useState(0),[u,w]=a.useState(0),[f,j]=a.useState(1),[p,g]=a.useState(!1),t=a.useRef(null);a.useEffect(()=>{t.current&&(t.current.addEventListener("loadedmetadata",()=>{w(t.current?.duration||0)}),t.current.addEventListener("timeupdate",()=>{h(t.current?.currentTime||0)}),t.current.addEventListener("ended",()=>{c(!1),h(0)}))},[r]);const v=()=>{t.current&&(l?t.current.pause():t.current.play(),c(!l))},N=d=>{const i=parseFloat(d.target.value);t.current&&(t.current.currentTime=i,h(i))},C=d=>{const i=parseFloat(d.target.value);j(i),t.current&&(t.current.volume=i),g(i===0)},S=()=>{t.current&&(p?(t.current.volume=f||1,g(!1)):(t.current.volume=0,g(!0)))},y=d=>{const i=Math.floor(d/60),A=Math.floor(d%60);return`${i}:${A.toString().padStart(2,"0")}`},b=u?x/u*100:0;return e.jsxs("div",{className:"bg-white rounded-3xl p-6 sm:p-8 shadow-xl",children:[e.jsx("audio",{ref:t,src:r||void 0,preload:"metadata"}),e.jsxs("div",{className:"flex flex-col sm:flex-row items-center gap-6",children:[e.jsx("div",{className:"w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 bg-gradient-to-br from-warm-brown to-gold flex items-center justify-center",style:{background:n?void 0:"linear-gradient(135deg, #8B7355 0%, #C4A77D 100%)"},children:n?e.jsx("img",{src:n,alt:s,className:"w-full h-full object-cover"}):e.jsx("svg",{className:"w-12 h-12 text-cream",fill:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{d:"M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"})})}),e.jsxs("div",{className:"flex-1 w-full",children:[e.jsx("h3",{className:"font-serif text-xl text-dark-brown mb-1 truncate text-center sm:text-left",children:s}),o&&e.jsxs("p",{className:"text-sm text-text-muted mb-4 text-center sm:text-left",children:["Duur: ",o]}),e.jsxs("div",{className:"space-y-2 mb-4",children:[e.jsx("input",{type:"range",min:0,max:u||100,value:x,onChange:N,className:"w-full h-2 bg-cream-dark rounded-full appearance-none cursor-pointer accent-warm-brown",style:{background:`linear-gradient(to right, #8B7355 ${b}%, #F5ECD8 ${b}%)`}}),e.jsxs("div",{className:"flex justify-between text-xs text-text-muted",children:[e.jsx("span",{children:y(x)}),e.jsx("span",{children:y(u)})]})]}),e.jsxs("div",{className:"flex items-center justify-center sm:justify-start gap-4",children:[e.jsx("button",{onClick:()=>{t.current&&(t.current.currentTime-=10)},className:"p-2 text-warm-brown hover:text-dark-brown transition-colors","aria-label":"10 seconden terug",children:e.jsx(T,{className:"w-5 h-5"})}),e.jsx("button",{onClick:v,disabled:!r,className:"w-14 h-14 rounded-full bg-warm-brown text-cream flex items-center justify-center hover:bg-dark-brown transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed","aria-label":l?"Pauze":"Afspelen",children:l?e.jsx(L,{className:"w-6 h-6"}):e.jsx(V,{className:"w-6 h-6 ml-1"})}),e.jsx("button",{onClick:()=>{t.current&&(t.current.currentTime+=10)},className:"p-2 text-warm-brown hover:text-dark-brown transition-colors","aria-label":"10 seconden vooruit",children:e.jsx($,{className:"w-5 h-5"})}),e.jsxs("div",{className:"flex items-center gap-2 ml-4",children:[e.jsx("button",{onClick:S,className:"p-1 text-warm-brown hover:text-dark-brown transition-colors","aria-label":p?"Geluid aan":"Dempen",children:p?e.jsx(z,{className:"w-5 h-5"}):e.jsx(B,{className:"w-5 h-5"})}),e.jsx("input",{type:"range",min:0,max:1,step:.1,value:p?0:f,onChange:C,className:"w-20 h-1 bg-cream-dark rounded-full appearance-none cursor-pointer","aria-label":"Volume"})]})]})]})]})]})}export{R as default};
