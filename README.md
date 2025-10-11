# Project initial Structure

jobly/
├── src/
│ ├── app/
│ │ ├── core/ # Singleton services, guards
│ │ │ ├── guards/
│ │ │ │ ├── auth.guard.ts
│ │ │ │ ├── role.guard.ts
│ │ │ │ └── unsaved-changes.guard.ts
│ │ │ ├── interceptors/
│ │ │ │ ├── auth.interceptor.ts
│ │ │ │ └── error.interceptor.ts
│ │ │ └── services/
│ │ │ ├── auth.service.ts
│ │ │ ├── notification.service.ts
│ │ │ └── storage.service.ts
│ │ │
│ │ ├── shared/ # Shared components, directives, pipes
│ │ │ ├── components/
│ │ │ │ ├── header/
│ │ │ │ ├── footer/
│ │ │ │ ├── loader/
│ │ │ │ └── confirmation-dialog/
│ │ │ ├── directives/
│ │ │ │ ├── auto-focus.directive.ts
│ │ │ │ ├── debounce-click.directive.ts
│ │ │ │ ├── img-fallback.directive.ts
│ │ │ │ └── permission.directive.ts
│ │ │ ├── pipes/
│ │ │ │ ├── time-ago.pipe.ts
│ │ │ │ ├── truncate.pipe.ts
│ │ │ │ ├── salary-format.pipe.ts
│ │ │ │ └── filter.pipe.ts
│ │ │ └── models/
│ │ │ ├── user.model.ts
│ │ │ ├── job.model.ts
│ │ │ └── application.model.ts
│ │ │
│ │ ├── features/ # Feature modules
│ │ │ ├── auth/
│ │ │ │ ├── components/
│ │ │ │ │ ├── login/
│ │ │ │ │ ├── register/
│ │ │ │ │ └── role-selection/
│ │ │ │ ├── auth.routes.ts
│ │ │ │ └── auth.module.ts
│ │ │ │
│ │ │ ├── jobs/ # Job seeker features
│ │ │ │ ├── components/
│ │ │ │ │ ├── job-list/
│ │ │ │ │ ├── job-detail/
│ │ │ │ │ ├── job-card/
│ │ │ │ │ └── job-filters/
│ │ │ │ ├── services/
│ │ │ │ │ └── job.service.ts
│ │ │ │ ├── jobs.routes.ts
│ │ │ │ └── jobs.module.ts
│ │ │ │
│ │ │ ├── applications/ # Job applications
│ │ │ │ ├── components/
│ │ │ │ │ ├── application-form/
│ │ │ │ │ ├── my-applications/
│ │ │ │ │ └── application-status/
│ │ │ │ ├── services/
│ │ │ │ │ └── application.service.ts
│ │ │ │ └── applications.routes.ts
│ │ │ │
│ │ │ ├── company/ # Company dashboard
│ │ │ │ ├── components/
│ │ │ │ │ ├── dashboard/
│ │ │ │ │ ├── post-job/
│ │ │ │ │ ├── manage-jobs/
│ │ │ │ │ ├── applicants-list/
│ │ │ │ │ └── applicant-detail/
│ │ │ │ ├── services/
│ │ │ │ │ └── company.service.ts
│ │ │ │ └── company.routes.ts
│ │ │ │
│ │ │ └── profile/ # User profile
│ │ │ ├── components/
│ │ │ │ ├── profile-view/
│ │ │ │ ├── profile-edit/
│ │ │ │ └── resume-upload/
│ │ │ ├── services/
│ │ │ │ └── profile.service.ts
│ │ │ └── profile.routes.ts
│ │ │
│ │ ├── app.component.ts
│ │ ├── app.routes.ts # Main routing
│ │ └── app.config.ts
│ │
│ ├── assets/
│ ├── environments/
│ │ ├── environment.ts
│ │ └── environment.development.ts
│ └── styles.css

jobly-firebase/
├── users/
│ └── {userId}
│ ├── email
│ ├── role: 'seeker' | 'company'
│ ├── displayName
│ ├── photoURL
│ ├── createdAt
│ └── profile: {
│ // Role-specific data
│ }
│
├── jobs/
│ └── {jobId}
│ ├── companyId
│ ├── title
│ ├── description
│ ├── requirements[]
│ ├── location
│ ├── salary: { min, max, currency }
│ ├── type: 'full-time' | 'part-time' | 'contract'
│ ├── category
│ ├── status: 'active' | 'closed'
│ ├── createdAt
│ └── updatedAt
│
└── applications/
└── {applicationId}
├── jobId
├── seekerId
├── companyId
├── status: 'pending' | 'reviewing' | 'accepted' | 'rejected'
├── resumeURL
├── coverLetter
├── appliedAt
└── updatedAt

🎨 Angular Material Components to Use

MatToolbar - Navigation header
MatSidenav - Side navigation
MatCard - Job cards, applicant cards
MatTable - Applicants list for companies
MatPaginator - Pagination for job listings
MatFormField - All form inputs
MatSelect - Dropdowns (job type, category)
MatChip - Skills, tags, filters
MatDialog - Confirmation dialogs, application forms
MatSnackBar - Notifications
MatBadge - Notification counts
MatTabs - Company dashboard sections
MatExpansionPanel - Job details accordion
MatButton - All buttons with elevation

🚀 Development Phases
Phase 1: Foundation

Setup Angular project with Firebase => done
Configure Angular Material theme => done
Implement authentication (email/password, Google)
Create core services and guards
Build basic layout (header, footer, routing)

Phase 2: Job Seeker Features

Job listing with filters (signals + observables)
Job detail view
Application form with resume upload
My applications dashboard
Profile management

Phase 3: Company Features

Company dashboard
Post/edit job form
Manage jobs (active/closed)
View applicants with filters
Application status management

Phase 4: Enhancement

Real-time notifications
Search with debouncing
Advanced filtering
Email notifications (Firebase Functions)
Analytics dashboard

💡 Best Practices Applied
✅ Standalone components - Modern Angular approach
✅ Lazy loading - Better performance
✅ OnPush change detection - Optimize rendering
✅ Smart/Dumb component pattern - Clear separation
✅ RxJS operators - Clean async code
✅ Signals - Reactive state management
✅ Type safety - Strong typing everywhere
✅ Error handling - Interceptors + try-catch
✅ Accessibility - ARIA labels, keyboard navigation
Ready to start building? I can help you with specific components or features! 🚀

# Commit Message Common Verbs

Add → add login feature, add new API endpoint

Fix → fix typo, fix crash in job service

Update → update dependencies, update README

Remove → remove unused imports, remove old API

Refactor → refactor auth module

Improve → improve error handling, improve UI performance

Change → change default port to 3000
