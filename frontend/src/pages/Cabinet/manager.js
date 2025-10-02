import { Helmet } from "react-helmet";
import AdminComponent from "../../component/AdminComponent/adminComponent";

const ManagerPage = () => {

    return (
        <div style={{ background: "#ffffff" }}>
            <Helmet>
                <title>ТЗ/Панель менеджера по аренде</title>
            </Helmet>
            <AdminComponent />
        </div>
    )
}

export default ManagerPage;