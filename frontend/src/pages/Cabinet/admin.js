import { Helmet } from "react-helmet";
import AdminComponent from "../../component/Cabinet/AdminComponent/adminComponent";

const AdminPage = () => {

    return (
        <div style={{ background: "#ffffff" }}>
            <Helmet>
                <title>ТЗ/Админ Панель</title>
            </Helmet>
            <AdminComponent />
        </div>
    )
}

export default AdminPage;