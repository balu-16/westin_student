export type ClassStatus = 'completed' | 'in-progress' | 'upcoming'

export interface ClassSession {
  id: string
  subject: string
  code: string
  faculty: string
  startTime: string
  endTime: string
  room: string
  section: string
  status: ClassStatus
}

export interface DaySchedule {
  day: string
  classes: ClassSession[]
}

export interface SubjectAttendance {
  id: string
  subject: string
  code: string
  attended: number
  total: number
  percentage: number
}

export interface Announcement {
  id: string
  title: string
  message: string
  date: string
  category: 'exam' | 'event' | 'general'
}

export interface QuickLinkItem {
  id: string
  label: string
  to: string
  icon: 'book' | 'clipboard' | 'calendar' | 'bell'
}

export interface Student {
  /** API user id — powers OneSignal push identity (student_<id>); may lag profile refresh */
  id?: string
  name: string
  firstName: string
  department: string
  year: string
  studentId: string
  email: string
  overallAttendance: number
  avatarUrl: string | null
}

export interface AttendanceBreakdown {
  label: string
  value: number
  color: string
}

export interface DashboardStats {
  classesToday: number
  classesCompleted: number
  overallAttendance: number
  subjects: number
  pendingAssignments: number
}

export type FileType = 'pdf' | 'docx' | 'pptx' | 'xlsx'

export interface StudyFile {
  id: string
  name: string
  subtitle: string
  type: FileType
  subject: string
  uploadedBy: string
  date: string
  size: string
}

export interface SubjectFolder {
  id: string
  subject: string
  fileCount: number
}

export type EventCategory = 'CULTURAL' | 'TECH TALK' | 'SPORTS' | 'WORKSHOP' | 'SEMINAR'

export interface UpcomingEvent {
  id: string
  category: EventCategory
  title: string
  description: string
  day: number
  month: string
  year: number
  weekday: string
  fullDate: string
  accent: string
}

export interface EventCategoryCount {
  id: string
  name: string
  count: number
  icon: 'music' | 'presentation' | 'trophy' | 'wrench' | 'sparkles'
}
