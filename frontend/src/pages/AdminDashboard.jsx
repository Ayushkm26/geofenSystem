
import { useContext } from 'react';
import { AdminDataContext } from '../Context/AdminContex'; 
import AdminHeader from '../components/AdminHeader';
import Footer from '../components/Footers';
function AdminDashboard() {
  const { admin } = useContext(AdminDataContext); 

  return (
    <>
    <AdminHeader />
    <div className="container mx-auto px-3 py-8 text-left">
        <h1 className="text-3xl font-bold mb-6"> Admin Dashboard</h1>
        <p className="text-gray-700 font-bold mb-1">Welcome {admin.name}!</p>
      </div>
    <Footer />
    </>
  )
}

export default AdminDashboard