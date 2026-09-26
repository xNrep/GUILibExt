(function(Scratch){
'use strict';

if (!Scratch || !Scratch.extensions) return;

class GUILibV4 {
    constructor() {
        this.elements = new Map();
        this.order = [];
        this.visible = true;
        this.nextId = 1;
        this.root = null;
        this.style = null;
        this._events = new Map();
        this._ensureRoot();
    }

    getInfo() {
        return {
            id: 'guilibv4',
            name: 'GUILib',
            color1: '#4C97FF',
            color2: '#3373CC',
            color3: '#2E5DA8',
            blocks: [
                {blockType: Scratch.BlockType.COMMAND, opcode:'show', text:'Show GUI'},
                {blockType: Scratch.BlockType.COMMAND, opcode:'hide', text:'Hide GUI'},
                {blockType: Scratch.BlockType.COMMAND, opcode:'clear', text:'Clear GUI'},
                {blockType: Scratch.BlockType.COMMAND, opcode:'openEditor', text:'Open Editor'},

                {blockType: Scratch.BlockType.COMMAND, opcode:'panel', text:'create panel [ID] at x [X] y [Y] width [W] height [H]'},
                {blockType: Scratch.BlockType.COMMAND, opcode:'label', text:'create label [ID] text [TEXT] at x [X] y [Y]'},
                {blockType: Scratch.BlockType.COMMAND, opcode:'button', text:'create button [ID] text [TEXT] at x [X] y [Y] width [W] height [H]'},
                {blockType: Scratch.BlockType.COMMAND, opcode:'input', text:'create input [ID] placeholder [PLACEHOLDER] at x [X] y [Y] width [W] height [H]'},
                {blockType: Scratch.BlockType.COMMAND, opcode:'checkbox', text:'create checkbox [ID] text [TEXT] at x [X] y [Y]'},
                {blockType: Scratch.BlockType.COMMAND, opcode:'slider', text:'create slider [ID] at x [X] y [Y] width [W] min [MIN] max [MAX]'},
                {blockType: Scratch.BlockType.COMMAND, opcode:'dropdown', text:'create dropdown [ID] options [OPTIONS] at x [X] y [Y] width [W]'},
                {blockType: Scratch.BlockType.COMMAND, opcode:'window', text:'create window [ID] title [TITLE] at x [X] y [Y] width [W] height [H]'},

                {blockType: Scratch.BlockType.COMMAND, opcode:'set', text:'set [ID] property [PROPERTY] to [VALUE]'},
                {blockType: Scratch.BlockType.COMMAND, opcode:'remove', text:'remove [ID]'},
                {blockType: Scratch.BlockType.COMMAND, opcode:'bringFront', text:'bring [ID] to front'},
                {blockType: Scratch.BlockType.COMMAND, opcode:'setDraggable', text:'set [ID] draggable [STATE]'},

                {blockType: Scratch.BlockType.REPORTER, opcode:'get', text:'get [PROPERTY] of [ID]'},
                {blockType: Scratch.BlockType.BOOLEAN, opcode:'exists', text:'[ID] exists?'},

                {blockType: Scratch.BlockType.COMMAND, opcode:'toast', text:'show toast [TEXT]'},
                {blockType: Scratch.BlockType.COMMAND, opcode:'modal', text:'show modal [ID] title [TITLE] message [MESSAGE]'},
                {blockType: Scratch.BlockType.COMMAND, opcode:'tooltip', text:'set [ID] tooltip to [TEXT]'},
                {blockType: Scratch.BlockType.COMMAND, opcode:'tab', text:'create tab [ID] text [TEXT] at x [X] y [Y]'},
                {blockType: Scratch.BlockType.COMMAND, opcode:'theme', text:'set theme to [THEME]'},
                {blockType: Scratch.BlockType.COMMAND, opcode:'scale', text:'set GUI scale to [SCALE]'},

                {blockType: Scratch.BlockType.HAT, opcode:'whenClicked', text:'when GUI element [ID] is clicked'},
                {blockType: Scratch.BlockType.HAT, opcode:'whenChanged', text:'when GUI element [ID] changes'},
                {blockType: Scratch.BlockType.HAT, opcode:'whenModal', text:'when modal [ID] is confirmed'},
                {blockType: Scratch.BlockType.HAT, opcode:'whenTab', text:'when tab [ID] is selected'}
            ],
            arguments: {
                ID:{type:Scratch.ArgumentType.STRING, defaultValue:'element'},
                X:{type:Scratch.ArgumentType.NUMBER, defaultValue:100},
                Y:{type:Scratch.ArgumentType.NUMBER, defaultValue:100},
                W:{type:Scratch.ArgumentType.NUMBER, defaultValue:200},
                H:{type:Scratch.ArgumentType.NUMBER, defaultValue:100},
                TEXT:{type:Scratch.ArgumentType.STRING, defaultValue:'Hello'},
                TITLE:{type:Scratch.ArgumentType.STRING, defaultValue:'Window'},
                MESSAGE:{type:Scratch.ArgumentType.STRING, defaultValue:'Hello'},
                PLACEHOLDER:{type:Scratch.ArgumentType.STRING, defaultValue:'Type here'},
                MIN:{type:Scratch.ArgumentType.NUMBER, defaultValue:0},
                MAX:{type:Scratch.ArgumentType.NUMBER, defaultValue:100},
                OPTIONS:{type:Scratch.ArgumentType.STRING, defaultValue:'One,Two,Three'},
                PROPERTY:{type:Scratch.ArgumentType.STRING, defaultValue:'text'},
                VALUE:{type:Scratch.ArgumentType.STRING, defaultValue:''},
                STATE:{type:Scratch.ArgumentType.BOOLEAN, defaultValue:true},
                THEME:{type:Scratch.ArgumentType.STRING, menu:'themes', defaultValue:'dark'},
                SCALE:{type:Scratch.ArgumentType.NUMBER, defaultValue:1}
            },
            menus: {
                themes: {acceptReporters:true, items:['dark','light','blue','purple']}
            }
        };
    }

    _ensureRoot() {
        if (!Scratch.extensions.unsandboxed || typeof document === 'undefined') return;
        if (this.root && this.root.isConnected) return;
        this.root = document.createElement('div');
        this.root.id = 'guilib-root';
        Object.assign(this.root.style,{
            position:'fixed',left:'0',top:'0',width:'100vw',height:'100vh',
            pointerEvents:'none',zIndex:'2147483000',fontFamily:'Arial,sans-serif'
        });
        document.body.appendChild(this.root);
        this._applyTheme('dark');
    }

    _el(tag='div') {
        this._ensureRoot();
        const e=document.createElement(tag);
        e.style.boxSizing='border-box';
        return e;
    }

    _num(v,d=0){ const n=Number(v); return Number.isFinite(n)?n:d; }
    _key(id){ return String(id ?? '').trim(); }
    _emit(type,id,data={}) {
        const key=String(id ?? '');
        const payload={id:key,...data};
        const list=this._events.get(type)||[];
        for(const fn of list) { try{fn(payload);}catch(e){} }
    }

    _register(id,el,type,meta={}) {
        const key=this._key(id);
        if(!key) return null;
        this.remove({ID:key});
        el.dataset.guilibId=key;
        el.dataset.guilibType=type;
        this.root.appendChild(el);
        const item={el,type,x:meta.x||0,y:meta.y||0,width:meta.width||0,height:meta.height||0,draggable:true,...meta};
        this.elements.set(key,item);
        this.order=this.order.filter(x=>x!==key);
        this.order.push(key);
        this._position(key);
        return el;
    }

    _position(id) {
        const x=this.elements.get(id); if(!x) return;
        x.el.style.position='absolute';
        x.el.style.left=(this._num(x.x)+'px');
        x.el.style.top=(this._num(x.y)+'px');
        if(x.width) x.el.style.width=this._num(x.width)+'px';
        if(x.height) x.el.style.height=this._num(x.height)+'px';
        x.el.style.pointerEvents='auto';
    }

    _bind(id,el,type) {
        if(type==='button'||type==='checkbox'||type==='dropdown'||type==='tab') {
            el.addEventListener('click',()=>this._emit('clicked',id));
        }
        if(type==='input') el.addEventListener('input',()=>this._emit('changed',id));
        if(type==='slider') el.addEventListener('input',()=>this._emit('changed',id));
        if(type==='dropdown') el.addEventListener('change',()=>this._emit('changed',id));
    }

    show(){ this.visible=true; this._ensureRoot(); if(this.root)this.root.style.display='block'; }
    hide(){ this.visible=false; if(this.root)this.root.style.display='none'; }
    clear(){
        for(const id of [...this.elements.keys()]) this.remove({ID:id});
        this.order=[]; this.nextId=1;
    }

    panel(a){
        const id=this._key(a.ID), e=this._el();
        e.style.background='rgba(30,30,35,.95)';
        e.style.border='1px solid rgba(255,255,255,.15)';
        e.style.borderRadius='10px';
        return this._register(id,e,'panel',{x:this._num(a.X),y:this._num(a.Y),width:this._num(a.W,200),height:this._num(a.H,100)});
    }

    label(a){
        const id=this._key(a.ID), e=this._el();
        e.textContent=String(a.TEXT??'');
        e.style.color='#fff'; e.style.fontSize='16px'; e.style.padding='4px 8px';
        e.style.whiteSpace='pre-wrap';
        return this._register(id,e,'label',{x:this._num(a.X),y:this._num(a.Y),width:Math.max(40,String(a.TEXT??'').length*9+16),height:30});
    }

    button(a){
        const id=this._key(a.ID), e=this._el('button');
        e.textContent=String(a.TEXT??'Button');
        e.style.background='#4C97FF'; e.style.color='#fff'; e.style.border='0';
        e.style.borderRadius='7px'; e.style.cursor='pointer'; e.style.fontSize='14px';
        this._bind(id,e,'button');
        return this._register(id,e,'button',{x:this._num(a.X),y:this._num(a.Y),width:this._num(a.W,140),height:this._num(a.H,40)});
    }

    input(a){
        const id=this._key(a.ID), e=this._el('input');
        e.type='text'; e.placeholder=String(a.PLACEHOLDER??'');
        e.style.padding='8px'; e.style.border='1px solid #777'; e.style.borderRadius='6px';
        e.style.background='#222'; e.style.color='#fff'; e.style.outline='none';
        this._bind(id,e,'input');
        return this._register(id,e,'input',{x:this._num(a.X),y:this._num(a.Y),width:this._num(a.W,220),height:this._num(a.H,38)});
    }

    checkbox(a){
        const id=this._key(a.ID), wrap=this._el(), box=this._el('input'), text=this._el('span');
        box.type='checkbox'; text.textContent=' '+String(a.TEXT??'');
        text.style.color='#fff'; text.style.verticalAlign='middle';
        wrap.append(box,text); wrap.style.padding='5px';
        this._bind(id,box,'checkbox');
        return this._register(id,wrap,'checkbox',{x:this._num(a.X),y:this._num(a.Y),width:180,height:32,input:box});
    }

    slider(a){
        const id=this._key(a.ID), e=this._el('input');
        e.type='range'; e.min=String(a.MIN??0); e.max=String(a.MAX??100); e.value=e.min;
        this._bind(id,e,'slider');
        return this._register(id,e,'slider',{x:this._num(a.X),y:this._num(a.Y),width:this._num(a.W,220),height:30});
    }

    dropdown(a){
        const id=this._key(a.ID), e=this._el('select');
        String(a.OPTIONS??'').split(',').map(x=>x.trim()).filter(Boolean).forEach(v=>{
            const o=document.createElement('option'); o.value=v; o.textContent=v; e.appendChild(o);
        });
        e.style.background='#222'; e.style.color='#fff'; e.style.padding='7px'; e.style.borderRadius='6px';
        this._bind(id,e,'dropdown');
        return this._register(id,e,'dropdown',{x:this._num(a.X),y:this._num(a.Y),width:this._num(a.W,180),height:38});
    }

    window(a){
        const id=this._key(a.ID), e=this._el(), bar=this._el(), title=this._el();
        title.textContent=String(a.TITLE??'Window');
        Object.assign(bar.style,{height:'32px',background:'#333',color:'#fff',padding:'7px 10px',cursor:'move',fontWeight:'bold'});
        bar.appendChild(title); e.appendChild(bar);
        Object.assign(e.style,{background:'#1d1d22',border:'1px solid #555',borderRadius:'8px',overflow:'hidden',color:'#fff'});
        const item=this._register(id,e,'window',{x:this._num(a.X),y:this._num(a.Y),width:this._num(a.W,320),height:this._num(a.H,220)});
        this._makeDraggable(id,bar);
        return item;
    }

    _makeDraggable(id,handle){
        handle.addEventListener('mousedown',(ev)=>{
            const item=this.elements.get(id); if(!item||item.draggable===false)return;
            const sx=ev.clientX, sy=ev.clientY, ox=item.x, oy=item.y;
            const move=e=>{item.x=ox+e.clientX-sx;item.y=oy+e.clientY-sy;this._position(id);};
            const up=()=>{document.removeEventListener('mousemove',move);document.removeEventListener('mouseup',up);};
            document.addEventListener('mousemove',move); document.addEventListener('mouseup',up);
        });
    }

    set(a){
        const id=this._key(a.ID), item=this.elements.get(id); if(!item)return;
        const p=String(a.PROPERTY||'').toLowerCase(), v=a.VALUE;
        if(p==='x') item.x=this._num(v); else if(p==='y') item.y=this._num(v);
        else if(p==='width') item.width=this._num(v); else if(p==='height') item.height=this._num(v);
        else if(p==='text'){ if(item.type==='input') item.el.value=String(v); else if(item.type==='checkbox') {item.el.lastChild.textContent=' '+String(v);} else item.el.textContent=String(v); }
        else if(p==='value'){ if('value' in item.el)item.el.value=String(v); else if(item.input)item.input.value=String(v); }
        else if(p==='color'){item.el.style.color=String(v);}
        else if(p==='background'||p==='backgroundcolor'){item.el.style.background=String(v);}
        else if(p==='fontsize'){item.el.style.fontSize=this._num(v,16)+'px';}
        else if(p==='radius'||p==='borderradius'){item.el.style.borderRadius=this._num(v,6)+'px';}
        else if(p==='opacity'){item.el.style.opacity=Math.max(0,Math.min(1,this._num(v,1)));}
        else if(p==='placeholder'&&item.type==='input')item.el.placeholder=String(v);
        else if(p==='draggable')item.draggable=String(v)!=='false';
        this._position(id);
    }

    get(a){
        const item=this.elements.get(this._key(a.ID)); if(!item)return '';
        const p=String(a.PROPERTY||'').toLowerCase();
        if(p==='x')return String(item.x); if(p==='y')return String(item.y);
        if(p==='width')return String(item.width); if(p==='height')return String(item.height);
        if(p==='type')return item.type;
        if(p==='text')return item.type==='input'?item.el.value:(item.type==='checkbox'?item.el.lastChild.textContent.trim():item.el.textContent);
        if(p==='value')return 'value' in item.el?String(item.el.value):(item.input?String(item.input.value):'');
        if(p==='visible')return String(item.el.style.display!=='none');
        return String(item.el.style[p]||'');
    }

    exists(a){ return this.elements.has(this._key(a.ID)); }
    remove(a){
        const id=this._key(a.ID), item=this.elements.get(id); if(!item)return;
        item.el.remove(); this.elements.delete(id); this.order=this.order.filter(x=>x!==id);
    }
    bringFront(a){
        const id=this._key(a.ID), item=this.elements.get(id); if(!item)return;
        this.root.appendChild(item.el); this.order=this.order.filter(x=>x!==id); this.order.push(id);
    }
    setDraggable(a){const item=this.elements.get(this._key(a.ID));if(item)item.draggable=!!a.STATE;}

    toast(a){
        this._ensureRoot(); const e=this._el();
        e.textContent=String(a.TEXT??''); Object.assign(e.style,{position:'fixed',right:'20px',bottom:'20px',padding:'12px 18px',background:'#222',color:'#fff',borderRadius:'8px',boxShadow:'0 4px 18px #0008'});
        this.root.appendChild(e); setTimeout(()=>e.remove(),2500);
    }

    modal(a){
        this._ensureRoot(); const overlay=this._el(), box=this._el(), title=this._el(), msg=this._el(), ok=this._el('button');
        title.textContent=String(a.TITLE??'Modal'); msg.textContent=String(a.MESSAGE??''); ok.textContent='OK';
        Object.assign(overlay.style,{position:'fixed',inset:'0',background:'#0008',display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'auto'});
        Object.assign(box.style,{background:'#202024',color:'#fff',padding:'20px',borderRadius:'10px',minWidth:'280px'});
        title.style.fontWeight='bold'; title.style.fontSize='18px'; msg.style.margin='14px 0'; ok.style.padding='8px 18px';
        box.append(title,msg,ok); overlay.appendChild(box); this.root.appendChild(overlay);
        ok.addEventListener('click',()=>{overlay.remove();this._emit('modal',a.ID);});
    }

    tooltip(a){
        const item=this.elements.get(this._key(a.ID)); if(item)item.el.title=String(a.TEXT??'');
    }

    tab(a){
        const id=this._key(a.ID), e=this._el('button'); e.textContent=String(a.TEXT??id);
        Object.assign(e.style,{background:'#333',color:'#fff',border:'0',padding:'7px 12px',margin:'2px',cursor:'pointer',pointerEvents:'auto'});
        e.addEventListener('click',()=>this._emit('tab',id,{index:this.order.indexOf(id)}));
        return this._register(id,e,'tab',{x:this._num(a.X),y:this._num(a.Y),width:110,height:34});
    }

    _applyTheme(theme){
        this.theme=String(theme||'dark');
        if(!this.root)return;
        const vars={
            dark:['#1d1d22','#fff','#4C97FF'], light:['#f4f4f4','#111','#4C97FF'],
            blue:['#10243d','#fff','#3fa9f5'], purple:['#26183b','#fff','#a970ff']
        }[this.theme]||['#1d1d22','#fff','#4C97FF'];
        this.root.dataset.theme=this.theme;
        this.root.style.setProperty('--guilib-bg',vars[0]);
        this.root.style.setProperty('--guilib-fg',vars[1]);
        this.root.style.setProperty('--guilib-accent',vars[2]);
    }
    theme(a){this._applyTheme(a.THEME);}
    scale(a){this._ensureRoot();const n=Math.max(.25,Math.min(3,this._num(a.SCALE,1)));this.root.style.transformOrigin='0 0';this.root.style.transform='scale('+n+')';this.guiScale=n;}

    whenClicked(a){ return Scratch.BlockType.BOOLEAN ? false : false; }
    _hat(type,a){ return !!a; }
    whenClicked(){return false;}
    whenChanged(){return false;}
    whenModal(){return false;}
    whenTab(){return false;}

    openEditor(){
        if(!Scratch.extensions.unsandboxed || typeof window==='undefined') return;
        const existing=window.open('about:blank','GUILibEditor');
        if(!existing)return;
        window.GUILibV4Instance=this;
        const w=existing, self=this;
        const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
        const html='<!doctype html><html><head><meta charset="utf-8"><title>GUILib Editor</title><style>'+
        '*{box-sizing:border-box}body{margin:0;background:#111;color:#eee;font:14px Arial;display:grid;grid-template-rows:48px 1fr;height:100vh}'+
        '#bar{display:flex;gap:6px;align-items:center;padding:8px;background:#202024;border-bottom:1px solid #444}'+
        'button,input{font:inherit}button{background:#333;color:#fff;border:1px solid #555;border-radius:5px;padding:6px 10px;cursor:pointer}button:hover{background:#444}'+
        '#main{display:grid;grid-template-columns:220px 1fr 260px;min-height:0}#left,#right{background:#18181c;padding:10px;overflow:auto}#left{border-right:1px solid #333}#right{border-left:1px solid #333}'+
        '#canvas{position:relative;overflow:auto;background-color:#0d0d0f;background-image:linear-gradient(#ffffff0a 1px,transparent 1px),linear-gradient(90deg,#ffffff0a 1px,transparent 1px);background-size:20px 20px}'+
        '.item{padding:7px;border:1px solid #333;border-radius:4px;margin-bottom:5px;cursor:pointer}.item.sel{border-color:#4C97FF;background:#223}'+
        '.field{display:flex;gap:5px;align-items:center;margin:7px 0}.field label{width:75px}.field input{width:150px;background:#222;color:#fff;border:1px solid #555;border-radius:4px;padding:5px}'+
        '.node{position:absolute;outline:1px solid #4C97FF55}.selected{outline:2px solid #4C97FF}.handle{position:absolute;width:9px;height:9px;background:#4C97FF;border:1px solid #fff;right:-5px;bottom:-5px;cursor:nwse-resize}'+
        '</style></head><body><div id="bar">'+
        '<b>GUILib Editor</b><button id="refresh">Refresh</button><button id="grid">Grid</button><button id="snap">Snap</button><button id="add">Add Label</button><button id="dup">Duplicate</button><button id="del">Delete</button><button id="export">Export JSON</button><button id="imp">Import JSON</button>'+
        '</div><div id="main"><aside id="left"><b>Hierarchy</b><div id="list"></div></aside><section id="canvas"></section><aside id="right"><b>Properties</b><div id="props"></div></aside></div>'+
        '<script>const api=window.opener&&window.opener.GUILibV4Instance;if(!api){document.body.innerHTML="<h2 style=\\"padding:20px\\">GUILib instance not found. Run Open Editor from the project.</h2>";}else{'+
        'let selected=null,snap=false,grid=true;const canvas=document.getElementById("canvas"),list=document.getElementById("list"),props=document.getElementById("props");'+
        'function items(){return Array.from(api.elements.entries())}'+
        'function refresh(){list.innerHTML="";canvas.innerHTML="";items().forEach(([id,x])=>{const li=document.createElement("div");li.className="item"+(id===selected?" sel":"");li.textContent=id+" ("+x.type+")";li.onclick=()=>select(id);list.appendChild(li);const n=x.el.cloneNode(true);n.className="node"+(id===selected?" selected":"");n.removeAttribute("id");n.style.pointerEvents="auto";n.style.margin="0";n.onclick=e=>{e.stopPropagation();select(id)};n.onmousedown=e=>drag(e,id);canvas.appendChild(n);if(id===selected){const h=document.createElement("div");h.className="handle";h.onmousedown=e=>resize(e,id);n.appendChild(h)}});renderProps()}'+
        'function select(id){selected=id;refresh()}'+
        'function val(label,current){return "<div class=\\"field\\"><label>"+label+"</label><input data-p=\\""+label.toLowerCase()+"\\" value=\\""+String(current??"").replace(/"/g,"&quot;")+"\\"></div>"}'+
        'function renderProps(){props.innerHTML="";if(!selected||!api.elements.has(selected)){return}const x=api.elements.get(selected);props.innerHTML=val("x",x.x)+val("y",x.y)+val("width",x.width)+val("height",x.height)+val("text",api.get({ID:selected,PROPERTY:"text"}));props.querySelectorAll("input").forEach(i=>i.onchange=()=>{api.set({ID:selected,PROPERTY:i.dataset.p,VALUE:i.value});refresh()})}'+
        'function point(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left+canvas.scrollLeft,y:e.clientY-r.top+canvas.scrollTop}}'+
        'function drag(e,id){if(e.target.classList.contains("handle"))return;const x=api.elements.get(id);if(!x||x.draggable===false)return;e.preventDefault();const p=point(e),ox=x.x,oy=x.y;function mv(ev){const q=point(ev);let nx=ox+q.x-p.x,ny=oy+q.y-p.y;if(snap){nx=Math.round(nx/20)*20;ny=Math.round(ny/20)*20}api.set({ID:id,PROPERTY:"x",VALUE:nx});api.set({ID:id,PROPERTY:"y",VALUE:ny});refresh()}function up(){removeEventListener("mousemove",mv);removeEventListener("mouseup",up)}addEventListener("mousemove",mv);addEventListener("mouseup",up)}'+
        'function resize(e,id){e.stopPropagation();e.preventDefault();const x=api.elements.get(id);const p=point(e),ow=x.width,oh=x.height;function mv(ev){const q=point(ev);let nw=Math.max(30,ow+q.x-p.x),nh=Math.max(20,oh+q.y-p.y);if(snap){nw=Math.round(nw/20)*20;nh=Math.round(nh/20)*20}api.set({ID:id,PROPERTY:"width",VALUE:nw});api.set({ID:id,PROPERTY:"height",VALUE:nh});refresh()}function up(){removeEventListener("mousemove",mv);removeEventListener("mouseup",up)}addEventListener("mousemove",mv);addEventListener("mouseup",up)}'+
        'document.getElementById("refresh").onclick=refresh;document.getElementById("grid").onclick=()=>{grid=!grid;canvas.style.backgroundImage=grid?"linear-gradient(#ffffff0a 1px,transparent 1px),linear-gradient(90deg,#ffffff0a 1px,transparent 1px)":"none"};document.getElementById("snap").onclick=()=>snap=!snap;'+
        'document.getElementById("add").onclick=()=>{let id="label"+Date.now();api.label({ID:id,TEXT:"New Label",X:100,Y:100});select(id)};document.getElementById("dup").onclick=()=>{if(!selected)return;const x=api.elements.get(selected);let id=selected+"_copy";let n=1;while(api.elements.has(id))id=selected+"_copy"+(++n);const text=api.get({ID:selected,PROPERTY:"text"});if(x.type==="label")api.label({ID:id,TEXT:text,X:x.x+20,Y:x.y+20});else if(x.type==="button")api.button({ID:id,TEXT:text,X:x.x+20,Y:x.y+20,W:x.width,H:x.height});else api.panel({ID:id,X:x.x+20,Y:x.y+20,W:x.width,H:x.height});select(id)};'+
        'document.getElementById("del").onclick=()=>{if(selected){api.remove({ID:selected});selected=null;refresh()}};document.getElementById("export").onclick=()=>{const data=items().map(([id,x])=>({id,type:x.type,x:x.x,y:x.y,width:x.width,height:x.height,text:api.get({ID:id,PROPERTY:"text"})}));const a=document.createElement("a");a.href="data:application/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(data,null,2));a.download="guilib-layout.json";a.click()};'+
        'document.getElementById("imp").onclick=()=>{const raw=prompt("Paste GUILib layout JSON");if(!raw)return;try{const data=JSON.parse(raw);api.clear();data.forEach(x=>{if(x.type==="label")api.label({ID:x.id,TEXT:x.text||"",X:x.x,Y:x.y});else if(x.type==="button")api.button({ID:x.id,TEXT:x.text||"",X:x.x,Y:x.y,W:x.width,H:x.height});else api.panel({ID:x.id,X:x.x,Y:x.y,W:x.width,H:x.height});api.set({ID:x.id,PROPERTY:"width",VALUE:x.width});api.set({ID:x.id,PROPERTY:"height",VALUE:x.height})});selected=null;refresh()}catch(e){alert("Invalid JSON")}};refresh();}<\/script></body></html>';
        w.document.open(); w.document.write(html); w.document.close();
    }
}

Scratch.extensions.register(new GUILibV4());
})(Scratch);
