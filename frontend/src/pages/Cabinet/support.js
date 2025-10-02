import { Helmet } from "react-helmet";
import AdminComponent from "../component/AdminComponent/adminComponent";

const SupportPage = () => {

    return (
        <div style={{ background: "#ffffff" }}>
            <Helmet>
                <title>ТЗ/Панель служба поддержки</title>
            </Helmet>
            <AdminComponent />
        </div>
    )
}

export default SupportPage;