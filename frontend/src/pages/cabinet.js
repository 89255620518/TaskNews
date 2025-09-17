import { Helmet } from "react-helmet";
import CabinetComponent from "../component/CabinetComponent/cabinetComponent";

const CabinetPage = () => {

    return (
        <div style={{ background: "#ffffff" }}>
            <Helmet>
                <title>ТЗ/Личный кабинет</title>
            </Helmet>
            <CabinetComponent />
        </div>
    )
}

export default CabinetPage;