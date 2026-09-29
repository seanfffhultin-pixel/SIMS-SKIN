"use client";
import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import {CalendarDays,Check,CheckCircle2,ChevronRight,Clock3,GraduationCap,Megaphone,BookOpen,RotateCcw} from "lucide-react";
import type {StudentData} from "@/lib/types";

function pct(a:number,b:number){return b>0?((a/b)*100).toFixed(1):"0.0"}

export default function Home(){
 const [d,setData]=useState<StudentData|null>(null);
 const [error,setError]=useState("");
 const [storageReady,setStorageReady]=useState(false);
 const [now,setNow]=useState<Date|null>(null);
 useEffect(()=>{
  const controller=new AbortController();
  fetch("/api/student",{signal:controller.signal,cache:"no-store"})
   .then(r=>{if(!r.ok) throw new Error("Unable to load student information.");return r.json()})
   .then(setData).catch(e=>{if(e.name!=="AbortError")setError(e.message)});
  setNow(new Date());
  const timer=setInterval(()=>setNow(new Date()),60000);
  return ()=>{controller.abort();clearInterval(timer)};
 },[]);
 const [completed,setCompleted]=useState<Record<string,boolean>>({});
 const [filter,setFilter]=useState<"all"|"todo"|"done">("all");
 useEffect(()=>{
  if(!d)return;
  try{
   const saved=JSON.parse(localStorage.getItem(`shsb:completed:${d.student.id}`)||"{}");
   const restored:Record<string,boolean>={};
   if(saved && typeof saved==="object" && !Array.isArray(saved)){
    for(const [id,value] of Object.entries(saved)){if(typeof value==="boolean")restored[id]=value}
   }
   setCompleted(restored);
  }catch{setError("Saved homework ticks could not be loaded on this device.")}
  setStorageReady(true);
 },[d]);
 const visible=useMemo(()=>(d?.homework??[]).filter(h=>filter==="all"||(filter==="done"?!!completed[h.id]:!completed[h.id])),[d,filter,completed]);
 const time=now?.toLocaleTimeString("en-GB",{timeZone:"Europe/London",hour:"2-digit",minute:"2-digit",hour12:false})??"00:00";
 const next=d?.lessons.filter(l=>l.startsAt>time).sort((a,b)=>a.startsAt.localeCompare(b.startsAt))[0];

 function toggle(id:string){
  if(!d||!storageReady)return;
  const updated={...completed,[id]:!completed[id]};
  setCompleted(updated);
  try{localStorage.setItem(`shsb:completed:${d.student.id}`,JSON.stringify(updated))}
  catch{setError("Your tick changed, but this browser could not save it for next time.")}
 }
 if(!d)return <main className="mx-auto max-w-xl p-8" role="status">{error||"Loading student information…"}{error&&<button className="ml-4 underline" onClick={()=>window.location.reload()}>Retry</button>}</main>;

 return <main className="min-h-screen">
  <div className="mx-auto flex max-w-7xl">
   <aside className="desktop-nav sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-6 md:flex">
    <div className="mb-10 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white"><GraduationCap size={21}/></div><div><div className="font-bold">SHSB Student</div><div className="text-xs text-slate-500">Student portal</div></div></div>
    <nav className="space-y-1">{[["Dashboard","/"],["Timetable","#timetable"],["Homework","#homework"],["Calendar","#calendar"],["Attendance","#attendance"],["Announcements","#announcements"]].map(([label,href],i)=><Link key={label} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${i===0?"bg-slate-100 font-semibold":"text-slate-600 hover:bg-slate-50"}`}>{i===0?<BookOpen size={18}/>:i===1?<Clock3 size={18}/>:i===2?<CheckCircle2 size={18}/>:i===3?<CalendarDays size={18}/>:i===4?<GraduationCap size={18}/>:<Megaphone size={18}/>} {label}</Link>)}</nav>
    <div className="mt-auto rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">SIMS data is read-only here.<br/>Your completion ticks are personal.</div>
   </aside>

   <section className="min-w-0 flex-1 px-5 py-7 md:px-10">
    <header className="mb-8 flex items-center justify-between"><div><p className="muted text-sm">{now?.toLocaleDateString("en-GB",{timeZone:"Europe/London",weekday:"long",day:"numeric",month:"long"})}</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Hello, {d.student.name}.</h1></div></header>

    <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Demo data — your SIMS account is not connected. <a className="ml-2 font-semibold underline" href="https://www.sims-student.co.uk/#!/schools/3a69abc8-bef5-416c-a9f6-2b2c0a1b1fdf/homeworkItems" target="_blank" rel="noopener noreferrer">Open SIMS Student</a></p>
    {error&&<p role="alert" className="mb-5 text-sm text-red-700">{error}</p>}
    <div className="grid gap-5 lg:grid-cols-3">
     <div className="card p-6 lg:col-span-2"><div className="flex items-center justify-between"><div><p className="muted text-sm">Your next lesson</p><h2 className="mt-1 text-2xl font-bold">{next?.subject??"No more lessons today"}</h2></div><div className="rounded-2xl bg-slate-100 px-4 py-3 text-center"><div className="text-lg font-bold">{next?.startsAt??"—"}</div><div className="text-xs text-slate-500">{next?.room??""}</div></div></div><div className="mt-5 flex items-center gap-2 text-sm text-slate-600"><Clock3 size={16}/> {next?.startsAt??"—"}–{next?.endsAt??"—"} · {next?.teacher??""}</div><Link href="#timetable" className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-semibold">View today's timetable <ChevronRight size={17}/></Link></div>
     <div className="card p-6" id="attendance"><p className="muted text-sm">Attendance</p><div className="mt-2 text-4xl font-bold">{d.attendance.possible>0?`${pct(d.attendance.present,d.attendance.possible)}%`:"Not available"}</div><p className="mt-1 text-sm text-slate-500">{d.attendance.present} of {d.attendance.possible} sessions</p><div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-900" style={{width:`${pct(d.attendance.present,d.attendance.possible)}%`}}/></div></div>
    </div>

    <div className="card mt-5 p-6" id="homework">
     <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold">Homework</h2><p className="mt-1 text-sm text-slate-500">Example assignments. Tick things off for yourself.</p></div><div className="flex rounded-xl bg-slate-100 p-1 text-sm">{(["all","todo","done"] as const).map(f=><button key={f} onClick={()=>setFilter(f)} className={`rounded-lg px-3 py-1.5 capitalize ${filter===f?"bg-white font-semibold shadow-sm":"text-slate-500"}`}>{f==="todo"?"To do":f==="done"?"Done":"All"}</button>)}</div></div>
     <div className="space-y-2">{visible.length===0&&<p className="py-4 text-sm text-slate-500">No homework in this view.</p>}{visible.map(h=>{const done=!!completed[h.id];return <div key={h.id} className={`flex items-center gap-4 rounded-2xl border p-4 transition ${done?"border-slate-100 bg-slate-50 opacity-70":"border-slate-100 bg-white"}`}>
       <button disabled={!storageReady} aria-pressed={done} aria-label={done?"Mark incomplete":"Mark completed"} onClick={()=>toggle(h.id)} className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${done?"border-slate-900 bg-slate-900 text-white":"border-slate-300 text-transparent hover:border-slate-500"}`}><Check size={15}/></button>
       <div className="min-w-0 flex-1"><div className="text-xs font-semibold text-slate-500">{h.subject}</div><div className={`mt-1 font-semibold ${done?"line-through":""}`}>{h.title}</div></div>
       <div className="text-right text-sm"><div className={h.simsStatus==="overdue"&&!done?"font-semibold text-red-600":"font-medium text-slate-600"}>{done?"Completed":h.dueDate}</div>{h.simsStatus==="overdue"&&!done&&<div className="text-xs text-red-500">Overdue in SIMS</div>}</div>
     </div>})}</div>
     <div className="mt-5 flex items-center gap-2 text-xs text-slate-400"><RotateCcw size={13}/> Completion ticks are saved in this browser, separately from SIMS.</div>
    </div>

    <div className="mt-5 grid gap-5 lg:grid-cols-2">
     <div className="card p-6" id="announcements"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold">Latest</h2><Megaphone size={19} className="text-slate-400"/></div>{d.announcements.map(a=><div key={a.id} className="border-b border-slate-100 py-4 last:border-0"><div className="flex justify-between gap-4"><div className="font-semibold">{a.title}</div><div className="whitespace-nowrap text-xs text-slate-400">{a.publishedAt}</div></div><p className="mt-1 text-sm text-slate-500">{a.body}</p></div>)}</div>
     <div className="card p-6" id="calendar"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold">Calendar</h2><CalendarDays size={19} className="text-slate-400"/></div><p className="text-sm text-slate-500">This area will mirror the calendar/events exposed by the authorised SIMS integration.</p></div>
    </div>

    <div className="card mt-5 p-6" id="timetable"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold">Today's timetable</h2><span className="text-xs text-slate-400">Demo timetable</span></div><div className="grid gap-2 md:grid-cols-5">{d.lessons.map(l=><div key={l.id} className="rounded-2xl border border-slate-100 p-4"><div className="text-xs font-semibold text-slate-400">{l.startsAt}</div><div className="mt-2 font-bold">{l.subject}</div><div className="mt-1 text-xs text-slate-500">{l.room}</div><div className="mt-3 text-xs text-slate-500">{l.teacher}</div></div>)}</div></div>

    <footer className="py-8 text-center text-xs text-slate-400">SHSB Student · Prototype · SIMS is the source of school data</footer>
   </section>
  </div>
 </main>
}