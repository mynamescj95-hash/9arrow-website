document.addEventListener('DOMContentLoaded',function(){
  var t=document.querySelector('.nav-toggle'),l=document.querySelector('.nav-links');
  if(t)t.addEventListener('click',function(){l.classList.toggle('open');});
  if(l)l.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){l.classList.remove('open');});});

  // scroll reveals + quiver activation
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  },{threshold:.14, rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal,.quiver').forEach(function(el){io.observe(el);});

  // condensing sticky header
  var h=document.querySelector('.site-header');
  var onScroll=function(){ if(h) h.classList.toggle('scrolled', window.scrollY>40); };
  onScroll(); window.addEventListener('scroll',onScroll,{passive:true});
});

// interactive before/after slider
(function(){
  var s=document.getElementById('baslider'); if(!s) return;
  var drag=false;
  function setpos(x){var r=s.getBoundingClientRect();var p=(x-r.left)/r.width*100;p=Math.max(2,Math.min(98,p));s.style.setProperty('--pos',p+'%');}
  s.addEventListener('pointerdown',function(e){drag=true;setpos(e.clientX);try{s.setPointerCapture(e.pointerId);}catch(_){}});
  s.addEventListener('pointermove',function(e){if(drag)setpos(e.clientX);});
  window.addEventListener('pointerup',function(){drag=false;});
})();

// scroll-reactive parallax background + aim rail
(function(){
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var topo=document.querySelector('.bg-fx .l-topo'),
      arr=document.querySelector('.bg-fx .l-arrows'),
      ring=document.querySelector('.bg-fx .l-ring'),
      aim=document.querySelector('.aimrail .arrow'),
      doc=document.documentElement, ticking=false;
  function upd(){
    var y=window.scrollY||0, max=(doc.scrollHeight-window.innerHeight)||1, p=Math.min(1,Math.max(0,y/max));
    if(topo) topo.style.transform='translate3d(0,'+(-y*0.06)+'px,0)';
    if(arr)  arr.style.transform ='translate3d('+(y*0.05)+'px,'+(y*0.11)+'px,0)';
    if(ring) ring.style.transform='translate3d(0,'+(-y*0.03)+'px,0) rotate('+(y*0.02)+'deg)';
    if(aim)  aim.style.top=(9+p*82)+'%';
    ticking=false;
  }
  window.addEventListener('scroll',function(){ if(!ticking){requestAnimationFrame(upd);ticking=true;} },{passive:true});
  window.addEventListener('resize',upd,{passive:true}); upd();
})();

// services carousel arrows
(function(){
  var rail=document.getElementById('svcRail'); if(!rail) return;
  document.querySelectorAll('[data-rail]').forEach(function(b){
    b.addEventListener('click',function(){ rail.scrollBy({left:(b.getAttribute('data-rail')==='next'?1:-1)*340,behavior:'smooth'}); });
  });
})();

// service photo galleries (thumbnail swaps main image)
(function(){
  document.querySelectorAll('[data-gallery]').forEach(function(g){
    var main=g.querySelector('.sg-main img');
    g.querySelectorAll('.sg-thumb').forEach(function(b){
      b.addEventListener('click',function(){
        main.style.opacity=0;
        setTimeout(function(){ main.src=b.getAttribute('data-full'); main.style.opacity=1; },120);
        g.querySelectorAll('.sg-thumb').forEach(function(x){x.classList.remove('is-active');});
        b.classList.add('is-active');
      });
    });
  });
})();

// ===== new header: condense on scroll + cinematic menu overlay =====
(function(){
  var hdr=document.getElementById('hdr');
  if(hdr){ var on=function(){hdr.classList.toggle('scrolled',window.scrollY>40);}; on(); window.addEventListener('scroll',on,{passive:true}); }
  var btn=document.getElementById('hdrMenu'), ov=document.getElementById('navover'), x=document.getElementById('navoverX');
  if(btn&&ov){
    function open(){ov.classList.add('open');ov.setAttribute('aria-hidden','false');btn.setAttribute('aria-expanded','true');document.body.classList.add('nav-open');}
    function close(){ov.classList.remove('open');ov.setAttribute('aria-hidden','true');btn.setAttribute('aria-expanded','false');document.body.classList.remove('nav-open');}
    btn.addEventListener('click',open);
    if(x)x.addEventListener('click',close);
    ov.querySelectorAll('.navover-nav a').forEach(function(a){a.addEventListener('click',close);});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
    // active link
    var here=(location.pathname.split('/').pop()||'index.html');
    ov.querySelectorAll('.navover-nav a').forEach(function(a){
      var href=a.getAttribute('href'); if(href===here||(here==='index.html'&&href==='index.html')){a.classList.add('active');}
    });
  }
})();

