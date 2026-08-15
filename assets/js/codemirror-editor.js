(()=>{
'use strict';
const root=document.querySelector('#ray-editor');
if(!root||!window.CodeMirror)return;
if(root.dataset.cmReady==='1')return;
root.dataset.cmReady='1';

const textarea=root.querySelector('#code-input');
const codeHost=root.querySelector('.code-editor');
const gutter=root.querySelector('#editor-gutter');
if(!textarea||!codeHost)return;

const defaults={
 'main.js':textarea.value||`const signal = {
  state: "LIVE",
  pointer: { x: 0, y: 0 },

  tick() {
    requestAnimationFrame(() => this.tick());
  }
};

signal.tick();`,
 'style.css':`.terminal {
  position: relative;
  overflow: hidden;
  border: 1px solid #222;
  border-radius: 12px;
}

.terminal:hover {
  border-color: #333;
}`,
 'index.html':`<section class="system">
  <span class="eyebrow">RAY / STUDIO</span>
  <h2>BUILD THE UNKNOWN</h2>
</section>`
};
const modes={'main.js':'javascript','style.css':'css','index.html':'htmlmixed'};
const labels={'main.js':'JAVASCRIPT','style.css':'CSS','index.html':'HTML'};
const key=file=>`ray-codemirror:${file}`;
const read=file=>{try{return localStorage.getItem(key(file))}catch(_){return null}};
const write=(file,value)=>{try{localStorage.setItem(key(file),value)}catch(_){}};

// Remove the old textarea controls and replace the toolbar with clean listeners.
const tabs=[...root.querySelectorAll('.editor-tab')].map(old=>{const n=old.cloneNode(true);old.replaceWith(n);return n});
const oldRun=root.querySelector('#editor-run');
const run=oldRun?oldRun.cloneNode(true):null;
if(oldRun)oldRun.replaceWith(run);

const status=root.querySelector('#editor-status');
const position=root.querySelector('#editor-position');
const language=root.querySelector('#editor-language');
const message=root.querySelector('#editor-message');
const command=root.querySelector('#editor-command');
const editor=window.CodeMirror.fromTextArea(textarea,{
  mode:'javascript',
  theme:'material-darker',
  lineNumbers:true,
  lineWrapping:false,
  tabSize:2,
  indentUnit:2,
  indentWithTabs:false,
  autoCloseBrackets:true,
  matchBrackets:true,
  styleActiveLine:true,
  viewportMargin:40,
  inputStyle:'textarea',
  extraKeys:{
    'Ctrl-S':()=>save(),
    'Cmd-S':()=>save(),
    'Ctrl-Enter':()=>runCode(),
    'Cmd-Enter':()=>runCode(),
    'Tab':cm=>cm.execCommand('indentMore')
  }
});
window.RayCodeMirror=editor;
codeHost.classList.add('codemirror-host');
root.classList.add('ray-editor-ready');
if(gutter)gutter.setAttribute('aria-hidden','true');

let current='main.js';
const setStatus=(value,temporary=false)=>{
 if(status)status.textContent=value;
 if(message)message.textContent=`${value}${temporary?'':' / CODEMIRROR'}`;
};
const updatePosition=()=>{
 const c=editor.getCursor();
 if(position)position.textContent=`Ln ${c.line+1}, Col ${c.ch+1}`;
};
const save=()=>{
 const value=editor.getValue();
 write(current,value);
 textarea.value=value;
 textarea.dispatchEvent(new Event('change',{bubbles:true}));
 setStatus('SAVED',true);
 setTimeout(()=>setStatus('READY'),650);
};
const load=file=>{
 if(current)write(current,editor.getValue());
 current=file;
 const stored=read(file);
 editor.setOption('mode',modes[file]);
 editor.setValue(stored!==null?stored:defaults[file]);
 editor.clearHistory();
 editor.setCursor({line:0,ch:0});
 textarea.value=editor.getValue();
 codeHost.dataset.file=file;
 tabs.forEach(t=>t.classList.toggle('active',t.dataset.file===file));
 if(language)language.textContent=labels[file];
 if(command)command.textContent=`edit ${file}`;
 updatePosition();
 setStatus('READY');
 editor.focus();
};
const runCode=()=>{
 save();
 setStatus('RUNNING');
 const source=editor.getValue();
 try{
  if(current==='main.js'){
   new Function(source);
  }else if(current==='style.css'){
   const sheet=new CSSStyleSheet();
   sheet.replaceSync(source);
  }else{
   new DOMParser().parseFromString(source,'text/html');
  }
  setStatus('BUILD OK');
 }catch(error){
  setStatus(`ERROR / ${String(error?.message||error).slice(0,52)}`);
 }
 setTimeout(()=>setStatus('READY'),1600);
};

tabs.forEach(tab=>tab.addEventListener('click',()=>load(tab.dataset.file)));
run?.addEventListener('click',runCode);
editor.on('cursorActivity',updatePosition);
editor.on('change',()=>{textarea.value=editor.getValue();updatePosition();setStatus('EDITING',true)});
editor.on('focus',()=>setStatus('EDITING',true));
editor.on('blur',()=>{if(root.dataset.cmDirty!=='1')setStatus('READY')});

load(current);
})();
