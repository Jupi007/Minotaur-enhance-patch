// ==UserScript==
// @name         Minotaur enhance patch
// @description  Améliore l'interface utilisateur de Minot@ur
// @icon         https://minotaur.sso.gendarmerie.interieur.gouv.fr/v2/favicons/favicon.svg
// @version      2025-06-16
// @grant        GM.xmlHttpRequest
// @require      https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.global.min.js
// @match        https://minotaur.sso.gendarmerie.interieur.gouv.fr/*
// ==/UserScript==

(()=>{var A="https://minotaur.sso.gendarmerie.interieur.gouv.fr/v2/data";function q(a){let e=document.createElement("style");return e.textContent=a,document.head.appendChild(e),e}function d(a,e,t=null,n={}){return new Promise((r,i)=>{GM.xmlHttpRequest({method:a,url:A+e,data:t,headers:n,onload:s=>{r(s)},onerror:s=>{i(s)}})})}function v(a,e={}){let t=new FullCalendar.Calendar(a,{locale:"fr",height:"auto",firstDay:1,headerToolbar:{left:"prev,next",center:"title",right:"today"},eventDidMount:function(n){n.el.setAttribute("title",n.event.title)},...e});return t.render(),t}function I(a){let e=a.getFullYear(),t=`${a.getMonth()+1}`.padStart(2,"0"),n=`${a.getDate()}`.padStart(2,"0");return`${e}-${t}-${n}`}function f(a){return a>=200&&a<300}function h(){let a=new Date,e=new Date(a);return e.setFullYear(a.getFullYear()+1),e.setMonth(e.getMonth()-1),new Date(e.getFullYear(),e.getMonth()+1,0)}var N="X-CSRF-TOKEN",O=[];async function C(a){if(a in O)return O[a];let e=await d("GET",`/csrf-token/${a}`),t=JSON.parse(e.responseText).csrfToken;return O[a]=t,t}function g(a,e){return new Promise(async(t,n)=>{let r;try{let i=await d("GET",`/availabilities?minDate=${a}&maxDate=${e}&limit=9999999&page=1`);r=JSON.parse(i.responseText),f(i.status)?t(r):n(`Error unexpected response code ${i.status}`)}catch(i){n(i)}})}function L(a){return new Promise(async(e,t)=>{try{let n=await d("POST",`/availabilities/${a}`,null,{[N]:await C("availabilitiesdelete")});f(n.status)?e():t(`Error unexpected response code ${n.status}`)}catch(n){t(n)}})}function E(a,e,t=null){return new Promise(async(n,r)=>{try{let i=await d("POST","/availabilities",JSON.stringify({id:t??"",start:I(a),end:I(e)}),{[N]:await C("availabilities")});f(i.status)?n():r(`Error unexpected response code ${i.status}`)}catch(i){r(i)}})}var p=Object.freeze({AVAILABILITIES:"availabilities",SUMMONS:"summons",VOLUNTEERING_DECLARATIONS:"volunteeringDeclarations"});function y(a){return{events:a,id:p.AVAILABILITIES,display:"background",color:"#6ca3e3"}}function D(a){return a.items.map(e=>{let t=new Date(e.end);return t.setDate(t.getDate()+1),{id:e.id,start:e.start,end:t,allDay:!0}})}function b(a){return{events:a,id:p.SUMMONS,color:"#18753c"}}function S(a){return a.items.map(e=>{let t=new Date(e.end);return t.setDate(t.getDate()+1),{start:e.start,end:t,allDay:!0,title:e.missionObjet}})}function R(a){return{events:a,id:p.VOLUNTEERING_DECLARATIONS,color:"#725c49"}}function P(a){return a.items.map(e=>{let t=new Date(e.end);return t.setDate(t.getDate()+1),{start:e.start,end:t,allDay:!0,title:e.objet}})}var M=`<div class="calendar-help">
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
`;var x=class{calendarEl;calendar;helpEl;showAvailabilities=!1;showSummons=!0;showVolunteeringDeclarations=!0;constructor(){let e=document.querySelector("main");this.calendarEl=document.createElement("div"),e.prepend(this.calendarEl);let t={start:new Date,end:h()};this.calendar=v(this.calendarEl,{validRange:t,eventSources:[y(async(s,l,u)=>{if(!this.showAvailabilities){l([]);return}let o=new Date,m=h();try{let c=await g(o.toISOString(),m.toISOString());l(D(c))}catch(c){u(c)}}),b(async(s,l,u)=>{if(!this.showSummons){l([]);return}let o=new Date,m=h();try{let c=await d("GET",`/convocations?minDate=${o.toISOString()}&maxDate=${m.toISOString()}`),k=JSON.parse(c.responseText);l(S(k))}catch(c){u(c)}}),R(async(s,l,u)=>{if(!this.showVolunteeringDeclarations){l([]);return}let o=new Date,m=h();try{let c=await d("GET",`/volunteering-declarations?minDate=${o.toISOString()}&maxDate=${m.toISOString()}`),k=JSON.parse(c.responseText);l(P(k))}catch(c){u(c)}})]}),this.helpEl=document.createElement("div"),this.helpEl.innerHTML=M,this.calendarEl.after(this.helpEl);let n=document.getElementById("availabilities-checkbox");n.addEventListener("click",s=>{this.showAvailabilities=n.checked,this.calendar.refetchEvents(),this.calendar.unselect()});let r=document.getElementById("summons-checkbox");r.addEventListener("click",s=>{this.showSummons=r.checked,this.calendar.refetchEvents(),this.calendar.unselect()});let i=document.getElementById("volunteering-declarations-checkbox");i.addEventListener("click",s=>{this.showVolunteeringDeclarations=i.checked,this.calendar.refetchEvents(),this.calendar.unselect()})}destroy(){this.calendar.destroy(),this.calendarEl.remove(),this.helpEl.remove()}};var $=`<div class="calendar-help">
	<div>
		Clickez sur une date pour ajouter/supprimer une disponibilit\xE9.
	</div>
	<div class="calendar-help-square-container">
		<div class="calendar-help-square-item">
			<div class="calendar-help-square calendar-help-square--blue"></div>
			DISPONIBILIT\xC9S
		</div>
		<div class="calendar-help-square-item">
			<input id="summons-checkbox" type="checkbox" class="calendar-help-square calendar-help-square--green" checked>
			<label for="summons-checkbox">CONVOCATIONS</label>
		</div>
	</div>
</div>
`;var w=class{calendarEl;calendar;helpEl;locked=!1;showSummons=!0;constructor(){let e=document.querySelector("main");this.calendarEl=document.createElement("div"),e.prepend(this.calendarEl);let t={start:new Date,end:h()};this.calendar=v(this.calendarEl,{eventSources:[y(async(r,i,s)=>{let l=new Date,u=h();try{let o=await g(l.toISOString(),u.toISOString());i(D(o))}catch(o){s(o)}}),b(async(r,i,s)=>{if(!this.showSummons){i([]);return}let l=new Date,u=h();try{let o=await d("GET",`/convocations?minDate=${l.toISOString()}&maxDate=${u.toISOString()}`),m=JSON.parse(o.responseText);i(S(m))}catch(o){s(o)}})],selectable:!0,validRange:t,dateClick:r=>this.onDateClick(r)}),this.helpEl=document.createElement("div"),this.helpEl.innerHTML=$,this.calendarEl.after(this.helpEl);let n=document.getElementById("summons-checkbox");n.addEventListener("click",r=>{this.showSummons=n.checked,this.calendar.refetchEvents(),this.calendar.unselect()})}destroy(){this.calendar.destroy(),this.calendarEl.remove(),this.helpEl.remove()}onDateClick(e){let t=e.date,n=t.getTime(),r=this.calendar.getEvents().filter(i=>{if(i.source.id===p.AVAILABILITIES)return n>=i.start.getTime()&&n<i.end.getTime()});r.length>0?r.forEach(i=>{this.removeAvailability(i,t)}):this.addAvailability(t)}async removeAvailability(e,t){if(!this.locked){this.locked=!0;try{await L(e.id);let n=new Date(e.end);if(n.setDate(n.getDate()-1),e.start.getTime()<t.getTime()){let r=new Date(t);r.setDate(r.getDate()-1),await E(e.start,r)}if(n.getTime()>t.getTime()){let r=new Date(t);r.setDate(r.getDate()+1),await E(r,n)}}finally{this.calendar.refetchEvents(),this.calendar.unselect(),this.locked=!1}}}async addAvailability(e){if(!this.locked){this.locked=!0;try{await E(e,e)}finally{this.calendar.refetchEvents(),this.calendar.unselect(),this.locked=!1}}}};var T=class{currentPage=null;constructor(){this.initNewPage();let e=history.pushState;history.pushState=(...t)=>{e.apply(history,t),this.destroyCurrentPage(),this.initNewPage()},window.addEventListener("popstate",()=>{this.destroyCurrentPage(),this.initNewPage()})}destroyCurrentPage(){this.currentPage!==null&&(this.currentPage.destroy(),this.currentPage=null)}initNewPage(){location.href.endsWith("missions")?this.currentPage=new w:location.href.endsWith("aav")&&(this.currentPage=new x)}};var F=`.fc {
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
`;document.addEventListener("DOMContentLoaded",()=>{q(F),new T});})();
