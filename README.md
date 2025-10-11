# 🚀 JobHunt (aka _Jobly_)

A modern **job marketplace platform** built with **Angular + Firebase**, designed for both job seekers and companies.  
It provides a smooth, real-time experience with authentication, job listings, applications, and company dashboards.

---

## 📂 Project Structure

jobHunt/
├── src/
│ ├── app/
│ │ ├── core/ # Singleton services, guards, interceptors
│ │ ├── shared/ # Reusable components, directives, pipes, models
│ │ ├── features/ # Feature modules (auth, jobs, applications, company, profile)
│ │ ├── app.component.ts
│ │ ├── app.routes.ts
│ │ └── app.config.ts
│ ├── assets/
│ ├── environments/
│ │ ├── environment.ts
│ │ └── environment.development.ts
│ └── styles.css

bash
Copy code

### 🔑 Firebase Data Structure

jobHunt-firebase/
├── users/{userId}
│ ├── email
│ ├── role: 'seeker' | 'company'
│ ├── displayName
│ ├── photoURL
│ ├── createdAt
│ └── profile { ...role-specific data }

├── jobs/{jobId}
│ ├── companyId
│ ├── title, description, requirements[]
│ ├── location
│ ├── salary { min, max, currency }
│ ├── type: 'full-time' | 'part-time' | 'contract'
│ ├── category
│ ├── status: 'active' | 'closed'
│ ├── createdAt, updatedAt

└── applications/{applicationId}
├── jobId, seekerId, companyId
├── status: 'pending' | 'reviewing' | 'accepted' | 'rejected'
├── resumeURL, coverLetter
├── appliedAt, updatedAt

markdown
Copy code

---

## 🎨 Angular Material Components Used

- **MatToolbar** → Navigation header
- **MatSidenav** → Side navigation
- **MatCard** → Job & applicant cards
- **MatTable** → Applicants list
- **MatPaginator** → Job listing pagination
- **MatFormField / MatSelect / MatChip** → Forms & filters
- **MatDialog** → Application forms, confirmations
- **MatSnackBar** → Notifications
- **MatBadge** → Notification counts
- **MatTabs** → Company dashboard sections
- **MatExpansionPanel** → Job details accordion
- **MatButton** → All buttons

---

## 🚀 Development Phases

### Phase 1: Foundation

- [x] Setup Angular project with Firebase
- [x] Configure Angular Material theme
- [ ] Authentication (email/password, Google)
- [ ] Core services + guards
- [ ] Layout (header, footer, routing)

### Phase 2: Job Seeker Features

- Job listing with filters (signals + observables)
- Job detail view
- Application form with resume upload
- My applications dashboard
- Profile management

### Phase 3: Company Features

- Company dashboard
- Post/edit job form
- Manage jobs (active/closed)
- View applicants + filters
- Application status management

### Phase 4: Enhancements

- Real-time notifications
- Search with debouncing
- Advanced filtering
- Email notifications (Firebase Functions)
- Analytics dashboard

---

## ✅ Best Practices

- **Standalone components** (modern Angular)
- **Lazy loading** for performance
- **OnPush change detection** for efficiency
- **Smart/Dumb component pattern**
- **RxJS + Signals** for reactive state
- **Type safety everywhere**
- **Interceptors + try/catch** for error handling
- **Accessibility** (ARIA labels, keyboard support)

---

## 📌 Commit Message Guidelines

Use **imperative verbs** with Conventional Commit style:

- **Add** → `add login feature`
- **Fix** → `fix crash in job service`
- **Update** → `update dependencies`
- **Remove** → `remove unused imports`
- **Refactor** → `refactor auth module`
- **Improve** → `improve error handling`
- **Change** → `change default port to 3000`

---

🔥 With **JobHunt (_Jobly_)**, job seekers can easily apply and track applications, while companies can manage postings and applicants in real time.
