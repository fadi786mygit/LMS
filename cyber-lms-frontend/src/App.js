import {  Routes, Route, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; // for icons
import '@fortawesome/fontawesome-free/css/all.min.css';
import Login from './Pages/Login';
import Register from './Pages/Register';
import ResetPassword from './Pages/ResetPassword';
import SetPassword from './Pages/SetPassword';
import VerifyCode from './Pages/VerifyCode';
import ResetCode from './Pages/Reset-code';
import AdminDashboard from './admin/AdminDashboard';
import UserManagement from './admin/UserManagement';
import InstructorManagement from './admin/InstructorManagement';
import CourseManagement from './admin/CourseManagement';
import ToolManagement from './admin/ToolManagement';
import UpdateUser from './admin/UpdateUser';
import ViewUser from './admin/ViewUser';
import ViewInstructorr from './admin/ViewInstructorr';
import UpdateInstructor from './admin/UpdateInstructor';
import ViewCourse from './admin/ViewCourse';
import UpdateCourse from './admin/UpdateCourse';
import CategoryDetails from './admin/CategoryDetails';
import UpdateCategory from './admin/UpdateCategory';
import AddUser from './admin/AddUser';
import AddInstructor from './admin/AddInstructor';
import AddCategory from './admin/AddCategory';
import CreateCourse from './admin/CreateCourse';
import AdminSettings from './admin/AdminSettings';
import Dashboard from './user/Dashboard';
import UserSettings from './user/UserSettings';
import ForgotPassword from './Pages/ForgotPassword';
import Home from './Pages/Home';
import CyberSecurityCourses from './Pages/CyberSecurityCourses';
import CloudComputingCourses from './Pages/CloudComputingCourses';
import DataScienceCourses from './Pages/DataScienceCourses';
import CourseDescription from './Pages/CourseDescription';
import UserCourses from './user/UserCourses';
import InstructorDashboard from './instructor/InstructorDashboard';
import InstructorCreateCourse from './instructor/InstructorCreateCourse';
import InstructorCourses from './instructor/InstructorCourses';
import EditCourse from "./instructor/EditCourse";
import InstructorUploadVideos from './instructor/InstructorUploadVideos';
import Quizzes from './instructor/Quizzes';
import AddQuiz from './instructor/AddQuiz';
import StudentCourseQuizzes from './user/StudentCourseQuizzes';
import AttemptQuiz from './user/AttemptQuiz';
import InstructorSettings from './instructor/InstructorSettings'
import BecomeInstructor from './Pages/BecomeInstructor';
import InstructorRequest from './admin/InstructorRequest';
import Certificates from './user/Certificates';
import InstructorCertificates from './instructor/InstructorCertificates';
import InstructorCourseCertificates from './Pages/InstructorCoursesCertificates';
import VerifyCertificate from './user/VerifyCertificate';
import Payment from './admin/Payments';
import ReportsAnalytics from './admin/ReportsAnalytics';
import Plans from './user/Plans';
import Tutorials from './user/Tutorials';
import Labs from './user/Labs';
import Community from './user/Community';
import StudentCourseVideo from './user/StudentCourseVideo';
import UpdateQuiz from './instructor/UpdateQuiz';
import AddContent from './instructor/AddContent';
import { useEffect } from 'react';
import { motion } from "motion/react";
import '@fortawesome/fontawesome-free/css/all.min.css';



function App() {
  
 const navigate = useNavigate();
  useEffect(() => {
    const lastLogin = localStorage.getItem("lastLogin");
    if (lastLogin) {
      const diff = (Date.now() - parseInt(lastLogin)) / 1000 / 60; // minutes
      if (diff > 10) {
        localStorage.removeItem("token");
        localStorage.removeItem("lastLogin");
        navigate("/login"); // redirect to login
      }
    }
  }, [navigate]);

 

  return (
    <>
     
        <Routes>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/set-password" element={<SetPassword />} />
          <Route path="/verify-code" element={<VerifyCode />} />
          <Route path="/reset-code" element={<ResetCode />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/admin/dashboard' element={<AdminDashboard />} />
          <Route path="/admin/user-management" element={<UserManagement />} />
          <Route path="/admin/instructors-management" element={<InstructorManagement />} />
          <Route path="/admin/courses" element={<CourseManagement />} />
          <Route path="/admin/tools" element={<ToolManagement />} />
          <Route path="/admin/update-user/:id" element={<UpdateUser />} />
          <Route path="/admin/view-user/:id" element={<ViewUser />} />
          <Route path="/admin/view-instructor/:id" element={<ViewInstructorr />} />
          <Route path="/admin/update-instructor/:id" element={<UpdateInstructor />} />
          <Route path="/admin/view-course/:id" element={<ViewCourse />} />
          <Route path="/admin/update-course/:id" element={<UpdateCourse />} />
          <Route path="/admin/view-tools/:id" element={<CategoryDetails />} />
          <Route path="/admin/edit-tools/:id" element={<UpdateCategory />} />
          <Route path='/admin/add-user' element={<AddUser />} />
          <Route path='/admin/add-instructor' element={<AddInstructor />} />
          <Route path='/admin/add-tools' element={<AddCategory />} />
          <Route path='/admin/add-course' element={<CreateCourse />} />
          <Route path='/admin/admin-settings' element={<AdminSettings />} />
          <Route path="/admin/payment" element={<Payment />} />
          <Route path="/user/dashboard" element={<Dashboard />} />
          <Route path="user/user-setting" element={<UserSettings />} />
          <Route path="user/courses" element={<UserCourses />} />
          <Route path='/' element={<Home />} />
          <Route path='/cybersecurity-courses' element={<CyberSecurityCourses />} />
          <Route path="/cloud-computing-courses" element={<CloudComputingCourses />} />
          <Route path="/data-science-courses" element={<DataScienceCourses />} />
          <Route path="/course/:id" element={<CourseDescription />} />
          <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
          <Route path="/instructor/create-course" element={<InstructorCreateCourse />} />
          <Route path="/instructor/courses" element={<InstructorCourses />} />
          <Route path="/instructor/edit-course/:id" element={<EditCourse />} />
          <Route path="/instructor/upload-videos" element={<InstructorUploadVideos />} />
          <Route path='/instructor/quizzes' element={<Quizzes />} />
          <Route path='/instructor/instructor-settings' element={<InstructorSettings />} />
          <Route path='/instructor/courses/:courseId/quizzes/add' element={<AddQuiz />} />
           <Route path="/user/courses/:courseId/quizzes" element={<StudentCourseQuizzes />} />
          <Route path="/user/courses/:courseId/quizzes/:quizId/attempt" element={<AttemptQuiz />} />
          <Route path="/become-instructor" element={<BecomeInstructor />} />
          <Route path="/admin/instructor-requests" element={<InstructorRequest />} />
          <Route path="/user/certificates" element={<Certificates />} />
          <Route path="/instructor/certificates" element={<InstructorCertificates />} />
          <Route path="/instructor/certificates/:courseId" element={<InstructorCourseCertificates />} />
          <Route path="/user/verify-certificate" element={<VerifyCertificate />} />
          <Route path="/admin/reports" element={<ReportsAnalytics />} />
          <Route path="/user/plans" element={<Plans />} />
          <Route path="/user/tutorials" element={<Tutorials />} />
          <Route path = "/user/labs" element = {<Labs/>}/>
          <Route path = "/user/community" element = {<Community/>}/>
           <Route path="/user/courseVideo/:courseId" element={<StudentCourseVideo />} />
           <Route path="/courses/:courseId/quizzes/:quizId/edit" element={<UpdateQuiz />} />
           <Route path="/courses/:courseId/add-content" element={<AddContent />} />








        </Routes>
     




    </>

  );
}

export default App;