// ===== interactive transformation background (scene per page) =====
(function(){
  var cv=document.getElementById('clearfield'); if(!cv) return;
  var SCENE=cv.getAttribute('data-scene')||'clearing';
  var ctx=cv.getContext('2d'), dpr=Math.min(window.devicePixelRatio||1,2), W=0,H=0,base=0,trees=[];
  function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  function build(){W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;base=Math.round(H*0.62);
    var r=rng(7),N=Math.max(16,Math.round(W/52));trees=[];for(var i=0;i<N;i++)trees.push({x:(i+0.5)/N+(r()-0.5)*0.4/N,s:12+r()*10});}
  function tree(x,s){var Hh=s*3;ctx.fillStyle='#34431f';ctx.fillRect(x-2,base-Hh*0.15,4,Hh*0.15);ctx.fillStyle='#6f8a3c';
    function t(b,tp,hw){ctx.beginPath();ctx.moveTo(x-hw,base-b);ctx.lineTo(x+hw,base-b);ctx.lineTo(x,base-tp);ctx.closePath();ctx.fill();}
    t(Hh*0.15,Hh*0.52,s*0.9);t(Hh*0.4,Hh*0.74,s*0.7);t(Hh*0.64,Hh*0.96,s*0.52);}
  function mulcher(cx,t){ctx.save();ctx.translate(cx,base);ctx.globalAlpha=.92;ctx.fillStyle='#C39A2E';
    ctx.beginPath();if(ctx.roundRect)ctx.roundRect(-58,-2,116,18,9);else ctx.rect(-58,-2,116,18);ctx.fill();
    ctx.fillRect(-38,-22,74,22);ctx.fillRect(-24,-40,34,20);ctx.fillStyle='rgba(11,12,10,.5)';ctx.fillRect(-20,-36,26,12);
    ctx.save();ctx.translate(78,-2);ctx.fillStyle='#C39A2E';ctx.beginPath();ctx.arc(0,0,17,0,6.2832);ctx.fill();
    ctx.rotate(t*9);ctx.strokeStyle='#0B0C0A';ctx.lineWidth=2.5;for(var j=0;j<8;j++){ctx.rotate(.785);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(17,0);ctx.stroke();}ctx.restore();
    ctx.fillStyle='#b9912b';ctx.globalAlpha=.5;for(var i=0;i<8;i++){var a=(i*.7+t*6)%6.2832,d=14+((i*53+t*240)%26);ctx.fillRect(86+Math.cos(a)*d,-2+Math.sin(a)*d*.7,3,2);}ctx.restore();}
  function tint(hx,c){ctx.fillStyle=c;ctx.fillRect(0,base,hx,H-base);}
  function car(cx,col){ctx.save();ctx.translate(cx,base-10);ctx.fillStyle=col;
    if(ctx.roundRect){ctx.beginPath();ctx.roundRect(-20,-6,40,12,3);ctx.fill();ctx.beginPath();ctx.roundRect(-11,-15,22,11,3);ctx.fill();}else{ctx.fillRect(-20,-6,40,12);ctx.fillRect(-11,-15,22,11);}
    ctx.fillStyle='#0B0C0A';ctx.beginPath();ctx.arc(-12,7,4,0,6.2832);ctx.arc(12,7,4,0,6.2832);ctx.fill();ctx.restore();}
  function tower(x,h){ctx.strokeStyle='rgba(160,160,150,.75)';ctx.lineWidth=3;var top=base-h,wb=18,wt=6;
    ctx.beginPath();ctx.moveTo(x-wb,base);ctx.lineTo(x-wt,top);ctx.moveTo(x+wb,base);ctx.lineTo(x+wt,top);
    ctx.moveTo(x-13,base-h*0.55);ctx.lineTo(x+13,base-h*0.55);ctx.moveTo(x-wt-9,top+9);ctx.lineTo(x+wt+9,top+9);ctx.stroke();}
  function pole(x){ctx.strokeStyle='rgba(120,95,60,.8)';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x,base);ctx.lineTo(x,base-74);ctx.stroke();
    ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-12,base-66);ctx.lineTo(x+12,base-66);ctx.stroke();
    ctx.fillStyle='rgba(226,188,73,.7)';ctx.beginPath();ctx.arc(x,base-74,3,0,6.2832);ctx.fill();}
  function building(x,h){var w=46;ctx.fillStyle='#23272c';ctx.fillRect(x-w/2,base-h,w,h);
    ctx.fillStyle='#15181c';ctx.fillRect(x-w/2,base-h,w,5);
    ctx.fillStyle='rgba(226,188,73,.5)';for(var wy=base-h+11;wy<base-8;wy+=12)for(var wx=x-w/2+6;wx<x+w/2-6;wx+=11)ctx.fillRect(wx,wy,6,7);
    ctx.strokeStyle='rgba(11,12,10,.5)';ctx.lineWidth=1;ctx.strokeRect(x-w/2,base-h,w,h);}
  function log(x){ctx.save();ctx.translate(x,base-3);ctx.fillStyle='#6b5836';
    if(ctx.roundRect){ctx.beginPath();ctx.roundRect(-22,-6,44,12,6);ctx.fill();}else ctx.fillRect(-22,-6,44,12);
    ctx.fillStyle='#8a7048';ctx.beginPath();ctx.arc(-22,0,6,0,6.2832);ctx.fill();ctx.strokeStyle='#5a4a2c';ctx.lineWidth=1;ctx.beginPath();ctx.arc(-22,0,3,0,6.2832);ctx.stroke();ctx.restore();}
  function cow(x){ctx.save();ctx.translate(x,base);ctx.fillStyle='#3b2f25';ctx.fillRect(-16,-20,32,12);
    ctx.fillRect(-15,-8,4,8);ctx.fillRect(-3,-8,4,8);ctx.fillRect(7,-8,4,8);ctx.fillRect(12,-8,4,8);ctx.fillRect(-22,-17,9,8);
    ctx.fillStyle='rgba(232,226,214,.7)';ctx.fillRect(0,-18,10,8);ctx.restore();}
  function person(x){ctx.save();ctx.translate(x,base);ctx.strokeStyle='#cfc7b2';ctx.fillStyle='#cfc7b2';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(0,-26,4,0,6.2832);ctx.fill();ctx.beginPath();ctx.moveTo(0,-22);ctx.lineTo(0,-11);
    ctx.moveTo(0,-11);ctx.lineTo(-4,-1);ctx.moveTo(0,-11);ctx.lineTo(4,-1);ctx.moveTo(0,-19);ctx.lineTo(-5,-14);ctx.moveTo(0,-19);ctx.lineTo(5,-14);ctx.stroke();ctx.restore();}
  function house(x){ctx.save();ctx.translate(x,base);ctx.fillStyle='#4a4036';ctx.fillRect(-22,-34,44,34);
    ctx.fillStyle='#6b3b2c';ctx.beginPath();ctx.moveTo(-26,-34);ctx.lineTo(0,-54);ctx.lineTo(26,-34);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(226,188,73,.6)';ctx.fillRect(-15,-24,10,10);ctx.fillRect(5,-24,10,10);ctx.fillStyle='#241f18';ctx.fillRect(-5,-17,10,17);ctx.restore();}
  function well(x){ctx.save();ctx.translate(x,base);ctx.fillStyle='#6b6f72';ctx.fillRect(-8,-14,16,14);
    ctx.strokeStyle='#5a4a2c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-8,-14);ctx.lineTo(-8,-28);ctx.moveTo(8,-14);ctx.lineTo(8,-28);ctx.stroke();
    ctx.fillStyle='#6b3b2c';ctx.beginPath();ctx.moveTo(-12,-28);ctx.lineTo(0,-36);ctx.lineTo(12,-28);ctx.closePath();ctx.fill();ctx.restore();}
  function weed(x,s){var Hh=s*2.3;ctx.strokeStyle='#5e6b3a';ctx.lineWidth=2;ctx.beginPath();
    ctx.moveTo(x,base);ctx.quadraticCurveTo(x-6,base-Hh*0.6,x-3,base-Hh);ctx.moveTo(x,base);ctx.quadraticCurveTo(x+2,base-Hh*0.7,x+4,base-Hh*1.05);
    ctx.moveTo(x,base);ctx.quadraticCurveTo(x-1,base-Hh*0.5,x-7,base-Hh*0.8);ctx.moveTo(x,base);ctx.quadraticCurveTo(x+6,base-Hh*0.6,x+8,base-Hh*0.85);ctx.stroke();}
  function ball(x){ctx.save();ctx.translate(x,base-7);ctx.fillStyle='rgba(240,238,230,.9)';ctx.beginPath();ctx.arc(0,0,7,0,6.2832);ctx.fill();ctx.fillStyle='#0B0C0A';ctx.beginPath();ctx.arc(0,0,2.2,0,6.2832);ctx.fill();ctx.restore();}
  function after(hx,t){
    if(SCENE==='pasture'){ctx.strokeStyle='rgba(120,150,70,.5)';ctx.lineWidth=2;
      for(var x=8;x<hx;x+=11){ctx.beginPath();ctx.moveTo(x,base);ctx.lineTo(x-2,base-7);ctx.stroke();}
      ctx.strokeStyle='rgba(120,95,60,.6)';ctx.lineWidth=3;var fy=base-26;ctx.beginPath();ctx.moveTo(0,fy);ctx.lineTo(hx,fy);ctx.moveTo(0,fy+12);ctx.lineTo(hx,fy+12);ctx.stroke();
      for(var px=40;px<hx;px+=80){ctx.beginPath();ctx.moveTo(px,base);ctx.lineTo(px,base-34);ctx.stroke();}
      if(hx>W*0.34){var ox=W*0.3;ctx.fillStyle='rgba(70,100,40,.8)';ctx.beginPath();ctx.arc(ox,base-56,34,0,6.2832);ctx.fill();ctx.fillStyle='#4b3a22';ctx.fillRect(ox-5,base-30,10,30);}
    } else if(SCENE==='road'){ctx.fillStyle='rgba(58,61,64,.85)';ctx.fillRect(0,base-15,hx,30);
      ctx.fillStyle='rgba(226,188,73,.85)';for(var dx=((t*130)%48)-48;dx<hx;dx+=48)ctx.fillRect(dx,base-2,22,4);
      var cs=[[0,'#cdd2d6'],[0.45,'#b06a2c'],[0.8,'#7A8B3D']];cs.forEach(function(c){var span=hx-40;if(span<60)return;var cx=((t*72+c[0]*span*2)%span)+12;car(cx,c[1]);});
    } else if(SCENE==='pad'){
      ctx.fillStyle='rgba(196,200,198,.93)';ctx.fillRect(0,base-7,hx,14);
      ctx.fillStyle='rgba(232,235,233,.55)';ctx.fillRect(0,base-7,hx,3);
      ctx.strokeStyle='rgba(85,92,90,.5)';ctx.lineWidth=1;for(var jx=78;jx<hx;jx+=80){ctx.beginPath();ctx.moveTo(jx,base-7);ctx.lineTo(jx,base+7);ctx.stroke();}
      if(hx>44){var we=Math.max(0,hx-48);ctx.fillStyle='rgba(150,158,156,.95)';ctx.fillRect(we,base-7,hx-we,14);var sh=0.5+0.5*Math.sin(t*4);ctx.fillStyle='rgba(225,235,240,'+(0.22+0.4*sh)+')';ctx.fillRect(we,base-6,hx-we,2);}
    } else if(SCENE==='lots'){ctx.strokeStyle='rgba(195,154,46,.4)';ctx.lineWidth=1.5;ctx.setLineDash([6,6]);
      for(var x=70;x<hx;x+=90){ctx.beginPath();ctx.moveTo(x,base);ctx.lineTo(x,base-72);ctx.stroke();}ctx.setLineDash([]);
      ctx.fillStyle='rgba(120,130,120,.45)';ctx.strokeStyle='rgba(242,238,225,.45)';ctx.lineWidth=1.5;
      for(var px=30;px<hx-40;px+=90){ctx.fillRect(px,base-30,52,30);ctx.strokeRect(px,base-30,52,30);}
    } else if(SCENE==='solar'){
      for(var x=44;x<hx;x+=64){ctx.save();ctx.translate(x,base);ctx.strokeStyle='#7a7f78';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-16);ctx.stroke();
        ctx.translate(0,-18);ctx.rotate(-0.5);ctx.fillStyle='rgba(40,70,110,.82)';ctx.fillRect(-22,-10,44,20);ctx.strokeStyle='rgba(180,200,230,.5)';ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(-22,0);ctx.lineTo(22,0);ctx.moveTo(0,-10);ctx.lineTo(0,10);ctx.stroke();ctx.restore();}
    } else if(SCENE==='utility'){var xs=[];for(var x=80;x<hx;x+=150)xs.push(x);
      ctx.strokeStyle='rgba(200,200,190,.4)';ctx.lineWidth=1.5;for(var i=0;i<xs.length-1;i++){ctx.beginPath();ctx.moveTo(xs[i],base-82);ctx.quadraticCurveTo((xs[i]+xs[i+1])/2,base-64,xs[i+1],base-82);ctx.stroke();}
      xs.forEach(function(x){tower(x,90);});
    } else if(SCENE==='logs'){
      for(var li=0;li<trees.length;li++){var lx=trees[li].x*W;if(lx<hx)log(lx);}
    } else if(SCENE==='ranch'){
      ctx.strokeStyle='rgba(120,150,70,.5)';ctx.lineWidth=2;for(var gx=8;gx<hx;gx+=11){ctx.beginPath();ctx.moveTo(gx,base);ctx.lineTo(gx-2,base-7);ctx.stroke();}
      ctx.strokeStyle='rgba(120,95,60,.6)';ctx.lineWidth=3;var fy=base-26;ctx.beginPath();ctx.moveTo(0,fy);ctx.lineTo(hx,fy);ctx.moveTo(0,fy+12);ctx.lineTo(hx,fy+12);ctx.stroke();
      for(var fpx=40;fpx<hx;fpx+=80){ctx.beginPath();ctx.moveTo(fpx,base);ctx.lineTo(fpx,base-34);ctx.stroke();}
      [0.18,0.42,0.66].forEach(function(fr){if(hx>fr*W)cow(fr*W);});
    } else if(SCENE==='lawn'){
      ctx.strokeStyle='rgba(96,150,60,.6)';ctx.lineWidth=2;for(var lx2=6;lx2<hx;lx2+=8){ctx.beginPath();ctx.moveTo(lx2,base);ctx.lineTo(lx2,base-5);ctx.stroke();}
      if(hx>W*0.55)ball(W*0.5);
    } else if(SCENE==='path'){
      ctx.fillStyle='rgba(196,168,120,.5)';ctx.fillRect(0,base-3,hx,9);
      [0,0.4,0.75].forEach(function(o){var span=hx-30;if(span<60)return;person(((t*40+o*span*2)%span)+12);});
    } else if(SCENE==='homes'){
      for(var hmi=0;hmi<trees.length;hmi++){var hmx=trees[hmi].x*W;if(hmx<hx){if(hmi%4===2)well(hmx);else house(hmx);}}
    } else if(SCENE==='cedar'){
      ctx.strokeStyle='rgba(110,150,70,.5)';ctx.lineWidth=2;for(var cgx=8;cgx<hx;cgx+=12){ctx.beginPath();ctx.moveTo(cgx,base);ctx.lineTo(cgx-2,base-7);ctx.stroke();}
      ctx.fillStyle='rgba(140,200,235,.8)';for(var wi=0;wi<Math.floor(hx/70);wi++){var wx=wi*70+30,tw=0.5+0.5*Math.sin(t*2+wi);ctx.globalAlpha=0.25+0.55*tw;ctx.fillRect(wx,base+7+((wi*13)%13),4,3);}ctx.globalAlpha=1;
      if(hx>W*0.32){var cox=W*0.3;ctx.fillStyle='rgba(70,100,40,.8)';ctx.beginPath();ctx.arc(cox,base-54,32,0,6.2832);ctx.fill();ctx.fillStyle='#4b3a22';ctx.fillRect(cox-5,base-28,10,28);}
    } else if(SCENE==='commercial'){for(var bi=0;bi<trees.length;bi++){var bx=trees[bi].x*W;if(bx<hx)building(bx,52+(trees[bi].s-12)*7);}
    } else if(SCENE==='utilities'){
      ctx.strokeStyle='rgba(160,140,100,.5)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,base);ctx.lineTo(W,base);ctx.stroke();
      ctx.fillStyle='rgba(70,55,35,.2)';ctx.fillRect(0,base+2,hx,48);
      ctx.fillStyle='rgba(70,110,150,.75)';ctx.fillRect(0,base+16,hx,11);
      ctx.fillStyle='rgba(150,205,238,.85)';for(var fx=((t*130)%28)-28;fx<hx;fx+=28)ctx.fillRect(fx,base+19,13,5);
      ctx.fillStyle='rgba(184,150,70,.6)';ctx.fillRect(0,base+34,hx,7);
      ctx.fillStyle='rgba(11,12,10,.5)';ctx.fillRect(hx-10,base+2,20,48);
      var pxs=[];for(var x=80;x<hx;x+=150)pxs.push(x);
      ctx.strokeStyle='rgba(210,210,200,.45)';ctx.lineWidth=1.5;for(var i=0;i<pxs.length-1;i++){ctx.beginPath();ctx.moveTo(pxs[i],base-70);ctx.quadraticCurveTo((pxs[i]+pxs[i+1])/2,base-58,pxs[i+1],base-70);ctx.stroke();}
      pxs.forEach(function(x){pole(x);});
    } else if(SCENE==='cleared'){
      ctx.strokeStyle='rgba(195,154,46,.12)';ctx.lineWidth=2;ctx.setLineDash([12,10]);
      ctx.beginPath();ctx.moveTo(0,base+6);ctx.lineTo(hx,base+6);ctx.moveTo(0,base+12);ctx.lineTo(hx,base+12);ctx.stroke();ctx.setLineDash([]);
    } else { // clearing (home): tracks + stumps
      ctx.strokeStyle='rgba(195,154,46,.14)';ctx.lineWidth=2;ctx.setLineDash([10,9]);ctx.beginPath();ctx.moveTo(0,base+6);ctx.lineTo(hx,base+6);ctx.moveTo(0,base+12);ctx.lineTo(hx,base+12);ctx.stroke();ctx.setLineDash([]);
      for(var i=0;i<trees.length;i++){var tx=trees[i].x*W;if(tx<hx){ctx.fillStyle='#5d4a2c';ctx.beginPath();ctx.ellipse(tx,base,trees[i].s*0.35,trees[i].s*0.15,0,0,6.2832);ctx.fill();}}
    }
  }
  function draw(now){if(!W){requestAnimationFrame(draw);return;}var t=(now||0)*0.001;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    var sy=window.scrollY||0,maxs=(document.documentElement.scrollHeight-H)||1,prog=Math.min(1,Math.max(0,sy/maxs));
    var hx=-60+prog*(W+120);
    after(hx,t);
    for(var i=0;i<trees.length;i++){var tx=trees[i].x*W;if(tx>hx){if(SCENE==='lawn')weed(tx,trees[i].s);else tree(tx,trees[i].s);}}
    mulcher(hx,t);
    requestAnimationFrame(draw);}
  build();window.addEventListener('resize',build,{passive:true});requestAnimationFrame(draw);
})();


