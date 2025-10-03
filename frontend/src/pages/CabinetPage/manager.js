import { Helmet } from "react-helmet";
import ManagerComponent from "../../component/Cabinet/ManagerComponent/managerComponent";

const ManagerPage = () => {

    return (
        <div style={{ background: "#ffffff" }}>
            <Helmet>
                <title>ТЗ/Кабинет менеджера по аренде</title>
            </Helmet>
            <ManagerComponent />
        </div>
    )
}

export default ManagerPage;