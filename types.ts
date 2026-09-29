export type Lesson={id:string;subject:string;teacher:string;room:string;startsAt:string;endsAt:string};
export type Homework={id:string;subject:string;title:string;dueDate:string;simsStatus:"current"|"overdue"|"submitted"};
export type Announcement={id:string;title:string;body:string;publishedAt:string};
export type StudentData={student:{id:string;name:string;year:string};lessons:Lesson[];homework:Homework[];announcements:Announcement[];attendance:{present:number;possible:number};syncedAt:string};