// Our Work: filter + lightbox
(function(){
  var grid=document.getElementById('workGrid'); if(!grid) return;
  document.querySelectorAll('.work-filters button').forEach(function(b){
    b.addEventListener('click',function(){
      document.querySelectorAll('.work-filters button').forEach(function(x){x.classList.remove('active');});
      b.classList.add('active'); var c=b.getAttribute('data-cat');
      grid.querySelectorAll('.work-item').forEach(function(it){ it.classList.toggle('hide', c!=='all' && it.getAttribute('data-cat')!==c); });
    });
  });
  var lb=document.getElementById('lightbox'), lbimg=lb&&lb.querySelector('img');
  grid.querySelectorAll('.work-item').forEach(function(it){
    it.addEventListener('click',function(){ if(lb){lbimg.src=it.querySelector('img').src;lb.classList.add('open');document.body.classList.add('nav-open');} });
  });
  if(lb){ function cl(){lb.classList.remove('open');document.body.classList.remove('nav-open');}
    lb.addEventListener('click',function(e){if(e.target===lb||e.target.classList.contains('lb-x'))cl();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')cl();}); }
})();

// hero stat count-up
(function(){
  function up(el){var tgt=+el.dataset.count,dec=+(el.dataset.decimals||0),suf=el.dataset.suffix||'',dur=1500,st=null;
    function step(ts){if(!st)st=ts;var p=Math.min(1,(ts-st)/dur),v=tgt*(1-Math.pow(1-p,3));el.textContent=v.toFixed(dec)+suf;if(p<1)requestAnimationFrame(step);else el.textContent=tgt.toFixed(dec)+suf;}
    requestAnimationFrame(step);}
  document.querySelectorAll('.hero-stats [data-count]').forEach(up);
})();

// hero land-clearing loop animation
(function(){
  var cv=document.getElementById('heroclear'); if(!cv) return;
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var ctx=cv.getContext('2d'),dpr=Math.min(window.devicePixelRatio||1,2),W=0,H=0,base=0,trees=[];
  function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  function build(){W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;base=H-6;var r=rng(5),N=Math.max(10,Math.round(W/64));trees=[];for(var i=0;i<N;i++)trees.push({x:(i+0.5)/N+(r()-0.5)*0.5/N,s:11+r()*7});}
  function tree(x,s){var Hh=s*3;ctx.fillStyle='#34431f';ctx.fillRect(x-2,base-Hh*0.15,4,Hh*0.15);ctx.fillStyle='#74863f';
    function t(b,tp,hw){ctx.beginPath();ctx.moveTo(x-hw,base-b);ctx.lineTo(x+hw,base-b);ctx.lineTo(x,base-tp);ctx.closePath();ctx.fill();}
    t(Hh*0.15,Hh*0.52,s*0.9);t(Hh*0.4,Hh*0.74,s*0.7);t(Hh*0.64,Hh*0.96,s*0.52);}
  function mul(cx,t){ctx.save();ctx.translate(cx,base);ctx.fillStyle='#C39A2E';
    ctx.beginPath();if(ctx.roundRect)ctx.roundRect(-42,-2,84,13,7);else ctx.rect(-42,-2,84,13);ctx.fill();
    ctx.fillRect(-28,-18,54,18);ctx.fillRect(-18,-30,26,14);ctx.fillStyle='rgba(11,12,10,.5)';ctx.fillRect(-14,-26,18,9);ctx.fillStyle='#C39A2E';
    ctx.save();ctx.translate(56,-2);ctx.beginPath();ctx.arc(0,0,13,0,6.2832);ctx.fill();ctx.rotate(t*9);ctx.strokeStyle='#0B0C0A';ctx.lineWidth=2;for(var j=0;j<8;j++){ctx.rotate(.785);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(13,0);ctx.stroke();}ctx.restore();
    ctx.fillStyle='#b9912b';ctx.globalAlpha=.5;for(var i=0;i<7;i++){var a=(i*.7+t*6)%6.2832,d=12+((i*53+t*220)%22);ctx.fillRect(64+Math.cos(a)*d,-2+Math.sin(a)*d*.7,2,2);}ctx.restore();}
  function loop(now){if(!W){requestAnimationFrame(loop);return;}var t=(now||0)*0.001;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    var period=W+280,hx=((t*150)%period)-140;
    for(var i=0;i<trees.length;i++){var tx=trees[i].x*W;if(tx<hx){ctx.fillStyle='#5d4a2c';ctx.beginPath();ctx.ellipse(tx,base,trees[i].s*0.32,trees[i].s*0.14,0,0,6.2832);ctx.fill();}}
    for(var k=0;k<trees.length;k++){var tx2=trees[k].x*W;if(tx2>hx)tree(tx2,trees[k].s);}
    mul(hx,t);requestAnimationFrame(loop);}
  build();window.addEventListener('resize',build,{passive:true});requestAnimationFrame(loop);
})();

/* blog search + category filter */
(function(){
  var tools=document.querySelector('.blog-tools'); if(!tools) return;
  var q=document.getElementById('blogSearch'),
      chips=[].slice.call(document.querySelectorAll('.chip')),
      items=[].slice.call(document.querySelectorAll('.blog-item')),
      count=document.getElementById('blogCount'),
      empty=document.getElementById('blogEmpty'),
      filter='all';
  function apply(){
    var term=(q&&q.value||'').trim().toLowerCase(), n=0;
    items.forEach(function(it){
      var tags=(it.getAttribute('data-tags')||'').split(' '),
          hay=it.getAttribute('data-search')||'',
          okF=filter==='all'||tags.indexOf(filter)>-1,
          okT=!term||hay.indexOf(term)>-1,
          show=okF&&okT;
      it.style.display=show?'':'none'; if(show)n++;
    });
    if(count) count.textContent=n+(n===1?' article':' articles');
    if(empty) empty.hidden=n>0;
  }
  q&&q.addEventListener('input',apply);
  chips.forEach(function(c){c.addEventListener('click',function(){
    chips.forEach(function(x){x.classList.remove('is-active')});
    c.classList.add('is-active'); filter=c.getAttribute('data-f'); apply();
  });});
  apply();
})();

/* lead-gen download gate (Name + Email + Phone) */
(function(){
  var gates=[].slice.call(document.querySelectorAll('.dl-gate'));
  if(!gates.length) return;

  /* ===== CONFIG: set these to capture leads in HubSpot (Marketing > Forms) =====
     Leave the YOUR_ placeholders to gate + deliver the PDF without sending anywhere yet. */
  var HS_PORTAL_ID='YOUR_PORTAL_ID';
  var HS_FORM_GUID='YOUR_FORM_GUID';

  var GUIDE={
    '9arrow-land-clearing-cost-guide.pdf':'The Central Texas Land-Clearing Cost Guide',
    '9arrow-hill-country-cedar-removal-guide.pdf':'The Hill Country Cedar Removal Guide',
    '9arrow-land-clearing-planning-checklist.pdf':'The Project Planning Checklist'
  };
  var EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var html=''
   +'<div class="dlm-overlay" id="dlmOverlay" aria-hidden="true">'
   +'<div class="dlm" role="dialog" aria-modal="true" aria-labelledby="dlmTitle">'
   +'<button class="dlm-x" type="button" aria-label="Close">&times;</button>'
   +'<div class="dlm-form-wrap">'
   +'<span class="dlm-eyebrow">&#8250;&#8250;&#8250; Free Guide</span>'
   +'<h3 id="dlmTitle">Where should we send it?</h3>'
   +'<p class="sub" id="dlmSub">Enter your details and your guide downloads instantly.</p>'
   +'<form id="dlmForm" novalidate>'
   +'<label>Name<input name="name" type="text" autocomplete="name" required></label><div class="err">Please enter your name.</div>'
   +'<label>Email<input name="email" type="email" autocomplete="email" required></label><div class="err">Enter a valid email address.</div>'
   +'<label>Phone<input name="phone" type="tel" autocomplete="tel" required></label><div class="err">Enter a valid phone number.</div>'
   +'<button class="btn btn-primary" type="submit">Get my free guide &#8250;&#8250;&#8250;</button>'
   +'<p class="fine">By submitting, you agree 9 Arrow Land Service may contact you about your project. We never sell your info.</p>'
   +'</form></div>'
   +'<div class="dlm-success" hidden>'
   +'<div class="chk">&#10003;</div><h3>Check your download.</h3>'
   +'<p class="sub">Your guide is downloading now &mdash; we&rsquo;ll be in touch.<br>It does not get better.</p>'
   +'<a class="btn btn-ghost" id="dlmManual" href="#" download>Didn&rsquo;t start? Click here</a>'
   +'</div></div></div>';
  var holder=document.createElement('div'); holder.innerHTML=html;
  document.body.appendChild(holder.firstChild);

  var ov=document.getElementById('dlmOverlay'),
      form=document.getElementById('dlmForm'),
      sub=document.getElementById('dlmSub'),
      formWrap=ov.querySelector('.dlm-form-wrap'),
      success=ov.querySelector('.dlm-success'),
      manual=document.getElementById('dlmManual'),
      curPdf=null,curGuide='your guide';

  function captured(){try{return localStorage.getItem('dl9arrow')==='1'}catch(e){return false}}
  function go(pdf){var a=document.createElement('a');a.href=pdf;a.setAttribute('download','');document.body.appendChild(a);a.click();a.remove();}
  function open(pdf,guide){curPdf=pdf;curGuide=guide;
    sub.textContent='Enter your details and “'+guide+'” downloads instantly.';
    formWrap.hidden=false;success.hidden=true;ov.classList.add('open');ov.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';setTimeout(function(){var i=form.elements.name;i&&i.focus();},60);}
  function close(){ov.classList.remove('open');ov.setAttribute('aria-hidden','true');document.body.style.overflow='';}

  gates.forEach(function(g){g.addEventListener('click',function(e){
    var pdf=g.getAttribute('data-pdf')||g.getAttribute('href');
    if(captured()) return; /* returning visitor: let the link download normally */
    e.preventDefault();
    open(pdf, GUIDE[(pdf||'').split('/').pop()]||'your guide');
  });});

  ov.querySelector('.dlm-x').addEventListener('click',close);
  ov.addEventListener('click',function(e){if(e.target===ov)close();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&ov.classList.contains('open'))close();});

  form.addEventListener('submit',function(e){
    e.preventDefault();
    var f=form.elements, ok=true;
    function mark(el,valid){el.classList.toggle('invalid',!valid);
      var er=el.parentElement.nextElementSibling; if(er&&er.className==='err')er.style.display=valid?'none':'block';
      if(!valid)ok=false;}
    mark(f.name, f.name.value.trim().length>1);
    mark(f.email, EMAIL.test(f.email.value.trim()));
    mark(f.phone, f.phone.value.replace(/\D/g,'').length>=10);
    if(!ok) return;

    var lead={name:f.name.value.trim(),email:f.email.value.trim(),phone:f.phone.value.trim()};
    if(HS_PORTAL_ID.indexOf('YOUR_')<0 && HS_FORM_GUID.indexOf('YOUR_')<0){
      var parts=lead.name.split(' '),first=parts.shift(),last=parts.join(' ');
      var body={fields:[
        {name:'firstname',value:first},{name:'lastname',value:last},
        {name:'email',value:lead.email},{name:'phone',value:lead.phone}],
        context:{pageUri:location.href,pageName:document.title}};
      fetch('https://api.hsforms.com/submissions/v3/integration/submit/'+HS_PORTAL_ID+'/'+HS_FORM_GUID,
        {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).catch(function(){});
    }
    try{localStorage.setItem('dl9arrow','1');}catch(e){}
    manual.href=curPdf; go(curPdf);
    formWrap.hidden=true; success.hidden=false;
  });
})();

/* interactive service explorer (hover/tap to preview, auto-cycle until interaction) */
(function(){
  var ex=document.getElementById('svcEx'); if(!ex) return;
  var items=[].slice.call(ex.querySelectorAll('.svc-ex-item')),
      panels=[].slice.call(ex.querySelectorAll('.svc-ex-panel')),
      stage=ex.querySelector('.svc-ex-stage'),
      cur=0, timer=null, hovering=false, touched=false,
      reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

  function show(i){
    if(i===cur||i<0||i>=items.length) return;
    items[cur].classList.remove('is-active'); panels[cur].classList.remove('is-active');
    cur=i;
    items[i].classList.add('is-active'); panels[i].classList.add('is-active');
  }
  items.forEach(function(it,i){
    it.addEventListener('mouseenter',function(){ show(i); });
    it.addEventListener('focus',function(){ show(i); });
    it.addEventListener('click',function(){
      // tap: preview first; if already showing, follow the link
      if(cur===i && touched){ location.href=panels[i].getAttribute('href'); return; }
      touched=true; show(i);
      if(window.innerWidth<=820) stage.scrollIntoView({behavior:'smooth',block:'center'});
    });
  });
  ex.addEventListener('mouseenter',function(){ hovering=true; });
  ex.addEventListener('mouseleave',function(){ hovering=false; });

  if(!reduce){
    timer=setInterval(function(){ if(!hovering && !document.hidden){ show((cur+1)%items.length); } },4200);
  }
})();
