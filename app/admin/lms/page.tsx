"use client";

import { useState, useCallback, useMemo } from "react";
import { adminService } from "@/services/adminService";
import {
  Plus, ChevronRight, BookOpen, Layers, Video,
  FileText, Edit3, Trash2, X, Eye, EyeOff, Loader2,
  Upload, Award, AlertCircle, Save, Image as ImageIcon,
  CheckCircle2, RefreshCw
} from "lucide-react";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { useStableFetch } from "@/hooks/useStableFetch";

export default function LMSManagementPage() {
  const { data: coursesData, loading: coursesLoading, execute: fetchCourses } = useStableFetch(adminService.getCourses, {
    cacheKey: 'admin-courses'
  });

  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  const fetchModulesFn = useCallback(() =>
    selectedCourse ? adminService.getModules(selectedCourse.id) : Promise.resolve([]),
  [selectedCourse]);

  const fetchLessonsFn = useCallback(() =>
    selectedModule ? adminService.getLessons(selectedModule.id) : Promise.resolve([]),
  [selectedModule]);

  const fetchAssignmentsFn = useCallback(() =>
    selectedLesson ? adminService.getAssignments(selectedLesson.id) : Promise.resolve([]),
  [selectedLesson]);

  const { data: modulesData, loading: modulesLoading, execute: refreshModules } = useStableFetch(fetchModulesFn, {
    immediate: !!selectedCourse,
    cacheKey: selectedCourse ? `modules-${selectedCourse.id}` : undefined
  });

  const { data: lessonsData, loading: lessonsLoading, execute: refreshLessons } = useStableFetch(fetchLessonsFn, {
    immediate: !!selectedModule,
    cacheKey: selectedModule ? `lessons-${selectedModule.id}` : undefined
  });

  const { data: assignmentsData, loading: assignmentsLoading, execute: refreshAssignments } = useStableFetch(fetchAssignmentsFn, {
    immediate: !!selectedLesson,
    cacheKey: selectedLesson ? `assignments-${selectedLesson.id}` : undefined
  });

  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [isEditingModule, setIsEditingModule] = useState(false);
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [isEditingAssignment, setIsEditingAssignment] = useState(false);

  const [courseForm, setCourseForm] = useState({ title: "", description: "", thumbnail_url: "", is_published: true });
  const [moduleForm, setModuleForm] = useState({ title: "", description: "", order_index: 1, is_published: true });
  const [lessonForm, setLessonForm] = useState<any>({
    title: "", content: "", video_url: "", pdf_url: "",
    order_index: 1, duration_minutes: 10, is_published: true
  });
  const [assignmentForm, setAssignmentForm] = useState<any>({
    title: "", description: "", due_date: "", max_score: 100
  });

  const courses = useMemo(() => Array.isArray(coursesData) ? coursesData : [], [coursesData]);
  const modules = useMemo(() => Array.isArray(modulesData) ? modulesData : [], [modulesData]);
  const lessons = useMemo(() => Array.isArray(lessonsData) ? lessonsData : [], [lessonsData]);
  const assignments = useMemo(() => Array.isArray(assignmentsData) ? assignmentsData : [], [assignmentsData]);

  const handleSaveCourse = async () => {
    const tid = notify.loading("Syncing path records...");
    try {
      if (isEditingCourse && selectedCourse) {
        await adminService.updateCourse({ ...courseForm, id: selectedCourse.id });
      } else {
        await adminService.createCourse(courseForm);
      }
      notify.success("Authorized Sync Complete");
      setIsEditingCourse(false);
      fetchCourses(true);
    } catch (err) {
      notify.error("Protocol Error");
    } finally {
      notify.dismiss(tid);
    }
  };

  const handleSaveModule = async () => {
    if (!selectedCourse) return;
    const tid = notify.loading("Architecting syllabus block...");
    try {
      if (isEditingModule && selectedModule) {
        await adminService.updateModule({ ...moduleForm, id: selectedModule.id });
      } else {
        await adminService.createModule({ ...moduleForm, course_id: selectedCourse.id });
      }
      notify.success("Module Integrated");
      setIsEditingModule(false);
      refreshModules(true);
    } catch (err) {
      notify.error("Architecture Error");
    } finally {
      notify.dismiss(tid);
    }
  };

  const handleSaveLesson = async () => {
    if (!selectedModule) return;
    const tid = notify.loading("Provisioning academic content...");
    try {
      if (isEditingLesson && lessonForm.id) {
        await adminService.updateLesson(lessonForm);
      } else {
        await adminService.createLesson({ ...lessonForm, module_id: selectedModule.id });
      }
      notify.success("Content Active");
      setIsEditingLesson(false);
      refreshLessons(true);
    } catch (err) {
      notify.error("Deployment Error");
    } finally {
      notify.dismiss(tid);
    }
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-tight">Curriculum</h1>
          <p className="text-slate-500 font-medium text-xs mt-1">Design academic paths and synchronize learning modules.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => fetchCourses(true)} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
             <RefreshCw size={20} className={coursesLoading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => {
              setCourseForm({ title: "", description: "", thumbnail_url: "", is_published: true });
              setIsEditingCourse(true);
              setSelectedCourse(null);
            }}
            className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95"
          >
            New Path
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-50 bg-slate-50/30">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authorized Paths</h3>
            </div>
            <div className="divide-y divide-slate-50 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {coursesLoading && courses.length === 0 ? <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></div> : courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => { setSelectedCourse(course); setSelectedModule(null); setSelectedLesson(null); }}
                  className={cn(
                    "w-full text-left p-6 transition-all group flex items-center justify-between",
                    selectedCourse?.id === course.id ? "bg-slate-50" : "hover:bg-slate-50/50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm",
                      selectedCourse?.id === course.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                    )}>
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <p className={cn("text-xs font-bold uppercase tracking-tight", selectedCourse?.id === course.id ? "text-slate-900" : "text-slate-500")}>{course.title}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{course.is_published ? "Status: Operational" : "Status: Draft"}</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className={cn("text-slate-300 transition-transform", selectedCourse?.id === course.id && "translate-x-1")} />
                </button>
              ))}
              {courses.length === 0 && !coursesLoading && <p className="p-10 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest italic">Core nodes empty.</p>}
            </div>
          </div>
        </aside>

        <main className="lg:col-span-9">
          {selectedCourse && !isEditingCourse ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8">
                  <button
                    onClick={() => { setCourseForm({ ...selectedCourse }); setIsEditingCourse(true); }}
                    className="p-3 bg-slate-50 hover:bg-slate-900 text-slate-400 hover:text-white rounded-2xl transition-all border border-slate-100"
                  >
                    <Edit3 size={18} />
                  </button>
                </div>
                <div className="flex flex-col md:flex-row gap-10 items-start">
                  {selectedCourse.thumbnail_url ? (
                    <img src={selectedCourse.thumbnail_url} className="w-40 h-40 rounded-3xl object-cover border border-slate-100 shadow-md" alt="" />
                  ) : (
                    <div className="w-40 h-40 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200 shadow-inner">
                      <BookOpen size={64} />
                    </div>
                  )}
                  <div className="space-y-4 flex-1">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">{selectedCourse.title}</h2>
                      <div className="mt-4 flex items-center gap-3">
                         <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm", selectedCourse.is_published ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100")}>{selectedCourse.is_published ? 'Operational' : 'Restricted'}</span>
                         <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Node ID: #{selectedCourse.id}</span>
                      </div>
                    </div>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-2xl">{selectedCourse.description || "Mission brief awaiting synchronization."}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                <div className="md:col-span-5 space-y-6">
                  <div className="flex justify-between items-center px-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syllabus Blocks</h3>
                    <button onClick={() => { setModuleForm({ title: "", description: "", order_index: modules.length + 1, is_published: true }); setIsEditingModule(true); setSelectedModule(null); }} className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">Add Block</button>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-[2.25rem] overflow-hidden shadow-sm">
                    <div className="divide-y divide-slate-50">
                      {modulesLoading ? <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></div> : modules.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => { setSelectedModule(m); setSelectedLesson(null); }}
                          className={cn(
                            "w-full text-left p-6 transition-all group flex items-center justify-between",
                            selectedModule?.id === m.id ? "bg-slate-50" : "hover:bg-slate-50/50"
                          )}
                        >
                          <div className="flex items-center gap-4">
                             <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black", selectedModule?.id === m.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400")}>{m.order_index}</div>
                             <span className={cn("text-[11px] font-black uppercase tracking-tight", selectedModule?.id === m.id ? "text-slate-900" : "text-slate-500")}>{m.title}</span>
                          </div>
                          <ChevronRight size={12} className={cn("text-slate-300 transition-transform", selectedModule?.id === m.id && "translate-x-1")} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-7 space-y-6">
                  {selectedModule ? (
                    <div className="animate-in fade-in duration-300 space-y-6">
                      <div className="flex justify-between items-center px-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Provisioned Lessons</h3>
                        <button onClick={() => { setLessonForm({ title: "", content: "", video_url: "", pdf_url: "", order_index: lessons.length + 1, duration_minutes: 10, is_published: true }); setIsEditingLesson(true); }} className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">Provision Lesson</button>
                      </div>
                      <div className="space-y-3">
                        {lessonsLoading ? <Skeleton className="h-40 w-full rounded-2xl" /> : lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            onClick={() => setSelectedLesson(lesson)}
                            className={cn(
                              "bg-white border rounded-[1.75rem] p-6 flex items-center justify-between group transition-all shadow-sm cursor-pointer",
                              selectedLesson?.id === lesson.id ? "border-blue-600 ring-4 ring-blue-50 shadow-xl" : "border-slate-200 hover:border-slate-300"
                            )}
                          >
                             <div className="flex items-center gap-5">
                               <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shadow-inner group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                 {lesson.video_url ? <Video size={20} /> : <FileText size={20} />}
                               </div>
                               <div>
                                 <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-tight">{lesson.title}</h4>
                                 <div className="flex items-center gap-3 mt-1.5">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1"><Clock size={10} /> {lesson.duration_minutes}M</span>
                                    <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                    <span className={cn("text-[9px] font-black uppercase tracking-widest", lesson.is_published ? "text-emerald-500" : "text-slate-300")}>{lesson.is_published ? "Sync Active" : "Draft"}</span>
                                 </div>
                               </div>
                             </div>
                             <button onClick={(e) => { e.stopPropagation(); setLessonForm({...lesson}); setIsEditingLesson(true); }} className="p-2.5 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Edit3 size={16} /></button>
                          </div>
                        ))}
                        {lessons.length === 0 && !lessonsLoading && (
                          <div className="bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[2rem] py-20 text-center">
                             <FileText size={40} className="mx-auto text-slate-200 mb-4" />
                             <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">Node lessons empty.</p>
                          </div>
                        )}
                      </div>

                      {selectedLesson && (
                        <div className="mt-14 space-y-6 animate-in slide-in-from-top-6 duration-500">
                           <div className="flex justify-between items-center px-4">
                              <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600">Lab Assignments: {selectedLesson.title}</h3>
                              <button onClick={() => { setAssignmentForm({ title: "", description: "", due_date: "", max_score: 100 }); setIsEditingAssignment(true); }} className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">Create Lab</button>
                           </div>
                           <div className="space-y-3">
                              {assignmentsLoading ? <Skeleton className="h-20 w-full" /> : assignments.map((assignment: any) => (
                                 <div key={assignment.id} className="bg-[#0F172A] rounded-[2rem] p-8 flex justify-between items-center group shadow-2xl shadow-blue-900/10">
                                    <div className="flex items-center gap-6">
                                       <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-blue-400 shadow-inner">
                                          <Award size={24} />
                                       </div>
                                       <div>
                                          <h5 className="text-[13px] font-black text-white uppercase tracking-tight">{assignment.title}</h5>
                                          <div className="flex items-center gap-4 mt-2">
                                             <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Weight: {assignment.max_score} XP</p>
                                             <div className="w-1 h-1 bg-slate-700 rounded-full" />
                                             <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Target Node: #00{assignment.id}</p>
                                          </div>
                                       </div>
                                    </div>
                                    <button onClick={() => { setAssignmentForm({...assignment}); setIsEditingAssignment(true); }} className="p-3 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all"><Edit3 size={18} /></button>
                                 </div>
                              ))}
                           </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white border-2 border-slate-100 border-dashed rounded-[3rem] py-32 text-center shadow-sm">
                      <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-100 mb-6 shadow-inner"><Layers size={40} /></div>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] italic">Select syllabus block to proceed.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : isEditingCourse ? (
             <CourseForm form={courseForm} setForm={setCourseForm} onSave={handleSaveCourse} onCancel={() => setIsEditingCourse(false)} isEdit={!!selectedCourse} />
          ) : (
            <div className="bg-white border-2 border-slate-100 border-dashed rounded-[3rem] py-48 text-center space-y-8 shadow-sm">
              <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-slate-100 shadow-inner">
                <BookOpen size={56} />
              </div>
              <div className="space-y-2">
                 <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Academic Architecture</h3>
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] max-w-sm mx-auto leading-relaxed">Select curriculum path to initiate node synchronization.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function CourseForm({ form, setForm, onSave, onCancel, isEdit }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-[3rem] p-10 md:p-14 shadow-sm space-y-12 animate-in slide-in-from-bottom-8 duration-700">
       <div className="flex justify-between items-center border-b border-slate-50 pb-8">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{isEdit ? "Update Path" : "Init Path"}</h2>
          <button onClick={onCancel} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900"><X size={24} /></button>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Path Identifier</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold focus:border-blue-500 outline-none transition-all shadow-inner" placeholder="e.g. CORE-ENGINEERING-2026" />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Mission Brief</label>
                <textarea rows={6} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold focus:border-blue-500 outline-none transition-all resize-none shadow-inner" placeholder="Course objectives..." />
             </div>
          </div>
          <div className="space-y-8">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Visual Branding</label>
                <div className="flex gap-6 items-center">
                   <div className="w-24 h-24 rounded-3xl bg-slate-50 border-2 border-slate-50 overflow-hidden flex items-center justify-center shadow-inner">{form.thumbnail_url ? <img src={form.thumbnail_url} className="w-full h-full object-cover" /> : <ImageIcon size={32} className="text-slate-200" />}</div>
                   <div className="flex-1 space-y-3">
                      <input value={form.thumbnail_url} onChange={e => setForm({...form, thumbnail_url: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl px-4 py-2.5 text-xs font-bold shadow-inner" placeholder="Asset URL" />
                      <p className="text-[9px] text-slate-400 font-bold uppercase italic px-2">Ensure high-res vector or JPEG.</p>
                   </div>
                </div>
             </div>
             <div className="p-8 bg-slate-50 rounded-3xl border border-slate-50 flex items-center justify-between shadow-inner">
                <div><p className="text-sm font-black text-slate-900 uppercase">Operational Status</p><p className="text-[10px] text-slate-400 font-bold tracking-tight">Toggle portal visibility for students.</p></div>
                <button onClick={() => setForm({...form, is_published: !form.is_published})} className={cn("w-14 h-7 rounded-full transition-all relative", form.is_published ? "bg-emerald-500" : "bg-slate-300 shadow-inner")}><div className={cn("absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md", form.is_published ? "right-1" : "left-1")} /></button>
             </div>
          </div>
       </div>
       <div className="flex justify-end gap-6 pt-10 border-t border-slate-50">
          <button onClick={onCancel} className="px-8 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest">Abort</button>
          <button onClick={onSave} className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-blue-900/10 hover:bg-blue-600 transition-all active:scale-95"><Save size={18} className="inline mr-2" /> Commit Logic</button>
       </div>
    </div>
  );
}
