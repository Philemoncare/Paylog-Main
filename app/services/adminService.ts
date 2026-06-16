import { apiFetch } from "@/lib/api";

export const adminService = {
  async getDashboardData() {
    return apiFetch('/api/admin/data');
  },

  async getRegistrations() {
    return apiFetch('/api/admin/registrations');
  },

  async getPayments() {
    return apiFetch('/api/admin/payments');
  },

  async updatePaymentStatus(id: string, status: string) {
    return apiFetch('/api/admin/payment-status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
  },

  async deleteRegistration(id: number) {
    return apiFetch(`/api/admin/registrations?id=${id}`, {
      method: 'DELETE',
    });
  },

  async resendWelcomeEmail(registrationId: number) {
    return apiFetch('/api/admin/resend-welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registrationId }),
    });
  },

  async getTimetable() {
    return apiFetch('/api/admin/timetable');
  },

  async addTimetableEntry(data: any) {
    return apiFetch('/api/admin/timetable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async updateTimetableEntry(data: any) {
    return apiFetch('/api/admin/timetable', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async deleteTimetableEntry(id: number) {
    return apiFetch(`/api/admin/timetable?id=${id}`, {
      method: 'DELETE',
    });
  },

  async markAttendance(data: { registrationId: number, timetableId: number }) {
    return apiFetch('/api/admin/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async getAttendance(registrationId?: number) {
    const url = registrationId ? `/api/admin/attendance?registrationId=${registrationId}` : '/api/admin/attendance';
    return apiFetch(url);
  },

  async removeAttendance(id: number) {
    return apiFetch(`/api/admin/attendance?id=${id}`, {
      method: 'DELETE',
    });
  },

  async getSetting(key: string) {
    return apiFetch(`/api/admin/settings?key=${key}`);
  },

  async updateSetting(key: string, value: string) {
    return apiFetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
  },

  // LMS METHODS
  async getCourses() {
    return apiFetch('/api/admin/lms/courses');
  },

  async createCourse(data: any) {
    return apiFetch('/api/admin/lms/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async updateCourse(data: any) {
    return apiFetch('/api/admin/lms/courses', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async deleteCourse(id: number) {
    return apiFetch(`/api/admin/lms/courses?id=${id}`, {
      method: 'DELETE',
    });
  },

  async getModules(courseId: number) {
    return apiFetch(`/api/admin/lms/modules?courseId=${courseId}`);
  },

  async createModule(data: any) {
    return apiFetch('/api/admin/lms/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async updateModule(data: any) {
    return apiFetch('/api/admin/lms/modules', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async deleteModule(id: number) {
    return apiFetch(`/api/admin/lms/modules?id=${id}`, {
      method: 'DELETE',
    });
  },

  async getLessons(moduleId: number) {
    return apiFetch(`/api/admin/lms/lessons?moduleId=${moduleId}`);
  },

  async createLesson(data: any) {
    return apiFetch('/api/admin/lms/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async updateLesson(data: any) {
    return apiFetch('/api/admin/lms/lessons', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async deleteLesson(id: number) {
    return apiFetch(`/api/admin/lms/lessons?id=${id}`, {
      method: 'DELETE',
    });
  },

  async getAssignments(lessonId: number) {
    return apiFetch(`/api/admin/lms/assignments?lessonId=${lessonId}`);
  },

  async createAssignment(data: any) {
    return apiFetch('/api/admin/lms/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async updateAssignment(data: any) {
    return apiFetch('/api/admin/lms/assignments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async deleteAssignment(id: number) {
    return apiFetch(`/api/admin/lms/assignments?id=${id}`, {
      method: 'DELETE',
    });
  },

  async getSubmissions(filters: { status?: string, type?: string } = {}) {
    const params = new URLSearchParams(filters as any);
    return apiFetch(`/api/admin/submissions?${params.toString()}`);
  },

  async updateSubmission(data: { id: number, status: string, score?: number, feedback?: string }) {
    return apiFetch('/api/admin/submissions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async getAnalytics() {
    return apiFetch('/api/admin/analytics');
  },

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });
  }
};
