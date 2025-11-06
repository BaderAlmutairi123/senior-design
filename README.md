# Social Engineering Attack Simulator

> **Transforming the weakest link in cybersecurity into the strongest defense**

A comprehensive web-based training platform that immerses users in realistic social engineering attack scenarios. Designed for educational institutions and organizations to build cybersecurity awareness through interactive simulations.

[![License](https://img.shields.io/badge/license-Academic-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-In%20Development-yellow.svg)]()

## 📋 Table of Contents

- [Overview](#overview)
- [The Problem](#the-problem)
- [Our Solution](#our-solution)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [User Types](#user-types)
- [User Stories](#user-stories)
- [Technology Stack](#technology-stack)
- [Project Goals](#project-goals)
- [Testing Strategy](#testing-strategy)
- [Non-Functional Requirements](#non-functional-requirements)
- [Development Team](#development-team)
- [Project Timeline](#project-timeline)
- [References](#references)

## 🎯 Overview

The Social Engineering Attack Simulator is an academic software engineering project that creates an accessible, comprehensive training platform for cybersecurity awareness. The platform presents employees and students with authentic attack simulations including sophisticated phishing emails, vishing attempts, pretexting scenarios, and baiting attacks, allowing them to practice recognition and response skills in a controlled environment.

## 🚨 The Problem

Organizations today face an alarming reality:

- **Cyber attacks are growing exponentially** - Complaints and financial losses have increased dramatically year over year
- **Employees remain the weakest link** - Despite millions spent on technical security solutions, a single convincing phishing email or persuasive phone call can bypass the most sophisticated firewalls
- **Existing solutions are inadequate** - Platforms like KnowBe4 and Proofpoint focus primarily on email-based attacks and come with enterprise-level pricing that puts them out of reach for educational institutions and smaller organizations
- **Limited attack vector coverage** - Most existing solutions miss critical attack vectors beyond phishing, including vishing (voice phishing), pretexting, and physical security manipulation

According to the FBI's IC3 Report, complaint trends and losses have grown exponentially, especially as the world moves to technology and AI at an unprecedented rate.

## 💡 Our Solution

Unlike existing enterprise solutions, our platform prioritizes **educational value** and **accessibility**, making advanced social engineering awareness training available to academic institutions and organizations with limited cybersecurity budgets.

### What Makes Us Different

- **Comprehensive attack vector coverage** - Phishing, vishing, pretexting, and baiting
- **Real-time educational feedback** - Detailed explanations of social engineering psychology
- **Live simulation environment** - Dummy organizational email system for realistic testing
- **Progress tracking and analytics** - Comprehensive dashboards for both users and administrators
- **Mobile-responsive design** - Accessible across all devices
- **Cost-effective** - Designed for educational institutions with limited budgets

## ✨ Key Features

### For Students/Trainees

1. **Extensive Scenario Library**
   - 15+ realistic social engineering attack scenarios
   - Multiple attack types: phishing, vishing, pretexting, baiting
   - Varying difficulty levels to match user experience

2. **Interactive Training**
   - Realistic email simulations with sophisticated attack techniques
   - Phone call transcripts and interactive responses
   - Immediate feedback with educational explanations

3. **Progress Tracking**
   - Personal performance dashboards
   - Accuracy scores and completion percentages
   - Improvement trends over time
   - Identification of weak areas

4. **Live Attack Simulation**
   - Participate in realistic organizational environment
   - Receive mix of legitimate and malicious emails
   - Real-time testing of knowledge
   - Comprehensive readiness reports

### For Instructors/Administrators

1. **User Management**
   - Create and manage training groups
   - Assign scenarios to specific users
   - Track enrollment and participation

2. **Analytics Dashboard**
   - Monitor individual and group performance
   - Identify training needs
   - Generate comprehensive reports
   - Track improvement metrics

3. **Scenario Customization**
   - Modify scenarios for specific industries
   - Customize content for different job roles
   - Create organization-specific training modules

## 🏗️ System Architecture

### High-Level Components

```
┌─────────────────┐
│   Frontend      │
│   (Vue.js)      │
└────────┬────────┘
         │
         │ HTTPS/TLS 1.3
         │
┌────────▼────────┐
│  Web Server     │
│   (Django)      │
└────────┬────────┘
         │
    ┌────┴────┬──────────┐
    │         │          │
┌───▼──┐  ┌──▼───┐  ┌───▼────┐
│  DB  │  │Scenario│ │ Email  │
│MySQL │  │Engine  │ │Simulator│
└──────┘  └────────┘ └────────┘
```

### Component Details

#### 1. Frontend (SC-1)
- **Technology**: Vue.js Components
- **Purpose**: Display user interfaces and handle user interactions
- **Components**:
  - `AccountComponent.vue` - Account creation interface
  - `LoginComponent.vue` - Login interface
  - `HomeComponent.vue` - Main dashboard
  - `ChatComponent.vue` - Interactive scenario interface
  - `SettingsComponent.vue` - User settings
  - `TranscriptsComponent.vue` - Conversation history
  - `HistoryComponent.vue` - Training history

#### 2. Backend Web Server (SC-2)
- **Technology**: Django + Heroku
- **Purpose**: Process inputs and manage communication between frontend and database
- **Key Functions**:
  - `createAccount()` - Store user profiles
  - `checkLogin()` - Validate user authentication
  - `matchSymptoms()` - (Scenario matching engine)
  - `updateAccount()` - Modify user information
  - `updateRecords()` - Save training progress
  - `passReset()` - Password recovery

#### 3. Database (SC-4)
- **Technology**: MySQL
- **Purpose**: Store user profiles, scenario data, and training progress
- **Data Stored**:
  - User account information
  - Scenario content and metadata
  - User responses and performance metrics
  - Training history and analytics

#### 4. Scenario Engine
- **Purpose**: Manage and deliver training scenarios
- **Features**:
  - Scenario selection and randomization
  - Difficulty adjustment
  - Response evaluation
  - Educational content delivery

#### 5. Email Simulator
- **Purpose**: Create realistic organizational email environment
- **Features**:
  - Dummy email generation
  - Mix of safe and malicious content
  - Real-time phishing simulation
  - Response tracking

## 👥 User Types

### 1. Students/Trainees
Individuals practicing and learning about social engineering attacks through interactive scenarios.

### 2. Instructors/Administrators
Staff members managing training programs, customizing scenarios, and monitoring user progress.

### 3. Organization Members
Employees participating in security awareness training and live attack simulations.

## 📖 User Stories

### US-1: Register Account
**User**: Students/Trainees, Organization Members  
**Description**: Create a user account to access social engineering training scenarios  
**Priority**: 5/5 | **Story Points**: 4/10

**Steps**:
1. Navigate to registration page
2. Enter personal information (name, email, organization/role)
3. Create username and secure password
4. System validates and checks for duplicates
5. Account confirmed and redirected to login

### US-2: Take Social Engineering Scenario
**User**: Students/Trainees, Organization Members  
**Description**: Complete realistic social engineering attack simulation scenarios  
**Priority**: 5/5 | **Story Points**: 6/10

**Steps**:
1. Login to account
2. Select scenario category (phishing, vishing, pretexting, baiting)
3. Choose difficulty level
4. Analyze and respond to scenario
5. Submit response
6. Receive immediate feedback

### US-3: View Feedback and Explanations
**User**: Students/Trainees, Organization Members  
**Description**: Receive immediate feedback with detailed educational explanations  
**Priority**: 5/5 | **Story Points**: 6/10

**Steps**:
1. Complete scenario response
2. View correct/incorrect result
3. Read detailed explanation of attack techniques
4. Review warning signs
5. Learn about psychological manipulation tactics
6. Access additional learning resources

### US-4: Track Personal Progress
**User**: Students/Trainees, Organization Members  
**Description**: View performance scores, completion rates, and improvement trends  
**Priority**: 4/5 | **Story Points**: 7/10

**Steps**:
1. Access personal dashboard
2. View overall accuracy and completion percentage
3. See performance breakdown by scenario type
4. Review progress charts
5. Identify areas needing practice
6. Receive personalized recommendations

### US-5: Participate in Live Attack Simulation
**User**: Organization Members  
**Description**: Experience real-time phishing attacks in simulated organizational environment  
**Priority**: 3/5 | **Story Points**: 10/10

**Steps**:
1. Administrator enrolls user in simulation
2. System creates dummy email environment
3. User receives mix of legitimate and phishing emails
4. User identifies and reports suspicious emails
5. System tracks all responses
6. Immediate alerts for dangerous actions
7. Comprehensive readiness report generated

### US-6: Manage User Accounts
**User**: Instructors/Administrators  
**Description**: Create and manage user accounts for training groups  
**Priority**: 5/5 | **Story Points**: 8/10

### US-7: View Analytics Dashboard
**User**: Instructors/Administrators  
**Description**: Monitor user performance and identify training needs  
**Priority**: 5/5 | **Story Points**: 8/10

### US-8: Customize Scenarios
**User**: Instructors/Administrators  
**Description**: Modify scenarios for specific industries or roles  
**Priority**: 4/5 | **Story Points**: 9/10

## 🛠️ Technology Stack

### Frontend
- **Framework**: Vue.js
- **Styling**: CSS3, Mobile-responsive design
- **Accessibility**: WCAG 2.1 compliance

### Backend
- **Framework**: Django (Python web framework)
- **API**: RESTful architecture
- **Data Format**: JSON
- **Authentication**: OAuth 2.0

### Database
- **System**: MySQL
- **Management**: Relational database management system

### Hosting & Deployment
- **Platform**: Heroku
- **Protocol**: HTTPS/TLS 1.3
- **Availability**: Cloud-based, 24/7 access

### Security
- **Encryption**: TLS 1.3 for all communications
- **Password Storage**: Secure hashing (bcrypt/Argon2)
- **Authentication**: Session-based with OAuth 2.0
- **Compliance**: GDPR data protection standards

### Testing Tools
- **Unit Testing**: Jest
- **Integration Testing**: Cypress
- **Performance Testing**: Apache JMeter
- **Security Testing**: OWASP ZAP
- **Load Testing**: Minimum 20 concurrent users

## 🎯 Project Goals

### Goal 1: Web Application Development
Build a web application that presents users with 15+ realistic social engineering attack scenarios including phishing emails, fake phone calls, and other common attack methods. Users can register accounts, view scenarios, and submit responses through a working web interface.

### Goal 2: Educational Feedback System
Create a feedback system that explains correct and incorrect responses to help users learn from their choices. The system provides explanations of attack techniques and highlights warning signs that users should recognize.

### Goal 3: Progress Tracking & Analytics
Develop user progress tracking and basic analytics showing individual performance scores and tracking improvement over time. The system stores user responses and generates reports showing which scenarios users struggle with most.

### Goal 4: Live Cyber Attack Testing Phase
Create a "cyber attack testing phase" that sends simulated cyber attacks to dummy emails and phone numbers within a dummy organization, simulating how an actual cyber attack would occur in real life situations.

### Goal 5: Cloud Deployment
Deploy the application to a cloud hosting service so it can be accessed online by multiple users simultaneously. The deployed application includes secure user authentication and the ability to handle at least 20 concurrent users.

## 🧪 Testing Strategy

### Comprehensive Testing Approach

Our testing strategy ensures system reliability and functionality through multiple testing layers:

#### 1. Unit Testing
- **Purpose**: Detailed testing of individual system components
- **Timing**: After component implementation, before integration
- **Coverage**: Edge cases, boundary conditions, error handling
- **Example**: Testing login screen with 100 valid and invalid inputs

#### 2. Integration Testing
- **Purpose**: Test functionality when components are connected
- **Timing**: Immediately after connecting components
- **Coverage**: Component interactions, data flow, API calls
- **Example**: Testing Frontend-to-Web Server communication

#### 3. Smoke Testing
- **Purpose**: Identify major bugs before detailed testing
- **Timing**: Initial testing after feature implementation
- **Coverage**: Basic functionality, critical paths
- **Example**: Verifying successful login and scenario access

#### 4. Functional Testing
- **Purpose**: Ensure system meets functional requirements and user stories
- **Timing**: End of each sprint
- **Coverage**: All functional requirements, user story completion
- **Example**: Testing scenario engine with 100 different symptom sets

#### 5. Security Testing
- **Purpose**: Ensure system meets security requirements
- **Timing**: End of each sprint, after functional testing
- **Tools**: OWASP ZAP
- **Coverage**: SQL injection, XSS attacks, authentication bypass
- **Example**: Attempting SQL injection on login text fields

#### 6. Performance Testing
- **Purpose**: Verify system handles required load
- **Tools**: Apache JMeter
- **Coverage**: Concurrent users, response times, scalability
- **Target**: Minimum 20 concurrent users with <1s response time

#### 7. Validation Testing
- **Purpose**: Validate complete user stories work end-to-end
- **Timing**: End of development cycle
- **Coverage**: Complete user workflows, integration of all components

### Test Coverage

- **Total Test Cases**: 33+ detailed test cases
- **Target Pass Rate**: 95%
- **Coverage Areas**:
  - User authentication and account management
  - Scenario delivery and interaction
  - Feedback system functionality
  - Progress tracking and analytics
  - Live simulation environment
  - Administrator functions
  - Security controls
  - Performance benchmarks

## 📊 Non-Functional Requirements

### Performance Requirements (NFR-1 to NFR-3)
- **NFR-1**: System supports at least 20 concurrent users
- **NFR-2**: Response time < 1 second for user requests
- **NFR-3**: Database queries complete in < 500ms

### Security Requirements (NFR-4 to NFR-8)
- **NFR-4**: All passwords encrypted using bcrypt/Argon2
- **NFR-5**: HTTPS/TLS 1.3 for all communications
- **NFR-6**: OAuth 2.0 authentication
- **NFR-7**: SQL injection protection on all inputs
- **NFR-8**: GDPR compliance for user data

### Reliability Requirements (NFR-9 to NFR-11)
- **NFR-9**: 99% uptime for deployed application
- **NFR-10**: User data backed up regularly
- **NFR-11**: Graceful error handling and recovery

### Robustness Requirements (NFR-12 to NFR-14)
- **NFR-12**: System continues operating during errors
- **NFR-13**: Clear error messages for users
- **NFR-14**: Validation on all user inputs

### Database Requirements (NFR-15 to NFR-17)
- **NFR-15**: Secure storage of user credentials
- **NFR-16**: Encrypted sensitive data
- **NFR-17**: Database accessible only via API

### Engineering Requirements (NFR-18 to NFR-20)
- **NFR-18**: Mobile-responsive design
- **NFR-19**: WCAG 2.1 accessibility standards
- **NFR-20**: Cross-browser compatibility

## 👨‍💻 Development Team

### Core Team
- **Bader** - Lead Developer
- **Partner** - Developer
- **Project Advisor** - Academic Guidance

### Team Availability
- Developers: 10 hours/week each
- Project Advisor: 1 hour/week

### Budget
- Free/Open Source technologies
- Cloud hosting: Heroku Free Tier
- Total budget: Academic project (minimal costs)

## 📅 Project Timeline

### Development Schedule: 6 Sprints (Two-Semester Timeline)

#### Sprint 1-2: Foundation
- User authentication system
- Basic frontend interface
- Database schema design
- Initial scenario engine

#### Sprint 3-4: Core Features
- Scenario library implementation
- Feedback system development
- Progress tracking functionality
- Basic analytics dashboard

#### Sprint 5-6: Advanced Features & Testing
- Live simulation environment
- Administrator dashboard
- Comprehensive testing
- Cloud deployment
- Final documentation

### Testing Schedule
- Unit tests: During each sprint
- Integration tests: At sprint boundaries
- Functional tests: End of each sprint
- Security tests: End of each sprint
- Performance tests: Sprint 5-6
- Validation tests: Final sprint

## 📚 References

1. Federal Bureau of Investigation. "Internet Crime Report 2024: Social Engineering and Business Email Compromise." IC3.gov. Available at: https://www.ic3.gov/AnnualReport/Reports/2024_IC3Report.pdf

## 🔐 Security Considerations

### Ethical Boundaries
- **Educational Purpose Only**: All simulations designed for training, not malicious use
- **Controlled Environment**: Dummy organizations and email systems
- **Privacy Protection**: GDPR compliance for all user data
- **No Real Attacks**: System cannot be used to launch actual attacks
- **Academic Constraints**: Ethical guidelines for educational software

### Data Protection
- Encrypted storage of sensitive information
- Secure password hashing
- Protected database access
- User consent and data rights
- Regular security audits

## 📈 Success Metrics

1. **Testing Coverage**: 95% pass rate on 33+ test cases
2. **User Engagement**: Completion of training scenarios
3. **Performance**: Support for 20+ concurrent users
4. **Learning Effectiveness**: Measurable improvement in user scores
5. **System Reliability**: 99% uptime
6. **Educational Impact**: Knowledge transfer verification

## 🚀 Future Enhancements

- Expanded scenario library (100+ scenarios)
- Multi-language support
- Advanced analytics and AI-driven recommendations
- Integration with existing LMS platforms
- Gamification elements (badges, leaderboards)
- Virtual reality training modules
- Real-time competitive scenarios
- Industry-specific certification programs

## 📄 License

This project is an academic software engineering project. All rights reserved for educational purposes.

## 🤝 Contributing

This is an academic project. For questions or collaboration opportunities, please contact the development team.

## 📞 Support

For technical support or questions about the project, please contact:
- Project Team: [Contact Information]
- Academic Advisor: Dr. Krishnan Pillaipakkamnatt

---

**Built with 💙 for cybersecurity education**

*Making the weakest link in cybersecurity the strongest defense*
