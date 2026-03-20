// src/pages/Enrollment.tsx
import React, { useEffect, useState } from "react";
import { Enrollment, Student, Subject, Section } from "../type";
import {
  getEnrollments,
  getStudents,
  getSubjects,
  getSections,
  createEnrollment,
  dropEnrollment,
  updateEnrollment,
  deleteEnrollment,
  bulkEnroll,
} from "../api";
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Loader } from "lucide-react";

const EnrollmentPage: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    student_id: "",
    subject_id: "",
    section_id: "",
  });

  const [bulkData, setBulkData] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [enrollmentsData, studentsData, subjectsData, sectionsData] =
        await Promise.all([
          getEnrollments(),
          getStudents(),
          getSubjects(),
          getSections(),
        ]);
      setEnrollments(enrollmentsData);
      setStudents(studentsData);
      setSubjects(subjectsData);
      setSections(sectionsData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load enrollment data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEnrollment = async () => {
    if (!formData.student_id || !formData.subject_id) {
      setError("Please select a student and subject");
      return;
    }

    try {
      const newEnrollment = await createEnrollment({
        student_id: Number(formData.student_id),
        subject_id: Number(formData.subject_id),
        ...(formData.section_id && { section_id: Number(formData.section_id) }),
      });

      setEnrollments([...enrollments, newEnrollment]);
      setFormData({ student_id: "", subject_id: "", section_id: "" });
      setShowForm(false);
      setSuccessMessage("Enrollment created successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Failed to create enrollment"
      );
    }
  };

  const handleBulkEnroll = async () => {
    if (!bulkData.trim()) {
      setError("Please enter enrollment data");
      return;
    }

    try {
      const lines = bulkData
        .trim()
        .split("\n")
        .filter((line) => line.trim());
      const enrollmentList = lines.map((line) => {
        const [student_id, subject_id, section_id] = line.split(",").map((s) => s.trim());
        return {
          student_id: Number(student_id),
          subject_id: Number(subject_id),
          ...(section_id && { section_id: Number(section_id) }),
        };
      });

      const result = await bulkEnroll(enrollmentList);
      await fetchData();
      setBulkData("");
      setShowBulkForm(false);
      setSuccessMessage(
        `Bulk enrollment completed: ${result.successful} successful, ${result.failed} failed`
      );
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to bulk enroll students");
    }
  };

  const handleStatusChange = async (enrollmentId: number, newStatus: string) => {
    try {
      if (newStatus === "dropped") {
        await dropEnrollment(enrollmentId);
      } else {
        await updateEnrollment(enrollmentId, { status: newStatus });
      }
      await fetchData();
      setSuccessMessage("Enrollment status updated");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update enrollment");
    }
  };

  const handleDelete = async (enrollmentId: number) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm("Are you sure you want to delete this enrollment?"))
      return;

    try {
      await deleteEnrollment(enrollmentId);
      setEnrollments(enrollments.filter((e) => e.id !== enrollmentId));
      setSuccessMessage("Enrollment deleted");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to delete enrollment");
    }
  };

  const getStudentInfo = (enrollmentId: number) => {
    const enrollment = enrollments.find((e) => e.id === enrollmentId);
    if (!enrollment) return null;
    const studentId = typeof enrollment.student === 'object' ? enrollment.student.id : enrollment.student;
    const student = students.find((s) => s.id === studentId);
    return student;
  };

  const getSubjectInfo = (subjectId: number | Subject) => {
    const id = typeof subjectId === 'object' ? subjectId.id : subjectId;
    return subjects.find((s) => s.id === id);
  };

  const getSectionInfo = (sectionId: number) => {
    return sections.find((s) => s.id === sectionId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "enrolled":
        return "bg-green-100 text-green-800 border border-green-300";
      case "dropped":
        return "bg-red-100 text-red-800 border border-red-300";
      case "completed":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "enrolled":
        return <CheckCircle2 className="w-4 h-4" />;
      case "dropped":
        return <AlertCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900"> Enrollments</h1>
            <p className="text-gray-500 mt-2">Manage student course enrollments</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowBulkForm(!showBulkForm)}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:shadow-lg transition font-medium"
            >
              <Plus className="w-5 h-5" /> Bulk Enroll
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:shadow-lg transition font-medium"
            >
              <Plus className="w-5 h-5" /> New Enrollment
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        {/* New Enrollment Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Create New Enrollment
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student
                </label>
                <select
                  value={formData.student_id}
                  onChange={(e) =>
                    setFormData({ ...formData, student_id: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.student_id} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  value={formData.subject_id}
                  onChange={(e) =>
                    setFormData({ ...formData, subject_id: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subj) => (
                    <option key={subj.id} value={subj.id}>
                      {subj.code} - {subj.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section (Optional - Auto-assign if not selected)
                </label>
                <select
                  value={formData.section_id}
                  onChange={(e) =>
                    setFormData({ ...formData, section_id: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Auto-assign Section</option>
                  {sections.map((sec) => {
                    const subj = getSubjectInfo(sec.subject);
                    return (
                      <option key={sec.id} value={sec.id}>
                        {subj?.code} - {sec.name} ({sec.schedule})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCreateEnrollment}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Create Enrollment
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setFormData({ student_id: "", subject_id: "", section_id: "" });
                  setError(null);
                }}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Bulk Enrollment Form */}
        {showBulkForm && (
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Bulk Enrollment
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Enter data as CSV: student_id, subject_id, [section_id] (one per line)
            </p>
            <textarea
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              placeholder="1,1,1&#10;2,2,2&#10;3,3,3"
              className="w-full h-40 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleBulkEnroll}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                Bulk Enroll
              </button>
              <button
                onClick={() => {
                  setShowBulkForm(false);
                  setBulkData("");
                  setError(null);
                }}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Enrollments Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              All Enrollments ({enrollments.length})
            </h3>
          </div>

          {enrollments.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">No enrollments yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Create First Enrollment
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-100 to-slate-50">
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Student ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Section
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Enrolled Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {enrollments.map((enrollment) => {
                    const studentId = typeof enrollment.student === 'object' ? enrollment.student.id : enrollment.student;
                    const student = students.find((s) => s.id === studentId);
                    const subject = subjects.find(
                      (s) => s.id === (typeof enrollment.subject === 'object' ? enrollment.subject.id : enrollment.subject)
                    );
                    const section = enrollment.section
                      ? typeof enrollment.section === "object"
                        ? enrollment.section
                        : sections.find((s) => s.id === enrollment.section)
                      : null;

                    return (
                      <tr
                        key={enrollment.id}
                        className="hover:bg-slate-50 transition"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {student?.student_id || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {student?.name || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <div>
                            <div className="font-medium">
                              {subject?.code || "-"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {subject?.title}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <div>
                            <div className="font-medium">
                              {section?.name || "-"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {section?.schedule}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <select
                            value={enrollment.status}
                            onChange={(e) =>
                              handleStatusChange(enrollment.id, e.target.value)
                            }
                            className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${getStatusColor(
                              enrollment.status
                            )}`}
                          >
                            <option value="enrolled">Enrolled</option>
                            <option value="dropped">Dropped</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(enrollment.enrolled_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleDelete(enrollment.id)}
                            className="text-red-600 hover:text-red-800 transition inline-flex items-center gap-2"
                            title="Delete enrollment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
            <div className="text-3xl font-bold">
              {enrollments.filter((e) => e.status === "enrolled").length}
            </div>
            <div className="text-sm opacity-90">Active Enrollments</div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-md p-6 text-white">
            <div className="text-3xl font-bold">
              {enrollments.filter((e) => e.status === "dropped").length}
            </div>
            <div className="text-sm opacity-90">Dropped</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
            <div className="text-3xl font-bold">
              {enrollments.filter((e) => e.status === "completed").length}
            </div>
            <div className="text-sm opacity-90">Completed</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md p-6 text-white">
            <div className="text-3xl font-bold">{students.length}</div>
            <div className="text-sm opacity-90">Total Students</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentPage;