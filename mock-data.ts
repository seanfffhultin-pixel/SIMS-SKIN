import {StudentData} from "./types";
export const mockData:StudentData={
 student:{id:"demo-student-001",name:"Alex",year:"Year 10"},
 lessons:[
  {id:"1",subject:"Mathematics",teacher:"Mr Smith",room:"12",startsAt:"09:00",endsAt:"10:00"},
  {id:"2",subject:"English",teacher:"Ms Jones",room:"18",startsAt:"10:00",endsAt:"11:00"},
  {id:"3",subject:"Physics",teacher:"Dr Patel",room:"Lab 2",startsAt:"11:30",endsAt:"12:30"},
  {id:"4",subject:"History",teacher:"Mr Brown",room:"24",startsAt:"13:30",endsAt:"14:30"},
  {id:"5",subject:"Computing",teacher:"Mrs Green",room:"ICT 1",startsAt:"14:30",endsAt:"15:30"}
 ],
 homework:[
  {id:"h1",subject:"Mathematics",title:"Quadratic equations",dueDate:"Tomorrow",simsStatus:"current"},
  {id:"h2",subject:"Biology",title:"Cell structure worksheet",dueDate:"Friday",simsStatus:"current"},
  {id:"h3",subject:"English",title:"Read chapters 4–6",dueDate:"Monday",simsStatus:"submitted"},
  {id:"h4",subject:"History",title:"Essay",dueDate:"19 September",simsStatus:"overdue"}
 ],
 announcements:[
  {id:"a1",title:"Year 10 trip information",body:"Updated information about the upcoming trip.",publishedAt:"2h ago"},
  {id:"a2",title:"Exam timetable",body:"The latest timetable has been published.",publishedAt:"Yesterday"}
 ],
 attendance:{present:483,possible:501},syncedAt:new Date().toISOString()
};