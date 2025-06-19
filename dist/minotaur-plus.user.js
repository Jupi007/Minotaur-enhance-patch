// ==UserScript==
// @name         Minotaur enhance patch
// @description  Améliore l'interface utilisateur de Minot@ur
// @icon         https://minotaur.sso.gendarmerie.interieur.gouv.fr/v2/favicons/favicon.svg
// @version      2025-06-16
// @grant        GM.xmlHttpRequest
// @require      https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.global.min.js
// @match        https://minotaur.sso.gendarmerie.interieur.gouv.fr/*
// ==/UserScript==

(()=>{var N="https://minotaur.sso.gendarmerie.interieur.gouv.fr/v2/data";function R(a){let e=document.createElement("style");return e.textContent=a,document.head.appendChild(e),e}function d(a,e,t=null,n={}){return new Promise((i,r)=>{GM.xmlHttpRequest({method:a,url:N+e,data:t,headers:n,onload:c=>{i(c)},onerror:c=>{r(c)}})})}function v(a,e={}){let t=new FullCalendar.Calendar(a,{locale:"fr",height:"auto",firstDay:1,headerToolbar:{left:"prev,next",center:"title",right:"today"},eventDidMount:function(n){n.el.setAttribute("title",n.event.title)},...e});return t.render(),t}function A(a){let e=a.getFullYear(),t=`${a.getMonth()+1}`.padStart(2,"0"),n=`${a.getDate()}`.padStart(2,"0");return`${e}-${t}-${n}`}function g(a){return a>=200&&a<300}function h(){let a=new Date,e=new Date(a);return e.setFullYear(a.getFullYear()+1),e.setMonth(e.getMonth()-1),new Date(e.getFullYear(),e.getMonth()+1,0)}var q="X-CSRF-TOKEN",L=[];async function C(a){if(a in L)return L[a];let e=await d("GET",`/csrf-token/${a}`),t=JSON.parse(e.responseText).csrfToken;return L[a]=t,t}function y(a,e){return new Promise(async(t,n)=>{let i;try{let r=await d("GET",`/availabilities?minDate=${a}&maxDate=${e}&limit=9999999&page=1`);i=JSON.parse(r.responseText),g(r.status)?t(i):n(`Error unexpected response code ${r.status}`)}catch(r){n(r)}})}function P(a){return new Promise(async(e,t)=>{try{let n=await d("POST",`/availabilities/${a}`,null,{[q]:await C("availabilitiesdelete")});g(n.status)?e():t(`Error unexpected response code ${n.status}`)}catch(n){t(n)}})}function E(a,e,t=null){return new Promise(async(n,i)=>{try{let r=await d("POST","/availabilities",JSON.stringify({id:t??"",start:A(a),end:A(e)}),{[q]:await C("availabilities")});g(r.status)?n():i(`Error unexpected response code ${r.status}`)}catch(r){i(r)}})}var f=Object.freeze({AVAILABILITIES:"availabilities",SUMMONS:"summons",VOLUNTEERING_DECLARATIONS:"volunteeringDeclarations"});function D(a){return{events:a,id:f.AVAILABILITIES,display:"background",color:"#6ca3e3"}}function S(a){return a.items.map(e=>{let t=new Date(e.end);return t.setDate(t.getDate()+1),{id:e.id,start:e.start,end:t,allDay:!0}})}function b(a){return{events:a,id:f.SUMMONS,color:"#18753c"}}function w(a){return a.items.map(e=>{let t=new Date(e.end);return t.setDate(t.getDate()+1),{start:e.start,end:t,allDay:!0,title:e.missionObjet}})}function M(a){return{events:a,id:f.VOLUNTEERING_DECLARATIONS,color:"#725c49"}}function $(a){return a.items.map(e=>{let t=new Date(e.end);return t.setDate(t.getDate()+1),{start:e.start,end:t,allDay:!0,title:e.objet}})}var x=`<div id="calendar"></div>

<div class="calendar-help">
	<div class="calendar-help-square-container">
		<div class="calendar-help-square-item">
			<input id="availabilities-checkbox" type="checkbox" class="calendar-help-square calendar-help-square--blue">
			<label for="availabilities-checkbox">DISPONIBILIT\xC9S</label>
		</div>
		<div class="calendar-help-square-item">
			<input id="volunteering-declarations-checkbox" type="checkbox" class="calendar-help-square calendar-help-square--brown" checked>
			<label for="volunteering-declarations-checkbox">VOLONTARIATS</label>
		</div>
		<div class="calendar-help-square-item">
			<input id="summons-checkbox" type="checkbox" class="calendar-help-square calendar-help-square--green" checked>
			<label for="summons-checkbox">CONVOCATIONS</label>
		</div>
	</div>
</div>
`;var T=class{templateEl;calendar;showAvailabilities=!1;showSummons=!0;showVolunteeringDeclarations=!0;constructor(){let e=document.querySelector("main");this.templateEl=document.createElement("div"),this.templateEl.innerHTML=x,e.prepend(this.templateEl);let t=document.getElementById("calendar"),n={start:new Date,end:h()};this.calendar=v(t,{validRange:n,eventSources:[D(async(u,s,m)=>{if(!this.showAvailabilities){s([]);return}let o=new Date,p=h();try{let l=await y(o.toISOString(),p.toISOString());s(S(l))}catch(l){m(l)}}),b(async(u,s,m)=>{if(!this.showSummons){s([]);return}let o=new Date,p=h();try{let l=await d("GET",`/convocations?minDate=${o.toISOString()}&maxDate=${p.toISOString()}`),O=JSON.parse(l.responseText);s(w(O))}catch(l){m(l)}}),M(async(u,s,m)=>{if(!this.showVolunteeringDeclarations){s([]);return}let o=new Date,p=h();try{let l=await d("GET",`/volunteering-declarations?minDate=${o.toISOString()}&maxDate=${p.toISOString()}`),O=JSON.parse(l.responseText);s($(O))}catch(l){m(l)}})]});let i=document.getElementById("availabilities-checkbox");i.addEventListener("click",u=>{this.showAvailabilities=i.checked,this.calendar.refetchEvents(),this.calendar.unselect()});let r=document.getElementById("summons-checkbox");r.addEventListener("click",u=>{this.showSummons=r.checked,this.calendar.refetchEvents(),this.calendar.unselect()});let c=document.getElementById("volunteering-declarations-checkbox");c.addEventListener("click",u=>{this.showVolunteeringDeclarations=c.checked,this.calendar.refetchEvents(),this.calendar.unselect()})}destroy(){this.calendar.destroy(),this.templateEl.remove()}};var k=class{templateEl;calendar;locked=!1;showSummons=!0;constructor(){let e=document.querySelector("main");this.templateEl=document.createElement("div"),this.templateEl.innerHTML=x,e.prepend(this.templateEl);let t=document.getElementById("calendar"),n={start:new Date,end:h()};this.calendar=v(t,{eventSources:[D(async(r,c,u)=>{let s=new Date,m=h();try{let o=await y(s.toISOString(),m.toISOString());c(S(o))}catch(o){u(o)}}),b(async(r,c,u)=>{if(!this.showSummons){c([]);return}let s=new Date,m=h();try{let o=await d("GET",`/convocations?minDate=${s.toISOString()}&maxDate=${m.toISOString()}`),p=JSON.parse(o.responseText);c(w(p))}catch(o){u(o)}})],selectable:!0,validRange:n,dateClick:r=>this.onDateClick(r)});let i=document.getElementById("summons-checkbox");i.addEventListener("click",r=>{this.showSummons=i.checked,this.calendar.refetchEvents(),this.calendar.unselect()})}destroy(){this.calendar.destroy(),this.templateEl.remove()}onDateClick(e){let t=e.date,n=t.getTime(),i=this.calendar.getEvents().filter(r=>{if(r.source.id===f.AVAILABILITIES)return n>=r.start.getTime()&&n<r.end.getTime()});i.length>0?i.forEach(r=>{this.removeAvailability(r,t)}):this.addAvailability(t)}async removeAvailability(e,t){if(!this.locked){this.locked=!0;try{await P(e.id);let n=new Date(e.end);if(n.setDate(n.getDate()-1),e.start.getTime()<t.getTime()){let i=new Date(t);i.setDate(i.getDate()-1),await E(e.start,i)}if(n.getTime()>t.getTime()){let i=new Date(t);i.setDate(i.getDate()+1),await E(i,n)}}finally{this.calendar.refetchEvents(),this.calendar.unselect(),this.locked=!1}}}async addAvailability(e){if(!this.locked){this.locked=!0;try{await E(e,e)}finally{this.calendar.refetchEvents(),this.calendar.unselect(),this.locked=!1}}}};var I=class{currentPage=null;constructor(){this.initNewPage();let e=history.pushState;history.pushState=(...t)=>{e.apply(history,t),this.destroyCurrentPage(),this.initNewPage()},window.addEventListener("popstate",()=>{this.destroyCurrentPage(),this.initNewPage()})}destroyCurrentPage(){this.currentPage!==null&&(this.currentPage.destroy(),this.currentPage=null)}initNewPage(){location.href.endsWith("missions")?this.currentPage=new k:location.href.endsWith("aav")&&(this.currentPage=new T)}};var F=`.fc {
  margin: 0 auto;
  margin-top: 3rem;
  padding: 0 1rem;
  max-width: 50rem;
}

.fc-h-event .fc-event-title {
  text-overflow: ellipsis;
  font-size: .75em;
}

.fc .fc-toolbar-title {
  font-size: 1.5em;
  text-transform: capitalize;
}

.fc-day:not(.fc-day-disabled) {
  cursor: default;
}

.fc-daygrid-day-number {
  cursor: default !important;
}

.fc-event:not(.fc-bg-event):not(.fc-col-header-cell) {
  cursor: default !important;
}

.calendar-help {
  display: flex;
  flex-direction: column;
  gap: 2rem;

  margin: 0 auto;
  margin-top: 1.5rem;
  margin-bottom: 3rem;
  padding: 0 1rem;
  max-width: 50rem;
}

.calendar-help-square-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 2rem;
}

.calendar-help-square-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: .5rem;
}

.calendar-help-square {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 3px;
}

.calendar-help-square--green {
  accent-color: #18753c;
  background-color: #18753c;
}

.calendar-help-square--brown {
  accent-color: #725c49;
  background-color: #725c49;
}

.calendar-help-square--blue {
  accent-color: #d3e3f7;
  background-color: #d3e3f7;
}
`;document.addEventListener("DOMContentLoaded",()=>{R(F),new I});})();
