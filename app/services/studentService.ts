import { apiFetch } from "@/lib/api";

export const studentService = {
  async login(email: string, password: string) {
    return apiFetch('/api/student/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  },

  async getDashboardData() {
    return apiFetch('/api/student/dashboard', {
      method: 'GET',
    });
  },

  async getProfile() {
    return apiFetch('/api/student/profile');
  },

  async updateProfile(data: any) {
    return apiFetch('/api/student/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async updateProfilePhoto(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch('/api/student/profile/photo', {
      method: 'POST',
      body: formData,
    });
  },

  async logout() {
    return apiFetch('/api/student/logout', {
      method: 'POST',
    });
  },

  async getCurriculum() {
    return apiFetch('/api/student/learning-space');
  },

  async completeLesson(lessonId: number) {
    return apiFetch('/api/student/learning-space', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId }),
    });
  },

  async getProjects() {
    return apiFetch('/api/student/projects');
  },

  async submitProject(data: { title: string; description: string; projectUrl: string }) {
    return apiFetch('/api/student/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async getAssignments() {
    return apiFetch('/api/student/assignments');
  },

  async getSubmissions() {
    return apiFetch('/api/student/submissions');
  },

  async submitWork(data: any) {
    return apiFetch('/api/student/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }
};
