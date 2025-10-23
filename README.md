# 🚀 JobHunt (aka _Jobly_)

A modern **job marketplace platform** built with **Angular + Firebase**, designed for both job seekers and companies. It provides a smooth, real-time experience with authentication, job listings, applications, and company dashboards.

---

## 📂 Project Structure

```
jobHunt/
├── src/
│   ├── app/
│   │   ├── core/              # Singleton services, guards, interceptors
│   │   ├── shared/            # Reusable components, directives, pipes, models
│   │   ├── features/          # Feature modules (auth, jobs, applications, company, profile)
│   │   ├── app.component.ts
│   │   ├── app.routes.ts
│   │   └── app.config.ts
│   ├── assets/
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.development.ts
│   └── styles.css
└── ...
```

### Core Directory

```
core/
├── services/
│   ├── auth.service.ts
│   ├── profile.service.ts
│   ├── cloudinary.service.ts
│   └── form-change-detection.service.ts
├── guards/
│   ├── auth.guard.ts
│   └── role.guard.ts
├── interceptors/
│   └── http-error.interceptor.ts
└── models/
    └── user.model.ts
```

### Shared Directory

```
shared/
├── components/
│   ├── header/
│   ├── footer/
│   └── loader/
├── directives/
├── pipes/
└── models/
    └── user.model.ts
```

### Features Directory

```
features/
├── auth/
│   ├── login/
│   ├── register/
│   └── role-selection/
├── profile/
│   ├── profile-view/
│   └── profile-edit/
├── jobs/
│   ├── job-list/
│   ├── job-details/
│   └── job-search/
├── applications/
│   └── application-list/
└── company/
    ├── company-dashboard/
    └── job-post/
```

---

## 🔑 Firebase Data Structure

```
jobHunt-firebase/
├── users/{userId}
│   ├── email
│   ├── role: 'seeker' | 'company'
│   ├── displayName
│   ├── photoURL
│   ├── createdAt
│   └── profile { ...role-specific data }
│
├── jobs/{jobId}
│   ├── companyId
│   ├── title, description, requirements[]
│   ├── location
│   ├── salary { min, max, currency }
│   ├── type: 'full-time' | 'part-time' | 'contract'
│   ├── category
│   ├── status: 'active' | 'closed'
│   ├── createdAt, updatedAt
│
└── applications/{applicationId}
    ├── jobId, seekerId, companyId
    ├── status: 'pending' | 'reviewing' | 'accepted' | 'rejected'
    ├── resumeURL, coverLetter
    ├── appliedAt, updatedAt
```

---

## 🎨 Angular Material Components Used

- **MatToolbar** — Navigation header
- **MatSidenav** — Side navigation
- **MatCard** — Job & applicant cards
- **MatTable** — Applicants list
- **MatPaginator** — Job listing pagination
- **MatFormField / MatSelect / MatChip** — Forms & filters
- **MatDialog** — Application forms, confirmations
- **MatSnackBar** — Notifications
- **MatBadge** — Notification counts
- **MatTabs** — Company dashboard sections
- **MatExpansionPanel** — Job details accordion
- **MatButton** — All buttons

---

## 🚀 Development Phases

### Phase 1: Foundation ✅ COMPLETED

- [x] Setup Angular project with Firebase
- [x] Configure Angular Material theme
- [x] Authentication (email/password, Google)
- [x] Core services + guards
- [x] Layout (header, footer, routing)
- [x] Forgot password functionality
- [x] Role selection for Google sign-in

### Phase 2: Job Seeker Features ✅ COMPLETED

- [x] Job listing with filters (signals + observables)
- [x] Job detail view with apply functionality
- [x] Application form with resume upload
- [x] My applications dashboard with filtering
- [x] Profile management with file uploads
- [x] Application status tracking

### Phase 3: Company Features ✅ COMPLETED

- [x] Company dashboard with real statistics
- [x] Post job form with multi-step wizard
- [x] Manage jobs (active/closed) with actions
- [x] View applicants with status management
- [x] Application status management
- [x] Job management with filtering and pagination

### Phase 4: Profile Features ✅ COMPLETED

- [x] Comprehensive profile editing
- [x] Role-specific forms (seeker/company)
- [x] File upload for images and CVs
- [x] Skills management with chips
- [x] Social links and portfolio
- [x] Enhanced profile view with edit functionality

### Phase 5: Enhancements (Future)

- [ ] Real-time notifications
- [ ] Advanced search with debouncing
- [ ] Email notifications (Firebase Functions)
- [ ] Analytics dashboard
- [ ] Mobile app (Ionic)

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

- **Add** — `add login feature`
- **Fix** — `fix crash in job service`
- **Update** — `update dependencies`
- **Remove** — `remove unused imports`
- **Refactor** — `refactor auth module`
- **Improve** — `improve error handling`
- **Change** — `change default port to 3000`

---

🔥 With **JobHunt (_Jobly_)**, job seekers can easily apply and track applications, while companies can manage postings and applicants in real time.
