import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'jb-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-container">
      <!-- Loading State -->
      @if (authService.loading()) {
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading profile...</p>
      </div>
      }

      <!-- Error State -->
      @if (authService.error(); as error) {
      <div class="error"><strong>Error:</strong> {{ error }}</div>
      }

      <!-- Seeker Profile -->
      @if (authService.seekerProfile(); as seeker) {
      <div class="seeker-profile">
        <!-- Header -->
        <div class="profile-header">
          <div class="header-content">
            <div class="profile-avatar">
              @if (seeker.photoURL) {
              <img [src]="seeker.photoURL" [alt]="seeker.displayName" />
              } @else {
              <div class="avatar-placeholder">
                <span>{{ seeker.displayName.charAt(0).toUpperCase() }}</span>
              </div>
              }
            </div>
            <div class="header-info">
              <h1>{{ seeker.displayName }}</h1>
              <p class="subtitle">Job Seeker</p>
            </div>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="profile-section">
          <div class="section-header">
            <h3>📧 Contact Information</h3>
          </div>
          <div class="section-content grid-2">
            <div class="info-item">
              <label>Email</label>
              <p>{{ seeker.email }}</p>
            </div>
            @if (seeker.phone) {
            <div class="info-item">
              <label>Phone</label>
              <p>{{ seeker.phone }}</p>
            </div>
            } @if (seeker.location) {
            <div class="info-item">
              <label>Location</label>
              <p>{{ seeker.location }}</p>
            </div>
            } @if (seeker.uid) {
            <div class="info-item">
              <label>Member Since</label>
              <p>{{ seeker.createdAt | date : 'MMM d, yyyy' }}</p>
            </div>
            }
          </div>
        </div>

        <!-- Bio -->
        @if (seeker.bio) {
        <div class="profile-section">
          <div class="section-header">
            <h3>👤 About</h3>
          </div>
          <div class="section-content">
            <p class="bio-text">{{ seeker.bio }}</p>
          </div>
        </div>
        }

        <!-- Skills -->
        @if (seeker.skills && seeker.skills.length > 0) {
        <div class="profile-section">
          <div class="section-header">
            <h3>🛠️ Skills</h3>
            <span class="badge">{{ seeker.skills.length }}</span>
          </div>
          <div class="section-content">
            <div class="skills-container">
              @for (skill of seeker.skills; track skill) {
              <span class="skill-tag">{{ skill }}</span>
              }
            </div>
          </div>
        </div>
        }

        <!-- Experience -->
        @if (seeker.experience) {
        <div class="profile-section">
          <div class="section-header">
            <h3>💼 Experience</h3>
          </div>
          <div class="section-content">
            <p>{{ seeker.experience }}</p>
          </div>
        </div>
        }

        <!-- Education -->
        @if (seeker.education) {
        <div class="profile-section">
          <div class="section-header">
            <h3>🎓 Education</h3>
          </div>
          <div class="section-content">
            <p>{{ seeker.education }}</p>
          </div>
        </div>
        }

        <!-- Links & Portfolio -->
        @if (seeker.resumeURL || seeker.linkedIn || seeker.github || seeker.portfolio) {
        <div class="profile-section">
          <div class="section-header">
            <h3>🔗 Links & Portfolio</h3>
          </div>
          <div class="section-content">
            <div class="links-grid">
              @if (seeker.resumeURL) {
              <a [href]="seeker.resumeURL" target="_blank" rel="noopener" class="link-button">
                <span class="link-icon">📄</span>
                <span>Download Resume</span>
              </a>
              } @if (seeker.linkedIn) {
              <a [href]="seeker.linkedIn" target="_blank" rel="noopener" class="link-button">
                <span class="link-icon">💼</span>
                <span>LinkedIn</span>
              </a>
              } @if (seeker.github) {
              <a [href]="seeker.github" target="_blank" rel="noopener" class="link-button">
                <span class="link-icon">👨‍💻</span>
                <span>GitHub</span>
              </a>
              } @if (seeker.portfolio) {
              <a [href]="seeker.portfolio" target="_blank" rel="noopener" class="link-button">
                <span class="link-icon">🌐</span>
                <span>Portfolio</span>
              </a>
              }
            </div>
          </div>
        </div>
        }

        <!-- Metadata -->
        @if (seeker.updatedAt) {
        <div class="profile-section metadata">
          <p>Last updated: {{ seeker.updatedAt | date : 'MMM d, yyyy' }}</p>
        </div>
        }
      </div>
      }

      <!-- Company Profile -->
      @if (authService.companyProfile(); as company) {
      <div class="company-profile">
        <!-- Header -->
        <div class="profile-header company-header">
          <div class="header-content">
            <div class="company-logo">
              @if (company.companyLogo) {
              <img [src]="company.companyLogo" [alt]="company.companyName" />
              } @else {
              <div class="logo-placeholder">
                <span>{{ company.companyName.charAt(0).toUpperCase() }}</span>
              </div>
              }
            </div>
            <div class="header-info">
              <h1>{{ company.companyName }}</h1>
              <p class="subtitle">{{ company.displayName }}</p>
            </div>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="profile-section">
          <div class="section-header">
            <h3>📧 Contact Information</h3>
          </div>
          <div class="section-content grid-2">
            <div class="info-item">
              <label>Primary Contact</label>
              <p>{{ company.displayName }}</p>
            </div>
            <div class="info-item">
              <label>Email</label>
              <p>{{ company.email }}</p>
            </div>
            @if (company.location) {
            <div class="info-item">
              <label>Location</label>
              <p>{{ company.location }}</p>
            </div>
            } @if (company.website) {
            <div class="info-item">
              <label>Website</label>
              <p>
                <a [href]="company.website" target="_blank" rel="noopener">
                  {{ company.website }}
                </a>
              </p>
            </div>
            }
          </div>
        </div>

        <!-- Company Details -->
        <div class="profile-section">
          <div class="section-header">
            <h3>🏢 Company Details</h3>
          </div>
          <div class="section-content grid-2">
            @if (company.industry) {
            <div class="info-item">
              <label>Industry</label>
              <p>{{ company.industry }}</p>
            </div>
            } @if (company.companySize) {
            <div class="info-item">
              <label>Company Size</label>
              <p>{{ company.companySize }}</p>
            </div>
            } @if (company.foundedYear) {
            <div class="info-item">
              <label>Founded</label>
              <p>{{ company.foundedYear }}</p>
            </div>
            } @if (company.uid) {
            <div class="info-item">
              <label>Member Since</label>
              <p>{{ company.createdAt | date : 'MMM d, yyyy' }}</p>
            </div>
            }
          </div>
        </div>

        <!-- About -->
        @if (company.description) {
        <div class="profile-section">
          <div class="section-header">
            <h3>📝 About</h3>
          </div>
          <div class="section-content">
            <p>{{ company.description }}</p>
          </div>
        </div>
        }

        <!-- Social Links -->
        @if (company.linkedIn || company.twitter) {
        <div class="profile-section">
          <div class="section-header">
            <h3>🔗 Social Media</h3>
          </div>
          <div class="section-content">
            <div class="links-grid">
              @if (company.linkedIn) {
              <a [href]="company.linkedIn" target="_blank" rel="noopener" class="link-button">
                <span class="link-icon">💼</span>
                <span>LinkedIn</span>
              </a>
              } @if (company.twitter) {
              <a [href]="company.twitter" target="_blank" rel="noopener" class="link-button">
                <span class="link-icon">𝕏</span>
                <span>Twitter</span>
              </a>
              }
            </div>
          </div>
        </div>
        }

        <!-- Metadata -->
        @if (company.updatedAt) {
        <div class="profile-section metadata">
          <p>Last updated: {{ company.updatedAt | date : 'MMM d, yyyy' }}</p>
        </div>
        }
      </div>
      }
    </div>
  `,
  styles: [
    `
      .profile-container {
        max-width: 1000px;
        margin: 0 auto;
        padding: 1.5rem;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        min-height: 100vh;
      }

      /* Loading State */
      .loading {
        text-align: center;
        padding: 4rem 2rem;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .spinner {
        width: 50px;
        height: 50px;
        margin: 0 auto 1rem;
        border: 4px solid #e0e0e0;
        border-top: 4px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .loading p {
        color: #666;
        font-size: 1.1rem;
      }

      /* Error State */
      .error {
        background: #ffebee;
        color: #c62828;
        padding: 1.5rem;
        border-radius: 8px;
        border-left: 4px solid #c62828;
        margin-bottom: 2rem;
        font-weight: 500;
      }

      /* Profile Headers */
      .profile-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 2rem;
        border-radius: 12px 12px 0 0;
        margin-bottom: 0;
      }

      .profile-header.company-header {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      .header-content {
        display: flex;
        gap: 2rem;
        align-items: center;
      }

      .profile-avatar,
      .company-logo {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        overflow: hidden;
        border: 4px solid white;
        flex-shrink: 0;
        background: rgba(255, 255, 255, 0.2);
      }

      .company-logo {
        border-radius: 12px;
      }

      .profile-avatar img,
      .company-logo img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .avatar-placeholder,
      .logo-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.3);
        font-size: 2rem;
        font-weight: bold;
        color: white;
      }

      .header-info h1 {
        margin: 0;
        font-size: 2rem;
        font-weight: 600;
      }

      .header-info .subtitle {
        margin: 0.5rem 0 0 0;
        opacity: 0.9;
        font-size: 1rem;
      }

      /* Profile Sections */
      .seeker-profile,
      .company-profile {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      }

      .profile-section {
        padding: 2rem;
        border-bottom: 1px solid #e8e8e8;
      }

      .profile-section:last-child {
        border-bottom: none;
      }

      .profile-section.metadata {
        background: #f9f9f9;
        padding: 1rem 2rem;
        font-size: 0.875rem;
        color: #999;
      }

      /* Section Headers */
      .section-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
      }

      .section-header h3 {
        margin: 0;
        font-size: 1.25rem;
        color: #333;
      }

      .badge {
        background: #667eea;
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        margin-left: auto;
      }

      /* Grid Layouts */
      .grid-2 {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
      }

      .info-item {
        display: flex;
        flex-direction: column;
      }

      .info-item label {
        font-size: 0.875rem;
        color: #999;
        font-weight: 600;
        text-transform: uppercase;
        margin-bottom: 0.5rem;
      }

      .info-item p {
        margin: 0;
        color: #333;
        font-size: 1rem;
        line-height: 1.5;
      }

      /* Bio Text */
      .bio-text {
        color: #555;
        line-height: 1.7;
        margin: 0;
      }

      /* Skills */
      .skills-container {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
      }

      .skill-tag {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 500;
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .skill-tag:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }

      /* Links Grid */
      .links-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;
      }

      .link-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        padding: 1rem;
        background: #f5f5f5;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        text-decoration: none;
        color: #333;
        font-weight: 500;
        transition: all 0.3s;
      }

      .link-button:hover {
        background: #667eea;
        color: white;
        border-color: #667eea;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      }

      .link-icon {
        font-size: 1.25rem;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .profile-container {
          padding: 1rem;
        }

        .header-content {
          flex-direction: column;
          text-align: center;
          gap: 1rem;
        }

        .profile-avatar,
        .company-logo {
          width: 100px;
          height: 100px;
        }

        .header-info h1 {
          font-size: 1.5rem;
        }

        .profile-section {
          padding: 1.5rem 1rem;
        }

        .grid-2 {
          grid-template-columns: 1fr;
        }

        .links-grid {
          grid-template-columns: 1fr;
        }

        .section-header {
          flex-direction: column;
          align-items: flex-start;
        }

        .badge {
          margin-left: 0;
          align-self: flex-start;
          margin-top: 0.5rem;
        }
      }

      a {
        color: #667eea;
        text-decoration: none;
        transition: color 0.2s;
      }

      a:hover {
        color: #764ba2;
        text-decoration: underline;
      }
    `,
  ],
})
export class ProfileViewComponent {
  authService = inject(AuthService);
}
